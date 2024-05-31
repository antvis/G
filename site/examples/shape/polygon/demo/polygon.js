import { Canvas, CanvasEvent, Polygon } from '@antv/g';
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

// create a polygon
const polygon = new Polygon({
  style: {
    points: [
      [200, 100],
      [400, 100],
      [400 + 200 * Math.sin(Math.PI / 6), 100 + 200 * Math.cos(Math.PI / 6)],
      [400, 100 + 200 * Math.cos(Math.PI / 6) * 2],
      [200, 100 + 200 * Math.cos(Math.PI / 6) * 2],
      [200 - 200 * Math.sin(Math.PI / 6), 100 + 200 * Math.cos(Math.PI / 6)],
    ],
    fill: '#C6E5FF',
    stroke: '#1890FF',
    lineWidth: 2,
    cursor: 'pointer',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  // add a polygon to canvas
  canvas.appendChild(polygon);
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

const polygonFolder = gui.addFolder('polygon');
const polygonConfig = {
  fill: '#C6E5FF',
  stroke: '#1890FF',
  lineWidth: 2,
  fillOpacity: 1,
  strokeOpacity: 1,
  lineDash: 0,
  lineDashOffset: 0,
  increasedLineWidthForHitTesting: 0,
  cursor: 'pointer',
  shadowColor: '#fff',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  pointerEvents: 'auto',
  visibility: 'visible',
};
polygonFolder.addColor(polygonConfig, 'fill').onChange((color) => {
  polygon.style.fill = color;
});
polygonFolder.addColor(polygonConfig, 'stroke').onChange((color) => {
  polygon.style.stroke = color;
});
polygonFolder.add(polygonConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  polygon.style.lineWidth = lineWidth;
});
polygonFolder.add(polygonConfig, 'lineDash', 0, 100).onChange((lineDash) => {
  polygon.style.lineDash = [lineDash];
});
polygonFolder
  .add(polygonConfig, 'lineDashOffset', 0, 100)
  .onChange((lineDashOffset) => {
    polygon.style.lineDashOffset = lineDashOffset;
  });
polygonFolder
  .add(polygonConfig, 'fillOpacity', 0, 1, 0.1)
  .onChange((opacity) => {
    polygon.style.fillOpacity = opacity;
  });
polygonFolder
  .add(polygonConfig, 'strokeOpacity', 0, 1, 0.1)
  .onChange((opacity) => {
    polygon.style.strokeOpacity = opacity;
  });
polygonFolder
  .add(polygonConfig, 'increasedLineWidthForHitTesting', 0, 200)
  .onChange((increasedLineWidthForHitTesting) => {
    polygon.style.increasedLineWidthForHitTesting =
      increasedLineWidthForHitTesting;
  });
polygonFolder
  .add(polygonConfig, 'cursor', [
    'default',
    'pointer',
    'help',
    'progress',
    'text',
    'move',
  ])
  .onChange((cursor) => {
    polygon.style.cursor = cursor;
  });
polygonFolder.addColor(polygonConfig, 'shadowColor').onChange((color) => {
  polygon.attr('shadowColor', color);
});
polygonFolder
  .add(polygonConfig, 'shadowBlur', 0, 100)
  .onChange((shadowBlur) => {
    polygon.style.shadowBlur = shadowBlur;
  });
polygonFolder
  .add(polygonConfig, 'shadowOffsetX', -50, 50)
  .onChange((shadowOffsetX) => {
    polygon.style.shadowOffsetX = shadowOffsetX;
  });
polygonFolder
  .add(polygonConfig, 'shadowOffsetY', -50, 50)
  .onChange((shadowOffsetY) => {
    polygon.style.shadowOffsetY = shadowOffsetY;
  });
polygonFolder
  .add(polygonConfig, 'pointerEvents', [
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
    polygon.style.pointerEvents = pointerEvents;
  });
polygonFolder
  .add(polygonConfig, 'visibility', ['visible', 'hidden'])
  .onChange((visibility) => {
    polygon.style.visibility = visibility;
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
    polygon.style.transformOrigin = transformOrigin;
  });
transformFolder
  .add(transformConfig, 'localPositionX', 0, 600)
  .onChange((localPositionX) => {
    const [lx, ly] = polygon.getLocalPosition();
    polygon.setLocalPosition(localPositionX, ly);
  });
transformFolder
  .add(transformConfig, 'localPositionY', 0, 500)
  .onChange((localPositionY) => {
    const [lx, ly] = polygon.getLocalPosition();
    polygon.setLocalPosition(lx, localPositionY);
  });
transformFolder
  .add(transformConfig, 'localScale', 0.2, 5)
  .onChange((localScale) => {
    polygon.setLocalScale(localScale);
  });
transformFolder
  .add(transformConfig, 'localEulerAngles', 0, 360)
  .onChange((localEulerAngles) => {
    polygon.setLocalEulerAngles(localEulerAngles);
  });
transformFolder.close();
