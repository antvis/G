import { Canvas, CanvasEvent, Path } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
});
const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const path2 = new Path({
  style: {
    transform: 'translate(200, 100) scale(10)',
    d: 'M2 4C0.8954304997175604 3.9999999991219815 -1.3527075029566811e-16 4.895430499717561 0 6C0 6 0 9.9375 0 12C1.3527075029566811e-16 13.10456950028244 0.8954304997175604 14.00000000087802 2 14C8 14 10.25 14 14 14C15.104569499040734 13.99999999912198 16 13.104569499040734 16 12C16 9 16 7.875 16 6C16 4.895430500959266 15.104569499040734 4.0000000008780185 14 4C13.414 4 13.194249999999998 4 12.828 4C12.297610373455704 3.9998867247945213 11.788985462367364 3.7890987493850155 11.414 3.414C11 3 10.84475 2.8447500000000003 10.586 2.5860000000000003C10.211014537632636 2.210901250614985 9.702389626544296 2.0001132752054787 9.172 2.0000000000000004C8 2.0000000000000004 7.560500000000001 2.0000000000000004 6.828000000000001 2.0000000000000004C6.297610373455706 2.0001132752054787 5.788985462367367 2.210901250614985 5.4140000000000015 2.5860000000000003C5.000000000000002 3 4.844750000000001 3.1552499999999997 4.586000000000001 3.414C4.211014537632636 3.7890987493850155 3.7023896265442966 3.9998867247945213 3.1720000000000015 4C2.5860000000000016 4 2.3662500000000017 4 2.0000000000000018 4C2.000000000000001 4 2.000000000000001 4 2 4M10.5 8.5C10.5 6.575499102701247 8.416666666666666 5.372686041889527 6.75 6.334936490538903C5.976497308103742 6.781518477924107 5.5 7.606836025229591 5.5 8.5C5.5 10.424500897298753 7.583333333333334 11.627313958110474 9.25 10.665063509461097C10.023502691896258 10.218481522075892 10.5 9.39316397477041 10.5 8.5C10.5 8.5 10.5 8.5 10.5 8.5M2.5 6C2.1150998205402494 6.000000000305956 1.874537208444147 5.583333333830511 2.0669872979090567 5.2500000003442C2.1563036954051213 5.095299461648009 2.321367204761929 4.999999999858005 2.5 5C2.8849001794597506 5.000000000305956 3.125462791688336 5.416666667163845 2.933012701693495 5.7500000003442C2.8436963042354777 5.904700538406512 2.6786327946700927 5.999999999858005 2.5 6C2.5 6 2.5 6 2.5 6M11.5 8.5C11.5 11.194301256218253 8.583333333333334 12.878239541354663 6.250000000000001 11.531088913245537C5.167096231345241 10.90587413090625 4.5 9.750429564678573 4.5 8.5C4.5 5.805698743781747 7.416666666666667 4.121760458645338 9.75 5.468911086754464C10.832903768654761 6.094125869093751 11.5 7.249570435321427 11.5 8.5C11.5 8.5 11.5 8.5 11.5 8.5',
    lineWidth: 1,
    lineJoin: 'round',
    stroke: '#54BECC',
    cursor: 'pointer',
  },
});
path2.addEventListener('mouseenter', () => {
  path2.style.stroke = 'red';
});
path2.addEventListener('mouseleave', () => {
  path2.style.stroke = '#54BECC';
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(path2);
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

const pathFolder = gui.addFolder('path');
const pathConfig = {
  increasedLineWidthForHitTesting: 0,
  cursor: 'pointer',
};
pathFolder
  .add(pathConfig, 'increasedLineWidthForHitTesting', 0, 200)
  .onChange((increasedLineWidthForHitTesting) => {
    path2.style.increasedLineWidthForHitTesting =
      increasedLineWidthForHitTesting;
  });
pathFolder
  .add(pathConfig, 'cursor', [
    'default',
    'pointer',
    'help',
    'progress',
    'text',
    'move',
  ])
  .onChange((cursor) => {
    path2.style.cursor = cursor;
  });
