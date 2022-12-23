import { clamp, isNil, isObject } from '@antv/util';
import * as d3 from 'd3-color';
import { Rect } from '../..';
import { memoize } from '../../utils/memoize';
import type { Tuple4Number } from '../../types';
import type { CSSGradientValue } from '../cssom';
import { CSSRGB } from '../cssom';
import { getOrCreateRGBA, transparentColor } from '../CSSStyleValuePool';
import { parseGradient } from './gradient';

/**
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createPattern
 */
export interface Pattern {
  image: string | CanvasImageSource | Rect;
  repetition: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
  transform: string;
}

export function isPattern(object: any): object is Pattern {
  return isObject(object) && !!(object as Pattern).image;
}

/**
 * @see https://github.com/WebKit/WebKit/blob/main/Source/WebCore/css/parser/CSSParser.cpp#L97
 */
export const parseColor = memoize(
  (colorStr: string): CSSRGB | CSSGradientValue[] | Pattern => {
    if (isPattern(colorStr)) {
      return {
        repetition: 'repeat',
        ...(colorStr as Pattern),
      };
    }

    if (isNil(colorStr)) {
      colorStr = '';
    }

    if (colorStr === 'transparent') {
      // transparent black
      return transparentColor;
    } else if (colorStr === 'currentColor') {
      // @see https://github.com/adobe-webplatform/Snap.svg/issues/526
      colorStr = 'black';
    }

    // support CSS gradient syntax
    const g = parseGradient(colorStr);
    if (g) {
      return g;
    }

    // constants
    const color = d3.color(colorStr) as d3.RGBColor;
    const rgba: Tuple4Number = [0, 0, 0, 0];
    if (color !== null) {
      rgba[0] = color.r || 0;
      rgba[1] = color.g || 0;
      rgba[2] = color.b || 0;
      rgba[3] = color.opacity;
    }

    // return new CSSRGB(...rgba);
    return getOrCreateRGBA(...rgba);
  },
);

export function mergeColors(
  left: CSSRGB | CSSGradientValue[] | Pattern,
  right: CSSRGB | CSSGradientValue[] | Pattern,
): [number[], number[], (color: number[]) => string] | undefined {
  // only support constant value, exclude gradient & pattern
  if (!(left instanceof CSSRGB) || !(right instanceof CSSRGB)) {
    return;
  }

  return [
    [Number(left.r), Number(left.g), Number(left.b), Number(left.alpha)],
    [Number(right.r), Number(right.g), Number(right.b), Number(right.alpha)],
    (color: number[]) => {
      const rgba = color.slice();
      if (rgba[3]) {
        for (let i = 0; i < 3; i++)
          rgba[i] = Math.round(clamp(rgba[i], 0, 255));
      }
      rgba[3] = clamp(rgba[3], 0, 1);
      return `rgba(${rgba.join(',')})`;
    },
  ];
}
