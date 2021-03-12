import { DefaultShapeRenderer, ShapeCfg } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { injectable } from 'inversify';
import { Geometry3D } from '../components/Geometry3D';
import { Material3D } from '../components/Material3D';

@injectable()
export abstract class BaseRenderer extends DefaultShapeRenderer {
  abstract buildModel(entity: Entity): void;

  public onAttributeChanged(entity: Entity, name: string, value: any) {
    super.onAttributeChanged(entity, name, value);
  }

  init(entity: Entity, type: string, cfg: ShapeCfg) {
    super.init(entity, type, cfg);
    entity.addComponent(Geometry3D);
    entity.addComponent(Material3D);

    this.buildModel(entity);
  }

  render() {}
}
