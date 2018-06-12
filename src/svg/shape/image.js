const Util = require('../../util/index');
const Shape = require('../core/shape');

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
  _afterSetAttrImg(img) {
    this._setAttrImg(img);
  },
  _afterSetAttrAll(params) {
    if (params.img) {
      this._setAttrImg(params.img);
    }
  },
  _setAttrImg(image) {
    const self = this;
    const el = this.get('el');
    const attrs = self.__attrs;
    const img = image;


    if (Util.isString(img)) {
      // 如果传入的
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
      el.setAttribute('href', img.toDataURL());
    } else if (img instanceof ImageData) {
      const canvas = document.createElement('canvas');
      canvas.setAttribute('width', img.width);
      canvas.setAttribute('height', img.height);
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
