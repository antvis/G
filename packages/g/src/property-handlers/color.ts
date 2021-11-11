import * as d3 from 'd3-color';
import { clamp, isString } from '@antv/util';
import type { DisplayObject } from '../display-objects/DisplayObject';
import type { Tuple4Number } from '../types';
import { ParsedStyleProperty } from '.';

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

export interface Pattern {
  repetition: string;
  src: string;
}

export enum PARSED_COLOR_TYPE {
  Constant,
  LinearGradient,
  RadialGradient,
  Pattern,
}

export type ParsedColorStyleProperty =
  | ParsedStyleProperty<PARSED_COLOR_TYPE.Constant, Tuple4Number>
  | ParsedStyleProperty<PARSED_COLOR_TYPE.LinearGradient, LinearGradient>
  | ParsedStyleProperty<PARSED_COLOR_TYPE.RadialGradient, RadialGradient>
  | ParsedStyleProperty<PARSED_COLOR_TYPE.Pattern, Pattern>;

const regexLG = /^l\s*\(\s*([\d.]+)\s*\)\s*(.*)/i;
const regexRG = /^r\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)\s*(.*)/i;
const regexPR = /^p\s*\(\s*([axyn])\s*\)\s*(.*)/i;
const regexColorStop = /[\d.]+:(#[^\s]+|[^\)]+\))/gi;

export function parseColor(
  colorStr: string = '',
  displayObject: DisplayObject | null,
): ParsedColorStyleProperty {
  if (colorStr === 'transparent') {
    return {
      type: PARSED_COLOR_TYPE.Constant,
      value: [0, 0, 0, 0],
      formatted: 'rgba(0,0,0,0)',
    };
  }

  const type = colorStr[0];
  if (colorStr[1] === '(' || colorStr[2] === '(') {
    if (type === 'l') {
      const parsedLineGradient = parseLineGradient(colorStr);
      if (parsedLineGradient) {
        return {
          type: PARSED_COLOR_TYPE.LinearGradient,
          value: parsedLineGradient,
          formatted: '',
        };
      }
    } else if (type === 'r') {
      const parsedRadialGradient = parseRadialGradient(colorStr);
      if (parsedRadialGradient) {
        if (isString(parsedRadialGradient)) {
          colorStr = parsedRadialGradient as string;
        } else {
          return {
            type: PARSED_COLOR_TYPE.RadialGradient,
            value: parsedRadialGradient,
            formatted: '',
          };
        }
      }
    } else if (type === 'p') {
      const pattern = parsePattern(colorStr);
      if (pattern) {
        return {
          type: PARSED_COLOR_TYPE.Pattern,
          value: pattern,
          formatted: '',
        };
      }
    }
  }

  // constants
  const color = d3.color(colorStr) as d3.RGBColor;
  const rgba: Tuple4Number = [0, 0, 0, 0];
  if (color !== null) {
    rgba[0] = color.r / 255;
    rgba[1] = color.g / 255;
    rgba[2] = color.b / 255;
    rgba[3] = color.opacity;
  }
  return {
    type: PARSED_COLOR_TYPE.Constant,
    value: rgba,
    formatted:
      (color && `rgba(${color.r},${color.g},${color.b},${color.opacity})`) || 'rgba(0,0,0,0)',
  };
}

export function mergeColors(
  left: ParsedColorStyleProperty,
  right: ParsedColorStyleProperty,
  displayObject: DisplayObject | null,
): [number[], number[], (color: number[]) => string] | undefined {
  // only support constant value, exclude gradient & pattern
  if (left.type !== PARSED_COLOR_TYPE.Constant || right.type !== PARSED_COLOR_TYPE.Constant) {
    return;
  }

  return [
    left.value,
    right.value,
    (color: number[]) => {
      const rgba = color.slice();
      if (rgba[3]) {
        for (let i = 0; i < 3; i++) rgba[i] = Math.round(clamp(rgba[i] * 255, 0, 255));
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
    };
  }
  return null;
}
