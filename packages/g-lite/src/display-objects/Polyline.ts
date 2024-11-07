import { lineLength, linePointAt } from '@antv/g-math';
import { vec3 } from 'gl-matrix';
import type { DisplayObjectConfig } from '../dom';
import { Point } from '../shapes';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import type { DisplayObject } from './DisplayObject';
import { Polygon } from './Polygon';
import { getOrCalculatePolylineTotalLength } from '../utils';

export interface PolylineStyleProps extends BaseStyleProps {
  points: ([number, number] | [number, number, number])[];
  /**
   * marker will be positioned at the first point
   */
  markerStart?: DisplayObject | null;

  /**
   * marker will be positioned at the last point
   */
  markerEnd?: DisplayObject | null;

  markerMid?: DisplayObject | null;

  /**
   * offset relative to original position
   */
  markerStartOffset?: number;

  /**
   * offset relative to original position
   */
  markerEndOffset?: number;
  /**
   * Whether the circle is billboard.
   */
  isBillboard?: boolean;
  /**
   * Whether the circle is size attenuation.
   */
  isSizeAttenuation?: boolean;
}
export interface ParsedPolylineStyleProps extends ParsedBaseStyleProps {
  points: {
    points: ([number, number] | [number, number, number])[];
    segments: [number, number][];
    totalLength: number;
  };
  markerStart?: DisplayObject | null;
  markerMid?: DisplayObject | null;
  markerEnd?: DisplayObject | null;
  markerStartOffset?: number;
  markerEndOffset?: number;
  isBillboard?: boolean;
}

/**
 * Polyline inherits the marker-related capabilities of Polygon.
 */
export class Polyline extends Polygon {
  static PARSED_STYLE_LIST = new Set([
    ...Polygon.PARSED_STYLE_LIST,
    'points',
    'markerStart',
    'markerMid',
    'markerEnd',
    'markerStartOffset',
    'markerEndOffset',
    'isBillboard',
  ]);

  constructor({
    style,
    ...rest
  }: DisplayObjectConfig<PolylineStyleProps> = {}) {
    super({
      type: Shape.POLYLINE,
      style,
      initialParsedStyle: {
        points: {
          points: [],
          totalLength: 0,
          segments: [],
        },
        miterLimit: 4,
        isClosed: false,
      },
      ...rest,
    });
  }

  getTotalLength() {
    return getOrCalculatePolylineTotalLength(this);
  }

  getPointAtLength(distance: number, inWorldSpace = false): Point {
    return this.getPoint(distance / this.getTotalLength(), inWorldSpace);
  }

  getPoint(ratio: number, inWorldSpace = false): Point {
    const {
      points: { points },
    } = this.parsedStyle;

    if (this.parsedStyle.points.segments.length === 0) {
      const segments: [number, number][] = [];
      let tempLength = 0;
      let segmentT: [number, number];
      let segmentL: number;

      const totalLength = this.getTotalLength();

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

      this.parsedStyle.points.segments = segments;
    }

    let subt = 0;
    let index = 0;
    this.parsedStyle.points.segments.forEach((v, i) => {
      if (ratio >= v[0] && ratio <= v[1]) {
        subt = (ratio - v[0]) / (v[1] - v[0]);
        index = i;
      }
    });

    const { x, y } = linePointAt(
      points[index][0],
      points[index][1],
      points[index + 1][0],
      points[index + 1][1],
      subt,
    );

    const transformed = vec3.transformMat4(
      vec3.create(),
      vec3.fromValues(x, y, 0),
      inWorldSpace ? this.getWorldTransform() : this.getLocalTransform(),
    );

    // apply local transformation
    return new Point(transformed[0], transformed[1]);
  }

  getStartTangent(): number[][] {
    const { points } = this.parsedStyle.points;
    const result = [];
    result.push([points[1][0], points[1][1]]);
    result.push([points[0][0], points[0][1]]);
    return result;
  }

  getEndTangent(): number[][] {
    const { points } = this.parsedStyle.points;
    const l = points.length - 1;
    const result = [];
    result.push([points[l - 1][0], points[l - 1][1]]);
    result.push([points[l][0], points[l][1]]);
    return result;
  }
}
