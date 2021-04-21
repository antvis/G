import { Entity } from '@antv/g-ecs';
import { RenderingContext } from '../services/WebGLContextService';

export const ModelBuilder = Symbol('ModelBuilder');
export interface ModelBuilder {
  prepareModel(context: RenderingContext, entity: Entity): Promise<void>;
  onAttributeChanged(entity: Entity, name: string, value: any): Promise<void>;
}

export { CircleModelBuilder } from './Circle';
export { ImageModelBuilder } from './Image';
export { LineModelBuilder } from './Line';
