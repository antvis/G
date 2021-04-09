import { Component, Entity } from '@antv/g-ecs';
import { IModel, RenderingEngine } from '../services/renderer';

export enum INSTANCING_STATUS {
  Preparing,
  Rendering,
  Rendered,
}

export class Renderable3D extends Component {
  static tag = 'c-renderable-3d';

  pickingId: number;

  engine: RenderingEngine;

  model: IModel | null;

  modelPrepared = false;

  /**
   * Dirty flag of instanced array
   */
  instanceDirty = false;

  /**
   * Source renderable
   */
  source: Renderable3D;
  sourceEntity: Entity;

  /**
   * Keep refs when calling with `shape.createInstance()`.
   */
  instances: Renderable3D[] = [];
  instanceEntities: Entity[] = [];

  status: INSTANCING_STATUS = INSTANCING_STATUS.Preparing;
}
