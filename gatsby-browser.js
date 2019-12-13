/**
 * Note the way of mounting dependencies
 * See: https://github.com/antvis/gatsby-theme-antv/issues/80
 */
window.gCanvas = require('./packages/g-canvas/src/index.ts');
window.gSvg = require('./packages/g-svg/src/index.ts');
window.insertCss = require('insert-css');
