import { SimpleBBox, IShape } from '@antv/g-base';
import { isNil, isString, each } from '@antv/util';
import { getTextHeight, assembleFont } from '@antv/g-base/lib/util/text';

let context = null;

export function cacheCanvasContext(ctx: CanvasRenderingContext2D) {
  context = ctx;
}

/**
 * 字体宽度
 * @param text 文本
 * @param font 字体
 */
function getTextWidth(text: string, font: string) {
  let width = 0;
  // null 或者 undefined 时，宽度为 0
  if (isNil(text) || text === '') {
    return width;
  }
  context.save();
  context.font = font;
  if (isString(text) && text.includes('\n')) {
    const textArr = text.split('\n');
    each(textArr, (subText) => {
      const measureWidth = context.measureText(subText).width;
      if (width < measureWidth) {
        width = measureWidth;
      }
    });
  } else {
    width = context.measureText(text).width;
  }
  context.restore();
  return width;
}

export default function (shape: IShape): SimpleBBox {
  const attrs = shape.attr();
  const { x, y, text, fontSize, lineHeight } = attrs;
  let font = attrs.font;
  if (!font) {
    // 如果未组装 font
    font = assembleFont(attrs);
  }
  const width = getTextWidth(text, font);
  let bbox;
  if (!width) {
    // 如果width不存在，四点共其实点
    bbox = {
      x,
      y,
      width: 0,
      height: 0,
    };
  } else {
    const { textAlign, textBaseline } = attrs;
    const height = getTextHeight(text, fontSize, lineHeight); // attrs.height
    // 默认左右对齐：left, 默认上下对齐 bottom
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

    bbox = {
      x: point.x,
      y: point.y,
      width,
      height,
    };
  }
  return bbox;
}
