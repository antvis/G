export function getPixelRatio() {
  return window ? window.devicePixelRatio : 1;
}

/**
 * 两点之间的距离
 * @param {number} x1 起始点 x
 * @param {number} y1 起始点 y
 * @param {number} x2 结束点 x
 * @param {number} y2 结束点 y
 */
export function distance(x1: number, y1: number, x2: number, y2: number) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 是否在包围盒内
 * @param {number} minX   包围盒开始的点 x
 * @param {number} minY   包围盒开始的点 y
 * @param {number} width  宽度
 * @param {number} height 高度
 * @param {[type]} x      检测点的 x
 * @param {[type]} y      监测点的 y
 */
export function inBox(minX: number, minY: number, width: number, height: number, x, y) {
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
export { default as isNumberEqual } from '@antv/util/lib/is-number-equal';
