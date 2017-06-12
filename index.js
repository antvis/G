const Canvas = require('./src/canvas');
const G = require('./src/g/index');
Canvas.G = G;
Canvas.Group = G.Group;
Canvas.Shape = {};
Canvas.Shape.Marker = G.Marker;
Canvas.PathUtil = require('./src/util/path');
Canvas.MatrixUtil = require('./src/util/matrix');
Canvas.DomUtil = require('./src/util/dom');

module.exports = Canvas;
