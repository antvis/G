import type { AbsoluteArray, CurveArray } from '@antv/util';
import { getPointAtLength } from '@antv/util';
import type { DisplayObjectConfig } from '../dom';
import { Point } from '../shapes';
import type { Rectangle } from '../shapes/Rectangle';
import type { BaseStyleProps, ParsedBaseStyleProps, PathCommand } from '../types';
import { Shape } from '../types';
import { DisplayObject } from './DisplayObject';

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
export interface ParsedPathStyleProps extends ParsedBaseStyleProps {
  path: {
    absolutePath: AbsoluteArray;
    hasArc: boolean;
    segments: PathSegment[];
    polygons: [number, number][][];
    polylines: [number, number][][];
    curve: CurveArray;
    totalLength: number;
    zCommandIndexes: number[];
    rect: Rectangle;
  };
}
export class Path extends DisplayObject<PathStyleProps, ParsedPathStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<PathStyleProps> = {}) {
    super({
      type: Shape.PATH,
      style: {
        path: '',
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
    const { totalLength, absolutePath } = this.parsedStyle.path;
    const { x, y } = getPointAtLength(absolutePath, ratio * totalLength);
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
