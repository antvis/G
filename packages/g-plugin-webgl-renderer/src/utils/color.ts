import * as d3 from 'd3-color';
import { Color } from '../platform';

export function rgb2arr(str: string | null) {
  // @ts-ignore
  const color = d3.color(str) as d3.RGBColor;
  const arr = [0, 0, 0, 0];
  if (color != null) {
    arr[0] = color.r / 255;
    arr[1] = color.g / 255;
    arr[2] = color.b / 255;
    arr[3] = color.opacity;
  }
  return arr;
}

export function colorCopy(dst: Color, src: Color, a: number = src.a): void {
  dst.r = src.r;
  dst.g = src.g;
  dst.b = src.b;
  dst.a = a;
}

export function colorFromRGBA(dst: Color, r: number, g: number, b: number, a: number = 1.0): void {
  dst.r = r;
  dst.g = g;
  dst.b = b;
  dst.a = a;
}

export function colorNewCopy(src: Color, a: number = src.a): Color {
  return { r: src.r, g: src.g, b: src.b, a: a };
}

export function colorNewFromRGBA(r: number, g: number, b: number, a: number = 1.0): Color {
  return { r, g, b, a };
}

export const TransparentBlack = colorNewFromRGBA(0, 0, 0, 0);
export const OpaqueBlack = colorNewFromRGBA(0, 0, 0, 1);
export const TransparentWhite = colorNewFromRGBA(1, 1, 1, 0);
export const White = colorNewFromRGBA(1, 1, 1, 1);
