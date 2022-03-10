import { Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as lil from 'lil-gui';
import * as d3 from 'd3';
import Stats from 'stats.js';

/**
 * inspired by sprite.js
 * @see http://spritejs.com/#/en/guide/d3
 *
 * ported from @see https://codesandbox.io/s/vllpx?file=/chart.js
 */

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

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
dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

// create a group
const container = d3
  .select(
    canvas.document.documentElement, // Canvas' document element
  )
  .append('g')
  .attr('x', dimensions.margin.left)
  .attr('y', dimensions.margin.top); // use G's Group

const drawBars = async () => {
  const dataset = await d3.json(
    'https://gw.alipayobjects.com/os/bmw-prod/8e7cfeb6-28e5-4e78-8d16-c08468360f5f.json',
  );
  const metricAccessor = (d) => d.humidity;
  const yAccessor = (d) => d.length;

  // 4. Create scales

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, metricAccessor))
    .range([0, dimensions.boundedWidth])
    .nice();

  const binsGenerator = d3.bin().domain(xScale.domain()).value(metricAccessor).thresholds(12);

  const bins = binsGenerator(dataset);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(bins, yAccessor)])
    .range([dimensions.boundedHeight, 0])
    .nice();

  // 5. Draw data
  const binsGroup = container.append('g');
  const binGroups = binsGroup.selectAll('g').data(bins).join('g').attr('class', 'bin');

  const barPadding = 1;
  const barRects = binGroups
    .append('rect') // use G's Rect
    .attr('x', (d) => xScale(d.x0) + barPadding / 2)
    .attr('y', (d) => yScale(yAccessor(d)))
    .attr('width', (d) => d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding]))
    .attr('height', (d) => dimensions.boundedHeight - yScale(yAccessor(d)))
    .attr('fill', 'cornflowerblue');

  const barText = binGroups
    .filter(yAccessor)
    .append('text')
    .attr('x', (d) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
    .attr('y', (d) => yScale(yAccessor(d)) - 5)
    .text(yAccessor)
    .attr('fill', 'darkgrey')
    .style('text-anchor', 'middle')
    .style('font-size', 12)
    .style('font-family', 'sans-serif');

  const mean = d3.mean(dataset, metricAccessor);
  const meanLine = container
    .append('line')
    .attr('x1', xScale(mean))
    .attr('x2', xScale(mean))
    .attr('y1', -15)
    .attr('y2', dimensions.boundedHeight)
    .attr('stroke-width', 1)
    .attr('stroke', 'maroon')
    .attr('stroke-dasharray', '2px 4px');

  const meanLabel = container
    .append('text')
    .attr('x', xScale(mean))
    .attr('y', -20)
    .text('mean')
    .attr('fill', 'maroon')
    .style('font-size', 12)
    .style('text-anchor', 'middle');

  // 6. Draw peripherals
  const xAxisGenerator = d3.axisBottom().scale(xScale);

  const xAxis = container
    .append('g')
    .call(xAxisGenerator)
    .attr('transform', `translateY(${dimensions.boundedHeight}px)`)
    .attr('fill', 'black');

  const xAxisLabel = xAxis
    .append('text')
    .attr('x', dimensions.boundedWidth / 2)
    .attr('y', dimensions.margin.bottom - 10)
    .attr('fill', 'black')
    .style('font-size', 10)
    .text('Humidity')
    .style('text-transform', 'capitalize');
};

drawBars();

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.on('afterrender', () => {
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
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  canvas.setRenderer(
    renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  );
});
rendererFolder.open();
