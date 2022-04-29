import type { ParsedBaseStyleProps } from '@antv/g';
import { Syringe } from 'mana-syringe';

export const ElementRendererFactory = Syringe.defineToken('ElementRendererFactory');
export const ElementRenderer = Syringe.defineToken('ElementRenderer');
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
