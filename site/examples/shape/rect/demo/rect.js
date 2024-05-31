import { Canvas, CanvasEvent, Rect } from '@antv/g';
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

const rect = new Rect({
  style: {
    x: 100,
    y: 100,
    width: 300,
    height: 200,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    radius: [0, 4, 8, 16],
    cursor: 'pointer',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(rect);
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

const rectFolder = gui.addFolder('rect');
const rectConfig = {
  x: 200,
  y: 100,
  width: 300,
  height: 200,
  fill: '#1890FF',
  stroke: '#F04864',
  lineWidth: 4,
  lineDash: 0,
  lineDashOffset: 0,
  radiusTL: 0,
  radiusTR: 4,
  radiusBR: 8,
  radiusBL: 16,
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
rectFolder.add(rectConfig, 'x', 0, 400).onChange((x) => {
  rect.style.x = x;
});
rectFolder.add(rectConfig, 'y', 0, 400).onChange((y) => {
  rect.style.y = y;
});
rectFolder.add(rectConfig, 'width', -400, 400).onChange((width) => {
  rect.style.width = width;
});
rectFolder.add(rectConfig, 'height', -400, 400).onChange((height) => {
  rect.style.height = height;
});
rectFolder.addColor(rectConfig, 'fill').onChange((color) => {
  rect.style.fill = color;
});
rectFolder.addColor(rectConfig, 'stroke').onChange((color) => {
  rect.style.stroke = color;
});
rectFolder.add(rectConfig, 'radiusTL', 0, 20).onChange((radiusTL) => {
  rect.style.radius = [
    radiusTL,
    rectConfig.radiusTR,
    rectConfig.radiusBR,
    rectConfig.radiusBL,
  ];
});
rectFolder.add(rectConfig, 'radiusTR', 0, 20).onChange((radiusTR) => {
  rect.style.radius = [
    rectConfig.radiusTL,
    radiusTR,
    rectConfig.radiusBR,
    rectConfig.radiusBL,
  ];
});
rectFolder.add(rectConfig, 'radiusBR', 0, 20).onChange((radiusBR) => {
  rect.style.radius = [
    rectConfig.radiusTL,
    rectConfig.radiusTR,
    radiusBR,
    rectConfig.radiusBL,
  ];
});
rectFolder.add(rectConfig, 'radiusBL', 0, 20).onChange((radiusBL) => {
  rect.style.radius = [
    rectConfig.radiusTL,
    rectConfig.radiusTR,
    rectConfig.radiusBR,
    radiusBL,
  ];
});
rectFolder.add(rectConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  rect.style.lineWidth = lineWidth;
});
rectFolder.add(rectConfig, 'lineDash', 0, 100).onChange((lineDash) => {
  rect.style.lineDash = [lineDash];
});
rectFolder
  .add(rectConfig, 'lineDashOffset', 0, 100)
  .onChange((lineDashOffset) => {
    rect.style.lineDashOffset = lineDashOffset;
  });
rectFolder.add(rectConfig, 'fillOpacity', 0, 1, 0.1).onChange((opacity) => {
  rect.style.fillOpacity = opacity;
});
rectFolder.add(rectConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  rect.style.strokeOpacity = opacity;
});
rectFolder
  .add(rectConfig, 'increasedLineWidthForHitTesting', 0, 200)
  .onChange((increasedLineWidthForHitTesting) => {
    rect.style.increasedLineWidthForHitTesting =
      increasedLineWidthForHitTesting;
  });
rectFolder
  .add(rectConfig, 'cursor', [
    'default',
    'pointer',
    'help',
    'progress',
    'text',
    'move',
  ])
  .onChange((cursor) => {
    rect.style.cursor = cursor;
  });
rectFolder.addColor(rectConfig, 'shadowColor').onChange((color) => {
  rect.attr('shadowColor', color);
});
rectFolder.add(rectConfig, 'shadowBlur', 0, 100).onChange((shadowBlur) => {
  rect.style.shadowBlur = shadowBlur;
});
rectFolder
  .add(rectConfig, 'shadowOffsetX', -50, 50)
  .onChange((shadowOffsetX) => {
    rect.style.shadowOffsetX = shadowOffsetX;
  });
rectFolder
  .add(rectConfig, 'shadowOffsetY', -50, 50)
  .onChange((shadowOffsetY) => {
    rect.style.shadowOffsetY = shadowOffsetY;
  });
rectFolder
  .add(rectConfig, 'pointerEvents', [
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
    rect.style.pointerEvents = pointerEvents;
  });
rectFolder
  .add(rectConfig, 'visibility', ['visible', 'hidden'])
  .onChange((visibility) => {
    rect.style.visibility = visibility;
  });
rectFolder.open();

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
    rect.style.transformOrigin = transformOrigin;
  });
transformFolder
  .add(transformConfig, 'localPositionX', 0, 600)
  .onChange((localPositionX) => {
    const [lx, ly] = rect.getLocalPosition();
    rect.setLocalPosition(localPositionX, ly);
  });
transformFolder
  .add(transformConfig, 'localPositionY', 0, 500)
  .onChange((localPositionY) => {
    const [lx, ly] = rect.getLocalPosition();
    rect.setLocalPosition(lx, localPositionY);
  });
transformFolder
  .add(transformConfig, 'localScale', 0.2, 5)
  .onChange((localScale) => {
    rect.setLocalScale(localScale);
  });
transformFolder
  .add(transformConfig, 'localEulerAngles', 0, 360)
  .onChange((localEulerAngles) => {
    rect.setLocalEulerAngles(localEulerAngles);
  });
transformFolder.open();
