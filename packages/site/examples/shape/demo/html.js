import { Canvas, CustomElement, HTML, Line, Rect, Text } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
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

// create a line
const line = new Line({
  style: {
    x1: 200,
    y1: 100,
    x2: 400,
    y2: 100,
    stroke: '#1890FF',
    lineWidth: 2,
  },
});
const p1 = new HTML({
  id: 'p1',
  name: 'p1-name',
  className: 'p1-classname',
  style: {
    x: 200,
    y: 100,
    width: 60,
    height: 30,
    innerHTML: 'p1',
  },
});
const p2 = new HTML({
  id: 'p2',
  name: 'p2-name',
  className: 'p2-classname',
  style: {
    x: 400,
    y: 100,
    width: 60,
    height: 30,
    innerHTML: 'p2',
  },
});

const rect = new Rect({
  name: 'test-name',
  style: {
    x: 200,
    y: 200,
    width: 300,
    height: 100,
    fill: '#1890FF',
  },
});
const text = new Text({
  style: {
    x: 150,
    y: 50,
    text: 'Hover me!',
    fontSize: 22,
    fill: '#000',
    textAlign: 'center',
    textBaseline: 'middle',
  },
});
rect.appendChild(text);
const tooltip = new HTML({
  style: {
    x: 0,
    y: 0,
    innerHTML: 'Tooltip',
    fill: 'white',
    stroke: 'black',
    lineWidth: 6,
    width: 100,
    height: 30,
    pointerEvents: 'none',
    visibility: 'hidden',
  },
});

canvas.appendChild(line);
canvas.appendChild(p1);
canvas.appendChild(p2);
canvas.appendChild(rect);
canvas.appendChild(tooltip);

rect.addEventListener('mousemove', (e) => {
  tooltip.setPosition(e.x, e.y);
  tooltip.style.visibility = 'visible';

  console.log('move', e.target);
});
rect.addEventListener('mouseleave', (e) => {
  tooltip.setPosition(0, 0);
  tooltip.style.visibility = 'hidden';

  console.log('leave', e.target);
});

class Custom extends CustomElement {
  connectedCallback() {
    const tooltip = new HTML({
      style: {
        x: 0,
        y: 0,
        innerHTML: 'Tooltip',
        fill: 'white',
        stroke: 'black',
        lineWidth: 6,
        width: 100,
        height: 30,
      },
    });
    this.appendChild(tooltip);
    this.appendChild(new Rect({ style: { width: 100, height: 100, x: 0, y: 40, fill: 'red' } }));
  }
}
const customEl = new Custom({
  style: {
    transform: 'translate(200, 330)',
  },
});
canvas.appendChild(customEl);

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
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  canvas.setRenderer(
    renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  );
});
rendererFolder.open();

const lineFolder = gui.addFolder('line');
const lineConfig = {
  stroke: '#1890FF',
  lineWidth: 2,
  strokeOpacity: 1,
  anchorX: 0,
  anchorY: 0,
  x1: 200,
  y1: 100,
  x2: 400,
  y2: 100,
};
lineFolder.add(lineConfig, 'x1', 0, 400).onChange((x1) => {
  line.style.x1 = x1;
  p1.style.x = x1;
});
lineFolder.add(lineConfig, 'y1', 0, 400).onChange((y1) => {
  line.style.y1 = y1;
  p1.style.y = y1;
});
lineFolder.add(lineConfig, 'x2', 0, 400).onChange((x2) => {
  line.style.x2 = x2;
  p2.style.x = x2;
});
lineFolder.add(lineConfig, 'y2', 0, 400).onChange((y2) => {
  line.style.y2 = y2;
  p2.style.y = y2;
});
lineFolder.addColor(lineConfig, 'stroke').onChange((color) => {
  line.style.stroke = color;
});
lineFolder.add(lineConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  line.style.lineWidth = lineWidth;
});
lineFolder.add(lineConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  line.style.strokeOpacity = opacity;
});
lineFolder.add(lineConfig, 'anchorX', 0, 1, 0.1).onChange((anchorX) => {
  line.attr('anchor', [anchorX, lineConfig.anchorY]);
});
lineFolder.add(lineConfig, 'anchorY', 0, 1, 0.1).onChange((anchorY) => {
  line.attr('anchor', [lineConfig.anchorX, anchorY]);
});
lineFolder.open();
