import { runtime, Canvas, CanvasEvent, Path, Group } from '@antv/g';
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
  const group = new Group();
  group.style.transform = 'translate(0, 100)';

  const path = new Path({
    style: {
      fill: '#5B8FF9',
      stroke: '#5B8FF9',
      fillOpacity: 0.95,
      d: 'M51.3636360168457,0L282.5,0L282.5,405L51.3636360168457,405Z',
    },
  });
  group.appendChild(path);
  canvas.appendChild(group);
  path.animate(
    [
      {
        d: 'M51.3636360168457,0L282.5,0L282.5,405L51.3636360168457,405Z',
        fill: '#5B8FF9',
        stroke: '#5B8FF9',
        fillOpacity: 0.95,
        strokeOpacity: 1,
        opacity: 1,
      },
      {
        d: 'M73.37662506103516,0L271.4934997558594,0L271.4934997558594,395L73.37662506103516,395Z',
        fill: '#5B8FF9',
        stroke: '#5B8FF9',
        fillOpacity: 0.95,
      },
    ],
    {
      duration: 1000,
      fill: 'both',
      delay: 0,
      easing: 'ease-in-out-sine',
    },
  );

  const path2 = new Path({
    style: {
      fill: '#5AD8A6',
      stroke: '#5AD8A6',
      fillOpacity: 0.95,
      d: 'M290,0L527.272705078125,0L527.272705078125,420L290,420Z',
    },
  });
  group.appendChild(path2);
  path2.animate(
    [
      {
        d: 'M290,0L527.272705078125,0L527.272705078125,420L290,420Z',
        fill: '#5B8FF9',
        stroke: '#5B8FF9',
        fillOpacity: 0.95,
        strokeOpacity: 1,
        opacity: 1,
      },
      {
        d: 'M301.2987060546875,32.30769348144531L504.6753234863281,32.30769348144531L504.6753234863281,420L301.2987060546875,420Z',
        fill: '#5AD8A6',
        stroke: '#5AD8A6',
        fillOpacity: 0.95,
      },
    ],
    {
      duration: 1000,
      fill: 'both',
      delay: 0,
      easing: 'ease-in-out-sine',
    },
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
