import { lineLength, polylineLength } from '@antv/g-math';
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

  const segments: [number, number][] = [];
  let tempLength = 0;
  let segmentT: [number, number];
  let segmentL: number;

  const totalLength = polylineLength(points);

  points.forEach((p, i) => {
    if (points[i + 1]) {
      segmentT = [0, 0];
      segmentT[0] = tempLength / totalLength;
      segmentL = lineLength(p[0], p[1], points[i + 1][0], points[i + 1][1]);
      tempLength += segmentL;
      segmentT[1] = tempLength / totalLength;
      segments.push(segmentT);
    }
  });

  // const minX = Math.min(...points.map((point) => point[0]));
  // const minY = Math.min(...points.map((point) => point[1]));

  return {
    points,
    totalLength,
    segments,
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
