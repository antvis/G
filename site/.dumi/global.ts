if (typeof window !== 'undefined' && window) {
  (window as any).react = require('react');
  (window as any).reactDom = require('react-dom');
  (window as any).reactSplitPane = require('react-split-pane');
  (window as any).g6 = require('@antv/g6');
  (window as any).util = require('@antv/util');
  (window as any).stats = require('stats.js');
  (window as any).lilGui = require('lil-gui');
  (window as any).hammerjs = require('hammerjs');
  (window as any).hammerTouchemulator = require('hammer-touchemulator');
  (window as any).interactjs = require('interactjs');
  (window as any).simplexNoise = require('simplex-noise');
  (window as any).topojson = require('topojson');
  (window as any).versor = require('versor');
  (window as any).d3 = require('d3');
  (window as any).d3Cloud = require('d3-cloud');
  (window as any).d3Force3d = require('d3-force-3d');
  (window as any).d3SvgAnnotation = require('d3-svg-annotation');
  (window as any).plot = require('@observablehq/plot');
  (window as any).glMatrix = require('gl-matrix');
  // core
  (window as any).g = require('@antv/g');
  (window as any).gLite = require('@antv/g-lite');
  // renderers
  (window as any).gCanvas = require('@antv/g-canvas');
  (window as any).gWebgl = require('@antv/g-webgl');
  (window as any).gSvg = require('@antv/g-svg');
  (window as any).gWebgpu = require('@antv/g-webgpu');
  (window as any).gCanvaskit = require('@antv/g-canvaskit');
  // plugins
  (window as any).gPluginCssSelect = require('@antv/g-plugin-css-select');
  (window as any).gPlugin3d = require('@antv/g-plugin-3d');
  (window as any).gPluginControl = require('@antv/g-plugin-control');
  (window as any).gPluginPhysx = require('@antv/g-plugin-physx');
  (window as any).gPluginBox2d = require('@antv/g-plugin-box2d');
  (window as any).gPluginMatterjs = require('@antv/g-plugin-matterjs');
  (window as any).gPluginYoga = require('@antv/g-plugin-yoga');
  (
    window as any
  ).gPluginDeviceRenderer = require('@antv/g-plugin-device-renderer');
  (
    window as any
  ).gPluginRoughCanvasRenderer = require('@antv/g-plugin-rough-canvas-renderer');
  (
    window as any
  ).gPluginRoughSvgRenderer = require('@antv/g-plugin-rough-svg-renderer');
  (
    window as any
  ).gPluginZdogCanvasRenderer = require('@antv/g-plugin-zdog-canvas-renderer');
  (
    window as any
  ).gPluginZdogSvgRenderer = require('@antv/g-plugin-zdog-svg-renderer');
  (window as any).gPluginSvgRenderer = require('@antv/g-plugin-svg-renderer');
  (window as any).gPluginDragndrop = require('@antv/g-plugin-dragndrop');
  (window as any).gPluginGesture = require('@antv/g-plugin-gesture');
  (window as any).gPluginA11y = require('@antv/g-plugin-a11y');
  (window as any).gPluginAnnotation = require('@antv/g-plugin-annotation');
  // compiler for GPGPU
  (window as any).gDeviceApi = require('@antv/g-device-api');
  (window as any).webgpuGraph = require('@antv/webgpu-graph');
  (window as any).gComponents = require('@antv/g-components');
  (window as any).gWebComponents = require('@antv/g-web-components');
  (window as any).gImageExporter = require('@antv/g-image-exporter');
  (window as any).gLottiePlayer = require('@antv/g-lottie-player');
  (window as any).gPattern = require('@antv/g-pattern');

  // (window as any).reactG = require('@antv/react-g');
  // (window as any).mainWorker = require('./examples/canvas/demo/main.worker.js');
  (
    window as any
  ).workerizeTransferable = require('@naoak/workerize-transferable');
  (window as any).webfontloader = require('webfontloader');

  require('../css/demo.css');
}

if (
  typeof window !== 'undefined' &&
  typeof location !== 'undefined' &&
  (location.host === 'g-next.antv.vision' ||
    location.host === 'antv-g-next.gitee.io')
) {
  (window as any).location.href = location.href.replace(
    location.origin,
    'https://g.antv.antgroup.com',
  );
}
