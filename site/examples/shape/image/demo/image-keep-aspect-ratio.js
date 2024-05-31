import { Canvas, CanvasEvent, Image } from '@antv/g';
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

const image = new Image({
  style: {
    x: 200,
    y: 100,
    width: 200,
    keepAspectRatio: true,
    src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    cursor: 'pointer',
    pointerEvents: 'pixels',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(image);
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

const imageFolder = gui.addFolder('image');
const config = {
  x: 200,
  y: 100,
  width: 200,
  height: 200,
  opacity: 1,
  src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
  pointerEvents: 'auto',
  visibility: 'visible',
};
imageFolder.add(config, 'x', 0, 400).onChange((x) => {
  image.style.x = x;
});
imageFolder.add(config, 'y', 0, 400).onChange((y) => {
  image.style.y = y;
});
imageFolder.add(config, 'width', 0, 400).onChange((width) => {
  image.style.width = width;
});
imageFolder.add(config, 'height', 0, 400).onChange((height) => {
  image.style.height = height;
});
imageFolder.add(config, 'opacity', 0, 1, 0.1).onChange((opacity) => {
  image.style.opacity = opacity;
});
imageFolder
  .add(config, 'src', [
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8eoKRbfOwgAAAAAAAAAAAABkARQnAQ',
  ])
  .onChange((src) => {
    image.style.img = src;
  });
imageFolder
  .add(config, 'pointerEvents', [
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
    image.style.pointerEvents = pointerEvents;
  });
imageFolder
  .add(config, 'visibility', ['visible', 'hidden'])
  .onChange((visibility) => {
    image.style.visibility = visibility;
  });
imageFolder.open();

const transformFolder = gui.addFolder('transform');
const transformConfig = {
  localPositionX: 0,
  localPositionY: 0,
  localScaleX: 1,
  localScaleY: 1,
  localEulerAngles: 0,
  skewX: 0,
  skewY: 0,
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
    image.style.transformOrigin = transformOrigin;
  });
transformFolder
  .add(transformConfig, 'localPositionX', 0, 600)
  .onChange((localPositionX) => {
    const [lx, ly] = image.getLocalPosition();
    image.setLocalPosition(localPositionX, ly);
  });
transformFolder
  .add(transformConfig, 'localPositionY', 0, 500)
  .onChange((localPositionY) => {
    const [lx, ly] = image.getLocalPosition();
    image.setLocalPosition(lx, localPositionY);
  });
transformFolder
  .add(transformConfig, 'localScaleX', -5, 5)
  .onChange((localScaleX) => {
    if (localScaleX === 0) {
      localScaleX = 0.0001;
    }
    image.setLocalScale(localScaleX, transformConfig.localScaleY);
  });
transformFolder
  .add(transformConfig, 'localScaleY', -5, 5)
  .onChange((localScaleY) => {
    if (localScaleY === 0) {
      localScaleY = 0.0001;
    }
    image.setLocalScale(transformConfig.localScaleX, localScaleY);
  });
transformFolder
  .add(transformConfig, 'localEulerAngles', 0, 360)
  .onChange((localEulerAngles) => {
    image.setLocalEulerAngles(localEulerAngles);
  });
transformFolder.add(transformConfig, 'skewX', -180, 180).onChange((skewX) => {
  image.setLocalSkew(
    skewX * (Math.PI / 180),
    transformConfig.skewY * (Math.PI / 180),
  );
});
transformFolder.add(transformConfig, 'skewY', -180, 180).onChange((skewY) => {
  image.setLocalSkew(
    transformConfig.skewX * (Math.PI / 180),
    skewY * (Math.PI / 180),
  );
});
transformFolder.open();
