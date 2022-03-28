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
