const Util = require('../util/index');
const Shape = require('../core/shape');
const Inside = require('./util/inside');

const CImage = function(cfg) {
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
  __afterSetAttrImg(img) {
    this.__setAttrImg(img);
  },
  __afterSetAttrAll(params) {
    if (params.img) {
      this.__setAttrImg(params.img);
    }
  },
  isHitBox() {
    return false;
  },
  isPointInPath(x, y) {
    const attrs = this.__attrs;
    if (this.get('toDraw') || !attrs.img) {
      return false;
    }
    const rx = attrs.x;
    const ry = attrs.y;
    const width = attrs.width;
    const height = attrs.height;
    return Inside.rect(rx, ry, width, height, x, y);
  },
  __setAttrImg(img) {
    const self = this;
    const el = this.get('el');
    const attrs = self.__attrs;
    if (Util.isString(img)) {
      el.setAttribute('href', img);
    } else if (img instanceof Image) {
      if (!attrs.width) {
        self.attr('width', img.width);
      }
      if (!attrs.height) {
        self.attr('height', img.height);
      }
      el.setAttribute('href', img.src);
    } else if (img instanceof HTMLElement && Util.isString(img.nodeName) && img.nodeName.toUpperCase() === 'CANVAS') {
      if (!attrs.width) {
        self.attr('width', Number(img.getAttribute('width')));
      }

      if (!attrs.height) {
        self.attr('height', Number(img.getAttribute('height')));
      }
      el.setAttribute('href', img.getAttribute('src'));
    } else if (img instanceof ImageData) {
      const canvas = document.createElement('canvas');
      const ratio = window.devicePixelRatio;
      canvas.setAttribute('width', img.width);
      canvas.setAttribute('height', img.height);
      canvas.style.width = img.width * ratio;
      canvas.style.height = img.height * ratio;
      canvas.getContext('2d').putImageData(img, 0, 0);
      if (!attrs.width) {
        self.attr('width', img.width);
      }

      if (!attrs.height) {
        self.attr('height', img.height);
      }
      el.setAttribute('href', canvas.toDataURL());
    }
  },
  drawInner() {}
});

module.exports = CImage;
