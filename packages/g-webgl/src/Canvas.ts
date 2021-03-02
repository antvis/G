import { Canvas as BaseCanvas } from '@antv/g-core';
import { module } from '.';
import { Camera } from './Camera';
import { Geometry3D } from './components/Geometry3D';
import { Material3D } from './components/Material3D';
import { FrameGraphSystem } from './systems/FrameGraph';
import { GeometrySystem } from './systems/Geometry';

// export const DefaultCamera = Symbol('DefaultCamera');
// export const DefaultView = Symbol('DefaultView');

export class Canvas extends BaseCanvas {
  loadModule() {
    // // create a camera
    // const canvasConfig = this.container.get<CanvasCfg>(CanvasConfig);
    // const defaultCamera = this.container.get(Camera);
    // defaultCamera
    //   .setPosition(0, 0, 5)
    //   .setPerspective(0.1, 1000, 72, canvasConfig.width / canvasConfig.height);
    // this.container.bind(DefaultCamera).toConstantValue(defaultCamera);

    // // create a view with scene
    // const defaultView = this.container.get(View);
    // defaultView.setCamera(defaultCamera);
    // let dpr = window.devicePixelRatio || 1;
    // dpr = dpr >= 1 ? Math.ceil(dpr) : 1;
    // defaultView.setViewport({
    //   x: 0,
    //   y: 0,
    //   width: canvasConfig.width * dpr,
    //   height: canvasConfig.height * dpr,
    // });
    // this.container.bind(DefaultView).toConstantValue(defaultView);

    this.container.load(module);

    this.world.registerComponent(Geometry3D);
    this.world.registerComponent(Material3D);

    this.world.registerSystem(GeometrySystem);
    this.world.registerSystem(FrameGraphSystem);
  }

  addCamera() {
    return this.container.get(Camera);
  }
}
