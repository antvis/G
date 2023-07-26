const fs = require('fs');
const { createCanvas } = require('canvas');
const d3 = require('d3');
const { Canvas, Rectangle } = require('@antv/g');
const { Renderer } = require('@antv/g-webgl');
const { createPNGFromRawdata, sleep, diff } = require('../../util');
const weatherDataset = require('../../data/weather.json');

// create a renderer, unregister plugin relative to DOM
const renderer = new Renderer({
  targets: ['webgl1'],
  enableFXAA: false,
});
const domInteractionPlugin = renderer.getPlugin('dom-interaction');
renderer.unregisterPlugin(domInteractionPlugin);

const width = 600;
const height = 500;
const gl = require('gl')(width, height, {
  antialias: false,
  preserveDrawingBuffer: true,
  stencil: true,
});
const mockCanvas = {
  width,
  height,
  getContext: () => {
    gl.canvas = mockCanvas;
    // 模拟 DOM API，返回小程序 context，它应当和 CanvasRenderingContext2D 一致
    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/getContext
    return gl;
  },
  getBoundingClientRect: () => {
    // 模拟 DOM API，返回小程序 context 相对于视口的位置
    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect
    return new Rectangle(0, 0, width, height);
  },
};

// create a node-canvas
const offscreenNodeCanvas = createCanvas(1, 1);
const canvas = new Canvas({
  width,
  height,
  canvas: mockCanvas, // use headless-gl
  renderer,
  offscreenCanvas: offscreenNodeCanvas,
});

const RESULT_IMAGE = '/d3-scatterchart.png';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render D3 scatterchart with g-webgl', () => {
  afterEach(() => {
    canvas.removeChildren();
    fs.rmSync(__dirname + RESULT_IMAGE);
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render D3 linechart on server-side correctly.', async () => {
    await canvas.ready;

    const drawScatter = () => {
      // 1. Access data
      const dataset = weatherDataset;
      const xAccessor = (d) => d.dewPoint;
      const yAccessor = (d) => d.humidity;
      const colorAccessor = (d) => d.cloudCover;

      // 2. Create chart dimensions
      const width = 600;
      let dimensions = {
        width: width,
        height: width,
        margin: {
          top: 10,
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
      const bounds = d3
        .select(
          canvas.document.documentElement, // use GCanvas' document element instead of a real DOM
        )
        .append('g')
        .attr('x', dimensions.margin.left)
        .attr('y', dimensions.margin.top);

      // 4. Create scales

      const xScale = d3
        .scaleLinear()
        .domain(d3.extent(dataset, xAccessor))
        .range([0, dimensions.boundedWidth])
        .nice();

      const yScale = d3
        .scaleLinear()
        .domain(d3.extent(dataset, yAccessor))
        .range([dimensions.boundedHeight, 0])
        .nice();

      const colorScale = d3
        .scaleLinear()
        .domain(d3.extent(dataset, colorAccessor))
        .range(['skyblue', 'darkslategrey']);

      // 5. Draw data

      const dots = bounds.selectAll('circle').data(dataset);

      dots
        .join('circle')
        .attr('cx', (d) => xScale(xAccessor(d)))
        .attr('cy', (d) => yScale(yAccessor(d)))
        .attr('r', 5)
        .attr('fill', (d) => colorScale(colorAccessor(d)));

      // 6. Draw Preipherals - x axis and y axis

      //create a variable for xaxis and define it
      const xAxisGenerator = d3.axisBottom().scale(xScale);

      //add to the bounds
      const xAxis = bounds
        .append('g')
        .call(xAxisGenerator)
        //move to the bottom of the screen
        .style('transform', `translateY(${dimensions.boundedHeight}px)`);

      const xAxisLabel = xAxis
        .append('text')
        .attr('x', dimensions.boundedWidth / 2)
        .attr('y', dimensions.margin.bottom - 10)
        .attr('fill', 'black')
        .style('font-size', '1.4em')
        .html('Dew point (&deg;F)');

      //same thing with the y axis
      const yAxisGenerator = d3
        .axisLeft()
        .scale(yScale)
        //define the number of ticks that you want
        .ticks(4);

      const yAxis = bounds.append('g').call(yAxisGenerator);

      const yAxisLabel = yAxis
        .append('text')
        //using negative dimensions so we can rotate below with transform
        .attr('x', -dimensions.boundedHeight / 2)
        .attr('y', -dimensions.margin.left + 10)
        .style('fill', 'black')
        .text('Relative Humidity')
        .style('transform', 'rotate(-90deg)')
        .style('font-size', '1.4em')
        .style('text-anchor', 'middle');
    };

    drawScatter();

    await sleep(200);

    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    await createPNGFromRawdata(__dirname + RESULT_IMAGE, width, height, pixels);

    expect(
      diff(
        __dirname + RESULT_IMAGE,
        __dirname + BASELINE_IMAGE_DIR + RESULT_IMAGE,
      ),
    ).toBeLessThan(50);
  });
});
