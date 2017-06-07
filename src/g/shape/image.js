/**
 * @fileOverview 图像
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */
var Util = require('@ali/g-util');
var Shape = require('../core/shape');
var Inside = require('./util/inside');

var CImage = function(cfg) {
  CImage.superclass.constructor.call(this, cfg);
};

CImage.ATTRS = {
  x: 0,
  y: 0,
  img: undefined,
  width: 0,
  height: 0,
  sx: null,
  sy: null,
  swidth: null,
  sheight: null
};

Util.extend(CImage, Shape);

Util.augment(CImage, {
  type: 'image',
  __afterSetAttrImg: function(img) {
    this.__setAttrImg(img);
  },
  __afterSetAttrAll: function(params) {
    if (params.img) {
      this.__setAttrImg(params.img);
    }
  },
  isHitBox: function() {
    return false;
  },
  calculateBox: function() {
    var attrs = this.__attrs;
    var x = attrs.x;
    var y = attrs.y;
    var width = attrs.width;
    var height = attrs.height;

    return {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height
    };
  },
  isPointInPath: function(x, y) {
    var attrs = this.__attrs;
    if (this.get('toDraw') || !attrs.img) {
      return false;
    }
    var rx = attrs.x;
    var ry = attrs.y;
    var width = attrs.width;
    var height = attrs.height;
    return Inside.rect(rx, ry, width, height, x, y);
  },
  __setLoading: function(loading) {
    var canvas = this.get('canvas');
    if (loading === false && this.get('toDraw') === true) {
      this.__cfg.loading = false;
      canvas.draw();
    }
    return loading;
  },
  __setAttrImg: function(img) {
    var self = this;
    var attrs = self.__attrs;
    if (Util.isString(img)) {
      var image = new Image();
      image.onload = function() {
        if (self.get('destroyed')) return false;
        self.attr('imgSrc', img);
        self.attr('img', image);
        var callback = self.get('callback');
        if (callback) {
          callback.call(self);
        }
        self.set('loading', false);
      };
      image.src = img;
      self.set('loading', true);
    } else if (img instanceof Image) {
      if (!attrs.width) {
        self.attr('width', img.width);
      }

      if (!attrs.height) {
        self.attr('height', img.height);
      }
      return img;
    } else if (img instanceof HTMLElement && Util.isString(img.nodeName) && img.nodeName.toUpperCase() === 'CANVAS') {
      if (!attrs.width) {
        self.attr('width', Number(img.getAttribute('width')));
      }

      if (!attrs.height) {
        self.attr('height', Number(img.getAttribute('height')));
      }
      return img;
    } else if (img instanceof ImageData) {
      if (!attrs.width) {
        self.attr('width', img.width);
      }

      if (!attrs.height) {
        self.attr('height', img.height);
      }
      return img;
    } else {
      return null;
    }
  },
  drawInner: function(context) {
    if (this.get('loading')) {
      this.set('toDraw', true);
      return;
    }
    this.__drawImage(context);
  },
  __drawImage: function(context) {
    var attrs = this.__attrs;
    var x = attrs.x;
    var y = attrs.y;
    var img = attrs.img;
    var width = attrs.width;
    var height = attrs.height;
    var sx = attrs.sx;
    var sy = attrs.sy;
    var swidth = attrs.swidth;
    var sheight = attrs.sheight;
    this.set('toDraw', false);

    if (img instanceof Image || (img instanceof HTMLElement && Util.isString(img.nodeName) && img.nodeName.toUpperCase() === 'CANVAS')) {
      if (
        Util.isNull(sx) ||
        Util.isNull(sy) ||
        Util.isNull(swidth) ||
        Util.isNull(sheight)
      ) {
        context.drawImage(img, x, y, width, height);
        return;
      }
      if (
        Util.notNull(sx) &&
        Util.notNull(sy) &&
        Util.notNull(swidth) &&
        Util.notNull(sheight)
      ) {
        context.drawImage(img, sx, sy, swidth, sheight, x, y, width, height);
        return;
      }
    } else if (img instanceof ImageData) {
      context.putImageData(img, x, y, sx || 0, sy || 0, swidth || width, sheight || height);
      return;
    }
    return;
  }
});

module.exports = CImage;
