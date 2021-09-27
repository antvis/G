require('./site/css/demo.css');
window.react = require('react');
window.reactDom = require('react-dom');
window.reactSplitPane = require('react-split-pane');
window.stats = require('stats.js');
window.dat = require('dat.gui');
window.hammerjs = require('hammerjs');
window.interactjs = require('interactjs');
window.g = require('@antv/g');
window.gCanvas = require('@antv/g-canvas');
window.gWebgl = require('@antv/g-webgl');
window.gSvg = require('@antv/g-svg');
window.gComponents = require('@antv/g-components');
// plugins
window.gPluginCssSelect = require('@antv/g-plugin-css-select');
window.gPlugin3d = require('@antv/g-plugin-3d');
window.gPluginControl = require('@antv/g-plugin-control');

// origin trial for WebGPU
// @see https://github.com/GoogleChrome/OriginTrials/blob/gh-pages/developer-guide.md#16-can-i-provide-tokens-by-running-script
const tokenElement = document.createElement('meta');
tokenElement.httpEquiv = 'origin-trial';
tokenElement.content =
  'AqCnZyPTDPRK7MVw+bbVJoQkYndOjHKTarXCp+JTVy4VPAKv/E1SJDuFzsJGm0COxapIEanHG7oF0W+HT0ANwQUAAABJeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjgwMDAiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjQzMTU1MTk5fQ==';
document.head.appendChild(tokenElement);
