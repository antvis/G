import type { BaseStyleProps, Cursor, PathCommand } from './types';

export const G_CANVAS_ELEMENT = [
  'Group',
  'Rect',
  'Text',
  'Circle',
  'Ellipse',
  'Image',
  'Line',
  'Marker',
  'Path',
  'Polygon',
  'Polyline',
] as const;

// type ElementType = typeof G_CANVAS_ELEMENT[number];

export const ELEMENT_PROPS = [
  'id',
  'name',
  'type',
  'visible',
  'capture',
  'destroyed',
  'zIndex',
  'draggable',
];

export const GENERAL_SHAPE_ATTR = ['cursor'] as const;

export const COLOR_ATTRS = [
  'fill',
  'stroke',
  'opacity',
  'fillOpacity',
  'strokeOpacity',
  'shadowColor',
  'shadowBlur',
  'shadowOffsetX',
  'shadowOffsetY',
  'globalCompositeOperation',
] as const;

export const GENERAL_LINE_ATTRS = [
  'lineCap',
  'lineJoin',
  'lineWidth',
  'lineAppendWidth',
  'miterLimit',
  'lineDash',
  'startArrow',
  'endArrow',
] as const;

export const FONT_ATTRS = [
  'font',
  'textAlign',
  'textBaseline',
  'fontStyle',
  'fontVariant',
  'fontSize',
  'fontFamily',
  'fontWeight',
] as const;

export const CIRCLE_ATTRS = ['x', 'y', 'r', 'lineWidth'] as const;

export const DOM_ATTRS = ['x', 'y', 'width', 'height', 'html'] as const;

export const ELLIPSE_ATTRS = ['x', 'y', 'rx', 'ry'] as const;

export const IMAGE_ATTRS = ['x', 'y', 'width', 'height', 'img'] as const;

export const LINE_ATTRS = ['x1', 'y1', 'x2', 'y2'] as const;

export const MARKER_ATTRS = ['x', 'y', 'r', 'symbol'] as const;

export const PATH_ATTRS = ['path'] as const;

export const POLYGON_ATTRS = ['points'] as const;

export const POLYLINE_ATTRS = ['points'] as const;

export const RECT_ATTRS = ['x', 'y', 'width', 'height', 'radius'] as const;

export const TEXT_ATTRS = ['x', 'y', 'text'] as const;

/**
 * event
 */
export type GEvents = Partial<{
  onMousedown: (evt: Event) => void;
  onMouseup: (evt: Event) => void;
  onClick: (evt: Event) => void;
  onDblclick: (evt: Event) => void;
  onMousemove: (evt: Event) => void;
  onMouseover: (evt: Event) => void;
  onMouseout: (evt: Event) => void;
  onMouseenter: (evt: Event) => void;
  onMouseleave: (evt: Event) => void;
  onTouchstart: (evt: Event) => void;
  onTouchmove: (evt: Event) => void;
  onTouchend: (evt: Event) => void;
  onDragstart: (evt: Event) => void;
  onDrag: (evt: Event) => void;
  onDragend: (evt: Event) => void;
  onDragenter: (evt: Event) => void;
  onDragleave: (evt: Event) => void;
  onDragover: (evt: Event) => void;
  onDrop: (evt: Event) => void;
  onContextmenu: (evt: Event) => void;
  onMousewheel: (evt: Event) => void;
}>;

export type Matrix = [number, number, number, number, number, number];

export type PathType = string | PathCommand[];

export type Point = [number, number];

export type Anchor = Point;

export type Points = Point[];

export type Arrow =
  | {
      path: PathType;
      d?: number;
      stroke?: string;
      fill?: string;
      lineWidth?: string;
    }
  | boolean;

export type ElementProps = Partial<{
  id: string;
  name: string;
  visible: boolean;
  capture: boolean;
  zIndex: number;
  draggable: boolean;
  cursor: Cursor;
}>;

export type StyleProps = Partial<{
  fill: string;
  stroke: string;
  opacity: number;
  strokeOpacity: number;
  fillOpacity: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  globalCompositeOperation: string;
}>;

export type LineSizeProps = Partial<{
  lineWidth: number;
  lineAppendWidth: number;
}>;

export type LineStyleProps = Partial<{
  lineCap: 'butt' | 'round' | 'square';
  lineJoin: 'bevel' | 'round' | 'miter';

  lineDash: number[];
  miterLimit: number;
  startArrow: Arrow;
  endArrow: Arrow;
}> &
  LineSizeProps;

export type Radius =
  | number
  | [number]
  | [number, number]
  | [number, number, number]
  | [number, number, number, number];

export type RectProps = BaseStyleProps &
  Partial<{
    x: number;
    y: number;
    width: number;
    height: number;
    radius: Radius;
    anchor: Anchor;
    opacity: number;
  }> &
  LineStyleProps;

export type TextProps = BaseStyleProps &
  Partial<{
    x: number;
    y: number;
    text: string;
    fontSize: number;
    fontFamily: string;
    fontStyle: 'normal' | 'italic' | 'oblique';
    fontWeight: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
    fontVariant: 'normal' | 'small-caps' | string;
    textAlign: 'start' | 'center' | 'end' | 'left' | 'right';
    textBaseline: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom';
    lineWidth: number;
    fill?: string;
    stroke?: string;
    whiteSpace?: string;
    wordWrap?: boolean;
    wordWrapWidth?: number;
    leading?: number;
    letterSpacing?: number;
    lineHeight?: number;
    lineJoin?: string;
    lineCap?: string;
    miterLimit?: number;
    padding?: number;
    opacity?: number;
  }>;

export type CircleProps = BaseStyleProps &
  Partial<{
    x: number;
    y: number;
    r: number;
    opacity: number;
  }> &
  LineSizeProps;

export type EllipseProps = BaseStyleProps &
  Partial<{
    x: number;
    y: number;
    rx: number;
    ry: number;
    opacity: number;
  }> &
  LineSizeProps;

export type ImageProps = BaseStyleProps & {
  img: string | HTMLImageElement | HTMLCanvasElement;
} & Partial<{
    x: number;
    y: number;
    width: number;
    height: number;
    opacity: number;
  }>;

export type LineProps = BaseStyleProps &
  Partial<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    anchor: Anchor;
    opacity: number;
    strokeOpacity: number;
  }> &
  LineStyleProps;

export type PathProps = BaseStyleProps & {
  path: PathType;
  anchor: Anchor;
  opacity?: number;
  strokeOpacity?: number;
} & LineStyleProps;

export type PolygonProps = BaseStyleProps & {
  points: Points;
  opacity?: number;
  strokeOpacity?: number;
};

export type PolylineProps = BaseStyleProps & {
  points: Points;
  anchor: Anchor;
  opacity?: number;
  strokeOpacity?: number;
} & LineStyleProps;

export type AllShapeProps = RectProps &
  TextProps &
  CircleProps &
  EllipseProps &
  ImageProps &
  LineProps &
  PathProps &
  PolygonProps &
  PolylineProps;

export type ShapeProps =
  | RectProps
  | TextProps
  | CircleProps
  | EllipseProps
  | ImageProps
  | LineProps
  | PathProps
  | PolygonProps
  | PolylineProps;
