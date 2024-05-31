import { Canvas, CanvasEvent, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const svgRenderer = new SVGRenderer();
const webglRenderer = new WebGLRenderer();
const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});
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

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

// create a circle
const circle = new Circle({
  style: {
    cx: 300,
    cy: 200,
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    shadowColor: 'black',
    shadowBlur: 20,
    cursor: 'pointer',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  // add a circle to canvas
  canvas.appendChild(circle);
});

// use AntV G devtools
window.__g_instances__ = [canvas];

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

const circleFolder = gui.addFolder('circle');
const circleConfig = {
  cx: 300,
  cy: 200,
  r: 100,
  fill: '#1890FF',
  stroke: '#F04864',
  lineWidth: 4,
  lineDash: 0,
  lineDashOffset: 0,
  fillOpacity: 1,
  strokeOpacity: 1,
  shadowType: 'outer',
  shadowColor: '#000',
  shadowBlur: 20,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  increasedLineWidthForHitTesting: 0,
  cursor: 'pointer',
  pointerEvents: 'auto',
  visibility: 'visible',
};
circleFolder.add(circleConfig, 'cx', 0, 600).onChange((cx) => {
  circle.style.cx = cx;
});
circleFolder.add(circleConfig, 'cy', 0, 600).onChange((cy) => {
  circle.style.cy = cy;
});
circleFolder.add(circleConfig, 'r', 50, 200).onChange((r) => {
  circle.style.r = r;
});
circleFolder.addColor(circleConfig, 'fill').onChange((color) => {
  circle.style.fill = color;
});
circleFolder.addColor(circleConfig, 'stroke').onChange((color) => {
  circle.attr('stroke', color);
});
circleFolder
  .add(circleConfig, 'shadowType', ['inner', 'outer'])
  .onChange((shadowType) => {
    circle.attr('shadowType', shadowType);
  });
circleFolder.addColor(circleConfig, 'shadowColor').onChange((color) => {
  circle.attr('shadowColor', color);
});
circleFolder.add(circleConfig, 'shadowBlur', 0, 100).onChange((shadowBlur) => {
  circle.style.shadowBlur = shadowBlur;
});
circleFolder
  .add(circleConfig, 'shadowOffsetX', -50, 50)
  .onChange((shadowOffsetX) => {
    circle.style.shadowOffsetX = shadowOffsetX;
  });
circleFolder
  .add(circleConfig, 'shadowOffsetY', -50, 50)
  .onChange((shadowOffsetY) => {
    circle.style.shadowOffsetY = shadowOffsetY;
  });
circleFolder.add(circleConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  circle.style.lineWidth = lineWidth;
});
circleFolder.add(circleConfig, 'lineDash', 0, 100).onChange((lineDash) => {
  circle.style.lineDash = [lineDash];
});
circleFolder
  .add(circleConfig, 'lineDashOffset', 0, 100)
  .onChange((lineDashOffset) => {
    circle.style.lineDashOffset = lineDashOffset;
  });
circleFolder.add(circleConfig, 'fillOpacity', 0, 1, 0.1).onChange((opacity) => {
  circle.style.fillOpacity = opacity;
});
circleFolder
  .add(circleConfig, 'strokeOpacity', 0, 1, 0.1)
  .onChange((opacity) => {
    circle.style.strokeOpacity = opacity;
  });
circleFolder
  .add(circleConfig, 'increasedLineWidthForHitTesting', 0, 200)
  .onChange((increasedLineWidthForHitTesting) => {
    circle.style.increasedLineWidthForHitTesting =
      increasedLineWidthForHitTesting;
  });
circleFolder
  .add(circleConfig, 'cursor', [
    'default',
    'pointer',
    'help',
    'progress',
    'text',
    'move',
  ])
  .onChange((cursor) => {
    circle.style.cursor = cursor;
  });
circleFolder
  .add(circleConfig, 'pointerEvents', [
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
    circle.style.pointerEvents = pointerEvents;
  });
circleFolder
  .add(circleConfig, 'visibility', ['visible', 'hidden'])
  .onChange((visibility) => {
    circle.style.visibility = visibility;
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
    circle.style.transformOrigin = transformOrigin;
  });
transformFolder
  .add(transformConfig, 'localPositionX', 0, 600)
  .onChange((localPositionX) => {
    const [lx, ly] = circle.getLocalPosition();
    circle.setLocalPosition(localPositionX, ly);
  });
transformFolder
  .add(transformConfig, 'localPositionY', 0, 500)
  .onChange((localPositionY) => {
    const [lx, ly] = circle.getLocalPosition();
    circle.setLocalPosition(lx, localPositionY);
  });
transformFolder
  .add(transformConfig, 'localScale', 0.2, 5)
  .onChange((localScale) => {
    circle.setLocalScale(localScale);
  });
transformFolder
  .add(transformConfig, 'localEulerAngles', 0, 360)
  .onChange((localEulerAngles) => {
    circle.setLocalEulerAngles(localEulerAngles);
  });
transformFolder.open();
