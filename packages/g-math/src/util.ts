import { BBox } from './types';

function minNum(array: number[]) {
  return Math.min.apply(null, array);
}

function maxNum(array: number[]) {
  return Math.max.apply(null, array);
}

/**
 * 两点之间的距离
 * @param {number} x1 起始点 x
 * @param {number} y1 起始点 y
 * @param {number} x2 结束点 x
 * @param {number} y2 结束点 y
 * @return {number} 距离
 */
export function distance(x1: number, y1: number, x2: number, y2: number) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

export function isNumberEqual(v1: number, v2: number) {
  return Math.abs(v1 - v2) < 0.001;
}

export function getBBoxByArray(xArr: number[], yArr: number[]): BBox {
  const minX = minNum(xArr);
  const minY = minNum(yArr);
  const maxX = maxNum(xArr);
  const maxY = maxNum(yArr);
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function getBBoxRange(x1: number, y1: number, x2: number, y2: number) {
  return {
    minX: minNum([x1, x2]),
    maxX: maxNum([x1, x2]),
    minY: minNum([y1, y2]),
    maxY: maxNum([y1, y2]),
  };
}

export function piMod(angle: number) {
  return (angle + Math.PI * 2) % (Math.PI * 2);
}
