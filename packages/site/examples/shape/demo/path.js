import { Canvas, CanvasEvent, Group, Path } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
  fonts: [
    {
      name: 'Roboto',
      url: '/Roboto-Regular.ttf',
    },
    {
      name: 'sans-serif',
      url: '/NotoSansCJKsc-VF.ttf',
    },
  ],
});
const webgpuRenderer = new WebGPURenderer();

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const path1 = new Path({
  style: {
    path: [
      ['M', 100, 100],
      ['L', 200, 100],
    ],
    stroke: '#F04864',
    lineDash: [10],
  },
});
const path2 = new Path({
  style: {
    path:
      'M 100,300' +
      'l 50,-25' +
      'a25,25 -30 0,1 50,-25' +
      'l 50,-25' +
      'a25,50 -30 0,1 50,-25' +
      'l 50,-25' +
      'a25,75 -30 0,1 50,-25' +
      'l 50,-25' +
      'a25,100 -30 0,1 50,-25' +
      'l 50,-25' +
      'l 0, 200,' +
      'z',
    lineWidth: 10,
    lineJoin: 'round',
    stroke: '#54BECC',
    cursor: 'pointer',
  },
});
path2.addEventListener('mouseenter', () => {
  path2.style.stroke = 'red';
});
path2.addEventListener('mouseleave', () => {
  path2.style.stroke = '#54BECC';
});

const path3 = new Path({
  style: {
    lineWidth: 1,
    stroke: '#54BECC',
    path: 'M 0,40 C 5.5555555555555545,40,22.222222222222218,44.44444444444445,33.33333333333333,40 C 44.444444444444436,35.55555555555556,55.55555555555554,14.66666666666667,66.66666666666666,13.333333333333336 C 77.77777777777777,12.000000000000002,88.88888888888887,32,100,32 C 111.11111111111113,32,122.22222222222221,14.66666666666667,133.33333333333331,13.333333333333336 C 144.44444444444443,12.000000000000002,155.55555555555557,24,166.66666666666669,24 C 177.7777777777778,24,188.8888888888889,11.111111111111114,200,13.333333333333336 C 211.1111111111111,15.555555555555557,222.22222222222226,35.111111111111114,233.33333333333334,37.333333333333336 C 244.44444444444443,39.55555555555555,255.55555555555551,31.22222222222223,266.66666666666663,26.66666666666667 C 277.77777777777777,22.111111111111114,294.4444444444444,12.777777777777779,300,10',
  },
});

function getCirclePath(cx, cy, rx, ry) {
  return [
    // ['M', cx, cy - ry],
    // ['A', rx, ry, 0, 1, 1, cx, cy + ry],
    // ['A', rx, ry, 0, 1, 1, cx, cy - ry],

    ['M', cx - rx, ry],
    ['A', rx, ry, 0, 1, 0, cx + rx, ry],
    ['A', rx, ry, 0, 1, 0, cx - rx, ry],
    ['Z'],
  ];
}

const circlePath = new Path({
  style: {
    path: getCirclePath(0, 0, 100, 100),
    lineWidth: 1,
    stroke: '#54BECC',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(path1);
  canvas.appendChild(path2);
  canvas.appendChild(path3);
  canvas.appendChild(circlePath);
  circlePath.setPosition(100, 300);
});

const g = new Group({
  style: {
    transform: 'translate(400, 400) scale(0.5)',
  },
});
const p1 = new Path({
  style: {
    d: 'M1.2858791391047205e-14,-209.99999999999994A209.99999999999994,209.99999999999994,0,0,1,207.94618110413055,29.298221178223883L0,0Z',
    fill: 'red',
  },
});
const p2 = new Path({
  style: {
    d: 'M207.94618110413066,29.298221178223898A210.00000000000006,210.00000000000006,0,0,1,137.74500635698746,158.512817222184L0,0Z',
    fill: 'green',
  },
});
const p3 = new Path({
  style: {
    d: 'M137.7450063569874,158.51281722218394A209.99999999999997,209.99999999999997,0,0,1,-6.530971076665772,209.89841928131747L0,0Z',
    fill: 'blue',
  },
});
const p4 = new Path({
  style: {
    d: 'M-6.530971076665824,209.8984192813175A210,210,0,0,1,-168.7343604741219,-125.01486149809983L0,0Z',
    fill: 'yellow',
  },
});
const p5 = new Path({
  style: {
    d: 'M-168.7343604741219,-125.01486149809983A210,210,0,0,1,-3.377057564320937e-14,-210L0,0Z',
    fill: 'black',
  },
});
g.appendChild(p1);
g.appendChild(p2);
g.appendChild(p3);
g.appendChild(p4);
g.appendChild(p5);

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(g);
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
  .add(rendererConfig, 'renderer', ['canvas', 'svg', 'webgl', 'webgpu', 'canvaskit'])
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

const circleFolder = gui.addFolder('circle');
const circleConfig = {
  r: 100,
  lineWidth: 1,
  lineDash: 0,
  lineDashOffset: 0,
  anchorX: 0,
  anchorY: 0,
  shadowColor: '#fff',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
};
circleFolder.add(circleConfig, 'r', 0, 200).onChange((r) => {
  circlePath.style.path = getCirclePath(0, 0, r, r);
  circlePath.setPosition(100, 300);
});
circleFolder.add(circleConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  circlePath.style.lineWidth = lineWidth;
});
circleFolder.add(circleConfig, 'lineDash', 0, 100).onChange((lineDash) => {
  circlePath.style.lineDash = [lineDash];
});
circleFolder.add(circleConfig, 'lineDashOffset', 0, 100).onChange((lineDashOffset) => {
  circlePath.style.lineDashOffset = lineDashOffset;
});
circleFolder.add(circleConfig, 'anchorX', 0, 1).onChange((anchorX) => {
  circlePath.style.anchor = [anchorX, circleConfig.anchorY];
});
circleFolder.add(circleConfig, 'anchorY', 0, 1).onChange((anchorY) => {
  circlePath.style.anchor = [circleConfig.anchorX, anchorY];
});
circleFolder.addColor(circleConfig, 'shadowColor').onChange((color) => {
  circlePath.attr('shadowColor', color);
});
circleFolder.add(circleConfig, 'shadowBlur', 0, 100).onChange((shadowBlur) => {
  circlePath.style.shadowBlur = shadowBlur;
});
circleFolder.add(circleConfig, 'shadowOffsetX', -50, 50).onChange((shadowOffsetX) => {
  circlePath.style.shadowOffsetX = shadowOffsetX;
});
circleFolder.add(circleConfig, 'shadowOffsetY', -50, 50).onChange((shadowOffsetY) => {
  circlePath.style.shadowOffsetY = shadowOffsetY;
});
circleFolder.open();

const pathFolder = gui.addFolder('path');
const pathConfig = {
  increasedLineWidthForHitTesting: 0,
  cursor: 'pointer',
};
pathFolder
  .add(pathConfig, 'increasedLineWidthForHitTesting', 0, 200)
  .onChange((increasedLineWidthForHitTesting) => {
    path2.style.increasedLineWidthForHitTesting = increasedLineWidthForHitTesting;
  });
pathFolder
  .add(pathConfig, 'cursor', ['default', 'pointer', 'help', 'progress', 'text', 'move'])
  .onChange((cursor) => {
    path2.style.cursor = cursor;
  });
