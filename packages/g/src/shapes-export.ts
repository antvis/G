/* eslint-disable max-classes-per-file */
import type { DisplayObjectConfig } from './DisplayObject';
import { DisplayObject } from './DisplayObject';
import type { BaseStyleProps } from './types';
import { SHAPE } from './types';

export class Group extends DisplayObject<{}> {
  constructor(config?: DisplayObject<{}>) {
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
