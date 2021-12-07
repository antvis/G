import { Line as LineUtil, Polyline as PolylineUtil } from '@antv/g-math';

export function parsePoints(points: [number, number][]) {
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

  return {
    points,
    totalLength,
    segments,
  };
}
