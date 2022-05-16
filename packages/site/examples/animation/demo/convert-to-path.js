import {
  Path,
  Line,
  Circle,
  Ellipse,
  Canvas,
  Polyline,
  Polygon,
  Rect,
  convertToPath,
} from '@antv/g';
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

const showConvertedPath = (object) => {
  const pathStr = convertToPath(object);
  const objectPath = new Path({
    style: {
      path: pathStr,
      // anchor: object.style.anchor,
      // transform: object.style.transform,
      // transformOrigin: object.style.transformOrigin,
      fill: 'none',
      stroke: 'blue',
      lineWidth: 10,
    },
  });
  objectPath.setOrigin(object.getOrigin());
  objectPath.setLocalTransform(object.getLocalTransform());
  canvas.appendChild(objectPath);
};

/**
 * Circle -> Path
 */
const circle = new Circle({
  style: {
    cx: 0,
    cy: 0,
    r: 100,
    transform: 'translate(100, 100)',
    fill: 'red',
    opacity: 0.5,
  },
});
canvas.appendChild(circle);
circle.scale(0.5);
showConvertedPath(circle);

/**
 * Ellipse -> Path
 */
const ellipse = new Ellipse({
  style: {
    cx: 0,
    cy: 0,
    rx: 100,
    ry: 60,
    fill: 'red',
    opacity: 0.5,
  },
});
ellipse.setPosition(300, 100);
ellipse.setLocalScale(0.6);
canvas.appendChild(ellipse);
showConvertedPath(ellipse);

/**
 * Rect -> Path
 */
const rect = new Rect({
  style: {
    x: 200,
    y: 100,
    width: 100,
    height: 100,
    fill: 'red',
    opacity: 0.5,
  },
});
canvas.appendChild(rect);
rect.rotateLocal(30);
showConvertedPath(rect);

/**
 * Line -> Path
 */
const line = new Line({
  style: {
    x1: 100,
    y1: 200,
    x2: 100,
    y2: 300,
    lineWidth: 30,
    stroke: 'red',
    opacity: 0.5,
  },
});
canvas.appendChild(line);
showConvertedPath(line);

/**
 * Polyline -> Path
 */
const polyline = new Polyline({
  style: {
    points: '100,360 100,400, 50,400',
    lineWidth: 30,
    stroke: 'red',
    opacity: 0.5,
    transformOrigin: 'center',
  },
});
canvas.appendChild(polyline);
polyline.rotateLocal(90);
showConvertedPath(polyline);

/**
 * Polyline -> Path
 */
//  const polygon = new Polygon({
//   style: {
//     points: '100,360 100,400, 50,400',
//     lineWidth: 30,
//     stroke: 'red',
//     opacity: 0.5,
//   },
// });
// canvas.appendChild(polyline);
// showConvertedPath(polyline);

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
