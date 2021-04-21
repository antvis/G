import { Entity } from '@antv/g-ecs';

export const StyleRenderer = Symbol('StyleRenderer');
export interface StyleRenderer {
  render(context: CanvasRenderingContext2D, entity: Entity): void;
}

export * from './Default';
export * from './Image';
export * from './Text';
