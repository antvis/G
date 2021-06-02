import { Circle, Text, Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as dat from 'dat.gui';
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
  attrs: {
    fill: 'rgb(239, 244, 255)',
    fillOpacity: 1,
    lineAppendWidth: 0,
    lineWidth: 1,
    matrix: null,
    opacity: 1,
    r: 10,
    stroke: 'rgb(95, 149, 255)',
    strokeOpacity: 1,
    x: 0,
    y: 0,
  },
});

const text = new Text({
  id: 'text',
  attrs: {
    opacity: 1,
    lineWidth: 1,
    lineAppendWidth: 0,
    strokeOpacity: 1,
    fillOpacity: 1,
    x: 0,
    y: 19,
    text: '0-210224-xyspshall-26186221\n-1',
    fontSize: 12,
    fontFamily:
      '-apple-system, system-ui, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontVariant: 'normal',
    textAlign: 'center',
    textBaseline: 'top',
    fill: '#000',
    font:
      'normal normal normal 12px -apple-system, system-ui, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
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
  // text.attr('text', 'Drag me');
};
const onDragEnd = () => {
  dragging = false;
  circle.attr('opacity', 1);
  // text.attr('text', 'Drag me');
};
const onDragMove = (event) => {
  if (dragging) {
    circle.attr('opacity', 0.5);
    // text.attr('text', 'Dragging...');

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
canvas.on('postrender', () => {
  if (stats) {
    stats.update();
  }
});

// GUI
const gui = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const rendererFolder = gui.addFolder('renderer');
const rendererConfig = {
  renderer: CANVAS_RENDERER,
};
rendererFolder.add(rendererConfig, 'renderer', [CANVAS_RENDERER, WEBGL_RENDERER, SVG_RENDERER]).onChange((renderer) => {
  canvas.setConfig({
    renderer,
  });
});
rendererFolder.open();
