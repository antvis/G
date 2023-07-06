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
 * @see https://codesandbox.io/s/z375662r0p?file=/src/index.js
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

const data = [38024.7, 209484.6, 6201.2, 17741.9, 24377.7];
const total = d3.sum(data);
const colors = 'blue red maroon gray orange'.split(' ');
const width = 600;
const sectorArc = d3
  .arc()
  .innerRadius(width / 8)
  .outerRadius(width / 5);
const tweens = [
  function (sectorData) {
    const currentPath = this.getAttribute('d');
    return d3.interpolate(currentPath, sectorArc(sectorData));
  },
  function (sectorData) {
    const interpolator = d3.interpolate(this._current, sectorData);
    this._current = interpolator(0);
    return (t) => sectorArc(interpolator(t));
  },
];
let svg;

function drawCharts(data) {
  const pieData = d3.pie().sort(null)(data);
  const sectors = svg.selectAll('path').data(pieData);

  sectors
    .enter()
    .append('path')
    .attr('fill', (_, i) => colors[i])
    .attr('d', sectorArc)
    .property('_current', (d) => d);

  sectors.transition().duration(1000).attrTween('d', tweens[1]);
}

canvas.addEventListener(CanvasEvent.READY, () => {
  const wrapper = d3.select(
    canvas.document.documentElement, // use GCanvas' document element instead of a real DOM
  );

  const bounds = wrapper
    .append('g')
    .style('transform', `translate(${width / 2}px, ${width / 2}px)`);
  svg = bounds.append('g');

  drawCharts(data);
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

let isEven = false;
const animationFolder = gui.addFolder('animation');
const animationConfig = {
  swapData: () => {
    isEven = !isEven;
    drawCharts(isEven ? [...data].fill(total / data.length) : data);
  },
};
animationFolder.add(animationConfig, 'swapData');
animationFolder.open();
