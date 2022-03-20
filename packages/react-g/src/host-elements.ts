import type { Key, ReactElement, ReactNode, Ref } from 'react';
import { Shape } from '@antv/g';
import type {
  BaseStyleProps,
  CircleStyleProps,
  EllipseStyleProps,
  HTMLStyleProps,
  ImageStyleProps,
  LineStyleProps,
  PathStyleProps,
  PolygonStyleProps,
  PolylineStyleProps,
  RectStyleProps,
  TextStyleProps,
  Circle as GCircle,
  Group as GGroup,
  Ellipse as GEllipse,
  HTML as GHTML,
  Image as GImage,
  Line as GLine,
  Path as GPath,
  Polygon as GPolygon,
  Polyline as GPolyline,
  Rect as GRect,
  Text as GText,
} from '@antv/g';
import type { GEvents } from './types';

type BaseProps<Element, Prop> = {
  key?: Key;
  ref?: Ref<Element>;
  children?: ReactNode;
} & Prop &
  GEvents;

export function ElementOf<Element, Prop, T extends string>(
  type: T,
): (props: BaseProps<Element, Prop>) => ReactElement<Prop, T> {
  return type as any;
}

export const Circle = ElementOf<GCircle, CircleStyleProps, Shape.CIRCLE>(Shape.CIRCLE);
export const Ellipse = ElementOf<GEllipse, EllipseStyleProps, Shape.ELLIPSE>(Shape.ELLIPSE);
export const Group = ElementOf<GGroup, BaseStyleProps, Shape.GROUP>(Shape.GROUP);
export const HTML = ElementOf<GHTML, HTMLStyleProps, Shape.HTML>(Shape.HTML);
export const Image = ElementOf<GImage, ImageStyleProps, Shape.IMAGE>(Shape.IMAGE);
export const Line = ElementOf<GLine, LineStyleProps, Shape.LINE>(Shape.LINE);
export const Path = ElementOf<GPath, PathStyleProps, Shape.PATH>(Shape.PATH);
export const Polygon = ElementOf<GPolygon, PolygonStyleProps, Shape.POLYGON>(Shape.POLYGON);
export const Polyline = ElementOf<GPolyline, PolylineStyleProps, Shape.POLYLINE>(Shape.POLYLINE);
export const Rect = ElementOf<GRect, RectStyleProps, Shape.RECT>(Shape.RECT);
export const Text = ElementOf<GText, TextStyleProps, Shape.TEXT>(Shape.TEXT);
