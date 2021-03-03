import { DefaultShapeRenderer } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { injectable } from 'inversify';

@injectable()
export abstract class BaseRenderer extends DefaultShapeRenderer {
  abstract buildModel(entity: Entity): void;

  public onAttributeChanged(entity: Entity, name: string, value: any) {
    super.onAttributeChanged(entity, name, value);
  }

  render(entity: Entity) {
    this.buildModel(entity);
  }
}
