import { Shape, LineCap, LineJoin } from '../types';
import type { BaseStyleProps, PathCommand } from '../types';
import { DisplayObject } from './DisplayObject';
import type { DisplayObjectConfig } from '../dom';
import { Point } from '../shapes';
import { Cubic as CubicUtil } from '@antv/g-math';
import { isNil } from '@antv/util';
import type { Rectangle } from '../shapes/Rectangle';

export interface PathStyleProps extends BaseStyleProps {
  path?: string | PathCommand[];
  d?: string | PathCommand[];
}
export interface PathSegment {
  command: PathCommand[0];
  currentPoint: [number, number];
  prePoint: [number, number] | null;
  nextPoint: [number, number] | null;
  startTangent: [number, number] | null;
  endTangent: [number, number] | null;
  params: PathCommand;
}
export interface ParsedPathStyleProps {
  absolutePath: PathCommand[];
  hasArc: boolean;
  segments: PathSegment[];
  polygons: [number, number][][];
  polylines: [number, number][][];
  curve: PathCommand[];
  totalLength: number;
  curveSegments: number[][];
  zCommandIndexes: number[];
  rect: Rectangle;
}
export class Path extends DisplayObject<
  PathStyleProps,
  {
    path: ParsedPathStyleProps;
  }
> {
  constructor({ style, ...rest }: DisplayObjectConfig<PathStyleProps> = {}) {
    super({
      type: Shape.PATH,
      style: {
        path: '',
        lineJoin: LineJoin.MITER,
        lineCap: LineCap.BUTT,
        lineWidth: 1,
        miterLimit: 4,
        ...style,
      },
      ...rest,
    });
  }

  getTotalLength() {
    return this.parsedStyle.path.totalLength;
  }

  /**
   * Get point according to ratio
   */
  getPoint(ratio: number): Point | null {
    let subt = 0;
    let index = 0;

    const curve = this.parsedStyle.path.curve;
    if (!this.parsedStyle.path.curveSegments.length) {
      if (curve) {
        return new Point(curve[0][1], curve[0][2]);
      }
      return null;
    }
    this.parsedStyle.path.curveSegments.forEach((v, i) => {
      if (ratio >= v[0] && ratio <= v[1]) {
        subt = (ratio - v[0]) / (v[1] - v[0]);
        index = i;
      }
    });

    const seg = curve[index];
    if (isNil(seg) || isNil(index)) {
      return null;
    }
    const l = seg.length;
    const nextSeg = curve[index + 1];
    const { x, y } = CubicUtil.pointAt(
      // @ts-ignore
      seg[l - 2],
      seg[l - 1],
      nextSeg[1],
      nextSeg[2],
      nextSeg[3],
      nextSeg[4],
      nextSeg[5],
      nextSeg[6],
      subt,
    );
    return new Point(x, y);
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
