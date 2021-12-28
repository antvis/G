import type { Key, ReactElement, ReactNode, Ref } from 'react';
import { SHAPE } from '@antv/g';
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

export const Circle = ElementOf<GCircle, CircleStyleProps, SHAPE.Circle>(SHAPE.Circle);
export const Ellipse = ElementOf<GEllipse, EllipseStyleProps, SHAPE.Ellipse>(SHAPE.Ellipse);
export const Group = ElementOf<GGroup, BaseStyleProps, SHAPE.Group>(SHAPE.Group);
export const HTML = ElementOf<GHTML, HTMLStyleProps, SHAPE.HTML>(SHAPE.HTML);
export const Image = ElementOf<GImage, ImageStyleProps, SHAPE.Image>(SHAPE.Image);
export const Line = ElementOf<GLine, LineStyleProps, SHAPE.Line>(SHAPE.Line);
export const Path = ElementOf<GPath, PathStyleProps, SHAPE.Path>(SHAPE.Path);
export const Polygon = ElementOf<GPolygon, PolygonStyleProps, SHAPE.Polygon>(SHAPE.Polygon);
export const Polyline = ElementOf<GPolyline, PolylineStyleProps, SHAPE.Polyline>(SHAPE.Polyline);
export const Rect = ElementOf<GRect, RectStyleProps, SHAPE.Rect>(SHAPE.Rect);
export const Text = ElementOf<GText, TextStyleProps, SHAPE.Text>(SHAPE.Text);
