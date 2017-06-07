/**
 * @fileOverview Ellipse
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */
var Util = require('../../util/index');
var Shape = require('../core/shape');
var Inside = require('./util/inside');
var Matrix = require('@ali/g-matrix');
var Matrix3 = Matrix.Matrix3;
var Vector3 = Matrix.Vector3;

var Ellipse = function(cfg) {
  Ellipse.superclass.constructor.call(this, cfg);
};

Ellipse.ATTRS = {
  x: 0,
  y: 0,
  rx: 1,
  ry: 1,
  lineWidth: 1
};

Util.extend(Ellipse, Shape);

Util.augment(Ellipse, {
  canFill: true,
  canStroke: true,
  type: 'ellipse',
  getDefaultAttrs: function() {
    return {
      lineWidth: 1
    };
  },
  calculateBox: function() {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var rx = attrs.rx;
    var ry = attrs.ry;
    var lineWidth = attrs.lineWidth;
    var halfXWidth = rx + lineWidth / 2;
    var halfYWidth = ry + lineWidth / 2;

    return {
      minX: cx - halfXWidth,
      minY: cy - halfYWidth,
      maxX: cx + halfXWidth,
      maxY: cy + halfYWidth
    };
  },
  isPointInPath: function(x, y) {
    var fill = this.hasFill();
    var stroke = this.hasStroke();

    if (fill && stroke) {
      return this.__isPointInFill(x, y) || this.__isPointInStroke(x, y);
    }

    if (fill) {
      return this.__isPointInFill(x, y);
    }

    if (stroke) {
      return this.__isPointInStroke(x, y);
    }

    return false;
  },
  __isPointInFill: function(x, y) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var rx = attrs.rx;
    var ry = attrs.ry;

    var r = (rx > ry) ? rx : ry;
    var scaleX = (rx > ry) ? 1 : rx / ry;
    var scaleY = (rx > ry) ? ry / rx : 1;

    var p = new Vector3(x, y, 1);
    var m = new Matrix3();
    m.scale(scaleX, scaleY);
    m.translate(cx, cy);
    var inm = m.getInverse();
    p.applyMatrix(inm);

    return Inside.circle(0, 0, r, p.x, p.y);
  },
  __isPointInStroke: function(x, y) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var rx = attrs.rx;
    var ry = attrs.ry;
    var lineWidth = attrs.lineWidth;

    var r = (rx > ry) ? rx : ry;
    var scaleX = (rx > ry) ? 1 : rx / ry;
    var scaleY = (rx > ry) ? ry / rx : 1;

    var p = new Vector3(x, y, 1);
    var m = new Matrix3();
    m.scale(scaleX, scaleY);
    m.translate(cx, cy);
    var inm = m.getInverse();
    p.applyMatrix(inm);

    return Inside.arcline(0, 0, r, 0, Math.PI * 2, false, lineWidth, p.x, p.y);
  },
  createPath: function(context) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var rx = attrs.rx;
    var ry = attrs.ry;

    context = context || self.get('context');
    var r = (rx > ry) ? rx : ry;
    var scaleX = (rx > ry) ? 1 : rx / ry;
    var scaleY = (rx > ry) ? ry / rx : 1;

    var m = new Matrix3();
    m.scale(scaleX, scaleY);
    m.translate(cx, cy);
    var mo = m.to2DObject();
    context.beginPath();
    context.save();
    context.transform(mo.a, mo.b, mo.c, mo.d, mo.e, mo.f);
    context.arc(0, 0, r, 0, Math.PI * 2);
    context.restore();
    context.closePath();
  }
});

module.exports = Ellipse;
