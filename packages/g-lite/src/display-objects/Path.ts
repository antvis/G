import type {
  AbsoluteArray,
  AbsoluteSegment,
  CurveArray,
  PathArray,
} from '@antv/util';
import { getPointAtLength } from '@antv/util';
import { vec3 } from 'gl-matrix';
import type { DisplayObjectConfig } from '../dom';
import { runtime } from '../global-runtime';
import { Point } from '../shapes';
import { Rectangle } from '../shapes/Rectangle';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { getOrCalculatePathTotalLength } from '../utils';
import { DisplayObject, isDisplayObject } from './DisplayObject';

export interface PathStyleProps extends BaseStyleProps {
  path?: string | PathArray;
  d?: string | PathArray;
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

export interface PathSegmentBBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface PathSegment {
  command: 'M' | 'L' | 'V' | 'H' | 'C' | 'S' | 'Q' | 'T' | 'A' | 'Z';
  currentPoint: [number, number];
  prePoint: [number, number];
  nextPoint: [number, number];
  startTangent: [number, number];
  endTangent: [number, number];
  params: AbsoluteSegment;
  arcParams: PathArcParams;
  /**
   * Used for hit test.
   */
  box: PathSegmentBBox;
  /**
   * Convert A to C.
   */
  cubicParams: [number, number, number, number, number, number];
}

export const EMPTY_PARSED_PATH = {
  absolutePath: [] as unknown as AbsoluteArray,
  hasArc: false,
  segments: [],
  polygons: [],
  polylines: [],
  curve: null,
  totalLength: 0,
  rect: new Rectangle(0, 0, 0, 0),
};

export interface PathArcParams {
  cx: number;
  cy: number;
  // 弧形的起点和终点相同时，长轴和短轴的长度按 0 处理
  rx: number;
  ry: number;
  startAngle: number;
  endAngle: number;
  xRotation: number;
  arcFlag: number;
  sweepFlag: number;
}
export interface ParsedPathStyleProps extends ParsedBaseStyleProps {
  path: {
    absolutePath: AbsoluteArray;
    hasArc: boolean;
    segments: PathSegment[];
    polygons: [number, number][][];
    polylines: [number, number][][];
    curve: CurveArray;
    totalLength: number;
    rect: Rectangle;
  };
  d?: {
    absolutePath: AbsoluteArray;
    hasArc: boolean;
    segments: PathSegment[];
    polygons: [number, number][][];
    polylines: [number, number][][];
    curve: CurveArray;
    totalLength: number;
    rect: Rectangle;
  };
  markerStart?: DisplayObject;
  markerMid?: DisplayObject;
  markerEnd?: DisplayObject;
  markerStartOffset?: number;
  markerEndOffset?: number;
}
export class Path extends DisplayObject<PathStyleProps, ParsedPathStyleProps> {
  private markerStartAngle = 0;
  private markerEndAngle = 0;

  /**
   * markers placed at the mid
   */
  private markerMidList: DisplayObject[] = [];

  constructor({ style, ...rest }: DisplayObjectConfig<PathStyleProps> = {}) {
    super({
      type: Shape.PATH,
      style: {
        path: '',
        miterLimit: '',
        ...style,
      },
      initialParsedStyle: runtime.enableCSSParsing
        ? null
        : {
            miterLimit: 4,
            path: {
              ...EMPTY_PARSED_PATH,
            },
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

  attributeChangedCallback<Key extends keyof PathStyleProps>(
    attrName: Key,
    oldValue: PathStyleProps[Key],
    newValue: PathStyleProps[Key],
    prevParsedValue: ParsedPathStyleProps[Key],
    newParsedValue: ParsedPathStyleProps[Key],
  ) {
    if (attrName === 'path') {
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
        (prevParsedValue as DisplayObject).remove();
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
        (prevParsedValue as DisplayObject).remove();
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
      defX,
      defY,
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
      const [p1, p2] = this.getStartTangent();
      ox = p2[0] - defX;
      oy = p2[1] - defY;
      x = p1[0] - p2[0];
      y = p1[1] - p2[1];
      offset = markerStartOffset || 0;
      originalAngle = this.markerStartAngle;
    } else {
      const [p1, p2] = this.getEndTangent();
      ox = p2[0] - defX;
      oy = p2[1] - defY;
      x = p1[0] - p2[0];
      y = p1[1] - p2[1];
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
    const {
      path: { segments },
      defX,
      defY,
    } = this.parsedStyle;
    // clear all existed markers
    this.markerMidList.forEach((marker) => {
      marker.remove();
    });
    if (marker && isDisplayObject(marker)) {
      for (let i = 1; i < segments.length - 1; i++) {
        const [ox, oy] = segments[i].currentPoint;
        const cloned = i === 1 ? marker : marker.cloneNode(true);
        this.markerMidList.push(cloned);
        this.appendChild(cloned);
        cloned.setLocalPosition(ox - defX, oy - defY);
        // TODO: orient of marker
      }
    }
  }

  /**
   * Returns the total length of the path.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getTotalLength
   */
  getTotalLength() {
    return getOrCalculatePathTotalLength(this);
  }

  /**
   * Returns the point at a given distance along the path.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getPointAtLength
   */
  getPointAtLength(distance: number, inWorldSpace = false): Point {
    const {
      defX,
      defY,
      path: { absolutePath },
    } = this.parsedStyle;
    const { x, y } = getPointAtLength(absolutePath, distance);

    const transformed = vec3.transformMat4(
      vec3.create(),
      vec3.fromValues(x - defX, y - defY, 0),
      inWorldSpace ? this.getWorldTransform() : this.getLocalTransform(),
    );

    // apply local transformation
    return new Point(transformed[0], transformed[1]);
  }

  /**
   * Returns the point at a given ratio of the total length in path.
   */
  getPoint(ratio: number, inWorldSpace = false): Point {
    return this.getPointAtLength(
      ratio * getOrCalculatePathTotalLength(this),
      inWorldSpace,
    );
  }

  /**
   * Get start tangent vector
   */
  getStartTangent(): number[][] {
    const segments = this.parsedStyle.path.segments;
    let result: number[][] = [];
    if (segments.length > 1) {
      const startPoint = segments[0].currentPoint;
      const endPoint = segments[1].currentPoint;
      const tangent = segments[1].startTangent;
      result = [];
      if (tangent) {
        result.push([startPoint[0] - tangent[0], startPoint[1] - tangent[1]]);
        result.push([startPoint[0], startPoint[1]]);
      } else {
        result.push([endPoint[0], endPoint[1]]);
        result.push([startPoint[0], startPoint[1]]);
      }
    }
    return result;
  }

  /**
   * Get end tangent vector
   */
  getEndTangent(): number[][] {
    const segments = this.parsedStyle.path.segments;
    const length = segments.length;
    let result: number[][] = [];
    if (length > 1) {
      const startPoint = segments[length - 2].currentPoint;
      const endPoint = segments[length - 1].currentPoint;
      const tangent = segments[length - 1].endTangent;
      result = [];
      if (tangent) {
        result.push([endPoint[0] - tangent[0], endPoint[1] - tangent[1]]);
        result.push([endPoint[0], endPoint[1]]);
      } else {
        result.push([startPoint[0], startPoint[1]]);
        result.push([endPoint[0], endPoint[1]]);
      }
    }
    return result;
  }
}
