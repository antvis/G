import { ShapeRenderer } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { injectable } from 'inversify';

@injectable()
export abstract class BaseRenderer implements ShapeRenderer {
  abstract buildModel(entity: Entity): void;

  render(entity: Entity) {
    this.buildModel(entity);
  }
}
