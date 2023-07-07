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
 * @see https://lottiefiles.github.io/lottie-docs/concepts/#transform
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
  height: 500,
  renderer: canvasRenderer,
});

canvas.addEventListener(CanvasEvent.READY, async () => {
  const data = await d3.json('/lottie/spring.json');
  const animation = loadAnimation(data, { loop: true, autoplay: true });
  const wrapper = animation.render(canvas);

  const data2 = await d3.json('/lottie/spring2.json');
  const animation2 = loadAnimation(data2, { loop: false, autoplay: false });
  const wrapper2 = animation2.render(canvas);
  wrapper2.translate(150, 0);

  console.log(
    animation2.fps(),
    animation2.getDuration(),
    animation2.getDuration(true),
  );

  const data3 = await d3.json('/lottie/spring3.json');
  const animation3 = loadAnimation(data3, { loop: true, autoplay: true });
  const wrapper3 = animation3.render(canvas);
  wrapper3.translate(250, 0);

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

  const folder = gui.addFolder('playSegments');
  const config = {
    playSegmentsFirstFrame: 0,
    playSegmentsLastFrame: 24,
  };

  folder.add(config, 'playSegmentsFirstFrame', 0, 24).onChange((firstFrame) => {
    animation2.playSegments([firstFrame, config.playSegmentsLastFrame]);
  });
  folder.add(config, 'playSegmentsLastFrame', 0, 24).onChange((lastFrame) => {
    animation2.playSegments([config.playSegmentsFirstFrame, lastFrame]);
  });
  folder.open();
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
