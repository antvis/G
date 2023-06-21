import {
  angleAtSegments,
  distanceAtSegment,
  lengthOfSegment,
  pointAtSegments,
} from './segments';
import type { BBox, PointTuple } from './types';
import { getBBoxByArray } from './util';

export function box(points: PointTuple[]): BBox {
  const xArr = [];
  const yArr = [];
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    xArr.push(point[0]);
    yArr.push(point[1]);
  }
  return getBBoxByArray(xArr, yArr);
}
export function length(points: PointTuple[]) {
  return lengthOfSegment(points);
}
export function pointAt(points: PointTuple[], t: number) {
  return pointAtSegments(points, t);
}
export function pointDistance(points: PointTuple[], x: number, y: number) {
  return distanceAtSegment(points, x, y);
}
export function tangentAngle(points: PointTuple[], t: number) {
  return angleAtSegments(points, t);
}
