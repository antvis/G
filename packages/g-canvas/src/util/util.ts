export function getPixelRatio() {
  return window ? window.devicePixelRatio : 1;
}

export function distance(cx, cy, x, y) {
  const dx = cx - x;
  const dy = cy - y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function inBox(minX, minY, width, height, x, y) {
  return x >= minX && x <= minX + width && y >= minY && y <= minY + height;
}

// 全局设置一个唯一离屏的 ctx，用于计算 isPointInPath
let offScreenCtx = null;
export function getOffScreenContext() {
  if (!offScreenCtx) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    offScreenCtx = canvas.getContext('2d');
  }
  return offScreenCtx;
}

export { default as isNil } from '@antv/util/lib/is-nil';
export { default as isString } from '@antv/util/lib/is-string';
export { default as isFunction } from '@antv/util/lib/is-function';
export { default as isArray } from '@antv/util/lib/is-array';
export { default as each } from '@antv/util/lib/each';
export { default as toRadian } from '@antv/util/lib/to-radian';
export { default as mod } from '@antv/util/lib/mod';
