import { DisplayObject } from '@antv/g';

export const ModelBuilderFactory = Symbol('ModelBuilderFactory');
export const ModelBuilder = Symbol('ModelBuilder');
export interface ModelBuilder {
  prepareModel(object: DisplayObject): void;
  onAttributeChanged(object: DisplayObject, name: string, value: any): void;
}

export { CircleModelBuilder } from './Circle';
export { ImageModelBuilder } from './Image';
export { LineModelBuilder } from './Line';
export { TextModelBuilder } from './Text';
