import { Entity } from '@antv/g-ecs';

export const ElementRenderer = Symbol('ElementRenderer');
export interface ElementRenderer {
  apply(context: SVGElement, entity: Entity): void;
}

export { RectRenderer } from './Rect';
export { ImageRenderer } from './Image';
export { LineRenderer } from './Line';
export { PolylineRenderer } from './Polyline';
export { TextRenderer } from './Text';
