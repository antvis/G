import { DisplayObject, RendererPlugin, GeometryAABBUpdater, container } from '@antv/g';
import { ContainerModule, Container } from 'inversify';
import { registerModelBuilder } from '@antv/g-plugin-webgl-renderer';
import { CubeUpdater } from './aabb/CubeUpdater';
import { SphereUpdater } from './aabb/SphereUpdater';
import { GridUpdater } from './aabb/GridUpdater';
import { CubeModelBuilder } from './model/Cube';
import { SphereModelBuilder } from './model/Sphere';
import { GridModelBuilder } from './model/Grid';
import { SHAPE_3D } from './types';
import { Cube } from './Cube';
import { Sphere } from './Sphere';
import { Grid } from './Grid';


// TODO: provide more friendly API like `registerGeometry`
container
  .bind(GeometryAABBUpdater)
  .to(CubeUpdater)
  .inSingletonScope()
  .whenTargetNamed(SHAPE_3D.Cube);
container
  .bind(GeometryAABBUpdater)
  .to(SphereUpdater)
  .inSingletonScope()
  .whenTargetNamed(SHAPE_3D.Sphere);
container
  .bind(GeometryAABBUpdater)
  .to(GridUpdater)
  .inSingletonScope()
  .whenTargetNamed(SHAPE_3D.Grid);

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  registerModelBuilder(CubeModelBuilder, SHAPE_3D.Cube);
  registerModelBuilder(SphereModelBuilder, SHAPE_3D.Sphere);
  registerModelBuilder(GridModelBuilder, SHAPE_3D.Grid);
});

export class Plugin implements RendererPlugin {
  init(container: Container): void {
    container.load(containerModule);
  }
  destroy(container: Container): void {
    container.unload(containerModule);
  }
}

export { Cube, Sphere, Grid };
