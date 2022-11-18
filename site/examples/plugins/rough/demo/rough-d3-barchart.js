import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Plugin as PluginRoughCanvasRenderer } from '@antv/g-plugin-rough-canvas-renderer';
import { Plugin as PluginRoughSVGRenderer } from '@antv/g-plugin-rough-svg-renderer';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import * as d3 from 'd3';
import * as lil from 'lil-gui';
import Stats from 'stats.js';
import WebFont from 'webfontloader';

/**
 * Ported from fullstack-d3, use stylized rendering with rough.js.
 * @see https://codesandbox.io/s/vllpx?file=/chart.js
 */

// create a renderer
const canvasRenderer = new CanvasRenderer();
canvasRenderer.registerPlugin(new PluginRoughCanvasRenderer());
const svgRenderer = new SVGRenderer();
svgRenderer.registerPlugin(new PluginRoughSVGRenderer());
const webglRenderer = new WebGLRenderer();
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

canvas.addEventListener(CanvasEvent.READY, () => {
  WebFont.load({
    google: {
      families: ['Gaegu'],
    },
    active: () => {
      drawBars();
    },
  });

  const drawBars = async () => {
    // 1. Access data
    const dataset = await d3.json(
      'https://gw.alipayobjects.com/os/bmw-prod/8e7cfeb6-28e5-4e78-8d16-c08468360f5f.json',
    );
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
      .style('font-family', 'Gaegu')
      .style('font-size', '12px');

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
      .style('font-family', 'Gaegu')
      .style('font-size', '12px')
      .style('text-anchor', 'middle');

    // 6. Draw peripherals
    const xAxisGenerator = d3.axisBottom().scale(xScale);

    const xAxis = bounds
      .append('g')
      .call(xAxisGenerator)
      .attr('transform', `translateY(${dimensions.boundedHeight}px)`)
      .style('font-family', 'Gaegu')
      .attr('fill', 'black');

    const xAxisLabel = xAxis
      .append('text')
      .attr('x', dimensions.boundedWidth / 2)
      .attr('y', dimensions.margin.bottom - 10)
      .attr('fill', 'black')
      .style('font-family', 'Gaegu')
      .style('font-size', '10px')
      .text('Humidity')
      .style('text-transform', 'capitalize');
  };
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
