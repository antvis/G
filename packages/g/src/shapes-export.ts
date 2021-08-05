/* eslint-disable max-classes-per-file */
import type { DisplayObjectConfig } from './DisplayObject';
import { DisplayObject } from './DisplayObject';
import type { BaseStyleProps } from './types';
import { SHAPE } from './types';
import { Point } from './shapes';
import { Line as LineUtil, Polyline as PolylineUtil, Cubic as CubicUtil } from '@antv/g-math';
import { pathToCurve } from './utils/path';
import { isNil } from '@antv/util';

export class Group extends DisplayObject {
  constructor(config?: BaseStyleProps) {
    super({
      type: SHAPE.Group,
      ...config,
    });
  }
}

export interface CircleStyleProps extends BaseStyleProps {
  r: number;
}
export class Circle extends DisplayObject<CircleStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<CircleStyleProps>) {
    super({
      type: SHAPE.Circle,
      style: {
        r: 0,
        opacity: 1,
        ...style,
      },
      ...rest,
    });
  }
}

export interface EllipseStyleProps extends BaseStyleProps {
  rx: number;
  ry: number;
}
export class Ellipse extends DisplayObject<EllipseStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<EllipseStyleProps>) {
    super({
      type: SHAPE.Ellipse,
      style: {
        rx: 0,
        ry: 0,
        opacity: 1,
        ...style,
      },
      ...rest,
    });
  }
}

export interface RectStyleProps extends BaseStyleProps {
  width: number;
  height: number;
  radius?: number;
}
export class Rect extends DisplayObject<RectStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<RectStyleProps>) {
    super({
      type: SHAPE.Rect,
      style: {
        width: 0,
        height: 0,
        opacity: 1,
        ...style,
      },
      ...rest,
    });
  }
}

export interface ImageStyleProps extends BaseStyleProps {
  img: string | HTMLImageElement;
  width?: number;
  height?: number;
}
export class Image extends DisplayObject<ImageStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<ImageStyleProps>) {
    super({
      type: SHAPE.Image,
      style: {
        img: '',
        opacity: 1,
        ...style,
      },
      ...rest,
    });
  }
}

export interface LineStyleProps extends BaseStyleProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
export class Line extends DisplayObject<LineStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<LineStyleProps>) {
    super({
      type: SHAPE.Line,
      style: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        opacity: 1,
        strokeOpacity: 1,
        lineJoin: 'miter',
        lineCap: 'butt',
        lineWidth: 1,
        ...style,
      },
      ...rest,
    });
  }

  private totalLength: number;

  getPoint(ratio: number): Point {
    const { x1, y1, x2, y2 } = this.attributes;
    const point = LineUtil.pointAt(x1, y1, x2, y2, ratio);
    return new Point(point.x, point.y);
  }

  getTotalLength() {
    if (!this.totalLength) {
      const { x1, y1, x2, y2 } = this.attributes;
      this.totalLength = LineUtil.length(x1, y1, x2, y2);
    }
    return this.totalLength;
  }
}

export type PathStyleProps = BaseStyleProps;
export class Path extends DisplayObject<PathStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<PathStyleProps>) {
    super({
      type: SHAPE.Path,
      style: {
        opacity: 1,
        strokeOpacity: 1,
        lineJoin: 'miter',
        lineCap: 'butt',
        lineWidth: 1,
        ...style,
      },
      ...rest,
    });
  }

  private totalLength: number;
  private cache: [number, number][] = [];
  private curve: any;

  getTotalLength() {
    if (!this.totalLength) {
      this.totalLength = 0;
      this.curve = pathToCurve(this.attributes.path);
      this.createCache();
    }
    return this.totalLength;
  }

  /**
   * Get point according to ratio
   * @param {number} ratio
   * @return {Point} point
   */
  getPoint(ratio: number): Point | null {
    if (!this.cache.length) {
      this.curve = pathToCurve(this.attributes.path);
      this.createCache();
    }

    let subt;
    let index;

    const curve = this.curve;
    if (!this.cache.length) {
      if (curve) {
        return new Point(curve[0][1], curve[0][2]);
      }
      return null;
    }
    this.cache.forEach((v, i) => {
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
      seg[l - 2],
      seg[l - 1],
      nextSeg[1],
      nextSeg[2],
      nextSeg[3],
      nextSeg[4],
      nextSeg[5],
      nextSeg[6],
      subt
    );
    return new Point(x, y);
  }

  private createCache() {
    let totalLength = 0;
    let tempLength = 0;
    // 每段 curve 对应起止点的长度比例列表，形如: [[0, 0.25], [0.25, 0.6]. [0.6, 0.9], [0.9, 1]]
    const tCache = [];
    let segmentT;
    let segmentL;
    let segmentN;
    let l;
    const curve = this.curve;

    if (!curve) {
      return;
    }

    curve.forEach((segment, i) => {
      segmentN = curve[i + 1];
      l = segment.length;
      if (segmentN) {
        totalLength +=
          CubicUtil.length(
            segment[l - 2],
            segment[l - 1],
            segmentN[1],
            segmentN[2],
            segmentN[3],
            segmentN[4],
            segmentN[5],
            segmentN[6]
          ) || 0;
      }
    });
    this.totalLength = totalLength;

    if (totalLength === 0) {
      this.cache = [];
      return;
    }

    curve.forEach((segment, i) => {
      segmentN = curve[i + 1];
      l = segment.length;
      if (segmentN) {
        segmentT = [];
        segmentT[0] = tempLength / totalLength;
        segmentL = CubicUtil.length(
          segment[l - 2],
          segment[l - 1],
          segmentN[1],
          segmentN[2],
          segmentN[3],
          segmentN[4],
          segmentN[5],
          segmentN[6]
        );
        // 当 path 不连续时，segmentL 可能为空，为空时需要作为 0 处理
        tempLength += segmentL || 0;
        segmentT[1] = tempLength / totalLength;
        tCache.push(segmentT);
      }
    });
    this.cache = tCache;
  }
}

