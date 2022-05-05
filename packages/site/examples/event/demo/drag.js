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
  // open the following when debugging on PC
  // supportPointerEvent: false,
  // supportTouchEvent: true,
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
    text: 'Drag me',
    textAlign: 'center',
    textBaseline: 'middle',
  },
});

circle.appendChild(text);
canvas.appendChild(circle);

circle.setPosition(300, 200);

let dragging = false;
let lastPosition;
const isTouchEvent = (e) => !!e.changedTouches;
const onDragStart = (event) => {
  dragging = true;
  circle.attr('opacity', 0.5);

  lastPosition = isTouchEvent(event)
    ? [event.changedTouches[0].x, event.changedTouches[0].y]
    : [event.x, event.y];
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

    const eventPosition = isTouchEvent(event)
      ? [event.changedTouches[0].x, event.changedTouches[0].y]
      : [event.x, event.y];

    const offset = [eventPosition[0] - lastPosition[0], eventPosition[1] - lastPosition[1]];
    const position = circle.getPosition();
    circle.setPosition(position[0] + offset[0], position[1] + offset[1]);
    lastPosition = eventPosition;
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
};
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  canvas.setRenderer(
    renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  );
});
rendererFolder.open();
