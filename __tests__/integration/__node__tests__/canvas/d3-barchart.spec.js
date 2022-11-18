/**
 * inspired by sprite.js
 * @see http://spritejs.com/#/en/guide/d3
 *
 * ported from fullstack-d3
 * @see https://codesandbox.io/s/vllpx?file=/chart.js
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const { Canvas } = require('@antv/g');
const { Renderer } = require('@antv/g-canvas');
const d3 = require('d3');
const { sleep, diff } = require('../../util');
const weatherDataset = require('../../data/weather.json');

const WIDTH = 600;
const HEIGHT = 500;

// create a node-canvas
const nodeCanvas = createCanvas(WIDTH, HEIGHT);
const offscreenNodeCanvas = createCanvas(1, 1);

// create a renderer, unregister plugin relative to DOM
const renderer = new Renderer();
const domInteractionPlugin = renderer.getPlugin('dom-interaction');
renderer.unregisterPlugin(domInteractionPlugin);

const canvas = new Canvas({
  width: WIDTH,
  height: HEIGHT,
  canvas: nodeCanvas, // use node-canvas
  renderer,
  offscreenCanvas: offscreenNodeCanvas,
});

const RESULT_IMAGE = '/d3-barchart.png';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render d3 barchart with g-canvas', () => {
  afterEach(() => {
    canvas.removeChildren();
    fs.rmSync(__dirname + RESULT_IMAGE);
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

    await sleep(300);

    await new Promise((resolve) => {
      const out = fs.createWriteStream(__dirname + RESULT_IMAGE);
      const stream = nodeCanvas.createPNGStream();
      stream.pipe(out);
      out.on('finish', () => {
        resolve(undefined);
      });
    });

    expect(
      diff(
        __dirname + RESULT_IMAGE,
        __dirname + BASELINE_IMAGE_DIR + RESULT_IMAGE,
      ),
    ).toBe(0);
  });
});
