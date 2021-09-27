// tslint:disable-next-line:no-reference
/// <reference path="./glsl.d.ts" />
/// <reference path="../../../node_modules/@webgpu/types/dist/index.d.ts" />
import { Camera, container, RenderingPluginContribution, RendererPlugin, SHAPE } from '@antv/g';
import { World } from '@antv/g-ecs';
import { ContainerModule, Container, interfaces } from 'inversify';
import { ResourcePool } from './components/framegraph/ResourcePool';
import { Geometry3D } from './components/Geometry3D';
import { Material3D } from './components/Material3D';
import { Renderable3D } from './components/Renderable3D';
import { FrameGraphEngine, IRenderPass, RenderPassFactory } from './FrameGraphEngine';
import { FrameGraphPlugin } from './FrameGraphPlugin';
import { CopyPass } from './passes/CopyPass';
import { RenderPass } from './passes/RenderPass';
import { PickingIdGenerator } from './PickingIdGenerator';
import { PickingPlugin } from './PickingPlugin';
import { IView, RenderingEngine } from './services/renderer';
import { WebGLEngine } from './services/renderer/regl';
import { DefaultShaderModuleService, ShaderModuleService } from './services/shader-module';
import { gl } from './services/renderer/constants';
import {
  CircleModelBuilder,
  ImageModelBuilder,
  LineModelBuilder,
  ModelBuilder,
  TextModelBuilder,
  ModelBuilderFactory,
} from './shapes';
import { GlyphManager } from './shapes/symbol/GlyphManager';
import { TexturePool } from './shapes/TexturePool';
import { View } from './View';
import { rgb2arr } from './utils/color';
import TAAPass from './passes/TAAPass';

const world = container.get(World);
world.registerComponent(Geometry3D);
world.registerComponent(Material3D);
world.registerComponent(Renderable3D);

let bindFunc: interfaces.Bind;

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bindFunc = bind;
  /**
   * texture pool should be clean when renderer destroyed
   */
  bind(ResourcePool).toSelf().inSingletonScope();
  bind(PickingIdGenerator).toSelf().inSingletonScope();
  bind(TexturePool).toSelf().inSingletonScope();
  bind(GlyphManager).toSelf().inSingletonScope();

  bind(DefaultShaderModuleService).toSelf().inSingletonScope();
  bind(ShaderModuleService).toService(DefaultShaderModuleService);

  /**
   * bind model builder for each kind of Shape
   */
  bind(ModelBuilder).to(CircleModelBuilder).inSingletonScope().whenTargetNamed(SHAPE.Circle);
  bind(ModelBuilder).to(CircleModelBuilder).inSingletonScope().whenTargetNamed(SHAPE.Ellipse);
  bind(ModelBuilder).to(CircleModelBuilder).inSingletonScope().whenTargetNamed(SHAPE.Rect);
  bind(ModelBuilder).to(ImageModelBuilder).inSingletonScope().whenTargetNamed(SHAPE.Image);
  bind(ModelBuilder).to(LineModelBuilder).inSingletonScope().whenTargetNamed(SHAPE.Line);
  bind(ModelBuilder).to(LineModelBuilder).inSingletonScope().whenTargetNamed(SHAPE.Polyline);
  bind(ModelBuilder).to(TextModelBuilder).inSingletonScope().whenTargetNamed(SHAPE.Text);
  bind<interfaces.Factory<ModelBuilder | null>>(ModelBuilderFactory).toFactory<ModelBuilder | null>(
    (context: interfaces.Context) => {
      return (tagName: SHAPE) => {
        if (context.container.isBoundNamed(ModelBuilder, tagName)) {
          return context.container.getNamed(ModelBuilder, tagName);
        }
        return null;
      };
    },
  );

  /**
   * bind rendering engine
   */
  bind(WebGLEngine).toSelf().inSingletonScope();
  bind(RenderingEngine).toService(WebGLEngine);

  /**
   * bind render passes
   */
  bind<IRenderPass<any>>(IRenderPass)
    .to(RenderPass)
    .inSingletonScope()
    .whenTargetNamed(RenderPass.IDENTIFIER);
  bind<IRenderPass<any>>(IRenderPass)
    .to(CopyPass)
    .inSingletonScope()
    .whenTargetNamed(CopyPass.IDENTIFIER);
  bind<IRenderPass<any>>(IRenderPass)
    // @ts-ignore
    .to(TAAPass)
    .inSingletonScope()
    .whenTargetNamed(TAAPass.IDENTIFIER);
  bind<interfaces.Factory<IRenderPass<any>>>(RenderPassFactory).toFactory<IRenderPass<any>>(
    (context: interfaces.Context) => {
      return (name: string) => {
        return context.container.getNamed(IRenderPass, name);
      };
    },
  );

  bind(View).toSelf().inSingletonScope();

  /**
   * bind handlers when frame began
   */
  bind(FrameGraphEngine).toSelf().inSingletonScope();

  bind(FrameGraphPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(FrameGraphPlugin);

  bind(PickingPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(PickingPlugin);
});

export interface WebGLRenderingContext {
  engine: RenderingEngine;
  camera: Camera;
  view: IView;
}

export function registerModelBuilder(
  builderClazz: new (...args: any[]) => ModelBuilder,
  name: string,
) {
  bindFunc(ModelBuilder).to(builderClazz).inSingletonScope().whenTargetNamed(name);
}

export {
  Geometry3D,
  Material3D,
  Renderable3D,
  ShaderModuleService,
  ModelBuilder,
  TexturePool,
  RenderingEngine,
  gl,
  rgb2arr,
};

export class Plugin implements RendererPlugin {
  init(container: Container): void {
    container.load(containerModule);
  }
  destroy(container: Container): void {
    container.unload(containerModule);
  }
}
