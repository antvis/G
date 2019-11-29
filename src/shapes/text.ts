import * as Util from '@antv/util';
import Shape from '../core/shape';
import * as Inside from './util/inside';
import BBox from '../core/bbox';

class CText extends Shape {
  canFill: boolean = true;
  canStroke: boolean = true;
  type: string = 'text';

  getDefaultAttrs() {
    return {
      x: 0,
      y: 0,
      text: null,
      lineHeight: 1,
      lineWidth: 1,
      lineCount: 1,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontVariant: 'normal',
      textAlign: 'start',
      textBaseline: 'bottom',
      textArr: null,
    };
  }

  isPointInPath(x: number, y: number): boolean {
    const self = this;
    const box = self.getBBox();
    if (self.hasFill() || self.hasStroke()) {
      return Inside.box(box.x, box.maxX, box.minY, box.maxY, x, y);
    }
  }

  initTransform(): void {
    const fontSize = this.attrs.fontSize;
    if (fontSize && +fontSize < 12) {
      // 小于 12 像素的文本进行 scale 处理
      this.transform([
        ['t', -1 * this.attrs.x, -1 * this.attrs.y],
        ['s', +fontSize / 12, +fontSize / 12],
        ['t', this.attrs.x, this.attrs.y],
      ]);
    }
  }

  _assembleFont(): void {
    // var self = this;
    const attrs = this.attrs;
    const fontSize = attrs.fontSize;
    const fontFamily = attrs.fontFamily;
    const fontWeight = attrs.fontWeight;
    const fontStyle = attrs.fontStyle; // self.attr('fontStyle');
    const fontVariant = attrs.fontVariant; // self.attr('fontVariant');
    // self.attr('font', [fontStyle, fontVariant, fontWeight, fontSize + 'px', fontFamily].join(' '));
    attrs.font = [fontStyle, fontVariant, fontWeight, fontSize + 'px', fontFamily].join(' ');
  }

  _setAttrText(): void {
    const attrs = this.attrs;
    const text = attrs.text;
    let textArr = null;
    if (Util.isString(text) && text.indexOf('\n') !== -1) {
      textArr = text.split('\n');
      const lineCount = textArr.length;
      attrs.lineCount = lineCount;
    }
    attrs.textArr = textArr;
  }

  _getTextHeight(): number {
    const attrs = this.attrs;
    const lineCount = attrs.lineCount;
    const fontSize = attrs.fontSize * 1;
    if (lineCount > 1) {
      const spaceingY = this._getSpaceingY();
      return fontSize * lineCount + spaceingY * (lineCount - 1);
    }
    return fontSize;
  }

  isHitBox(): boolean {
    return false;
  }

  calculateBox(): BBox {
    const self = this;
    const attrs = self.attrs;
    const cfg = this.cfg;
    if (!cfg.attrs || cfg.hasUpdate) {
      this._assembleFont();
      this._setAttrText();
    }
    if (!attrs.textArr) {
      this._setAttrText();
    }
    const x = attrs.x;
    const y = attrs.y;
    const width = self.measureText(); // attrs.width
    if (!width) {
      // 如果width不存在，四点共其实点
      return new BBox(x, y, 0, 0);
    }
    const height = self._getTextHeight(); // attrs.height
    const textAlign = attrs.textAlign;
    const textBaseline = attrs.textBaseline;
    const lineWidth = self.getHitLineWidth();
    const point = {
      x,
      y: y - height,
    };

    if (textAlign) {
      if (textAlign === 'end' || textAlign === 'right') {
        point.x -= width;
      } else if (textAlign === 'center') {
        point.x -= width / 2;
      }
    }
    if (textBaseline) {
      if (textBaseline === 'top') {
        point.y += height;
      } else if (textBaseline === 'middle') {
        point.y += height / 2;
      }
    }

    this.set('startPoint', point);
    const halfWidth = lineWidth / 2;
    return BBox.fromRange(
      point.x - halfWidth,
      point.y - halfWidth,
      point.x + width + halfWidth,
      point.y + height + halfWidth
    );
  }

  _getSpaceingY(): number {
    const attrs = this.attrs;
    const lineHeight = attrs.lineHeight;
    const fontSize = attrs.fontSize * 1;
    return lineHeight ? lineHeight - fontSize : fontSize * 0.14;
  }

  drawInner(context: CanvasRenderingContext2D): void {
    const self = this;
    const attrs = self.attrs;
    const cfg = this.cfg;
    if (!cfg.attrs || cfg.hasUpdate) {
      this._assembleFont();
      this._setAttrText();
    }
    context.font = attrs.font;
    const text = attrs.text;
    if (Util.isNil(text)) {
      return;
    }
    const textArr = attrs.textArr;
    const x = attrs.x;
    const y = attrs.y;
    const maxWidth = attrs.maxWidth;

    context.beginPath();
    if (self.hasStroke()) {
      const strokeOpacity = attrs.strokeOpacity;
      if (!Util.isNil(strokeOpacity) && strokeOpacity !== 1) {
        context.globalAlpha = strokeOpacity;
      }
      if (textArr) {
        self._drawTextArr(context, false);
      } else {
        context.strokeText(text, x, y, maxWidth);
      }
      context.globalAlpha = 1;
    }
    if (self.hasFill()) {
      const fillOpacity = attrs.fillOpacity;
      if (!Util.isNil(fillOpacity) && fillOpacity !== 1) {
        context.globalAlpha = fillOpacity;
      }
      if (textArr) {
        self._drawTextArr(context, true);
      } else {
        context.fillText(text, x, y, maxWidth);
      }
    }
    cfg.hasUpdate = false;
  }

  _drawTextArr(context: CanvasRenderingContext2D, fill: boolean): void {
    const textArr = this.attrs.textArr;
    const textBaseline = this.attrs.textBaseline;
    const fontSize = this.attrs.fontSize * 1;
    const spaceingY = this._getSpaceingY();
    const x = this.attrs.x;
    const y = this.attrs.y;
    const maxWidth = this.attrs.maxWidth;
    const box = this.getBBox();
    const height = box.maxY - box.minY;
    let subY;

    Util.each(textArr, (subText: string, index: number) => {
      subY = y + index * (spaceingY + fontSize) - height + fontSize; // bottom;
      if (textBaseline === 'middle') subY += height - fontSize - (height - fontSize) / 2;
      if (textBaseline === 'top') subY += height - fontSize;
      if (fill) {
        context.fillText(subText, x, subY, maxWidth);
      } else {
        context.strokeText(subText, x, subY, maxWidth);
      }
    });
  }

  measureText(): number {
    const self = this;
    const attrs = self.attrs;
    const text = attrs.text;
    const font = attrs.font;
    const textArr = attrs.textArr;
    let measureWidth;
    let width = 0;

    if (Util.isNil(text)) return undefined;
    const context = document.createElement('canvas').getContext('2d');
    context.save();
    context.font = font;
    if (textArr) {
      Util.each(textArr, (subText: string) => {
        measureWidth = context.measureText(subText).width;
        if (width < measureWidth) {
          width = measureWidth;
        }
        context.restore();
      });
    } else {
      width = context.measureText(text).width;
      context.restore();
    }
    if (attrs.maxWidth !== undefined) {
      width = Math.min(attrs.maxWidth, width);
    }
    return width;
  }
}

export default CText;
