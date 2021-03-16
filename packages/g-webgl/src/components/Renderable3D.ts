import { Component, Entity } from '@antv/g-ecs';
import { IModel } from '../services/renderer';

export enum INSTANCING_STATUS {
  Preparing,
  Rendering,
  Rendered,
}

export class Renderable3D extends Component {
  public static tag = 'c-renderable-3d';

  public model: IModel | null;

  /**
   * Dirty flag of instanced array
   */
  public instanceDirty = false;

  /**
   * Source renderable
   */
  public source: Renderable3D;
  public sourceEntity: Entity;

  /**
   * Keep refs when calling with `shape.createInstance()`.
   */
  public instances: Renderable3D[] = [];
  public instanceEntities: Entity[] = [];

  public status: INSTANCING_STATUS = INSTANCING_STATUS.Preparing;
}
