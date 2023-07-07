import { Canvas, CanvasEvent, HTML, Rect } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import SimplexNoise from 'simplex-noise';
import Stats from 'stats.js';

/**
 * <pattern>
 * support the following image source:
 * * HTMLImageElement (<img>)
 * * HTMLCanvasElement (<canvas>)
 * * HTMLVideoElement (<video>)
 * * ImageData
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createPattern#%E5%8F%82%E6%95%B0
 */

// create a renderer
const canvasRenderer = new CanvasRenderer();
const svgRenderer = new SVGRenderer();
const webglRenderer = new WebGLRenderer();
const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
});

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

// <img> URL
const rect1 = new Rect({
  style: {
    x: 50,
    y: 50,
    width: 200,
    height: 100,
    fill: {
      image:
        'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*jgjxQ57sACsAAAAAAAAAAAAAARQnAQ',
      repetition: 'repeat',
    },
  },
});

// HTMLCanvasElement (<canvas>)
// @see https://observablehq.com/@awoodruff/canvas-cartography-nacis-2019
const patternCanvas = document.createElement('canvas');
patternCanvas.width = 20;
patternCanvas.height = 20;
const ctx = patternCanvas.getContext('2d');
ctx.strokeStyle = '#333';
ctx.lineWidth = 1;
ctx.beginPath();
for (let i = 0.5; i < 20; i += 5) {
  ctx.moveTo(0, i);
  ctx.lineTo(20, i);
}
ctx.stroke();
const rect3 = new Rect({
  style: {
    x: 50,
    y: 200,
    width: 200,
    height: 100,
    fill: {
      image: patternCanvas,
      repetition: 'repeat',
    },
  },
});

const width = 200;
const height = 100;
const noiseCanvas = document.createElement('canvas');
noiseCanvas.width = width;
noiseCanvas.height = height;
const context = noiseCanvas.getContext('2d');
const image = context.createImageData(width, height);
const noise = new SimplexNoise();
for (let z = 0, y = 0, i = 0; y < height; ++y) {
  for (let x = 0; x < width; ++x, i += 4) {
    image.data[i + 3] = (noise.noise2D(x / 64, y / 64) + 1) * 128;
  }
}
context.putImageData(image, 0, 0);
const rect4 = new Rect({
  style: {
    x: 300,
    y: 200,
    width: 200,
    height: 100,
    fill: {
      image: context.canvas,
      repetition: 'repeat',
    },
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(rect1);
  canvas.appendChild(rect3);
  canvas.appendChild(rect4);

  // HTMLImageElement(<img>)
  const image = new window.Image();
  image.onload = () => {
    const rect2 = new Rect({
      style: {
        x: 300,
        y: 50,
        width: 200,
        height: 100,
        fill: {
          image,
          repetition: 'repeat',
        },
      },
    });
    canvas.appendChild(rect2);
  };
  // without `crossOrigin`, it will throw 'WebGL2RenderingContext': Tainted canvases may not be loaded.
  image.crossOrigin = 'Anonymous';
  image.src =
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*jgjxQ57sACsAAAAAAAAAAAAAARQnAQ';

  // HTMLVideoElement(<video>)
  const video = document.createElement('video');
  video.src =
    'https://gw.alipayobjects.com/v/rms_6ae20b/afts/video/A*VD0TTbZB9WMAAAAAAAAAAAAAARQnAQ/720P';
  video.crossOrigin = 'Anonymous';
  video.autoplay = true;
  video.controls = false;
  video.muted = true;
  video.height = 100;
  video.width = 200;

  video.onloadeddata = function () {
    const rect5 = new Rect({
      style: {
        x: 50,
        y: 350,
        width: 200,
        height: 100,
        fill: {
          image: video,
          repetition: 'no-repeat',
        },
      },
    });
    canvas.appendChild(rect5);
  };

  canvas.appendChild(
    new HTML({
      style: {
        x: 100,
        y: 20,
        height: 30,
        width: 200,
        innerHTML: 'image URL',
      },
    }),
  );

  canvas.appendChild(
    new HTML({
      style: {
        x: 300,
        y: 20,
        height: 30,
        width: 200,
        innerHTML: 'HTMLImageElement(&lt;img&gt;)',
      },
    }),
  );

  canvas.appendChild(
    new HTML({
      style: {
        x: 50,
        y: 170,
        height: 30,
        width: 300,
        innerHTML: 'HTMLCanvasElement(&lt;canvas&gt;)',
      },
    }),
  );

  canvas.appendChild(
    new HTML({
      style: {
        x: 50,
        y: 320,
        height: 30,
        width: 300,
        innerHTML: 'HTMLVideoElement(&lt;video&gt;)',
      },
    }),
  );

  canvas.appendChild(
    new HTML({
      style: {
        x: 300,
        y: 170,
        height: 30,
        width: 300,
        innerHTML: 'Perlin Noise',
      },
    }),
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

const patternFolder = gui.addFolder('pattern');
const patternConfig = {
  repetition: 'repeat',
};
patternFolder
  .add(patternConfig, 'repetition', [
    'repeat',
    'repeat-x',
    'repeat-y',
    'no-repeat',
  ])
  .onChange((repetition) => {
    rect1.style.fill = {
      image:
        'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*jgjxQ57sACsAAAAAAAAAAAAAARQnAQ',
      repetition,
    };
  });
patternFolder.open();
