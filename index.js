import {toArray, toString, toCurve, toAbsolute, catmullRomToBezier} from '@ali/g-path-util';

var Canvas = require('./src/canvas');
var G = require('./src/g/index');
Canvas.G = G;
Canvas.Group = G.Group;
Canvas.Shape = {};
Canvas.Shape.Marker = G.Marker;
Canvas.PathUtil = {
  parsePathString: toArray,
  parsePathArray: toString, // Util.path2string
  path2curve: toCurve,
  pathToAbsolute: toAbsolute, // Util.path2Absolute
  catmullRom2bezier: catmullRomToBezier,
};
Canvas.MatrixUtil = require('./src/util/matrix-util');
Canvas.DomUtil = require('./src/util/dom-util');
Canvas.Matrix = require('@ali/g-matrix');

module.exports = Canvas;
