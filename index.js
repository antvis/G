const PathUtil = require('@ali/g-path-util');
const Canvas = require('./src/canvas');
const G = require('./src/g/index');
Canvas.G = G;
Canvas.Group = G.Group;
Canvas.Shape = {};
Canvas.Shape.Marker = G.Marker;
Canvas.PathUtil = {
  parsePathString: PathUtil.toArray,
  parsePathArray: PathUtil.toString, // Util.path2string
  path2curve: PathUtil.toCurve,
  pathToAbsolute: PathUtil.toAbsolute, // Util.path2Absolute
  catmullRom2bezier: PathUtil.catmullRomToBezier
};
Canvas.MatrixUtil = require('./src/util/matrix');
Canvas.DomUtil = require('./src/util/dom');

module.exports = Canvas;
