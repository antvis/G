import { Line as LineUtil } from '@antv/g-math';
import { vec3 } from 'gl-matrix';
import { DisplayObjectConfig, ElementEvent, MutationEvent } from '../dom';
import { Point } from '../shapes';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject } from './DisplayObject';

export interface PolylineStyleProps extends BaseStyleProps {
  points: [number, number][];
  /**
   * marker will be positioned at the first point
   */
  markerStart?: DisplayObject;

  /**
   * marker will be positioned at the last point
   */
  markerEnd?: DisplayObject;

  markerMid?: DisplayObject;

  /**
   * offset relative to original position
   */
  markerStartOffset?: number;

  /**
   * offset relative to original position
   */
  markerEndOffset?: number;
}
export interface ParsedPolylineStyleProps extends ParsedBaseStyleProps {
  points: {
    points: [number, number][];
    segments: [number, number][];
    totalLength: number;
  };
  markerStart?: DisplayObject;
  markerMid?: DisplayObject;
  markerEnd?: DisplayObject;
  markerStartOffset?: number;
  markerEndOffset?: number;
}
export class Polyline extends DisplayObject<PolylineStyleProps, ParsedPolylineStyleProps> {
  private markerStartAngle = 0;
  private markerEndAngle = 0;

  /**
   * markers placed at the mid
   */
  private markerMidList: DisplayObject[] = [];

  constructor({ style, ...rest }: DisplayObjectConfig<PolylineStyleProps> = {}) {
    super({
      type: Shape.POLYLINE,
      style: {
        points: '',
        miterLimit: '',
        ...style,
      },
      ...rest,
    });

    const { markerStart, markerEnd, markerMid } = this.parsedStyle;

    if (markerStart && markerStart instanceof DisplayObject) {
      this.markerStartAngle = markerStart.getLocalEulerAngles();
      this.appendChild(markerStart);
    }

    if (markerMid && markerMid instanceof DisplayObject) {
      this.placeMarkerMid(markerMid);
    }

    if (markerEnd && markerEnd instanceof DisplayObject) {
      this.markerEndAngle = markerEnd.getLocalEulerAngles();
      this.appendChild(markerEnd);
    }

    this.transformMarker(true);
    this.transformMarker(false);

    this.addEventListener(ElementEvent.ATTR_MODIFIED, (e: MutationEvent) => {
      const { attrName, prevParsedValue, newParsedValue } = e;

      if (attrName === 'points') {
        // recalc markers
        this.transformMarker(true);
        this.transformMarker(false);
        this.placeMarkerMid(this.parsedStyle.markerMid);
      } else if (attrName === 'markerStartOffset' || attrName === 'markerEndOffset') {
        this.transformMarker(true);
        this.transformMarker(false);
      } else if (attrName === 'markerStart') {
        if (prevParsedValue && prevParsedValue instanceof DisplayObject) {
          this.markerStartAngle = 0;
          (prevParsedValue as DisplayObject).remove();
        }

        // CSSKeyword 'unset'
        if (newParsedValue && newParsedValue instanceof DisplayObject) {
          this.markerStartAngle = newParsedValue.getLocalEulerAngles();
          this.appendChild(newParsedValue);
          this.transformMarker(true);
        }
      } else if (attrName === 'markerEnd') {
        if (prevParsedValue && prevParsedValue instanceof DisplayObject) {
          this.markerEndAngle = 0;
          (prevParsedValue as DisplayObject).remove();
        }

        if (newParsedValue && newParsedValue instanceof DisplayObject) {
          this.markerEndAngle = newParsedValue.getLocalEulerAngles();
          this.appendChild(newParsedValue);
          this.transformMarker(false);
        }
      } else if (attrName === 'markerMid') {
        this.placeMarkerMid(newParsedValue);
      }
    });
  }

  private transformMarker(isStart: boolean) {
    const {
      markerStart,
      markerEnd,
      markerStartOffset,
      markerEndOffset,
      points: { points },
      defX,
      defY,
    } = this.parsedStyle;
    const marker = isStart ? markerStart : markerEnd;

    if (!marker || !(marker instanceof DisplayObject)) {
      return;
    }

    let rad = 0;
    let x: number;
    let y: number;
    let ox: number;
    let oy: number;
    let offset: number;
    let originalAngle: number;

    if (isStart) {
      ox = points[0][0] - defX;
      oy = points[0][1] - defY;
      x = points[1][0] - points[0][0];
      y = points[1][1] - points[0][1];
      offset = markerStartOffset || 0;
      originalAngle = this.markerStartAngle;
    } else {
      const { length } = points;
      ox = points[length - 1][0] - defX;
      oy = points[length - 1][1] - defY;
      x = points[length - 2][0] - points[length - 1][0];
      y = points[length - 2][1] - points[length - 1][1];
      offset = markerEndOffset || 0;
      originalAngle = this.markerEndAngle;
    }
    rad = Math.atan2(y, x);

    // account for markerOffset
    marker.setLocalEulerAngles((rad * 180) / Math.PI + originalAngle);
    marker.setLocalPosition(ox + Math.cos(rad) * offset, oy + Math.sin(rad) * offset);
  }

  private placeMarkerMid(marker: DisplayObject) {
    const {
      points: { points },
      defX,
      defY,
    } = this.parsedStyle;

    // clear all existed markers
    this.markerMidList.forEach((marker) => {
      marker.remove();
    });

    if (marker && marker instanceof DisplayObject) {
      for (let i = 1; i < points.length - 1; i++) {
        const ox = points[i][0] - defX;
        const oy = points[i][1] - defY;

        const cloned = i === 1 ? marker : marker.cloneNode(true);
        this.markerMidList.push(cloned);

        this.appendChild(cloned);
        cloned.setLocalPosition(ox, oy);

        // TODO: orient of marker
      }
    }
  }

  getTotalLength() {
    return this.parsedStyle.points.totalLength;
  }

  getPoint(ratio: number): Point {
    const {
      defX,
      defY,
      points: { points, segments },
    } = this.parsedStyle;

    let subt = 0;
    let index = 0;
    segments.forEach((v, i) => {
      if (ratio >= v[0] && ratio <= v[1]) {
        subt = (ratio - v[0]) / (v[1] - v[0]);
        index = i;
      }
    });

    const { x, y } = LineUtil.pointAt(
      points[index][0],
      points[index][1],
      points[index + 1][0],
      points[index + 1][1],
      subt,
    );

    const transformed = vec3.transformMat4(
      vec3.create(),
      vec3.fromValues(x - defX, y - defY, 0),
      this.getLocalTransform(),
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
