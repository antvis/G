import { DisplayObject, ShapeCfg, GeometryAABBUpdater, container } from '@antv/g';
import { ContainerModule } from 'inversify';
import { registerModelBuilder } from '@antv/g-plugin-webgl-renderer';
import { CubeUpdater } from './aabb/CubeUpdater';
import { GridUpdater } from './aabb/GridUpdater';
import { CubeModelBuilder } from './model/Cube';
import { GridModelBuilder } from './model/Grid';
import { SHAPE_3D } from './types';
import { Cube } from './Cube';
import { Grid } from './Grid';

// TODO: provide more friendly API like `registerGeometry`
container
  .bind(GeometryAABBUpdater)
  .to(CubeUpdater)
  .inSingletonScope()
  .whenTargetNamed(SHAPE_3D.Cube);
container
  .bind(GeometryAABBUpdater)
  .to(GridUpdater)
  .inSingletonScope()
  .whenTargetNamed(SHAPE_3D.Grid);

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  registerModelBuilder(CubeModelBuilder, SHAPE_3D.Cube);
  registerModelBuilder(GridModelBuilder, SHAPE_3D.Grid);
});

export { Cube, Grid };
