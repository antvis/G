import { DisplayObject, ShapeCfg, GeometryAABBUpdater, container } from '@antv/g';
import { ContainerModule } from 'inversify';
import { registerModelBuilder } from '@antv/g-plugin-webgl-renderer';
import { CubeUpdater } from './aabb/CubeUpdater';
import { GridUpdater } from './aabb/GridUpdater';
import { CubeModelBuilder } from './shapes/Cube';
import { GridModelBuilder } from './shapes/Grid';

export enum SHAPE_3D {
  Cube = 'cube',
  Grid = 'grid',
}

// TODO: provide more friendly API like `registerGeometry`
container.bind(GeometryAABBUpdater).to(CubeUpdater).inSingletonScope().whenTargetNamed(SHAPE_3D.Cube);
container.bind(GeometryAABBUpdater).to(GridUpdater).inSingletonScope().whenTargetNamed(SHAPE_3D.Grid);

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  registerModelBuilder(CubeModelBuilder, SHAPE_3D.Cube);
  registerModelBuilder(GridModelBuilder, SHAPE_3D.Grid);
});

export class Cube extends DisplayObject {
  constructor({ attrs, ...rest }: ShapeCfg) {
    super({
      type: SHAPE_3D.Cube,
      attrs: {
        ...attrs,
      },
      ...rest,
    });
  }
}

export class Grid extends DisplayObject {
  constructor({ attrs, ...rest }: ShapeCfg) {
    super({
      type: SHAPE_3D.Grid,
      attrs: {
        ...attrs,
      },
      ...rest,
    });
  }
}
