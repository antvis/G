import { Group, Path, Line, Circle, Canvas, Polyline, Polygon, Rect, convertToPath } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

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

const path1 =
  'M 0,40 C 5.5555555555555545,40,22.222222222222218,44.44444444444445,33.33333333333333,40 C 44.444444444444436,35.55555555555556,55.55555555555554,14.66666666666667,66.66666666666666,13.333333333333336 C 77.77777777777777,12.000000000000002,88.88888888888887,32,100,32 C 111.11111111111113,32,122.22222222222221,14.66666666666667,133.33333333333331,13.333333333333336 C 144.44444444444443,12.000000000000002,155.55555555555557,24,166.66666666666669,24 C 177.7777777777778,24,188.8888888888889,11.111111111111114,200,13.333333333333336 C 211.1111111111111,15.555555555555557,222.22222222222226,35.111111111111114,233.33333333333334,37.333333333333336 C 244.44444444444443,39.55555555555555,255.55555555555551,31.22222222222223,266.66666666666663,26.66666666666667 C 277.77777777777777,22.111111111111114,294.4444444444444,12.777777777777779,300,10';
const path2 = [
  ['M', 0, 0],
  ['L', 200, 0],
];

const pathAGroup = new Group();
const pathA = new Path({
  style: {
    path: path1,
    stroke: '#F04864',
  },
});
canvas.appendChild(pathAGroup);
pathAGroup.appendChild(pathA);
pathAGroup.setPosition(100, 100);
pathA.animate([{ path: path1 }, { path: path2 }], {
  duration: 2500,
  easing: 'ease',
  iterations: Infinity,
  direction: 'alternate',
});

const line = new Line({
  style: {
    x1: 100,
    y1: 0,
    x2: 100,
    y2: 100,
  },
});
const linePath = convertToPath(line);
const pathB = new Path({
  style: {
    path: path1,
    stroke: '#F04864',
    anchor: line.style.anchor,
    transformOrigin: line.style.transformOrigin,
  },
});
pathB.setLocalTransform(line.getLocalTransform());
canvas.appendChild(pathB);
pathB.animate([{ path: path1 }, { path: linePath }], {
  duration: 2500,
  easing: 'ease',
  iterations: Infinity,
  direction: 'alternate',
});

const circle = new Circle({
  style: {
    cx: 50,
    cy: 50,
    r: 50,
  },
});
const circlePath = convertToPath(circle);
const pathCGroup = new Group();
const pathC = new Path({
  style: {
    path: path1,
    stroke: '#F04864',
    anchor: circle.style.anchor,
    transformOrigin: circle.style.transformOrigin,
  },
});
canvas.appendChild(pathCGroup);
pathC.setLocalTransform(circle.getLocalTransform());
pathCGroup.appendChild(pathC);
pathC.animate([{ path: path1 }, { path: circlePath }], {
  duration: 2500,
  easing: 'ease',
  iterations: Infinity,
  direction: 'alternate',
});
pathCGroup.translate(0, 100);

// const polylinePath = convertToPath(
//   new Polyline({
//     style: {
//       points: [
//         [50, 50],
//         [100, 50],
//         [100, 100],
//         [150, 100],
//         [150, 150],
//         [200, 150],
//       ],
//     },
//   }),
// );
// const pathD = new Path({
//   style: {
//     path: path1,
//     stroke: '#F04864',
//   },
// });
// canvas.appendChild(pathD);
// pathD.animate([{ path: path1 }, { path: polylinePath }], {
//   duration: 2500,
//   easing: 'ease',
//   iterations: Infinity,
//   direction: 'alternate',
// });
// pathD.translate(0, 200);

// const polygonPath = convertToPath(
//   new Polygon({
//     style: {
//       points: [
//         [0, 0],
//         [50, 50],
//         [50, 100],
//       ],
//     },
//   }),
// );
// const pathE = new Path({
//   style: {
//     path: path1,
//     stroke: '#F04864',
//   },
// });
// canvas.appendChild(pathE);
// pathE.animate([{ path: path1 }, { path: polygonPath }], {
//   duration: 2500,
//   easing: 'ease',
//   iterations: Infinity,
//   direction: 'alternate',
// });
// pathE.translate(0, 300);

// const rectPath = convertToPath(
//   new Rect({
//     style: {
//       width: 200,
//       height: 100,
//       transformOrigin: 'center',
//     },
//   }),
// );
// const pathF = new Path({
//   style: {
//     path: rectPath,
//     stroke: '#F04864',
//     fill: '',
//     lineWidth: 10,
//   },
// });
// canvas.appendChild(pathF);
// pathF.animate(
//   [
//     { path: rectPath, stroke: '#F04864', fill: 'blue' },
//     { path: circlePath, stroke: 'blue', fill: '#F04864' },
//   ],
//   {
//     duration: 2500,
//     easing: 'ease',
//     iterations: Infinity,
//     direction: 'alternate',
//   },
// );
// pathF.translate(200, 100);

// const starPath = new Path({
//   style: {
//     path: 'M301.113,12.011l99.25,179.996l201.864,38.778L461.706,380.808l25.508,203.958l-186.101-87.287L115.01,584.766l25.507-203.958L0,230.785l201.86-38.778L301.113,12.011',
//   },
// });
// starPath.scale(0.2);
// const pathG = new Path({
//   style: {
//     path: rectPath,
//     lineWidth: 2,
//   },
// });
// canvas.appendChild(pathG);
// pathG.animate(
//   [
//     { path: rectPath, stroke: '#F04864', fill: 'blue' },
//     { path: convertToPath(starPath), stroke: 'blue', fill: '#F04864' },
//   ],
//   {
//     duration: 2500,
//     easing: 'ease',
//     iterations: Infinity,
//     direction: 'alternate',
//   },
// );
// pathG.translate(300, 0);

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
