import { Entity } from '@antv/g-ecs';
import { IShape } from './types';

export class Shape implements IShape {
  private entity: Entity;

  setEntity(entity: Entity) {
    this.entity = entity;
  }

  getEntity(): Entity {
    return this.entity;
  }
}
