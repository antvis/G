import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as d3 from 'd3';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

/**
 * inspired by sprite.js
 * @see http://spritejs.com/#/en/guide/d3
 *
 * ported from fullstack-d3
 * @see https://codesandbox.io/s/30io6?file=/chart.js
 */

// create a renderer
const canvasRenderer = new CanvasRenderer();
const svgRenderer = new SVGRenderer();
const webglRenderer = new WebGLRenderer();
const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
  fonts: [
    {
      name: 'Roboto',
      url: '/Roboto-Regular.ttf',
    },
    {
      name: 'sans-serif',
      url: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/file/A*064aSK2LUPEAAAAAAAAAAAAADmJ7AQ/NotoSansCJKsc-VF.ttf',
    },
  ],
});

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const drawLineChart = async () => {
  // 1. Access data
  const data = await d3.json(
    'https://gw.alipayobjects.com/os/bmw-prod/8e7cfeb6-28e5-4e78-8d16-c08468360f5f.json',
  );
  const parseDate = d3.timeParse('%Y-%m-%d');
  //define x axis with xAccessor, wrape with parseDate from above
  const xAccessor = (d) => parseDate(d['date']);
  const yAccessor = (d) => d['temperatureMax'];

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
  const container = d3
    .select(
      canvas.document.documentElement, // use GCanvas' document element instead of a real DOM
    )
    .append('g')
    .attr('x', dimensions.margin.left)
    .attr('y', dimensions.margin.top);

  // 4. Create scales

  const yScale = d3
    .scaleLinear()
    //domain is the min and max input value, range is min and max output
    //domain should be the smallest and largest numbers our y axis will need to handle — in this case the lowest and highest max temperature in our dataset.
    // could define ourselves with .domain([0, 100])
    //better to use d3.extent, which will figure if out for us
    //needs two parameters, the data and the yAccessor (temp max)
    .domain(d3.extent(data, yAccessor))
    //range, in this case, should be min and max on xaxis. Can use boundedHeight to stay within margins
    .range([dimensions.boundedHeight, 0]);

  //Draw a rectangle covering all temps below freezing.
  //define scale - 32 degrees
  const freezingTemperaturePlacement = yScale(32);
  //create the rectangle with x,y, width and height
  const freezingTemperatures = container
    .append('rect')
    .attr('x', 0)
    .attr('width', dimensions.boundedWidth)
    .attr('y', freezingTemperaturePlacement)
    .attr('height', dimensions.boundedHeight - freezingTemperaturePlacement)
    .attr('fill', '#e0f3f3');

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, xAccessor))
    .range([0, dimensions.boundedWidth]);

  // 5. Draw data

  //We transform our data point with both the accessor function and the scale to get the scaled value in pixel space.

  const lineGenerator = d3
    .line()
    .x((d) => xScale(xAccessor(d)))
    .y((d) => yScale(yAccessor(d)));

  //Now add the path element to the points
  // Will be filled by default. Use styles to add a stroke
  const line = container
    .append('path')
    .attr('d', lineGenerator(data))
    .attr('fill', 'none')
    .attr('stroke', '#af9358')
    .attr('stroke-width', 2);

  // 6. Draw Axis

  const yAxisGenerator = d3.axisLeft().scale(yScale);

  const yAxis = container.append('g').call(yAxisGenerator);

  const xAxisGenerator = d3.axisBottom().scale(xScale);

  const xAxis = container
    .append('g')
    .call(xAxisGenerator)
    .style('transform', `translateY(${dimensions.boundedHeight}px)`);
};

canvas.addEventListener(CanvasEvent.READY, () => {
  drawLineChart();
});

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
  if (stats) {
    stats.update();
  }
});

// GUI
const gui = new lil.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const rendererFolder = gui.addFolder('renderer');
const rendererConfig = {
  renderer: 'canvas',
};
rendererFolder
  .add(rendererConfig, 'renderer', [
    'canvas',
    'svg',
    'webgl',
    'webgpu',
    'canvaskit',
  ])
  .onChange((rendererName) => {
    let renderer;
    if (rendererName === 'canvas') {
      renderer = canvasRenderer;
    } else if (rendererName === 'svg') {
      renderer = svgRenderer;
    } else if (rendererName === 'webgl') {
      renderer = webglRenderer;
    } else if (rendererName === 'webgpu') {
      renderer = webgpuRenderer;
    } else if (rendererName === 'canvaskit') {
      renderer = canvaskitRenderer;
    }
    canvas.setRenderer(renderer);
  });
rendererFolder.open();
