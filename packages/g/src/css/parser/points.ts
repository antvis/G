import { Line as LineUtil, Polyline as PolylineUtil } from '@antv/g-math';
import type { DisplayObject } from '../..';
import { isString } from '../../utils';

export function parsePoints(points: string | [number, number][], object: DisplayObject) {
  if (isString(points)) {
    return null;
  }

  const segments: [number, number][] = [];
  let tempLength = 0;
  let segmentT: [number, number];
  let segmentL;

  const totalLength = PolylineUtil.length(points);

  points.forEach((p, i) => {
    if (points[i + 1]) {
      segmentT = [0, 0];
      segmentT[0] = tempLength / totalLength;
      segmentL = LineUtil.length(p[0], p[1], points[i + 1][0], points[i + 1][1]);
      tempLength += segmentL;
      segmentT[1] = tempLength / totalLength;
      segments.push(segmentT);
    }
  });

  const minX = Math.min(...points.map((point) => point[0]));
  const minY = Math.min(...points.map((point) => point[1]));

  object.parsedStyle.defX = minX;
  object.parsedStyle.defY = minY;

  return {
    points,
    totalLength,
    segments,
  };
}
