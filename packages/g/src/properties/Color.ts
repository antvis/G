import { injectable } from 'inversify';
import * as d3 from 'd3-color';
import { clamp, isString, isNil } from '@antv/util';
import type { DisplayObject } from '../DisplayObject';
import type { Tuple4Number } from '../types';
import type { StylePropertyHandler } from '.';

const regexLG = /^l\s*\(\s*([\d.]+)\s*\)\s*(.*)/i;
const regexRG = /^r\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)\s*(.*)/i;
const regexPR = /^p\s*\(\s*([axyn])\s*\)\s*(.*)/i;
const regexColorStop = /[\d.]+:(#[^\s]+|[^\)]+\))/gi;

export interface LinearGradient {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  steps: string[][];
}

export interface RadialGradient {
  x0: number;
  y0: number;
  r0: number;
  x1: number;
  y1: number;
  r1: number;
  steps: string[][];
}

export enum PARSED_COLOR_TYPE {
  Constant,
  LinearGradient,
  RadialGradient,
}
export type ParsedColor = {
  type: PARSED_COLOR_TYPE.Constant;
  value: Tuple4Number;
} | {
  type: PARSED_COLOR_TYPE.LinearGradient;
  value: LinearGradient;
} | {
  type: PARSED_COLOR_TYPE.RadialGradient;
  value: RadialGradient;
}

function isConstant(parsed: ParsedColor['value']): parsed is Tuple4Number {
  return Array.isArray(parsed);
}
function isLinearGradient(parsed: ParsedColor['value']): parsed is LinearGradient {
  return !isRadialGradient(parsed) && !isNil((parsed as LinearGradient).x0);
}
function isRadialGradient(parsed: ParsedColor['value']): parsed is RadialGradient {
  return !isConstant(parsed) && !isNil((parsed as RadialGradient).r0);
}

/**
 * used in `fill`, `stroke`, support the following types:
 * * constant value, eg. 'red' '#fff' 'rgba()'
 * * gradient & pattern
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
 */

@injectable()
export class Color implements StylePropertyHandler<string, ParsedColor> {
  initialValue = '';

  parse(colorStr: string, displayObject: DisplayObject): ParsedColor {
    const type = colorStr[0];
    if (colorStr[1] === '(' || colorStr[2] === '(') {
      if (type === 'l') {
        const parsedLineGradient = parseLineGradient(displayObject, colorStr);
        if (parsedLineGradient) {
          return {
            type: PARSED_COLOR_TYPE.LinearGradient,
            value: parsedLineGradient,
          };
        }
      } else if (type === 'r') {
        const parsedRadialGradient = parseRadialGradient(displayObject, colorStr);
        if (parsedRadialGradient) {
          if (isString(parsedRadialGradient)) {
            colorStr = parsedRadialGradient as string;
          } else {
            return {
              type: PARSED_COLOR_TYPE.RadialGradient,
              value: parsedRadialGradient,
            };
          }
        }
      }
      // if (color[0] === 'p') {
      //   // regexPR.test(color)
      //   return parsePattern(context, element, color);
      // }
    }

    // constants
    const color = d3.color(colorStr) as d3.RGBColor;
    const arr: Tuple4Number = [0, 0, 0, 0];
    if (color !== null) {
      arr[0] = color.r / 255;
      arr[1] = color.g / 255;
      arr[2] = color.b / 255;
      arr[3] = color.opacity;
    }
    return {
      type: PARSED_COLOR_TYPE.Constant,
      value: arr,
    };
  }

  format(parsed: ParsedColor): string {
    if (isConstant(parsed.value)) {
      if (parsed.value[3]) {
        for (let i = 0; i < 3; i++)
          parsed.value[i] = Math.round(clamp(0, 255, parsed.value[i] * 255));
      }
      parsed.value[3] = clamp(0, 1, parsed.value[3]);
      return `rgba(${parsed.value.join(',')})`;
    }

    return '';
  }
}

export function parseLineGradient(displayObject: DisplayObject, gradientStr: string): LinearGradient | null {
  const arr = regexLG.exec(gradientStr);
  if (arr) {
    const angle = (parseFloat(arr[1]) % 360) * (Math.PI / 180);
    const steps = arr[2].match(regexColorStop)?.map((stop) => stop.split(':')) || [];
    const bounds = displayObject.getLocalBounds();
    if (bounds) {
      const [maxX, maxY] = bounds.getMax();
      const [minX, minY] = bounds.getMin();
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
      const y = (tanTheta * (end.x - start.x + tanTheta * (end.y - start.y))) / (tanTheta2 + 1) + start.y;

      return {
        x0: start.x,
        y0: start.y,
        x1: x,
        y1: y,
        steps,
      };
    }
    // const gradient = context.createLinearGradient(start.x, start.y, x, y);
    // addStop(steps, gradient);
  }
  return null;
}

export function parseRadialGradient(displayObject: DisplayObject, gradientStr: string): RadialGradient | string | null {
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
    const bounds = displayObject.getLocalBounds();
    if (bounds) {
      const [maxX, maxY] = bounds.getMax();
      const [minX, minY] = bounds.getMin();
      const width = maxX - minX;
      const height = maxY - minY;
      const r = Math.sqrt(width * width + height * height) / 2;

      return {
        x0: minX + width * fx,
        y0: minY + height * fy,
        r0: 0,
        x1: minX + width / 2,
        y1: minY + height / 2,
        r1: fr * r,
        steps,
      };
    }
  }
  return null;
}