require('./site/css/demo.css');
window.react = require('react');
window.reactDom = require('react-dom');
window.reactSplitPane = require('react-split-pane');
window.antd = require('antd');
window.g6 = require('@antv/g6');
window.stats = require('stats.js');
window.lilGui = require('lil-gui');
window.hammerjs = require('hammerjs');
window.hammerTouchemulator = require('hammer-touchemulator');
window.interactjs = require('interactjs');
window.simplexNoise = require('simplex-noise');
window.d3 = require('d3');
window.d3Force3d = require('d3-force-3d');
window.d3SvgAnnotation = require('d3-svg-annotation');
// core
window.g = require('@antv/g');
// renderers
window.gCanvas = require('@antv/g-canvas');
window.gWebgl = require('@antv/g-webgl');
window.gSvg = require('@antv/g-svg');
window.gWebgpu = require('@antv/g-webgpu');
window.gCanvaskit = require('@antv/g-canvaskit');
// plugins
window.gPluginCssSelect = require('@antv/g-plugin-css-select');
window.gPlugin3d = require('@antv/g-plugin-3d');
window.gPluginControl = require('@antv/g-plugin-control');
window.gPluginGpgpu = require('@antv/g-plugin-gpgpu');
window.gPluginPhysx = require('@antv/g-plugin-physx');
window.gPluginBox2d = require('@antv/g-plugin-box2d');
window.gPluginMatterjs = require('@antv/g-plugin-matterjs');
window.gPluginYoga = require('@antv/g-plugin-yoga');
window.gPluginRoughCanvasRenderer = require('@antv/g-plugin-rough-canvas-renderer');
window.gPluginRoughSvgRenderer = require('@antv/g-plugin-rough-svg-renderer');
window.gPluginDragndrop = require('@antv/g-plugin-dragndrop');
// compiler for GPGPU
// window.webgpuGraph = require('@antv/webgpu-graph');
window.gComponents = require('@antv/g-components');
window.gWebComponents = require('@antv/g-web-components');
window.gImageExporter = require('@antv/g-image-exporter');

window.reactG = require('@antv/react-g');
window.mainWorker = require('./examples/canvas/demo/main.worker.js');
window.workerizeTransferable = require('@naoak/workerize-transferable');
window.webfontloader = require('webfontloader');

// origin trial for WebGPU
// @see https://developer.chrome.com/origintrials/#/trials/my
// @see https://github.com/GoogleChrome/OriginTrials/blob/gh-pages/developer-guide.md#16-can-i-provide-tokens-by-running-script
const tokenElement1 = document.createElement('meta');
tokenElement1.httpEquiv = 'origin-trial';
tokenElement1.content =
  // https://localhost:8000
  'AskBFhwWdwJJX7fGMNV72Pzx17Ie+rnFLgcF3UiQpX+j+eb7P23/I84lXdRPBPE5KOkTnyil7Rstt1Ucd0EmhAgAAABJeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjgwMDAiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjYzNzE4Mzk5fQ==';
document.head.appendChild(tokenElement1);

const tokenElement2 = document.createElement('meta');
tokenElement2.httpEquiv = 'origin-trial';
tokenElement2.content =
  // https://g-next.antv.vision
  'AtkT/ddy5T9TSuIvZIIt7os30Ic3WI9YWIkksJTuNMn0Sa7n7CJzr2iSwwQVxFEduHqO0jnjb+7q8+KPGMVuHgYAAABleyJvcmlnaW4iOiJodHRwczovL2ctbmV4dC5hbnR2LnZpc2lvbjo0NDMiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjYzNzE4Mzk5LCJpc1N1YmRvbWFpbiI6dHJ1ZX0=';
document.head.appendChild(tokenElement2);

const tokenElement3 = document.createElement('meta');
tokenElement3.httpEquiv = 'origin-trial';
tokenElement3.content =
  // https://antv-g-next.gitee.io
  'AjUzE3QmJsptDX3Ro9T30cWLI+/iQoUIDL3jeE8BUGnyJAcq1MAomIZjqLqkEC3os/ND+28d5CQWFb9GOd7AGQ0AAABneyJvcmlnaW4iOiJodHRwczovL2FudHYtZy1uZXh0LmdpdGVlLmlvOjQ0MyIsImZlYXR1cmUiOiJXZWJHUFUiLCJleHBpcnkiOjE2NTI4MzE5OTksImlzU3ViZG9tYWluIjp0cnVlfQ==';
document.head.appendChild(tokenElement3);
