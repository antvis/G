import { BaseStyleProps } from '@antv/g';

export const ElementRendererFactory = Symbol('ElementRendererFactory');
export const ElementRenderer = Symbol('ElementRenderer');
export interface ElementRenderer<T extends BaseStyleProps> {
  dependencies: Array<keyof T>;
  apply(context: SVGElement, attributes: T): void;
}

export { RectRenderer } from './Rect';
export { ImageRenderer } from './Image';
export { LineRenderer } from './Line';
export { PolylineRenderer } from './Polyline';
export { TextRenderer } from './Text';
export { PathRenderer } from './Path';
