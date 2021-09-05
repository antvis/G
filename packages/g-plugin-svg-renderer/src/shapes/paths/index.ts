import { ParsedBaseStyleProps } from '@antv/g';

export const ElementRendererFactory = 'ElementRendererFactory';
export const ElementRenderer = 'ElementRenderer';
export interface ElementRenderer<T extends ParsedBaseStyleProps> {
  dependencies: Array<keyof T>;
  apply(context: SVGElement, attributes: T): void;
}

export { RectRenderer } from './Rect';
export { ImageRenderer } from './Image';
export { LineRenderer } from './Line';
export { PolylineRenderer } from './Polyline';
export { TextRenderer } from './Text';
export { PathRenderer } from './Path';
