const Util = require('../util/index');
const Shape = require('../core/shape');
const Inside = require('./util/inside');

const CText = function(cfg) {
  CText.superclass.constructor.call(this, cfg);
};

const BASELINE_MAP = {
  top: 'before-edge',
  middle: 'central',
  bottom: 'after-edge',
  alphabetic: 'baseline',
  hanging: 'hanging'
}

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
      fill: '#000',
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
    const el = this.get('el');
    const attrs = this.__attrs;
    const fontSize = attrs.fontSize;
    const fontFamily = attrs.fontFamily;
    const fontWeight = attrs.fontWeight;
    const fontStyle = attrs.fontStyle; // self.attr('fontStyle');
    const fontVariant = attrs.fontVariant; // self.attr('fontVariant');
    // self.attr('font', [fontStyle, fontVariant, fontWeight, fontSize + 'px', fontFamily].join(' '));
    const font = [ fontStyle, fontVariant, fontWeight, fontSize + 'px', fontFamily ].join(' ');
    attrs.font = font;
    el.setAttribute('font', attrs.font);

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
  __afterSetAttrTextAlign() {
    // todo left 和 right不支持，要看看怎么改
    let attr = this.__attrs.textAlign;
    const el = this.get('el');
    if ('left' === attr) {
      attr = 'start';
    }
    if ('right' === attr) {
      attr = 'end';
    }
    el.setAttribute('text-anchor', attr);
  },
  __afterSetAttrTextBaseLine() {
    let attr = this.__attrs.textBaseline;
    this.get('el').setAttribute('alignment-baseline', BASELINE_MAP[attr] || 'baseline');
  },
  __afterSetAttrText(text) {
    const attrs = this.__attrs;
    let textArr;
    if (Util.isString(text) && (text.indexOf('\n') !== -1)) {
      textArr = text.split('\n');
      const lineCount = textArr.length;
      attrs.lineCount = lineCount;
      attrs.textArr = textArr;
    }
    const el = this.get('el');
    if (~['undefined', 'null', 'NaN'].indexOf(String(text)) && el) {
      el.innerHTML = '';
    } else if(~text.indexOf('\n')) {
      textArr = text.split('\n');
      attrs.lineCount = textArr.length;
      attrs.textArr = textArr;
      let arr = '';
      Util.each(textArr, function(segment, i) {
          arr += `<tspan x="0" y="${i + 1}em">${segment}</tspan>`;
      });
      el.innerHTML = arr;
    } else {
      el.innerHTML = text;
    }
  },
  __afterSetAttrOutline(val) {
    const el = this.get('el');
    if (!val) {
      el.setAttribute('paint-order', 'normal');
    }
    const stroke = val.stroke || '#000';
    const fill = val.fill || this.__attrs.stroke;
    const lineWidth = val.lineWidth || this.__attrs.lineWidth * 2;
    el.setAttribute('paint-order', 'stroke');
    el.setAttribute('style', 'stroke-linecap:butt; stroke-linejoin:miter;');
    el.setAttribute('stroke', stroke);
    el.setAttribute('fill', fill);
    el.setAttribute('stroke-width', lineWidth);
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
    if ('textAlign' in objs) {
      this.__afterSetAttrTextAlign();
    }
    if ('textBaseLine' in objs) {
      this.__afterSetAttrTextBaseLine();
    }
    if ('text' in objs) {
      self.__afterSetAttrText(objs.text);
    }
    if ('outline' in objs) {
      self.__afterSetAttrOutline(objs.outline);
    }
  },
  isHitBox() {
    return false;
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
  }
});

module.exports = CText;
