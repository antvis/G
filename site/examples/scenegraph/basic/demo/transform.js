import { Canvas, CanvasEvent, Circle, Ellipse } from '@antv/g';
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

canvas.addEventListener(CanvasEvent.READY, () => {
  const ellipse = new Ellipse({
    style: {
      cx: 300,
      cy: 200,
      rx: 100,
      ry: 150,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });

  canvas.appendChild(ellipse);

  // original position
  const origin = new Circle({
    style: {
      r: 20,
      fill: 'red',
    },
  });
  canvas.appendChild(origin);
  origin.setLocalPosition(300, 200);

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

  const ellipseFolder = gui.addFolder('Transform');
  const ellipseConfig = {
    translateX: 0,
    translateY: 0,
    transformOriginX: 100,
    transformOriginY: 150,
    scale: 1,
    rotate: () => {
      ellipse.rotateLocal(10);
    },
  };
  ellipseFolder.add(ellipseConfig, 'translateX', -200, 200).onChange((tx) => {
    // same as:
    // ellipse.attr('x');
    // ellipse.attr('y');
    const [x, y] = ellipse.getPosition();
    // same as:
    // * ellipse.move(300 + tx, y);
    // * ellipse.moveTo(300 + tx, y);
    ellipse.setPosition(300 + tx, y);

    const [ox, oy] = ellipse.getOrigin();
    const [lx, ly] = ellipse.getPosition();
    origin.setPosition(lx + ox, ly + oy);
  });
  ellipseFolder.add(ellipseConfig, 'translateY', -200, 200).onChange((ty) => {
    const [x, y] = ellipse.getPosition();
    // same as:
    // * ellipse.move(x, 200 + ty);
    // * ellipse.moveTo(x, 200 + ty);
    ellipse.setPosition(x, 200 + ty);

    const [ox, oy] = ellipse.getOrigin();
    const [lx, ly] = ellipse.getPosition();
    origin.setPosition(lx + ox, ly + oy);
  });
  ellipseFolder
    .add(ellipseConfig, 'transformOriginX', -200, 200)
    .onChange((tx) => {
      ellipse.style.transformOrigin = `${tx}px ${ellipseConfig.transformOriginY}px`;

      const [ox, oy] = ellipse.getOrigin();
      const [lx, ly] = ellipse.getPosition();
      origin.setPosition(lx + ox, ly + oy);
    });
  ellipseFolder
    .add(ellipseConfig, 'transformOriginY', -200, 200)
    .onChange((ty) => {
      ellipse.style.transformOrigin = `${ellipseConfig.transformOriginX}px ${ty}px`;

      const [ox, oy] = ellipse.getOrigin();
      const [lx, ly] = ellipse.getPosition();
      origin.setPosition(lx + ox, ly + oy);
    });
  ellipseFolder.add(ellipseConfig, 'rotate').name('rotate');
  ellipseFolder.add(ellipseConfig, 'scale', 0.2, 5).onChange((scaling) => {
    ellipse.setLocalScale(scaling);
  });

  ellipseFolder.open();
});
