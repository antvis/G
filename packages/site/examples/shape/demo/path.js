import { Canvas, Path } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();

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

canvas.appendChild(path1);
canvas.appendChild(path2);
canvas.appendChild(path3);
canvas.appendChild(circlePath);
circlePath.setPosition(100, 300);

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

const circleFolder = gui.addFolder('circle');
const circleConfig = {
  r: 100,
  lineWidth: 1,
  lineDash: 0,
  lineDashOffset: 0,
  anchorX: 0,
  anchorY: 0,
};
circleFolder.add(circleConfig, 'r', 0, 200).onChange((r) => {
  circlePath.style.path = getCirclePath(0, 0, r, r);
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
circleFolder.open();
