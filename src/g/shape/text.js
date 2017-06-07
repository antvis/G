/**
 * @fileOverview text 文本
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */
var Util = require('@ali/g-util');
var Shape = require('../core/shape');
var Inside = require('./util/inside');
var Common = require('../common');

var CText = function(cfg) {
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
  getDefaultAttrs: function() {
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
  __assembleFont: function() {
    // var self = this;
    var attrs = this.__attrs;
    var fontSize = attrs.fontSize;
    var fontFamily = attrs.fontFamily;
    var fontWeight = attrs.fontWeight;
    var fontStyle = attrs.fontStyle; // self.attr('fontStyle');
    var fontVariant = attrs.fontVariant; // self.attr('fontVariant');
    // self.attr('font', [fontStyle, fontVariant, fontWeight, fontSize + 'px', fontFamily].join(' '));
    attrs.font = [fontStyle, fontVariant, fontWeight, fontSize + 'px', fontFamily].join(' ');
  },
  __afterSetAttrFontSize: function() {
    /* this.attr({
      height: this.__getTextHeight()
    }); */
    this.__assembleFont();
  },
  __afterSetAttrFontFamily: function() {
    this.__assembleFont();
  },
  __afterSetAttrFontWeight: function() {
    this.__assembleFont();
  },
  __afterSetAttrFontStyle: function() {
    this.__assembleFont();
  },
  __afterSetAttrFontVariant: function() {
    this.__assembleFont();
  },
  __afterSetAttrFont: function() {
    // this.attr('width', this.measureText());
  },
  __afterSetAttrText: function() {
    var attrs = this.__attrs;
    var text = attrs.text;
    var textArr;
    if (Util.isString(text) && (text.indexOf('\n') !== -1)) {
      textArr = text.split('\n');
      var lineCount = textArr.length;
      attrs.lineCount = lineCount;
      attrs.textArr = textArr;
    }
    // attrs.height = this.__getTextHeight();
    // attrs.width = this.measureText();
  },
  __getTextHeight: function() {
    var attrs = this.__attrs;
    var lineCount = attrs.lineCount;
    var fontSize = attrs.fontSize * 1;
    if (lineCount > 1) {
      var spaceingY = this.__getSpaceingY();
      return fontSize * lineCount + spaceingY * (lineCount - 1);
    }
    return fontSize;
  },
  // 计算浪费，效率低，待优化
  __afterSetAttrAll: function(objs) {
    var self = this;
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
  isHitBox: function() {
    return false;
  },
  calculateBox: function() {
    var self = this;
    var attrs = self.__attrs;
    var x = attrs.x;
    var y = attrs.y;
    var width = self.measureText(); // attrs.width
    if (!width) {
      // 如果width不存在，四点共其实点
      return {
        minX: x,
        minY: y,
        maxX: x,
        maxY: y
      };
    }
    var height = self.__getTextHeight(); // attrs.height
    var textAlign = attrs.textAlign;
    var textBaseline = attrs.textBaseline;
    var lineWidth = attrs.lineWidth;
    var point = {
      x: x,
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
    var halfWidth = lineWidth / 2;
    return {
      minX: point.x - halfWidth,
      minY: point.y - halfWidth,
      maxX: point.x + width + halfWidth,
      maxY: point.y + height + halfWidth
    };
  },
  __getSpaceingY: function() {
    var attrs = this.__attrs;
    var lineHeight = attrs.lineHeight;
    var fontSize = attrs.fontSize * 1;
    return lineHeight ? (lineHeight - fontSize) : fontSize * 0.14;
  },
  isPointInPath: function(x, y) {
    var self = this;
    var box = self.getBBox();
    if (self.hasFill() || self.hasStroke()) {
      return Inside.box(box.minX, box.maxX, box.minY, box.maxY, x, y);
    }
  },
  drawInner: function(context) {
    var self = this;
    var attrs = self.__attrs;
    var text = attrs.text;
    if (!text) {
      return;
    }
    var textArr = attrs.textArr;
    var fontSize = attrs.fontSize * 1;
    var spaceingY = self.__getSpaceingY();
    var x = attrs.x;
    var y = attrs.y;
    var textBaseline = attrs.textBaseline;
    var height;
    if (textArr) {
      var box = self.getBBox();
      height = box.maxY - box.minY;
    }
    var subY;

    context.beginPath();
    if (self.hasFill()) {
      var fillOpacity = attrs.fillOpacity;
      if (!Util.isNull(fillOpacity) && fillOpacity !== 1) {
        context.globalAlpha = fillOpacity;
      }
      if (textArr) {
        Util.each(textArr, function(subText, index) {
          subY = y + index * (spaceingY + fontSize) - height + fontSize; // bottom;
          if (textBaseline === 'middle') subY += height - fontSize - (height - fontSize) / 2;
          if (textBaseline === 'top') subY += height - fontSize;
          context.fillText(subText, x, subY);
        });
      } else {
        context.fillText(text, x, y);
      }
    }

    if (self.hasStroke()) {
      if (textArr) {
        Util.each(textArr, function(subText, index) {
          subY = y + index * (spaceingY + fontSize) - height + fontSize; // bottom;
          if (textBaseline === 'middle') subY += height - fontSize - (height - fontSize) / 2;
          if (textBaseline === 'top') subY += height - fontSize;
          context.strokeText(subText, x, subY);
        });
      } else {
        context.strokeText(text, x, y);
      }
    }
  },
  measureText: function() {
    var self = this;
    var attrs = self.__attrs;
    var text = attrs.text;
    var font = attrs.font;
    var textArr = attrs.textArr;
    var measureWidth;
    var width = 0;

    if (Util.isNull(text)) return undefined;
    var context = Common.backupContext;
    context.save();
    context.font = font;
    if (textArr) {
      Util.each(textArr, function(subText) {
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
