import { lineLength, linePointAt } from '@antv/g-math';
import { vec3 } from 'gl-matrix';
import type { DisplayObjectConfig } from '../dom';
import { Point } from '../shapes';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject, isDisplayObject } from './DisplayObject';

export interface LineStyleProps extends BaseStyleProps {
  /**
   * X coordinate of the start of the line.
   */
  x1: number;
  /**
   * Y coordinate of the start of the line.
   */
  y1: number;
  /**
   * X coordinate of the end of the line.
   */
  x2: number;
  /**
   * Y coordinate of the end of the line.
   */
  y2: number;
  /**
   * Z coordinate of the start of the line.
   */
  z1?: number;
  /**
   * Z coordinate of the end of the line.
   */
  z2?: number;
  /**
   * Whether the line is billboard.
   */
  isBillboard?: boolean;
  /**
   * Whether the line is size attenuation.
   */
  isSizeAttenuation?: boolean;
  /**
   * marker will be positioned at x1/y1
   */
  markerStart?: DisplayObject | null;

  /**
   * marker will be positioned at x2/y2
   */
  markerEnd?: DisplayObject | null;

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
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  z1?: number;
  z2?: number;
  isBillboard?: boolean;
  isSizeAttenuation?: boolean;
  markerStart?: DisplayObject | null;
  markerEnd?: DisplayObject | null;
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
  static PARSED_STYLE_LIST: Set<string> = new Set([
    ...DisplayObject.PARSED_STYLE_LIST,
    'x1',
    'y1',
    'x2',
    'y2',
    'z1',
    'z2',
    'isBillboard',
    'isSizeAttenuation',
    'markerStart',
    'markerEnd',
    'markerStartOffset',
    'markerEndOffset',
  ]);

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
        ...style,
      },
      ...rest,
    });

    const { markerStart, markerEnd } = this.parsedStyle;

    if (markerStart && isDisplayObject(markerStart)) {
      this.markerStartAngle = markerStart.getLocalEulerAngles();
      this.appendChild(markerStart);
    }

    if (markerEnd && isDisplayObject(markerEnd)) {
      this.markerEndAngle = markerEnd.getLocalEulerAngles();
      this.appendChild(markerEnd);
    }

    this.transformMarker(true);
    this.transformMarker(false);
  }

  attributeChangedCallback<Key extends keyof LineStyleProps>(
    attrName: Key,
    oldValue: LineStyleProps[Key],
    newValue: LineStyleProps[Key],
    prevParsedValue: ParsedLineStyleProps[Key],
    newParsedValue: ParsedLineStyleProps[Key],
  ) {
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
      if (prevParsedValue && isDisplayObject(prevParsedValue)) {
        this.markerStartAngle = 0;
        prevParsedValue.remove();
      }

      // CSSKeyword 'unset'
      if (newParsedValue && isDisplayObject(newParsedValue)) {
        this.markerStartAngle = newParsedValue.getLocalEulerAngles();
        this.appendChild(newParsedValue);
        this.transformMarker(true);
      }
    } else if (attrName === 'markerEnd') {
      if (prevParsedValue && isDisplayObject(prevParsedValue)) {
        this.markerEndAngle = 0;
        prevParsedValue.remove();
      }

      if (newParsedValue && isDisplayObject(newParsedValue)) {
        this.markerEndAngle = newParsedValue.getLocalEulerAngles();
        this.appendChild(newParsedValue);
        this.transformMarker(false);
      }
    }
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
    } = this.parsedStyle;
    const marker = isStart ? markerStart : markerEnd;

    if (!marker || !isDisplayObject(marker)) {
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
      ox = x1;
      oy = y1;
      x = x2 - x1;
      y = y2 - y1;
      offset = markerStartOffset || 0;
      originalAngle = this.markerStartAngle;
    } else {
      ox = x2;
      oy = y2;
      x = x1 - x2;
      y = y1 - y2;
      offset = markerEndOffset || 0;
      originalAngle = this.markerEndAngle;
    }
    rad = Math.atan2(y, x);

    // account for markerOffset
    marker.setLocalEulerAngles((rad * 180) / Math.PI + originalAngle);
    marker.setLocalPosition(
      ox + Math.cos(rad) * offset,
      oy + Math.sin(rad) * offset,
    );
  }

  getPoint(ratio: number, inWorldSpace = false): Point {
    // TODO: account for z1/z2 in 3D line
    const { x1, y1, x2, y2 } = this.parsedStyle;
    const { x, y } = linePointAt(x1, y1, x2, y2, ratio);

    const transformed = vec3.transformMat4(
      vec3.create(),
      vec3.fromValues(x, y, 0),
      inWorldSpace ? this.getWorldTransform() : this.getLocalTransform(),
    );

    // apply local transformation
    return new Point(transformed[0], transformed[1]);
  }

  getPointAtLength(distance: number, inWorldSpace = false): Point {
    return this.getPoint(distance / this.getTotalLength(), inWorldSpace);
  }

  getTotalLength() {
    // TODO: account for z1/z2 in 3D line
    const { x1, y1, x2, y2 } = this.parsedStyle;
    return lineLength(x1, y1, x2, y2);
  }
}
