import { Circle, Text, Canvas } from '@antv/g';
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

// add a circle to canvas
const circle = new Circle({
  id: 'circle',
  style: {
    fill: 'rgb(239, 244, 255)',
    fillOpacity: 1,
    lineWidth: 1,
    opacity: 1,
    r: 100,
    stroke: 'rgb(95, 149, 255)',
    strokeOpacity: 1,
    cursor: 'pointer',
  },
});

const text = new Text({
  id: 'text',
  style: {
    fill: '#000',
    fillOpacity: 0.9,
    font: `normal normal normal 12px Avenir, -apple-system, system-ui, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    // fontFamily: `Avenir, -apple-system, system-ui, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    // fontFamily: 'Arial, sans-serif',
    // fontFamily: 'sans-serif',
    fontFamily: 'Avenir',
    // fontFamily: 'Times',
    // fontFamily: 'Microsoft YaHei',
    fontSize: 22,
    fontStyle: 'normal',
    fontVariant: 'normal',
    fontWeight: 'normal',
    lineWidth: 1,
    opacity: 1,
    strokeOpacity: 1,
    text: 'Drag me',
    textAlign: 'center',
    textBaseline: 'middle',
  },
  draggable: true,
});

circle.appendChild(text);
canvas.appendChild(circle);

circle.setPosition(300, 200);

let dragging = false;
let lastPosition;
const onDragStart = (event) => {
  dragging = true;
  circle.attr('opacity', 0.5);
  lastPosition = [event.x, event.y];
  text.attr('text', 'Drag me');
};
const onDragEnd = () => {
  dragging = false;
  circle.attr('opacity', 1);
  text.attr('text', 'Drag me');
};
const onDragMove = (event) => {
  if (dragging) {
    circle.attr('opacity', 0.5);
    text.attr('text', 'Dragging...');

    const offset = [event.x - lastPosition[0], event.y - lastPosition[1]];
    const position = circle.getPosition();
    circle.setPosition(position[0] + offset[0], position[1] + offset[1]);
    lastPosition = [event.x, event.y];
  }
};

circle
  // events for drag start
  .on('mousedown', onDragStart)
  .on('touchstart', onDragStart)
  // events for drag end
  .on('mouseup', onDragEnd)
  .on('mouseupoutside', onDragEnd)
  .on('touchend', onDragEnd)
  .on('touchendoutside', onDragEnd)
  // events for drag move
  .on('mousemove', onDragMove)
  .on('touchmove', onDragMove);

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
  clone: () => {
    const cloned = circle.cloneNode(rendererConfig.deep);
    canvas.appendChild(cloned);
    cloned.toBack();
    cloned.translateLocal(10, 10);
  },
  deep: false,
};
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  canvas.setRenderer(
    renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  );
});
rendererFolder.add(rendererConfig, 'clone');
rendererFolder.add(rendererConfig, 'deep');
rendererFolder.open();

const circleFolder = gui.addFolder('circle');
const circleConfig = {
  r: 100,
  fill: '#1890FF',
  stroke: '#F04864',
  lineWidth: 4,
  fillOpacity: 1,
  strokeOpacity: 1,
  anchorX: 0.5,
  anchorY: 0.5,
  shadowColor: '#000',
  shadowBlur: 20,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
};
circleFolder.add(circleConfig, 'r', 50, 200).onChange((radius) => {
  circle.style.r = radius;
});
circleFolder.addColor(circleConfig, 'fill').onChange((color) => {
  circle.style.fill = color;
});
circleFolder.addColor(circleConfig, 'stroke').onChange((color) => {
  circle.attr('stroke', color);
});
circleFolder.addColor(circleConfig, 'shadowColor').onChange((color) => {
  circle.attr('shadowColor', color);
});
circleFolder.add(circleConfig, 'shadowBlur', 0, 100).onChange((shadowBlur) => {
  circle.style.shadowBlur = shadowBlur;
});
circleFolder.add(circleConfig, 'shadowOffsetX', -50, 50).onChange((shadowOffsetX) => {
  circle.style.shadowOffsetX = shadowOffsetX;
});
circleFolder.add(circleConfig, 'shadowOffsetY', -50, 50).onChange((shadowOffsetY) => {
  circle.style.shadowOffsetY = shadowOffsetY;
});
circleFolder.add(circleConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  circle.attr('lineWidth', lineWidth);
});
circleFolder.add(circleConfig, 'fillOpacity', 0, 1, 0.1).onChange((opacity) => {
  circle.attr('fillOpacity', opacity);
});
circleFolder.add(circleConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  circle.attr('strokeOpacity', opacity);
});
circleFolder.add(circleConfig, 'anchorX', 0, 1, 0.1).onChange((anchorX) => {
  circle.attr('anchor', [anchorX, circleConfig.anchorY]);
});
circleFolder.add(circleConfig, 'anchorY', 0, 1, 0.1).onChange((anchorY) => {
  circle.attr('anchor', [circleConfig.anchorX, anchorY]);
});
