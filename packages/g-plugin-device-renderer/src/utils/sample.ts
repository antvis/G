import { cubicLength, quadLength } from '@antv/g-math';
import { clamp } from '@antv/util';

const SEGMENT_LENGTH = 10;
const MIN_SEGMENT_NUM = 8;
const MAX_SEGMENT_NUM = 100;

export function quadCurveTo(
  cpX: number,
  cpY: number,
  toX: number,
  toY: number,
  points: number[],
  segmentNum?: number,
) {
  const fromX = points[points.length - 3];
  const fromY = points[points.length - 2];

  const n =
    segmentNum ??
    clamp(
      quadLength(fromX, fromY, cpX, cpY, toX, toY) / SEGMENT_LENGTH,
      MIN_SEGMENT_NUM,
      MAX_SEGMENT_NUM,
    );

  let xa = 0;
  let ya = 0;

  for (let i = 1; i <= n; ++i) {
    const j = i / n;

    xa = fromX + (cpX - fromX) * j;
    ya = fromY + (cpY - fromY) * j;

    points.push(
      xa + (cpX + (toX - cpX) * j - xa) * j,
      ya + (cpY + (toY - cpY) * j - ya) * j,
      0,
    );
  }
}

export function bezierCurveTo(
  cpX: number,
  cpY: number,
  cpX2: number,
  cpY2: number,
  toX: number,
  toY: number,
  points: number[],
  segmentNum?: number,
): void {
  const fromX = points[points.length - 3];
  const fromY = points[points.length - 2];

  points.length -= 3;

  const n =
    segmentNum ??
    clamp(
      cubicLength(fromX, fromY, cpX, cpY, cpX2, cpY2, toX, toY) /
        SEGMENT_LENGTH,
      MIN_SEGMENT_NUM,
      MAX_SEGMENT_NUM,
    );

  let dt = 0;
  let dt2 = 0;
  let dt3 = 0;
  let t2 = 0;
  let t3 = 0;

  points.push(fromX, fromY, 0);

  for (let i = 1, j = 0; i <= n; ++i) {
    j = i / n;

    dt = 1 - j;
    dt2 = dt * dt;
    dt3 = dt2 * dt;

    t2 = j * j;
    t3 = t2 * j;

    points.push(
      dt3 * fromX + 3 * dt2 * j * cpX + 3 * dt * t2 * cpX2 + t3 * toX,
      dt3 * fromY + 3 * dt2 * j * cpY + 3 * dt * t2 * cpY2 + t3 * toY,
      0,
    );
  }
}
