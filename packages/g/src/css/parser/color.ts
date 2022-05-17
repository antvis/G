import * as d3 from 'd3-color';
import type { Pattern, LinearGradient, RadialGradient } from '../cssom';
import { CSSRGB, CSSGradientValue, GradientPatternType } from '../cssom';
import type { Tuple4Number } from '../../types';
import { clamp, isNil, isString } from '../../utils';

const regexLG = /^l\s*\(\s*([\d.]+)\s*\)\s*(.*)/i;
const regexRG = /^r\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)\s*(.*)/i;
const regexPR = /^p\s*\(\s*([axyn])\s*\)\s*(.*)/i;
const regexColorStop = /[\d.]+:(#[^\s]+|[^\)]+\))/gi;

/**
 * @see https://github.com/WebKit/WebKit/blob/main/Source/WebCore/css/parser/CSSParser.cpp#L97
 */
export function parseColor(colorStr: string): CSSRGB | CSSGradientValue {
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

  const type = colorStr[0];
  if (colorStr[1] === '(' || colorStr[2] === '(') {
    if (type === 'l') {
      const parsedLineGradient = parseLineGradient(colorStr);
      if (parsedLineGradient) {
        return new CSSGradientValue(GradientPatternType.LinearGradient, parsedLineGradient);
      }
    } else if (type === 'r') {
      const parsedRadialGradient = parseRadialGradient(colorStr);
      if (parsedRadialGradient) {
        if (isString(parsedRadialGradient)) {
          colorStr = parsedRadialGradient as string;
        } else {
          return new CSSGradientValue(GradientPatternType.RadialGradient, parsedRadialGradient);
        }
      }
    } else if (type === 'p') {
      const pattern = parsePattern(colorStr);
      if (pattern) {
        return new CSSGradientValue(GradientPatternType.Pattern, pattern);
      }
    }
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
}

export function mergeColors(
  left: CSSRGB | CSSGradientValue,
  right: CSSRGB | CSSGradientValue,
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

function parsePattern(patternStr: string): Pattern | null {
  const arr = regexPR.exec(patternStr);
  if (arr) {
    let repetition = arr[1];
    const src = arr[2];
    switch (repetition) {
      case 'a':
        repetition = 'repeat';
        break;
      case 'x':
        repetition = 'repeat-x';
        break;
      case 'y':
        repetition = 'repeat-y';
        break;
      case 'n':
        repetition = 'no-repeat';
        break;
      default:
        repetition = 'no-repeat';
    }
    return {
      src,
      repetition,
      hash: patternStr,
    };
  }
  return null;
}

function parseLineGradient(gradientStr: string): LinearGradient | null {
  const arr = regexLG.exec(gradientStr);
  if (arr) {
    const angle = (parseFloat(arr[1]) % 360) * (Math.PI / 180);
    const steps = arr[2].match(regexColorStop)?.map((stop) => stop.split(':')) || [];
    const [maxX, maxY] = [1, 1];
    const [minX, minY] = [0, 0];
    let start;
    let end;

    if (angle >= 0 && angle < (1 / 2) * Math.PI) {
      start = {
        x: minX,
        y: minY,
      };
      end = {
        x: maxX,
        y: maxY,
      };
    } else if ((1 / 2) * Math.PI <= angle && angle < Math.PI) {
      start = {
        x: maxX,
        y: minY,
      };
      end = {
        x: minX,
        y: maxY,
      };
    } else if (Math.PI <= angle && angle < (3 / 2) * Math.PI) {
      start = {
        x: maxX,
        y: maxY,
      };
      end = {
        x: minX,
        y: minY,
      };
    } else {
      start = {
        x: minX,
        y: maxY,
      };
      end = {
        x: maxX,
        y: minY,
      };
    }

    const tanTheta = Math.tan(angle);
    const tanTheta2 = tanTheta * tanTheta;

    const x = (end.x - start.x + tanTheta * (end.y - start.y)) / (tanTheta2 + 1) + start.x;
    const y =
      (tanTheta * (end.x - start.x + tanTheta * (end.y - start.y))) / (tanTheta2 + 1) + start.y;

    return {
      x0: start.x,
      y0: start.y,
      x1: x,
      y1: y,
      steps,
      hash: gradientStr,
    };
  }
  return null;
}

function parseRadialGradient(gradientStr: string): RadialGradient | string | null {
  const arr = regexRG.exec(gradientStr);
  if (arr) {
    const fx = parseFloat(arr[1]);
    const fy = parseFloat(arr[2]);
    const fr = parseFloat(arr[3]);
    const steps = arr[4].match(regexColorStop)?.map((stop) => stop.split(':')) || [];
    // 环半径为0时，默认无渐变，取渐变序列的最后一个颜色
    if (fr === 0) {
      const colors = arr[4].match(regexColorStop) as string[];
      return colors[colors.length - 1].split(':')[1];
    }
    return {
      x0: fx,
      y0: fy,
      r0: 0,
      x1: 0.5,
      y1: 0.5,
      r1: fr,
      steps,
      hash: gradientStr,
    };
  }
  return null;
}
