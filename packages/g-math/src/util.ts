import type { BBox } from './types';

export function distance(x1: number, y1: number, x2: number, y2: number) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

export function getBBoxByArray(xArr: number[], yArr: number[]): BBox {
  const minX = Math.min(...xArr);
  const minY = Math.min(...yArr);
  const maxX = Math.max(...xArr);
  const maxY = Math.max(...yArr);
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function getBBoxRange(x1: number, y1: number, x2: number, y2: number) {
  return {
    minX: Math.min(x1, x2),
    maxX: Math.max(x1, x2),
    minY: Math.min(y1, y2),
    maxY: Math.max(y1, y2),
  };
}

export function piMod(angle: number) {
  return (angle + Math.PI * 2) % (Math.PI * 2);
}
