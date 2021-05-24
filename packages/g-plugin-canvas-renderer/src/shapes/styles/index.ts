import { ShapeAttrs } from '@antv/g';

export const StyleRendererFactory = Symbol('StyleRendererFactory');
export const StyleRenderer = Symbol('StyleRenderer');
export interface StyleRenderer {
  render(context: CanvasRenderingContext2D, attributes: ShapeAttrs): void;
}

export * from './Default';
export * from './Image';
export * from './Text';
