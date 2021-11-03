import { Point } from './Point';

export class PolygonShape {
  points: number[];
  closeStroke: boolean;

  constructor(points: Point[] | number[]);
  constructor(...points: Point[] | number[]);
  constructor(...points: any[]) {
    let flat: Point[] | number[] = Array.isArray(points[0]) ? points[0] : points;

    // if this is an array of points, convert it to a flat array of numbers
    if (typeof flat[0] !== 'number') {
      const p: number[] = [];

      for (let i = 0, il = flat.length; i < il; i++) {
        p.push((flat[i] as Point).x, (flat[i] as Point).y);
      }

      flat = p;
    }

    this.points = flat as number[];

    /**
     * `false` after moveTo, `true` after `closePath`. In all other cases it is `true`.
     * @member {boolean}
     * @default true
     */
    this.closeStroke = true;
  }

  clone(): PolygonShape {
    const points = this.points.slice();
    const polygon = new PolygonShape(points);
    polygon.closeStroke = this.closeStroke;
    return polygon;
  }

  contains(x: number, y: number): boolean {
    let inside = false;

    // use some raycasting to test hits
    // https://github.com/substack/point-in-polygon/blob/master/index.js
    const length = this.points.length / 2;

    for (let i = 0, j = length - 1; i < length; j = i++) {
      const xi = this.points[i * 2];
      const yi = this.points[i * 2 + 1];
      const xj = this.points[j * 2];
      const yj = this.points[j * 2 + 1];
      const intersect = yi > y !== yj > y && x < (xj - xi) * ((y - yi) / (yj - yi)) + xi;

      if (intersect) {
        inside = !inside;
      }
    }

    return inside;
  }
}
