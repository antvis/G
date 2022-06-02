import { Canvas, CanvasEvent, Line } from '@antv/g';
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
const line1 = new Line({
  style: {
    x1: 200,
    y1: 100,
    x2: 400,
    y2: 100,
    stroke: '#1890FF',
    lineWidth: 2,
    cursor: 'pointer',
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

canvas.addEventListener(CanvasEvent.READY, () => {
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
  increasedLineWidthForHitTesting: 0,
  cursor: 'pointer',
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
lineFolder
  .add(lineConfig, 'increasedLineWidthForHitTesting', 0, 200)
  .onChange((increasedLineWidthForHitTesting) => {
    line1.style.increasedLineWidthForHitTesting = increasedLineWidthForHitTesting;
  });
lineFolder
  .add(lineConfig, 'cursor', ['default', 'pointer', 'help', 'progress', 'text', 'move'])
  .onChange((cursor) => {
    line1.style.cursor = cursor;
  });

const transformFolder = gui.addFolder('transform');
const transformConfig = {
  localPositionX: 200,
  localPositionY: 100,
  localScale: 1,
  localEulerAngles: 0,
  transformOrigin: 'left top',
  anchorX: 0,
  anchorY: 0,
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
transformFolder.add(transformConfig, 'localPositionX', 0, 600).onChange((localPositionX) => {
  const [lx, ly] = line1.getLocalPosition();
  line1.setLocalPosition(localPositionX, ly);
});
transformFolder.add(transformConfig, 'localPositionY', 0, 500).onChange((localPositionY) => {
  const [lx, ly] = line1.getLocalPosition();
  line1.setLocalPosition(lx, localPositionY);
});
transformFolder.add(transformConfig, 'localScale', 0.2, 5).onChange((localScale) => {
  line1.setLocalScale(localScale);
});
transformFolder.add(transformConfig, 'localEulerAngles', 0, 360).onChange((localEulerAngles) => {
  line1.setLocalEulerAngles(localEulerAngles);
});
transformFolder.add(transformConfig, 'anchorX', 0, 1).onChange((anchorX) => {
  line1.style.anchor = [anchorX, transformConfig.anchorY];
});
transformFolder.add(transformConfig, 'anchorY', 0, 1).onChange((anchorY) => {
  line1.style.anchor = [transformConfig.anchorX, anchorY];
});
transformFolder.open();
