
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

export { default as isNil } from '@antv/util/lib/is-nil';
export { default as isString } from '@antv/util/lib/is-string';
export { default as isArray } from '@antv/util/lib/is-array';
export { default as each } from '@antv/util/lib/each';
