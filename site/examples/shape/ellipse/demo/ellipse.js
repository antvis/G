import { Canvas, CanvasEvent, Ellipse } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
  fonts: [
    {
      name: 'Roboto',
      url: '/Roboto-Regular.ttf',
    },
    {
      name: 'sans-serif',
      url: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/file/A*064aSK2LUPEAAAAAAAAAAAAADmJ7AQ/NotoSansCJKsc-VF.ttf',
    },
  ],
});
const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const ellipse = new Ellipse({
  style: {
    cx: 300,
    cy: 200,
    rx: 100,
    ry: 150,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    cursor: 'pointer',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(ellipse);
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
rendererFolder
  .add(rendererConfig, 'renderer', [
    'canvas',
    'svg',
    'webgl',
    'webgpu',
    'canvaskit',
  ])
  .onChange((rendererName) => {
    let renderer;
    if (rendererName === 'canvas') {
      renderer = canvasRenderer;
    } else if (rendererName === 'svg') {
      renderer = svgRenderer;
    } else if (rendererName === 'webgl') {
      renderer = webglRenderer;
    } else if (rendererName === 'webgpu') {
      renderer = webgpuRenderer;
    } else if (rendererName === 'canvaskit') {
      renderer = canvaskitRenderer;
    }
    canvas.setRenderer(renderer);
  });
rendererFolder.open();

const ellipseFolder = gui.addFolder('ellipse');
const ellipseConfig = {
  cx: 300,
  cy: 200,
  rx: 100,
  ry: 150,
  fill: '#1890FF',
  stroke: '#F04864',
  lineWidth: 4,
  fillOpacity: 1,
  strokeOpacity: 1,
  increasedLineWidthForHitTesting: 0,
  cursor: 'pointer',
  shadowColor: '#fff',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  pointerEvents: 'auto',
  visibility: 'visible',
};
ellipseFolder.add(ellipseConfig, 'cx', 0, 600).onChange((cx) => {
  ellipse.style.cx = cx;
});
ellipseFolder.add(ellipseConfig, 'cy', 0, 600).onChange((cy) => {
  ellipse.style.cy = cy;
});
ellipseFolder.add(ellipseConfig, 'rx', 50, 200).onChange((rx) => {
  ellipse.style.rx = rx;
});
ellipseFolder.add(ellipseConfig, 'ry', 50, 200).onChange((ry) => {
  ellipse.style.ry = ry;
});
ellipseFolder.addColor(ellipseConfig, 'fill').onChange((color) => {
  ellipse.style.fill = color;
});
ellipseFolder.addColor(ellipseConfig, 'stroke').onChange((color) => {
  ellipse.style.stroke = color;
});
ellipseFolder.add(ellipseConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  ellipse.style.lineWidth = lineWidth;
});
ellipseFolder
  .add(ellipseConfig, 'fillOpacity', 0, 1, 0.1)
  .onChange((opacity) => {
    ellipse.style.fillOpacity = opacity;
  });
ellipseFolder
  .add(ellipseConfig, 'strokeOpacity', 0, 1, 0.1)
  .onChange((opacity) => {
    ellipse.style.strokeOpacity = opacity;
  });
ellipseFolder.open();
ellipseFolder
  .add(ellipseConfig, 'increasedLineWidthForHitTesting', 0, 200)
  .onChange((increasedLineWidthForHitTesting) => {
    ellipse.style.increasedLineWidthForHitTesting =
      increasedLineWidthForHitTesting;
  });
ellipseFolder
  .add(ellipseConfig, 'cursor', [
    'default',
    'pointer',
    'help',
    'progress',
    'text',
    'move',
  ])
  .onChange((cursor) => {
    ellipse.style.cursor = cursor;
  });
ellipseFolder.addColor(ellipseConfig, 'shadowColor').onChange((color) => {
  ellipse.attr('shadowColor', color);
});
ellipseFolder
  .add(ellipseConfig, 'shadowBlur', 0, 100)
  .onChange((shadowBlur) => {
    ellipse.style.shadowBlur = shadowBlur;
  });
ellipseFolder
  .add(ellipseConfig, 'shadowOffsetX', -50, 50)
  .onChange((shadowOffsetX) => {
    ellipse.style.shadowOffsetX = shadowOffsetX;
  });
ellipseFolder
  .add(ellipseConfig, 'shadowOffsetY', -50, 50)
  .onChange((shadowOffsetY) => {
    ellipse.style.shadowOffsetY = shadowOffsetY;
  });
ellipseFolder
  .add(ellipseConfig, 'pointerEvents', [
    'none',
    'auto',
    'stroke',
    'fill',
    'painted',
    'visible',
    'visiblestroke',
    'visiblefill',
    'visiblepainted',
    'all',
  ])
  .onChange((pointerEvents) => {
    ellipse.style.pointerEvents = pointerEvents;
  });
ellipseFolder
  .add(ellipseConfig, 'visibility', ['visible', 'hidden'])
  .onChange((visibility) => {
    ellipse.style.visibility = visibility;
  });

const transformFolder = gui.addFolder('transform');
const transformConfig = {
  localPositionX: 0,
  localPositionY: 0,
  localScale: 1,
  localEulerAngles: 0,
  transformOrigin: 'left top',
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
    ellipse.style.transformOrigin = transformOrigin;
  });
transformFolder
  .add(transformConfig, 'localPositionX', 0, 600)
  .onChange((localPositionX) => {
    const [lx, ly] = ellipse.getLocalPosition();
    ellipse.setLocalPosition(localPositionX, ly);
  });
transformFolder
  .add(transformConfig, 'localPositionY', 0, 500)
  .onChange((localPositionY) => {
    const [lx, ly] = ellipse.getLocalPosition();
    ellipse.setLocalPosition(lx, localPositionY);
  });
transformFolder
  .add(transformConfig, 'localScale', 0.2, 5)
  .onChange((localScale) => {
    ellipse.setLocalScale(localScale);
  });
transformFolder
  .add(transformConfig, 'localEulerAngles', 0, 360)
  .onChange((localEulerAngles) => {
    ellipse.setLocalEulerAngles(localEulerAngles);
  });
transformFolder.open();
