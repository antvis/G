import type { ParsedBaseStyleProps } from '@antv/g';

export const ElementRendererFactory = 'ElementRendererFactory';
export const ElementRenderer = 'ElementRenderer';
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface ElementRenderer<T extends ParsedBaseStyleProps> {
  dependencies: string[];
  apply: (context: SVGElement, attributes: T) => void;
}

export { RectRenderer } from './Rect';
export { ImageRenderer } from './Image';
export { LineRenderer } from './Line';
export { PolylineRenderer } from './Polyline';
export { TextRenderer } from './Text';
export { PathRenderer } from './Path';
