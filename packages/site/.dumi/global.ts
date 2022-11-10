if (window) {
  (window as any).react = require('react');
  (window as any).reactDom = require('react-dom');
  (window as any).antd = require('antd');
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
  (window as any).d3Force3d = require('d3-force-3d');
  (window as any).d3SvgAnnotation = require('d3-svg-annotation');
  (window as any).plot = require('@observablehq/plot');
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
  (window as any).gPluginGpgpu = require('@antv/g-plugin-gpgpu');
  (window as any).gPluginPhysx = require('@antv/g-plugin-physx');
  (window as any).gPluginBox2d = require('@antv/g-plugin-box2d');
  (window as any).gPluginMatterjs = require('@antv/g-plugin-matterjs');
  (window as any).gPluginYoga = require('@antv/g-plugin-yoga');
  (window as any).gPluginRoughCanvasRenderer = require('@antv/g-plugin-rough-canvas-renderer');
  (window as any).gPluginRoughSvgRenderer = require('@antv/g-plugin-rough-svg-renderer');
  (window as any).gPluginSvgRenderer = require('@antv/g-plugin-svg-renderer');
  (window as any).gPluginDragndrop = require('@antv/g-plugin-dragndrop');
  (window as any).gPluginA11y = require('@antv/g-plugin-a11y');
  (window as any).gPluginAnnotation = require('@antv/g-plugin-annotation');
  // compiler for GPGPU
  (window as any).webgpuGraph = require('@antv/webgpu-graph');
  (window as any).gComponents = require('@antv/g-components');
  (window as any).gWebComponents = require('@antv/g-web-components');
  (window as any).gImageExporter = require('@antv/g-image-exporter');
  (window as any).gLottiePlayer = require('@antv/g-lottie-player');

  (window as any).reactG = require('@antv/react-g');
  // (window as any).mainWorker = require('./examples/canvas/demo/main.worker.js');
  (window as any).workerizeTransferable = require('@naoak/workerize-transferable');
  (window as any).webfontloader = require('webfontloader');

  require('../css/demo.css');

  // origin trial for WebGPU
  // @see https://developer.chrome.com/origintrials/#/trials/my
  // @see https://github.com/GoogleChrome/OriginTrials/blob/gh-pages/developer-guide.md#16-can-i-provide-tokens-by-running-script
  const tokenElement1 = document.createElement('meta');
  tokenElement1.httpEquiv = 'origin-trial';
  tokenElement1.content =
    // https://localhost:8000
    'AtaPcs85GAQLEMk4PnxB6jmeMr8Mti6j4gS9X5s48K1kX62IZHCnQv5mtMHMxlQx+FVLnqSvs38xjLJdHXqMYgcAAABJeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjgwMDAiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjc1MjA5NTk5fQ==';
  document.head.appendChild(tokenElement1);

  const tokenElement2 = document.createElement('meta');
  tokenElement2.httpEquiv = 'origin-trial';
  tokenElement2.content =
    // https://g-next.antv.vision
    'AgH4GJVeO0K7oJTtD0L0ESbQ5xdGuo95Kr3KkWJ+nDKLIJpPTGz5oY1mnkcqpAyX2an7fSKcCOM/IpEzeu70CwgAAABleyJvcmlnaW4iOiJodHRwczovL2ctbmV4dC5hbnR2LnZpc2lvbjo0NDMiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjc1MjA5NTk5LCJpc1N1YmRvbWFpbiI6dHJ1ZX0=';
  document.head.appendChild(tokenElement2);

  const tokenElement3 = document.createElement('meta');
  tokenElement3.httpEquiv = 'origin-trial';
  tokenElement3.content =
    // https://antv-g-next.gitee.io
    'AmzNijXrcUZyb44A2IdX8oeviklulN/QSoVqhnuIsoeVhmuFz3zgGydSQXO1/D+SR+l3w1xLSwIToHfDxnGCvgwAAABneyJvcmlnaW4iOiJodHRwczovL2FudHYtZy1uZXh0LmdpdGVlLmlvOjQ0MyIsImZlYXR1cmUiOiJXZWJHUFUiLCJleHBpcnkiOjE2NzUyMDk1OTksImlzU3ViZG9tYWluIjp0cnVlfQ==';
  document.head.appendChild(tokenElement3);
}
