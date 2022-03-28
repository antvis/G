import type { Color } from '../platform';

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
export const OpaqueWhite = colorNewFromRGBA(1, 1, 1, 1);
