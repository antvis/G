import type { Color } from '../interfaces';

export function colorEqual(c0: Readonly<Color>, c1: Readonly<Color>): boolean {
  return c0.r === c1.r && c0.g === c1.g && c0.b === c1.b && c0.a === c1.a;
}

export function colorCopy(dst: Color, src: Readonly<Color>): void {
  dst.r = src.r;
  dst.g = src.g;
  dst.b = src.b;
  dst.a = src.a;
}

export function colorNewCopy(src: Readonly<Color>): Color {
  const { r, g, b, a } = src;
  return { r, g, b, a };
}

export function colorNewFromRGBA(
  r: number,
  g: number,
  b: number,
  a = 1.0,
): Color {
  return { r, g, b, a };
}

export const TransparentBlack = colorNewFromRGBA(0, 0, 0, 0);
export const OpaqueBlack = colorNewFromRGBA(0, 0, 0, 1);
export const TransparentWhite = colorNewFromRGBA(1, 1, 1, 0);
export const OpaqueWhite = colorNewFromRGBA(1, 1, 1, 1);
