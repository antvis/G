import { DisplayObject } from '@antv/g';

export const ModelBuilderFactory = Symbol('ModelBuilderFactory');
export const ModelBuilder = Symbol('ModelBuilder');
export interface ModelBuilder {
  /**
   * prepare model for single shape or a batch of shapes
   */
  prepareModel(object: DisplayObject): void | Promise<void>;
  onAttributeChanged(object: DisplayObject, name: string, value: any): void | Promise<void>;
  renderModel?(object: DisplayObject): void;
}

export { CircleModelBuilder } from './Circle';
export { ImageModelBuilder } from './Image';
export { LineModelBuilder } from './Line';
export { TextModelBuilder } from './Text';
