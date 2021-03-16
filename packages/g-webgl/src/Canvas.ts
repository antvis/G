import { Canvas as BaseCanvas } from '@antv/g-core';
import { module } from '.';
import { Camera } from './Camera';
import { Geometry3D } from './components/Geometry3D';
import { Material3D } from './components/Material3D';
import { Renderable3D } from './components/Renderable3D';
import { FrameGraphSystem } from './systems/FrameGraph';
import { GeometrySystem } from './systems/Geometry';

export class Canvas extends BaseCanvas {
  loadModule() {
    this.container.load(module);

    this.world.registerComponent(Geometry3D);
    this.world.registerComponent(Material3D);
    this.world.registerComponent(Renderable3D);

    this.world.registerSystem(GeometrySystem);
    this.world.registerSystem(FrameGraphSystem);
  }

  addCamera() {
    return this.container.get(Camera);
  }
}
