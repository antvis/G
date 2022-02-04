require('./site/css/demo.css');
window.react = require('react');
window.reactDom = require('react-dom');
window.reactSplitPane = require('react-split-pane');
window.antd = require('antd');
window.g6 = require('@antv/g6');
window.stats = require('stats.js');
window.dat = require('dat.gui');
window.hammerjs = require('hammerjs');
window.interactjs = require('interactjs');
window.simplexNoise = require('simplex-noise');
window.d3Force3d = require('d3-force-3d');
window.g = require('@antv/g');
window.gCanvas = require('@antv/g-canvas');
window.gWebgl = require('@antv/g-webgl');
window.gSvg = require('@antv/g-svg');
window.gComponents = require('@antv/g-components');
// plugins
window.gPluginCssSelect = require('@antv/g-plugin-css-select');
window.gPlugin3d = require('@antv/g-plugin-3d');
window.gPluginControl = require('@antv/g-plugin-control');
window.gPluginGpgpu = require('@antv/g-plugin-gpgpu');
// compiler for GPGPU
window.gWebgpuCompiler = require('@antv/g-webgpu-compiler');

window.reactG = require('@antv/react-g');

// origin trial for WebGPU
// @see https://developer.chrome.com/origintrials/#/trials/my
// @see https://github.com/GoogleChrome/OriginTrials/blob/gh-pages/developer-guide.md#16-can-i-provide-tokens-by-running-script
const tokenElement1 = document.createElement('meta');
tokenElement1.httpEquiv = 'origin-trial';
tokenElement1.content =
  // https://localhost:8000
  'AkIL+/THBoi1QEsWbX5SOuMpL6+KGAXKrZE5Bz6yHTuijzvKz2MznuLqE+MH4YSqRi/v1fDK/6JyFzgibTTeNAsAAABJeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjgwMDAiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjUyODMxOTk5fQ==';
document.head.appendChild(tokenElement1);

const tokenElement2 = document.createElement('meta');
tokenElement2.httpEquiv = 'origin-trial';
tokenElement2.content =
  // https://g-next.antv.vision
  'Amsjy75wNj7v/xw4rTYvcjRgIQ6pnKefOdDfTPW4HwfoL56EI30QWNZBnfOu+fBlb65rnSEhyQmxfdc3KF3wIAYAAABleyJvcmlnaW4iOiJodHRwczovL2ctbmV4dC5hbnR2LnZpc2lvbjo0NDMiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjUyODMxOTk5LCJpc1N1YmRvbWFpbiI6dHJ1ZX0=';
document.head.appendChild(tokenElement2);

const tokenElement3 = document.createElement('meta');
tokenElement3.httpEquiv = 'origin-trial';
tokenElement3.content =
  // https://antv-g-next.gitee.io
  'AjUzE3QmJsptDX3Ro9T30cWLI+/iQoUIDL3jeE8BUGnyJAcq1MAomIZjqLqkEC3os/ND+28d5CQWFb9GOd7AGQ0AAABneyJvcmlnaW4iOiJodHRwczovL2FudHYtZy1uZXh0LmdpdGVlLmlvOjQ0MyIsImZlYXR1cmUiOiJXZWJHUFUiLCJleHBpcnkiOjE2NTI4MzE5OTksImlzU3ViZG9tYWluIjp0cnVlfQ==';
document.head.appendChild(tokenElement3);
