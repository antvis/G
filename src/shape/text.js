const Util = require('../util/index');
const Shape = require('../core/shape');
const Inside = require('./util/inside');

const CText = function(cfg) {
  CText.superclass.constructor.call(this, cfg);
};

CText.ATTRS = {
  x: 0,
  y: 0,
  text: null,
  fontSize: 12,
  fontFamily: 'sans-serif',
  fontStyle: 'normal',
  fontWeight: 'normal',
  fontVariant: 'normal',
  textAlign: 'start',
  textBaseline: 'bottom',
  lineHeight: null,
  textArr: null
};

Util.extend(CText, Shape);

Util.augment(CText, {
  canFill: true,
  canStroke: true,
  type: 'text',
  getDefaultAttrs() {
    return {
      lineWidth: 1,
      lineCount: 1,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontVariant: 'normal',
      textAlign: 'start',
      textBaseline: 'bottom'
    };
  },
  initTransform() {
    this.attr('matrix', [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
    const fontSize = this.__attrs.fontSize;
    if (fontSize && +fontSize < 12) { // 小于 12 像素的文本进行 scale 处理
      this.transform([
        [ 't', -1 * this.__attrs.x, -1 * this.__attrs.y ],
        [ 's', +fontSize / 12, +fontSize / 12 ],
        [ 't', this.__attrs.x, this.__attrs.y ]
      ]);
    }
  },
  __assembleFont() {
    // var self = this;
    const attrs = this.__attrs;
    const fontSize = attrs.fontSize;
    const fontFamily = attrs.fontFamily;
    const fontWeight = attrs.fontWeight;
    const fontStyle = attrs.fontStyle; // self.attr('fontStyle');
    const fontVariant = attrs.fontVariant; // self.attr('fontVariant');
    // self.attr('font', [fontStyle, fontVariant, fontWeight, fontSize + 'px', fontFamily].join(' '));
    attrs.font = [ fontStyle, fontVariant, fontWeight, fontSize + 'px', fontFamily ].join(' ');
  },
  __afterSetAttrFontSize() {
    /* this.attr({
      height: this.__getTextHeight()
    }); */
    this.__assembleFont();
  },
  __afterSetAttrFontFamily() {
    this.__assembleFont();
  },
  __afterSetAttrFontWeight() {
    this.__assembleFont();
  },
  __afterSetAttrFontStyle() {
    this.__assembleFont();
  },
  __afterSetAttrFontVariant() {
    this.__assembleFont();
  },
  __afterSetAttrFont() {
    // this.attr('width', this.measureText());
  },
  __afterSetAttrText() {
    const attrs = this.__attrs;
    const text = attrs.text;
    let textArr;
    if (Util.isString(text) && (text.indexOf('\n') !== -1)) {
      textArr = text.split('\n');
      const lineCount = textArr.length;
      attrs.lineCount = lineCount;
      attrs.textArr = textArr;
    }
    // attrs.height = this.__getTextHeight();
    // attrs.width = this.measureText();
  },
  __getTextHeight() {
    const attrs = this.__attrs;
    const lineCount = attrs.lineCount;
    const fontSize = attrs.fontSize * 1;
    if (lineCount > 1) {
      const spaceingY = this.__getSpaceingY();
      return fontSize * lineCount + spaceingY * (lineCount - 1);
    }
    return fontSize;
  },
  // 计算浪费，效率低，待优化
  __afterSetAttrAll(objs) {
    const self = this;
    if (
      'fontSize' in objs ||
      'fontWeight' in objs ||
      'fontStyle' in objs ||
      'fontVariant' in objs ||
      'fontFamily' in objs
    ) {
      self.__assembleFont();
    }

    if (
      'text' in objs
    ) {
      self.__afterSetAttrText(objs.text);
    }
  },
  isHitBox() {
    return false;
  },
  calculateBox() {
    const self = this;
    const attrs = self.__attrs;
    const x = attrs.x;
    const y = attrs.y;
    const width = self.measureText(); // attrs.width
    if (!width) {
      // 如果width不存在，四点共其实点
      return {
        minX: x,
        minY: y,
        maxX: x,
        maxY: y
      };
    }
    const height = self.__getTextHeight(); // attrs.height
    const textAlign = attrs.textAlign;
    const textBaseline = attrs.textBaseline;
    const lineWidth = self.getHitLineWidth();
    const point = {
      x,
      y: y - height
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
    return {
      minX: point.x - halfWidth,
      minY: point.y - halfWidth,
      maxX: point.x + width + halfWidth,
      maxY: point.y + height + halfWidth
    };
  },
  __getSpaceingY() {
    const attrs = this.__attrs;
    const lineHeight = attrs.lineHeight;
    const fontSize = attrs.fontSize * 1;
    return lineHeight ? (lineHeight - fontSize) : fontSize * 0.14;
  },
  isPointInPath(x, y) {
    const self = this;
    const box = self.getBBox();
    if (self.hasFill() || self.hasStroke()) {
      return Inside.box(box.minX, box.maxX, box.minY, box.maxY, x, y);
    }
  },
  drawInner(context) {
    const self = this;
    const attrs = self.__attrs;
    const text = attrs.text;
    if (!text) {
      return;
    }
    const textArr = attrs.textArr;
    const x = attrs.x;
    const y = attrs.y;

    context.beginPath();
    if (self.hasStroke()) {
      if (textArr) {
        self.__drawTextArr(context, false);
      } else {
        context.strokeText(text, x, y);
      }
    }
    if (self.hasFill()) {
      const fillOpacity = attrs.fillOpacity;
      if (!Util.isNil(fillOpacity) && fillOpacity !== 1) {
        context.globalAlpha = fillOpacity;
      }
      if (textArr) {
        self.__drawTextArr(context, true);
      } else {
        context.fillText(text, x, y);
      }
    }
  },
  __drawTextArr(context, fill) {
    const textArr = this.__attrs.textArr;
    const textBaseline = this.__attrs.textBaseline;
    const fontSize = this.__attrs.fontSize * 1;
    const spaceingY = this.__getSpaceingY();
    const x = this.__attrs.x;
    const y = this.__attrs.y;
    const box = this.getBBox();
    const height = box.maxY - box.minY;
    let subY;

    Util.each(textArr, (subText, index) => {
      subY = y + index * (spaceingY + fontSize) - height + fontSize; // bottom;
      if (textBaseline === 'middle') subY += height - fontSize - (height - fontSize) / 2;
      if (textBaseline === 'top') subY += height - fontSize;
      if (fill) {
        context.fillText(subText, x, subY);
      } else {
        context.strokeText(subText, x, subY);
      }
    });
  },
  measureText() {
    const self = this;
    const attrs = self.__attrs;
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
      Util.each(textArr, subText => {
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
    return width;
  }
});

module.exports = CText;
