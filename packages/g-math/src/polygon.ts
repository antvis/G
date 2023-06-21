import { box as polylineBox } from './polyline';
import {
  angleAtSegments,
  distanceAtSegment,
  lengthOfSegment,
  pointAtSegments,
} from './segments';
import type { PointTuple } from './types';

function getAllPoints(points: PointTuple[]) {
  const tmp = points.slice(0);
  if (points.length) {
    tmp.push(points[0]);
  }
  return tmp;
}

export function box(points: PointTuple[]) {
  return polylineBox(points);
}
export function length(points: PointTuple[]) {
  return lengthOfSegment(getAllPoints(points));
}
export function pointAt(points: PointTuple[], t: number) {
  return pointAtSegments(getAllPoints(points), t);
}
export function pointDistance(points: PointTuple[], x: number, y: number) {
  return distanceAtSegment(getAllPoints(points), x, y);
}
export function tangentAngle(points: PointTuple[], t: number) {
  return angleAtSegments(getAllPoints(points), t);
}
