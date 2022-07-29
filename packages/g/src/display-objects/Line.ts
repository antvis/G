import { Line as LineUtil } from '@antv/g-math';
import { vec3 } from 'gl-matrix';
import type { CSSUnitValue } from '../css';
import { DisplayObjectConfig, ElementEvent, MutationEvent } from '../dom';
import { Point } from '../shapes';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject } from './DisplayObject';

export interface LineStyleProps extends BaseStyleProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  z1?: number;
  z2?: number;
  isBillboard?: boolean;
  /**
   * marker will be positioned at x1/y1
   */
  markerStart?: DisplayObject;

  /**
   * marker will be positioned at x2/y2
   */
  markerEnd?: DisplayObject;

  /**
   * offset relative to original position
   */
  markerStartOffset?: number;

  /**
   * offset relative to original position
   */
  markerEndOffset?: number;
}
export interface ParsedLineStyleProps extends ParsedBaseStyleProps {
  x1: CSSUnitValue;
  y1: CSSUnitValue;
  x2: CSSUnitValue;
  y2: CSSUnitValue;
  z1?: CSSUnitValue;
  z2?: CSSUnitValue;
  defX: number;
  defY: number;
  isBillboard?: boolean;
  markerStart?: DisplayObject;
  markerEnd?: DisplayObject;
  markerStartOffset?: number;
  markerEndOffset?: number;
}

/**
 * Create a line connecting two points.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line
 *
 * Also support for using marker.
 */
export class Line extends DisplayObject<LineStyleProps, ParsedLineStyleProps> {
  private markerStartAngle = 0;
  private markerEndAngle = 0;

  constructor({ style, ...rest }: DisplayObjectConfig<LineStyleProps> = {}) {
    super({
      type: Shape.LINE,
      style: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        z1: 0,
        z2: 0,
        isBillboard: false,
        ...style,
      },
      ...rest,
    });

    const { markerStart, markerEnd } = this.parsedStyle;

    if (markerStart && markerStart instanceof DisplayObject) {
      this.markerStartAngle = markerStart.getLocalEulerAngles();
      this.appendChild(markerStart);
    }

    if (markerEnd && markerEnd instanceof DisplayObject) {
      this.markerEndAngle = markerEnd.getLocalEulerAngles();
      this.appendChild(markerEnd);
    }

    this.transformMarker(true);
    this.transformMarker(false);

    this.addEventListener(ElementEvent.ATTR_MODIFIED, (e: MutationEvent) => {
      const { attrName, prevParsedValue, newParsedValue } = e;

      if (
        attrName === 'x1' ||
        attrName === 'y1' ||
        attrName === 'x2' ||
        attrName === 'y2' ||
        attrName === 'markerStartOffset' ||
        attrName === 'markerEndOffset'
      ) {
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
      }
    });
  }

  private transformMarker(isStart: boolean) {
    const {
      markerStart,
      markerEnd,
      markerStartOffset,
      markerEndOffset,
      x1,
      x2,
      y1,
      y2,
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
      ox = x1.value - defX;
      oy = y1.value - defY;
      x = x2.value - x1.value;
      y = y2.value - y1.value;
      offset = markerStartOffset || 0;
      originalAngle = this.markerStartAngle;
    } else {
      ox = x2.value - defX;
      oy = y2.value - defY;
      x = x1.value - x2.value;
      y = y1.value - y2.value;
      offset = markerEndOffset || 0;
      originalAngle = this.markerEndAngle;
    }
    rad = Math.atan2(y, x);

    // account for markerOffset
    marker.setLocalEulerAngles((rad * 180) / Math.PI + originalAngle);
    marker.setLocalPosition(ox + Math.cos(rad) * offset, oy + Math.sin(rad) * offset);
  }

  getPoint(ratio: number): Point {
    // TODO: account for z1/z2 in 3D line
    const { x1, y1, x2, y2, defX, defY } = this.parsedStyle;
    const { x, y } = LineUtil.pointAt(x1.value, y1.value, x2.value, y2.value, ratio);

    const transformed = vec3.transformMat4(
      vec3.create(),
      vec3.fromValues(x - defX, y - defY, 0),
      this.getLocalTransform(),
    );

    // apply local transformation
    return new Point(transformed[0], transformed[1]);
  }

  getTotalLength() {
    // TODO: account for z1/z2 in 3D line
    const { x1, y1, x2, y2 } = this.parsedStyle;
    return LineUtil.length(x1.value, y1.value, x2.value, y2.value);
  }
}
