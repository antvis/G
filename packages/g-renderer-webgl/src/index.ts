// tslint:disable-next-line:no-reference
/// <reference path="../../../node_modules/@webgpu/types/dist/index.d.ts" />
import {
  container,
  ContextService,
  RenderingPluginContribution,
  SHAPE,
  registerDisplayObjectPlugin,
  registerCanvasContainerModule,
} from '@antv/g';
import { World } from '@antv/g-ecs';
import { ContainerModule, interfaces } from 'inversify';
import { Geometry3D } from './components/Geometry3D';
import { Material3D } from './components/Material3D';
import { Renderable3D } from './components/Renderable3D';
import { InitShapePlugin } from './plugins/InitShapePlugin';
import { PickingIdGenerator } from './plugins/PickingIdGenerator';
import { CircleModelBuilder } from './shapes/Circle';
import { RenderingEngine } from './services/renderer';
import { WebGLEngine } from './services/renderer/regl';
import { ResourcePool } from './components/framegraph/ResourcePool';
import { IRenderPass, RenderPassFactory } from './plugins/FrameGraphEngine';
import { RenderPass } from './plugins/passes/RenderPass';
import { CopyPass } from './plugins/passes/CopyPass';
import { FrameGraphEngine } from './plugins/FrameGraphEngine';
import { View } from './View';
import { TexturePool } from './shapes/TexturePool';
import { WebGLContextService } from './services/WebGLContextService';
import { DefaultShaderModuleService, ShaderModuleService } from './services/shader-module';
import { FrameGraphPlugin } from './plugins/FrameGraphPlugin';
import { ImageModelBuilder, LineModelBuilder, ModelBuilder, TextModelBuilder } from './shapes';
import { GlyphManager } from './shapes/symbol/GlyphManager';
import { PickingPlugin } from './plugins/PickingPlugin';

export const RENDERER = 'webgl';

const world = container.get(World);
world.registerComponent(Geometry3D);
world.registerComponent(Material3D);
world.registerComponent(Renderable3D);

container.bind(PickingIdGenerator).toSelf().inSingletonScope();
container.bind(TexturePool).toSelf().inSingletonScope();
container.bind(GlyphManager).toSelf().inSingletonScope();

container.bind(DefaultShaderModuleService).toSelf().inSingletonScope();
container.bind(ShaderModuleService).toService(DefaultShaderModuleService);

/**
 * bind model builder for each kind of Shape
 */
container.bind(CircleModelBuilder).toSelf().inSingletonScope();
container.bind(ImageModelBuilder).toSelf().inSingletonScope();
container.bind(LineModelBuilder).toSelf().inSingletonScope();
container.bind(TextModelBuilder).toSelf().inSingletonScope();
container
  .bind<interfaces.Factory<ModelBuilder>>(ModelBuilder)
  .toFactory<ModelBuilder>((context: interfaces.Context) => {
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

      return context.container.get(CircleModelBuilder);
    };
  });

registerDisplayObjectPlugin(InitShapePlugin);

registerCanvasContainerModule(
  new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(WebGLContextService).toSelf().inSingletonScope();
    bind(ContextService).toService(WebGLContextService);

    /**
     * texture pool should be clean when renderer destroyed
     */
    bind(ResourcePool).toSelf().inSingletonScope();

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

    /**
     * register rendering plugins
     */
    bind(FrameGraphPlugin).toSelf().inSingletonScope();
    bind(RenderingPluginContribution).toService(FrameGraphPlugin);
    bind(PickingPlugin).toSelf().inSingletonScope();
    bind(RenderingPluginContribution).toService(PickingPlugin);
  }),
  RENDERER
);
