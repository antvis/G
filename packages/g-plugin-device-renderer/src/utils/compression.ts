import { clamp } from '@antv/util';

export function packUint8ToFloat(a: number, b: number) {
  a = clamp(Math.floor(a), 0, 255);
  b = clamp(Math.floor(b), 0, 255);
  return 256 * a + b;
}
