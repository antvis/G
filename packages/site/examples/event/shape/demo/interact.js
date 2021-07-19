import { Circle, Text, Rect, Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { containerModule } from '@antv/g-plugin-css-select';
import * as dat from 'dat.gui';
import Stats from 'stats.js';
import interact from 'interactjs';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();

// register css select plugin
canvasRenderer.registerPlugin(containerModule);
webglRenderer.registerPlugin(containerModule);
svgRenderer.registerPlugin(containerModule);

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

// add a circle to canvas
const circle = new Circle({
  className: 'draggable',
  attrs: {
    fill: 'rgb(239, 244, 255)',
    fillOpacity: 1,
    lineWidth: 1,
    opacity: 1,
    r: 60,
    stroke: 'rgb(95, 149, 255)',
    strokeOpacity: 1,
  },
});

const text = new Text({
  attrs: {
    text: 'Drag me',
    fontSize: 22,
    fill: '#000',
    textAlign: 'center',
    textBaseline: 'middle',
  },
});
const dropZone = new Rect({
  attrs: {
    x: 100,
    y: 50,
    width: 300,
    height: 200,
    fill: '#1890FF',
  },
});

// resizable
const resizableRect = new Rect({
  attrs: {
    x: 200,
    y: 260,
    width: 200,
    height: 200,
    fill: '#1890FF',
  },
});
const resizableRectText = new Text({
  attrs: {
    text: 'Resize from any edge or corner',
    fontSize: 16,
    fill: '#000',
    textAlign: 'left',
    textBaseline: 'top',
    wordWrap: true,
    wordWrapWidth: 200,
  },
});
resizableRectText.translateLocal(0, 20);
resizableRect.appendChild(resizableRectText);
canvas.appendChild(resizableRect);

canvas.appendChild(dropZone);

circle.appendChild(text);
canvas.appendChild(circle);
circle.setPosition(100, 100);

// use interact.js
interact(circle, {
  context: canvas.document,
}).draggable({
  onmove: function (event) {
    const { dx, dy } = event;
    circle.translateLocal(dx, dy);
  }
});

interact(resizableRect, {
  context: canvas.document,
}).resizable({
  edges: { top: true, left: true, bottom: true, right: true },
  onmove: function (event) {
    resizableRect.translateLocal(event.deltaRect.left, event.deltaRect.top);
    resizableRect.style.width = event.rect.width;
    resizableRect.style.height = event.rect.height;

    resizableRectText.style.wordWrapWidth = event.rect.width;
  }
});

interact(dropZone, {
  context: canvas.document,
}).dropzone({
  accept: '.draggable',
  overlap: 0.75,
  ondragenter: function (event) {
    text.style.text = 'Dragged in';
  },
  ondragleave: function (event) {
    text.style.text = 'Dragged out';
  },
  ondrop: function (event) {
    text.style.text = 'Dropped';
  },
  ondropactivate: function (event) {
    // add active dropzone feedback
    event.target.style.fill = '#4e4';
  },
  ondropdeactivate: function (event) {
    event.target.style.fill = '#1890FF';
  }
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
canvas.on('afterRender', () => {
  if (stats) {
    stats.update();
  }
});

// GUI
const gui = new dat.GUI({ autoPlace: false });
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
