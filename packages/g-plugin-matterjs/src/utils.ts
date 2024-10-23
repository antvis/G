/**
 * @see https://stackoverflow.com/questions/45660743/sort-points-in-counter-clockwise-in-javascript
 */
export function sortPointsInCCW(pts: [number, number][]): [number, number][] {
  const points = pts.map(([x, y]) => ({
    x,
    y,
    angle: 0,
  }));

  points.sort((a, b) => a.y - b.y);

  // Get center y
  const cy = (points[0].y + points[points.length - 1].y) / 2;

  // Sort from right to left
  points.sort((a, b) => b.x - a.x);

  // Get center x
  const cx = (points[0].x + points[points.length - 1].x) / 2;

  // Center point
  const center = { x: cx, y: cy };

  // Pre calculate the angles as it will be slow in the sort
  // As the points are sorted from right to left the first point
  // is the rightmost

  // Starting angle used to reference other angles
  let startAng: number;
  points.forEach((point) => {
    let ang = Math.atan2(point.y - center.y, point.x - center.x);
    if (!startAng) {
      startAng = ang;
    } else if (ang < startAng) {
      // ensure that all points are clockwise of the start point
      ang += Math.PI * 2;
    }
    point.angle = ang; // add the angle to the point
  });

  // Sort clockwise;
  points.sort((a, b) => a.angle - b.angle);

  return points.map(({ x, y }) => [x, y]);
}
