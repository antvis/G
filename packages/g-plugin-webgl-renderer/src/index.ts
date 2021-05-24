// tslint:disable-next-line:no-reference
/// <reference path="../../../node_modules/@webgpu/types/dist/index.d.ts" />
import { Camera, container, RenderingPluginContribution, SHAPE } from '@antv/g';
import { World } from '@antv/g-ecs';
import { ContainerModule, interfaces } from 'inversify';
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
import {
  BatchModelBuilder,
  CircleModelBuilder,
  ImageModelBuilder,
  LineModelBuilder,
  ModelBuilder,
  TextModelBuilder,
} from './shapes';
import { GlyphManager } from './shapes/symbol/GlyphManager';
import { TexturePool } from './shapes/TexturePool';
import { View } from './View';

const world = container.get(World);
world.registerComponent(Geometry3D);
world.registerComponent(Material3D);
world.registerComponent(Renderable3D);

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
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
  bind(CircleModelBuilder).toSelf().inSingletonScope();
  bind(ImageModelBuilder).toSelf().inSingletonScope();
  bind(LineModelBuilder).toSelf().inSingletonScope();
  bind(TextModelBuilder).toSelf().inSingletonScope();
  bind<interfaces.Factory<ModelBuilder | null>>(ModelBuilder).toFactory<ModelBuilder | null>(
    (context: interfaces.Context) => {
      return (tagName: SHAPE) => {
        if (tagName === SHAPE.Circle || tagName === SHAPE.Ellipse || tagName === SHAPE.Rect) {
          return context.container.get(CircleModelBuilder);
        } else if (tagName === SHAPE.Image) {
          return context.container.get(ImageModelBuilder);
        } else if (tagName === SHAPE.Line || tagName === SHAPE.Polyline) {
          return context.container.get(LineModelBuilder);
        } else if (tagName === SHAPE.Text) {
          return context.container.get(TextModelBuilder);
        }

        return null;
      };
    }
  );

  /**
   * bind rendering engine
   */
  bind(WebGLEngine).toSelf().inSingletonScope();
  bind(RenderingEngine).toService(WebGLEngine);

  /**
   * bind render passes
   */
  bind<IRenderPass<any>>(IRenderPass).to(RenderPass).inSingletonScope().whenTargetNamed(RenderPass.IDENTIFIER);
  bind<IRenderPass<any>>(IRenderPass).to(CopyPass).inSingletonScope().whenTargetNamed(CopyPass.IDENTIFIER);
  bind<interfaces.Factory<IRenderPass<any>>>(RenderPassFactory).toFactory<IRenderPass<any>>(
    (context: interfaces.Context) => {
      return (name: string) => {
        return context.container.getNamed(IRenderPass, name);
      };
    }
  );

  bind(View).toSelf().inSingletonScope();
  // bind(Camera).toSelf().inSingletonScope();

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
