import { ShapeAttrs } from '@antv/g';

export const ElementRendererFactory = Symbol('ElementRendererFactory');
export const ElementRenderer = Symbol('ElementRenderer');
export interface ElementRenderer {
  apply(context: SVGElement, attributes: ShapeAttrs): void;
}

export { RectRenderer } from './Rect';
export { ImageRenderer } from './Image';
export { LineRenderer } from './Line';
export { PolylineRenderer } from './Polyline';
export { TextRenderer } from './Text';
