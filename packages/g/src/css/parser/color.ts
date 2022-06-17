import * as d3 from 'd3-color';
import { memoize } from 'lodash-es';
import type { Tuple4Number } from '../../types';
import { clamp, isNil, isObject } from '../../utils';
import type { CSSGradientValue } from '../cssom';
import { CSSRGB } from '../cssom';
import { parseGradient } from './gradient';

/**
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createPattern
 */
export interface Pattern {
  image: string | CanvasImageSource;
  repetition: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
}

export function isPattern(object: any): object is Pattern {
  return isObject(object) && !!(object as Pattern).image;
}

/**
 * @see https://github.com/WebKit/WebKit/blob/main/Source/WebCore/css/parser/CSSParser.cpp#L97
 */
export const parseColor = memoize((colorStr: string): CSSRGB | CSSGradientValue[] | Pattern => {
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
    return new CSSRGB(0, 0, 0, 0);
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

  return new CSSRGB(...rgba);

  // return {
  //   type: PARSED_COLOR_TYPE.Constant,
  //   value: rgba,
  //   formatted:
  //     // rgba(255,255,255,0) -> [NaN, NaN, NaN, 0]
  //     // @see https://github.com/d3/d3-color/issues/52
  //     (color && `rgba(${color.r || 0},${color.g || 0},${color.b || 0},${color.opacity})`) ||
  //     'rgba(0,0,0,0)',
  // };
});

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
        for (let i = 0; i < 3; i++) rgba[i] = Math.round(clamp(rgba[i], 0, 255));
      }
      rgba[3] = clamp(rgba[3], 0, 1);
      return `rgba(${rgba.join(',')})`;
    },
  ];
}