export type PolylineStyleProps = BaseStyleProps;
export class Polyline extends DisplayObject<PolylineStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<PolylineStyleProps>) {
    super({
      type: SHAPE.Polyline,
      style: {
        opacity: 1,
        strokeOpacity: 1,
        lineJoin: 'miter',
        lineCap: 'butt',
        lineWidth: 1,
        ...style,
      },
      ...rest,
    });
  }

  private totalLength: number;
  private cache: [number, number][] = [];

  getTotalLength() {
    const { points } = this.attributes;
    if (!this.totalLength) {
      this.totalLength = PolylineUtil.length(points);
    }
    return this.totalLength;
  }

  getPoint(ratio: number): Point {
    const { points } = this.attributes;
    if (!this.cache.length) {
      this.createCache();
    }

    let subt = 0;
    let index = 0;
    this.cache.forEach((v, i) => {
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
    return new Point(x, y);
  }

  private createCache() {
    const { points } = this.attributes;
    if (!points || points.length === 0) {
      return;
    }

    const totalLength = this.getTotalLength();
    if (totalLength <= 0) {
      return;
    }

    let tempLength = 0;
    let segmentT: [number, number];
    let segmentL;

    (points as [number, number][]).forEach((p, i) => {
      if (points[i + 1]) {
        segmentT = [0, 0];
        segmentT[0] = tempLength / totalLength;
        segmentL = LineUtil.length(p[0], p[1], points[i + 1][0], points[i + 1][1]);
        tempLength += segmentL;
        segmentT[1] = tempLength / totalLength;
        this.cache.push(segmentT);
      }
    });
  }
}

export type PolygonStyleProps = BaseStyleProps;
export class Polygon extends DisplayObject<PolygonStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<PolygonStyleProps>) {
    super({
      type: SHAPE.Polygon,
      style: {
        opacity: 1,
        strokeOpacity: 1,
        ...style,
      },
      ...rest,
    });
  }
}

export interface TextStyleProps extends BaseStyleProps {
  text: string;
  /** 设置文本内容的当前对齐方式 */
  textAlign?: 'start' | 'center' | 'end' | 'left' | 'right';
  /** 设置在绘制文本时使用的当前文本基线 */
  textBaseline?: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom';
  /** 字体样式 */
  fontStyle?: 'normal' | 'italic' | 'oblique';
  /** 文本字体大小 */
  fontSize?: number;
  /** 文本字体 */
  fontFamily?: string;
  /** 文本粗细 */
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  /** 字体变体 */
  fontVariant?: 'normal' | 'small-caps' | string;
  /** 文本行高 */
  lineHeight?: number;
  letterSpacing?: number;
  miterLimit?: number;
  padding?: number;
  whiteSpace?: 'pre';
  leading?: number;
  wordWrap?: boolean;
  wordWrapWidth?: number;
  dropShadow?: boolean;
  dropShadowDistance?: number;
}
export class Text extends DisplayObject<TextStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<TextStyleProps>) {
    super({
      type: SHAPE.Text,
      style: {
        opacity: 1,
        text: '',
        fontSize: 12,
        fontFamily: 'sans-serif',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontVariant: 'normal',
        textAlign: 'start',
        textBaseline: 'alphabetic',
        dropShadow: false,
        // dropShadowAlpha: 1,
        // dropShadowAngle: Math.PI / 6,
        // dropShadowBlur: 0,
        // dropShadowColor: '#000',
        dropShadowDistance: 5,
        fill: '#000',
        letterSpacing: 0,
        lineHeight: 0,
        lineJoin: 'miter',
        lineCap: 'butt',
        lineWidth: 0,
        miterLimit: 10,
        padding: 0,
        stroke: '#000',
        whiteSpace: 'pre',
        wordWrap: false,
        wordWrapWidth: 100,
        leading: 0,
        ...style,
      },
      ...rest,
    });
  }
}
