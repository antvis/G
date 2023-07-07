import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { loadAnimation } from '@antv/g-lottie-player';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';
import * as d3 from 'd3';

/**
 * @see https://lottiefiles.github.io/lottie-docs/breakdown/bouncy_ball/
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
  fonts: [
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
  height: 600,
  renderer: canvasRenderer,
});

let pointerAnimation;
canvas.addEventListener(CanvasEvent.READY, async () => {
  const data1 = await d3.json('/lottie/data1.json');
  const animation1 = loadAnimation(data1, { loop: true, autoplay: true });
  const wrapper1 = animation1.render(canvas);
  wrapper1.scale(0.5);

  const data2 = await d3.json('/lottie/data4.json');
  const animation2 = loadAnimation(data2, { loop: true, autoplay: true });
  const wrapper2 = animation2.render(canvas);
  wrapper2.scale(0.5);
  wrapper2.translate(300, 0);

  const data3 = await d3.json('/lottie/data3.json');
  const animation3 = loadAnimation(data3, { loop: true, autoplay: true });
  const wrapper3 = animation3.render(canvas);
  wrapper3.scale(0.5);
  wrapper3.translate(300, 200);

  // const flower = await d3.json('/lottie/flower.json');
  // flowerAnimation = loadAnimation(flower, { loop: true, autoplay: true });
  // const wrapper = flowerAnimation.render(canvas);
  // wrapper.scale(0.5);
  // wrapper.translate(0, 200);

  const pointer = await d3.json('/lottie/pointer.json');
  pointerAnimation = loadAnimation(pointer, { loop: false, autoplay: false });
  const wrapper = pointerAnimation.render(canvas);
  wrapper.scale(0.5);
  wrapper.translate(0, 200);

  console.log(
    pointerAnimation.fps(),
    pointerAnimation.getDuration(false),
    pointerAnimation.getDuration(true),
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

const controlFolder = gui.addFolder('control');
const controlConfig = {
  pause: () => {
    pointerAnimation.pause();
  },
  play: () => {
    pointerAnimation.play();
  },
  stop: () => {
    pointerAnimation.stop();
  },
  speed: 1,
  goToCurrentTime: 0,
  goToFrame: 0,
  playSegmentsFirstFrame: 0,
  playSegmentsLastFrame: 0,
};
controlFolder.add(controlConfig, 'play');
controlFolder.add(controlConfig, 'pause');
controlFolder.add(controlConfig, 'stop');
controlFolder.add(controlConfig, 'speed', -3, 3).onChange((speed) => {
  pointerAnimation.setSpeed(speed);
});
controlFolder
  .add(controlConfig, 'goToCurrentTime', 0, 4.04)
  .onChange((time) => {
    pointerAnimation.goTo(time);
    pointerAnimation.play();
  });
controlFolder.add(controlConfig, 'goToFrame', 0, 101).onChange((frame) => {
  pointerAnimation.goTo(frame, true);
  pointerAnimation.play();
});
controlFolder
  .add(controlConfig, 'playSegmentsFirstFrame', 0, 101)
  .onChange((firstFrame) => {
    pointerAnimation.playSegments([
      firstFrame,
      controlConfig.playSegmentsLastFrame,
    ]);
  });
controlFolder
  .add(controlConfig, 'playSegmentsLastFrame', 0, 101)
  .onChange((lastFrame) => {
    pointerAnimation.playSegments([
      controlConfig.playSegmentsFirstFrame,
      lastFrame,
    ]);
  });
controlFolder.open();
