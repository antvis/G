const util = require('util');
// ref: https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
// ref: https://github.com/jsdom/jsdom/issues/2524
Object.defineProperty(window, 'TextEncoder', {
  writable: true,
  value: util.TextEncoder,
});
Object.defineProperty(window, 'TextDecoder', {
  writable: true,
  value: util.TextDecoder,
});

const { createCanvas } = require('canvas');
const fs = require('fs');
const { JSDOM } = require('jsdom');
const xmlserializer = require('xmlserializer');
const { Canvas } = require('@antv/g');
const { Renderer } = require('@antv/g-svg');
const d3 = require('d3');
const { sleep } = require('../../util');
const weatherDataset = require('../../data/weather.json');

// create a renderer, unregister plugin relative to DOM
const renderer = new Renderer();
const domInteractionPlugin = renderer.getPlugin('dom-interaction');
renderer.unregisterPlugin(domInteractionPlugin);

const dom = new JSDOM(`
<div id="container">
</div>
`);

const WIDTH = 600;
const HEIGHT = 500;

const offscreenNodeCanvas = createCanvas(1, 1);

const canvas = new Canvas({
  container: 'container',
  width: WIDTH,
  height: HEIGHT,
  renderer,
  document: dom.window.document,
  offscreenCanvas: offscreenNodeCanvas,
  requestAnimationFrame: dom.window.requestAnimationFrame,
  cancelAnimationFrame: dom.window.cancelAnimationFrame,
});

const RESULT_IMAGE = '/d3-barchart.svg';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render D3 barchart with g-svg', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render d3 barchart on server-side correctly.', async () => {
    await canvas.ready;
    const drawBars = async () => {
      // 1. Access data
      const dataset = weatherDataset;
      const metricAccessor = (d) => d.humidity;
      const yAccessor = (d) => d.length;

      // 2. Create chart dimensions
      const width = 600;
      let dimensions = {
        width: width,
        height: width * 0.6,
        margin: {
          top: 30,
          right: 10,
          bottom: 50,
          left: 50,
        },
      };
      dimensions.boundedWidth =
        dimensions.width - dimensions.margin.left - dimensions.margin.right;
      dimensions.boundedHeight =
        dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

      // 3. Draw canvas
      const wrapper = d3.select(
        canvas.document.documentElement, // use GCanvas' document element instead of a real DOM
      );

      const bounds = wrapper
        .append('g')
        .style(
          'transform',
          `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`,
        );

      // 4. Create scales

      const xScale = d3
        .scaleLinear()
        .domain(d3.extent(dataset, metricAccessor))
        .range([0, dimensions.boundedWidth])
        .nice();

      const binsGenerator = d3
        .bin()
        .domain(xScale.domain())
        .value(metricAccessor)
        .thresholds(12);

      const bins = binsGenerator(dataset);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(bins, yAccessor)])
        .range([dimensions.boundedHeight, 0])
        .nice();

      // 5. Draw data
      const binsGroup = bounds.append('g');
      const binGroups = binsGroup
        .selectAll('g')
        .data(bins)
        .join('g')
        .attr('class', 'bin');

      const barPadding = 1;
      const barRects = binGroups
        .append('rect')
        .attr('x', (d) => xScale(d.x0) + barPadding / 2)
        .attr('y', (d) => yScale(yAccessor(d)))
        .attr('width', (d) =>
          d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding]),
        )
        .attr('height', (d) => dimensions.boundedHeight - yScale(yAccessor(d)))
        .attr('fill', 'cornflowerblue')
        .on('mouseenter', function (e) {
          d3.select(e.target).attr('fill', 'red');
        })
        .on('mouseleave', function (e) {
          d3.select(e.target).attr('fill', 'cornflowerblue');
        });

      const barText = binGroups
        .filter(yAccessor)
        .append('text')
        .attr('x', (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
        .attr('y', (d) => yScale(yAccessor(d)) - 5)
        .text(yAccessor)
        .attr('fill', 'darkgrey')
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-family', 'sans-serif');

      const mean = d3.mean(dataset, metricAccessor);
      const meanLine = bounds
        .append('line')
        .attr('x1', xScale(mean))
        .attr('x2', xScale(mean))
        .attr('y1', -15)
        .attr('y2', dimensions.boundedHeight)
        .attr('stroke-width', 1)
        .attr('stroke', 'maroon')
        .attr('stroke-dasharray', '2px 4px');

      const meanLabel = bounds
        .append('text')
        .attr('x', xScale(mean))
        .attr('y', -20)
        .text('mean')
        .attr('fill', 'maroon')
        .style('font-size', '12px')
        .style('text-anchor', 'middle');

      // 6. Draw peripherals
      const xAxisGenerator = d3.axisBottom().scale(xScale);

      const xAxis = bounds
        .append('g')
        .call(xAxisGenerator)
        .attr('transform', `translateY(${dimensions.boundedHeight}px)`)
        .attr('fill', 'black');

      const xAxisLabel = xAxis
        .append('text')
        .attr('x', dimensions.boundedWidth / 2)
        .attr('y', dimensions.margin.bottom - 10)
        .attr('fill', 'black')
        .style('font-size', '10px')
        .text('Humidity')
        .style('text-transform', 'capitalize');
    };

    drawBars();

    await sleep(120);

    // fs.writeFileSync(
    //   __dirname + RESULT_IMAGE,
    //   xmlserializer.serializeToString(
    //     dom.window.document.getElementById('container').children[0],
    //   ),
    // );

    const snapshot = fs.readFileSync(
      __dirname + BASELINE_IMAGE_DIR + RESULT_IMAGE,
      {
        encoding: 'utf8',
        flag: 'r',
      },
    );

    expect(
      xmlserializer.serializeToString(
        dom.window.document.getElementById('container').children[0],
      ),
    ).toBe(snapshot);
  });
});
