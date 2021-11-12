import { DisplayObject, RendererPlugin, globalContainer } from '@antv/g';
import { Module, Syringe } from 'mana-syringe';
import { registerModelBuilder, Batch } from '@antv/g-plugin-webgl-renderer';
import { CubeUpdater } from './aabb/CubeUpdater';
import { SphereUpdater } from './aabb/SphereUpdater';
import { GridUpdater } from './aabb/GridUpdater';
import { CubeModelBuilder } from './model/Cube';
// import { SphereModelBuilder } from './model/Sphere';
import { GridModelBuilder } from './model/Grid';
import { SHAPE_3D } from './types';
import { Cube } from './Cube';
import { Sphere } from './Sphere';
import { Grid } from './Grid';

// TODO: provide more friendly API like `registerGeometry`
globalContainer.register(CubeUpdater);
globalContainer.register(SphereUpdater);
globalContainer.register(GridUpdater);

export const containerModule = Module((register) => {
  registerModelBuilder(CubeModelBuilder, SHAPE_3D.Cube);
  // registerModelBuilder(SphereModelBuilder, SHAPE_3D.Sphere);
  registerModelBuilder(GridModelBuilder, SHAPE_3D.Grid);
});

export class Plugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    // @ts-ignore
    // container.container.unload(containerModule);
  }
}

export { Cube, Sphere, Grid };
