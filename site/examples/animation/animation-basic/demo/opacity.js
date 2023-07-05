import { Canvas, CanvasEvent, Path } from '@antv/g';
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

const path = new Path({
  style: {
    fill: '#5B8FF9',
    // fillOpacity: 0,
    stroke: '#5B8FF9',
    // strokeOpacity: 0,
    // opacity: 0,
    path: 'M11.078431372405001,86.78571428571429L110.78431372534617,86.78571428571429L110.78431372534617,405L11.078431372405001,405Z',
  },
});

// const path2 = new Path({
//   style: {
//     fill: '#5B8FF9',
//     stroke: '#5B8FF9',
//     path: 'M232.64705882332998,266.14285714285717L332.3529411762712,266.14285714285717L332.3529411762712,405L232.64705882332998,405Z',
//   },
// });

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(path);
  // canvas.appendChild(path2);

  const transformOrigin = [0, 318.21429443359375];
  path.setOrigin(transformOrigin);
  const animation = path.animate(
    [
      {
        // transform: 'scale(1, 0.0001)',
        fillOpacity: 0,
        strokeOpacity: 0,
        opacity: 0,
      },
      {
        // transform: 'scale(1, 0.0001)',
        fillOpacity: '',
        strokeOpacity: '',
        opacity: '',
        // offset: 0.01,
      },
      // {
      //   transform: 'scale(1, 1)',
      // },
    ],
    {
      duration: 1200,
      fill: 'both',
      delay: 0,
      iterations: Infinity,
    },
  );

  animation.finished.then(() => path.setOrigin(0, 0));

  animation.onframe = () => {
    // @ts-ignore
    console.log('frame...', path.style.opacity);
  };

  // path2.animate(
  //   [
  //     {
  //       transform: 'scale(1, 0.0001)',
  //       fillOpacity: 0,
  //       strokeOpacity: 0,
  //       opacity: 0,
  //     },
  //     {
  //       transform: 'scale(1, 0.0001)',
  //       fillOpacity: 1,
  //       strokeOpacity: 1,
  //       opacity: 1,
  //       offset: 0.01,
  //     },
  //     {
  //       transform: 'scale(1, 1)',
  //     },
  //   ],
  //   {
  //     duration: 1200,
  //     fill: 'both',
  //     delay: 0,
  //   },
  // );
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
