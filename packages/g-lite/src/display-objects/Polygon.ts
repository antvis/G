import type { DisplayObjectConfig } from '../dom';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject, isDisplayObject } from './DisplayObject';

export interface PolygonStyleProps extends BaseStyleProps {
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
  isClosed?: boolean;
  isBillboard?: boolean;
  isSizeAttenuation?: boolean;
}
export interface ParsedPolygonStyleProps extends ParsedBaseStyleProps {
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
  isClosed?: boolean;
  isBillboard?: boolean;
  isSizeAttenuation?: boolean;
}

export class Polygon extends DisplayObject<
  PolygonStyleProps,
  ParsedPolygonStyleProps
> {
  static PARSED_STYLE_LIST: Set<string> = new Set([
    ...DisplayObject.PARSED_STYLE_LIST,
    'points',
    'markerStart',
    'markerMid',
    'markerEnd',
    'markerStartOffset',
    'markerEndOffset',
    'isClosed',
    'isBillboard',
    'isSizeAttenuation',
  ]);

  private markerStartAngle = 0;
  private markerEndAngle = 0;

  /**
   * markers placed at the mid
   */
  private markerMidList: DisplayObject[] = [];

  constructor({ style, ...rest }: DisplayObjectConfig<PolygonStyleProps> = {}) {
    super({
      type: Shape.POLYGON,
      style,
      initialParsedStyle: {
        points: {
          points: [],
          totalLength: 0,
          segments: [],
        },
        miterLimit: 4,
        isClosed: true,
      },
      ...rest,
    });

    const { markerStart, markerEnd, markerMid } = this.parsedStyle;

    if (markerStart && isDisplayObject(markerStart)) {
      this.markerStartAngle = markerStart.getLocalEulerAngles();
      this.appendChild(markerStart);
    }

    if (markerMid && isDisplayObject(markerMid)) {
      this.placeMarkerMid(markerMid);
    }

    if (markerEnd && isDisplayObject(markerEnd)) {
      this.markerEndAngle = markerEnd.getLocalEulerAngles();
      this.appendChild(markerEnd);
    }

    this.transformMarker(true);
    this.transformMarker(false);
  }

  attributeChangedCallback<Key extends keyof PolygonStyleProps>(
    attrName: Key,
    oldValue: PolygonStyleProps[Key],
    newValue: PolygonStyleProps[Key],
    prevParsedValue: ParsedPolygonStyleProps[Key],
    newParsedValue: ParsedPolygonStyleProps[Key],
  ) {
    if (attrName === 'points') {
      // recalc markers
      this.transformMarker(true);
      this.transformMarker(false);
      this.placeMarkerMid(this.parsedStyle.markerMid);
    } else if (
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
    } else if (attrName === 'markerMid') {
      this.placeMarkerMid(newParsedValue as DisplayObject);
    }
  }

  private transformMarker(isStart: boolean) {
    const {
      markerStart,
      markerEnd,
      markerStartOffset,
      markerEndOffset,
      points: P,
    } = this.parsedStyle;
    const { points } = P || {};
    const marker = isStart ? markerStart : markerEnd;

    if (!marker || !isDisplayObject(marker) || !points) {
      return;
    }

    let rad = 0;
    let x: number;
    let y: number;
    let ox: number;
    let oy: number;
    let offset: number;
    let originalAngle: number;

    ox = points[0][0];
    oy = points[0][1];

    if (isStart) {
      x = points[1][0] - points[0][0];
      y = points[1][1] - points[0][1];
      offset = markerStartOffset || 0;
      originalAngle = this.markerStartAngle;
    } else {
      const { length } = points;

      if (!this.parsedStyle.isClosed) {
        ox = points[length - 1][0];
        oy = points[length - 1][1];
        x = points[length - 2][0] - points[length - 1][0];
        y = points[length - 2][1] - points[length - 1][1];
      } else {
        x = points[length - 1][0] - points[0][0];
        y = points[length - 1][1] - points[0][1];
      }
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

  private placeMarkerMid(marker: DisplayObject) {
    const { points: P } = this.parsedStyle;
    const { points } = P || {};

    // clear all existed markers
    this.markerMidList.forEach((marker) => {
      marker.remove();
    });
    this.markerMidList = [];

    if (marker && isDisplayObject(marker) && points) {
      for (
        let i = 1;
        i < (this.parsedStyle.isClosed ? points.length : points.length - 1);
        i++
      ) {
        const ox = points[i][0];
        const oy = points[i][1];

        const cloned = i === 1 ? marker : marker.cloneNode(true);
        this.markerMidList.push(cloned);

        this.appendChild(cloned);
        cloned.setLocalPosition(ox, oy);

        // TODO: orient of marker
      }
    }
  }
}
