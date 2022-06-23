import { Canvas, CanvasEvent, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

/**
 * ported from https://animista.net/play/entrances/scale-in
 */

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
  fonts: [
    {
      name: 'sans-serif',
      url: '/NotoSans-Regular.ttf',
    },
  ],
});
const webgpuRenderer = new WebGPURenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const circle = new Circle({
  style: {
    cx: 200,
    cy: 200,
    r: 60,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

let animation;
canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(circle);

  animation = circle.animate([{ transform: 'scale(1)' }, { transform: 'scale(2)' }], {
    duration: 500,
    easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
  });

  // get triggered when animation finished
  animation.onfinish = (e) => {
    console.log('finish!', e.target, e.target.playState);
  };
  animation.finished.then(() => {
    console.log('finish promise resolved');
  });
  // get triggered at the end of each frame in a running animation
  animation.onframe = (e) => {
    console.log(e.target.effect.getComputedTiming().progress);
    console.log('frame ended!', e.target, e.target.playState);
  };
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
  .add(rendererConfig, 'renderer', ['canvas', 'svg', 'webgl', 'webgpu', 'canvaskit'])
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

const animationFolder = gui.addFolder('animation');
const animationConfig = {
  play: () => {
    animation.play();
  },
  pause: () => {
    animation.pause();
  },
  reverse: () => {
    animation.reverse();
  },
  finish: () => {
    animation.finish();
  },
};
animationFolder.add(animationConfig, 'play').name('Play');
animationFolder.add(animationConfig, 'pause').name('Pause');
animationFolder.add(animationConfig, 'reverse').name('Reverse');
animationFolder.add(animationConfig, 'finish').name('Finish');
animationFolder.open();
