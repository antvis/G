import { isString } from '@antv/util';
import type { DisplayObject } from '../..';

/**
 * @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/points
 *
 * @example
 * points="100,10 250,150 200,110"
 */
export function parsePoints(
  pointsOrStr: string | [number, number][],
  object?: DisplayObject,
) {
  let points: [number, number][];
  if (isString(pointsOrStr)) {
    points = pointsOrStr.split(' ').map((pointStr) => {
      const [x, y] = pointStr.split(',');
      return [Number(x), Number(y)];
    });
  } else {
    points = pointsOrStr;
  }

  return {
    points,
    totalLength: 0,
    segments: [],
  };
}

export function mergePoints(
  left,
  right,
):
  | [
      [number, number][],
      [number, number][],
      (numberList: [number, number][]) => [number, number][],
    ]
  | undefined {
  return [
    left.points,
    right.points,
    (points) => {
      return points;
    },
  ];
}
