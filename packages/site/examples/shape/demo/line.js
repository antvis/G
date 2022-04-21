import { Line, Canvas } from '@antv/g';
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

// create a line
const line1 = new Line({
  style: {
    x1: 200,
    y1: 100,
    x2: 400,
    y2: 100,
    stroke: '#1890FF',
    lineWidth: 2,
  },
});

const line2 = new Line({
  style: {
    x1: 200,
    y1: 150,
    x2: 400,
    y2: 150,
    lineWidth: 2,
    lineDash: [10, 10],
    stroke: '#F04864',
  },
});
const line3 = new Line({
  style: {
    x1: 200,
    y1: 200,
    x2: 400,
    y2: 200,
    lineWidth: 2,
    stroke: 'l(0) 0:#F04864 0.5:#7EC2F3 1:#1890FF',
  },
});

canvas.appendChild(line1);
canvas.appendChild(line2);
canvas.appendChild(line3);

line2.animate([{ lineDashOffset: -20 }, { lineDashOffset: 0 }], {
  duration: 1500,
  iterations: Infinity,
});

line3.animate(
  [
    { x1: 200, lineWidth: 2 },
    { x1: 0, lineWidth: 10 },
  ],
  {
    duration: 1500,
    iterations: Infinity,
    easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
  },
);

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

const lineFolder = gui.addFolder('line1');
const lineConfig = {
  stroke: '#1890FF',
  lineWidth: 2,
  lineJoin: 'miter',
  lineCap: 'butt',
  strokeOpacity: 1,
  x1: 200,
  y1: 100,
  x2: 400,
  y2: 100,
  lineDash: 0,
  lineDashOffset: 0,
  visible: true,
};
lineFolder.add(lineConfig, 'lineJoin', ['miter', 'round', 'bevel']).onChange((lineJoin) => {
  line1.style.lineJoin = lineJoin;
});
lineFolder.add(lineConfig, 'lineCap', ['butt', 'round', 'square']).onChange((lineCap) => {
  line1.style.lineCap = lineCap;
});
lineFolder.add(lineConfig, 'lineDash', 0, 100).onChange((lineDash) => {
  line1.style.lineDash = [lineDash];
});
lineFolder.add(lineConfig, 'lineDashOffset', 0, 100).onChange((lineDashOffset) => {
  line1.style.lineDashOffset = lineDashOffset;
});
lineFolder.add(lineConfig, 'x1', 0, 400).onChange((x1) => {
  line1.style.x1 = x1;
});
lineFolder.add(lineConfig, 'y1', 0, 400).onChange((y1) => {
  line1.style.y1 = y1;
});
lineFolder.add(lineConfig, 'x2', 0, 400).onChange((x2) => {
  line1.style.x2 = x2;
});
lineFolder.add(lineConfig, 'y2', 0, 400).onChange((y2) => {
  line1.style.y2 = y2;
});
lineFolder.addColor(lineConfig, 'stroke').onChange((color) => {
  line1.style.stroke = color;
});
lineFolder.add(lineConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  line1.style.lineWidth = lineWidth;
});
lineFolder.add(lineConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  line1.style.strokeOpacity = opacity;
});
lineFolder.add(lineConfig, 'visible').onChange((visible) => {
  if (visible) {
    line1.style.visibility = 'visible';
    // line1.show();
  } else {
    line1.style.visibility = 'hidden';
    // line1.hide();
  }
});

const transformFolder = gui.addFolder('transform');
const transformConfig = {
  x: 200,
  y: 100,
  scale: 1,
  transformOrigin: 'left top',
  eulerAngles: 0,
};
transformFolder
  .add(transformConfig, 'transformOrigin', [
    'left top',
    'center',
    'right bottom',
    '50% 50%',
    '50px 50px',
  ])
  .onChange((transformOrigin) => {
    line1.style.transformOrigin = transformOrigin;
  });
transformFolder.add(transformConfig, 'x', 0, 400).onChange((x) => {
  line1.setLocalPosition(x, line1.style.y);
  // or
  // line1.style.x = x;
});
transformFolder.add(transformConfig, 'y', 0, 400).onChange((y) => {
  line1.setLocalPosition(line1.style.x, y);
  // or
  // line1.style.y = y;
});
transformFolder.add(transformConfig, 'scale', 0.2, 5).onChange((scaling) => {
  line1.setLocalScale(scaling);
});
transformFolder.add(transformConfig, 'eulerAngles', 0, 360).onChange((eulerAngles) => {
  line1.setLocalEulerAngles(eulerAngles);
});
transformFolder.open();
