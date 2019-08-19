import * as Util from '@antv/util';
import Shape from '../core/shape';
import * as Inside from './util/inside';
import BBox from '../core/bbox';

class CImage extends Shape {
  type: string = 'image';

  getDefaultAttrs() {
    return {
      x: 0,
      y: 0,
      img: null,
      width: 0,
      height: 0,
      sx: null,
      sy: null,
      swidth: null,
      sheight: null
    };
  }

  isPointInPath(x: number, y: number): boolean {
    const attrs = this.attrs;
    if (this.get('toDraw') || !attrs.img) {
      return false;
    }
    if (!this.cfg.attrs || this.cfg.attrs.img !== attrs.img) {
      this._setAttrImg();
    }
    const rx = attrs.x;
    const ry = attrs.y;
    const width = attrs.width;
    const height = attrs.height;
    return Inside.rect(rx, ry, width, height, x, y);
  }

  isHitBox(): boolean {
    return false;
  }

  calculateBox(): BBox {
    const attrs = this.attrs;

    if (!this.cfg.attrs || this.cfg.attrs.img !== attrs.img) {
      this._setAttrImg();
    }

    return new BBox(attrs.x, attrs.y, attrs.width, attrs.height);
  }

  _beforeSetLoading(loading) {
    const canvas = this.get('canvas');
    if (loading === false && this.get('toDraw') === true) {
      this.cfg.loading = false;
      canvas.draw();
    }
    return loading;
  }

  _setAttrImg() {
    const self = this;
    const attrs = self.attrs;
    const img = attrs.img;
    if (Util.isString(img)) {
      const image = new Image();
      image.onload = function() {
        if (self.get('destroyed')) return false;
        self.attr('imgSrc', img);
        self.attr('img', image);
        const callback = self.get('callback');
        if (callback) {
          callback.call(self);
        }
        self.set('loading', false);
      };
      image.src = img;
      image.crossOrigin = 'Anonymous';
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
  }

  drawInner(context: CanvasRenderingContext2D): void {
    if (this.cfg.hasUpdate) {
      this._setAttrImg();
    }
    if (this.get('loading')) {
      this.set('toDraw', true);
      return;
    }
    this._drawImage(context);
    this.cfg.hasUpdate = false;
  }

  _drawImage(context: CanvasRenderingContext2D): void {
    const attrs = this.attrs;
    const x = attrs.x;
    const y = attrs.y;
    const image = attrs.img;
    const width = attrs.width;
    const height = attrs.height;
    const sx = attrs.sx;
    const sy = attrs.sy;
    const swidth = attrs.swidth;
    const sheight = attrs.sheight;
    this.set('toDraw', false);

    let img = image;
    if (img instanceof ImageData) {
      img = new Image();
      img.src = image;
    }
    if (img instanceof Image || (img instanceof HTMLImageElement && Util.isString(img.nodeName) && img.nodeName.toUpperCase() === 'CANVAS')) {
      if (
        Util.isNil(sx) ||
        Util.isNil(sy) ||
        Util.isNil(swidth) ||
        Util.isNil(sheight)
      ) {
        context.drawImage(img, x, y, width, height);
        return;
      }
      if (
        !Util.isNil(sx) &&
        !Util.isNil(sy) &&
        !Util.isNil(swidth) &&
        !Util.isNil(sheight)
      ) {
        context.drawImage(img, sx, sy, swidth, sheight, x, y, width, height);
        return;
      }
    }
    return;
  }
}

export default CImage;
