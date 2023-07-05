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
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
  fonts: [
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

// add a circle to canvas
const circle = new Circle({
  style: {
    cx: 300,
    cy: 200,
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    cursor: 'pointer',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(circle);

  circle.addEventListener('pointerenter', function (e) {
    console.log(this, e.currentTarget);
    circle.style.fill = '#2FC25B';
  });

  circle.addEventListener('pointerleave', () => {
    console.log(this);
    circle.style.fill = '#1890FF';
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
    .add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg'])
    .onChange((renderer) => {
      canvas.setRenderer(
        renderer === 'canvas'
          ? canvasRenderer
          : renderer === 'webgl'
          ? webglRenderer
          : svgRenderer,
      );
    });
  rendererFolder.open();

  const circleFolder = gui.addFolder('circle');
  const circleConfig = {
    interactive: true,
    visible: true,
  };
  circleFolder.add(circleConfig, 'visible').onChange((visible) => {
    if (visible) {
      circle.style.visibility = 'visible';
      // circle.show();
    } else {
      circle.style.visibility = 'hidden';
      // circle.hide();
    }
  });
  circleFolder.add(circleConfig, 'interactive').onChange((interactive) => {
    circle.interactive = interactive;
  });
  circleFolder.open();
});
