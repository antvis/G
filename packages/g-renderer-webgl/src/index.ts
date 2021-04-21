// tslint:disable-next-line:no-reference
/// <reference path="../../../node_modules/@webgpu/types/dist/index.d.ts" />
import {
  container,
  CanvasContainerModule,
  ContextService,
  CullingStrategy,
  EventService,
  RenderingPluginContribution,
  SHAPE,
  RENDERER,
  registerDisplayObjectPlugin,
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
// import { Camera } from './Camera';
import { View } from './View';
import { TexturePool } from './shapes/TexturePool';
import { CanvasEventService } from './services/CanvasEventService';
import { WebGLContextService } from './services/WebGLContextService';
import { DefaultShaderModuleService, ShaderModuleService } from './services/shader-module';
import { FrameGraphPlugin } from './plugins/FrameGraphPlugin';
import { ImageModelBuilder, LineModelBuilder, ModelBuilder } from './shapes';

const world = container.get(World);
world.registerComponent(Geometry3D);
world.registerComponent(Material3D);
world.registerComponent(Renderable3D);
// world.registerSystem(GeometrySystem);

container.bind(PickingIdGenerator).toSelf().inSingletonScope();

container.bind(DefaultShaderModuleService).toSelf().inSingletonScope();
container.bind(ShaderModuleService).toService(DefaultShaderModuleService);

/**
 * bind model builder for each kind of Shape
 */
container.bind(CircleModelBuilder).toSelf().inSingletonScope();
container.bind(ImageModelBuilder).toSelf().inSingletonScope();
container.bind(LineModelBuilder).toSelf().inSingletonScope();
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
      }

      return context.container.get(CircleModelBuilder);
    };
  });

registerDisplayObjectPlugin(InitShapePlugin);

container
  .bind(CanvasContainerModule)
  .toConstantValue(
    new ContainerModule((bind, unbind, isBound, rebind) => {
      // TODO: implement dirty rectangle with Stencil
      // const config = container.get(CanvasConfig);
      // Object.assign(config, {
      //   dirtyRectangle: {
      //     enable: false,
      //   },
      // });

      bind(WebGLContextService).toSelf().inSingletonScope();
      bind(ContextService).toService(WebGLContextService);
      bind(CanvasEventService).toSelf().inSingletonScope();
      bind(EventService).toService(CanvasEventService);

      /**
       * texture pool should be clean when renderer destroyed
       */
      bind(TexturePool).toSelf().inSingletonScope();
      bind(ResourcePool).toSelf().inSingletonScope();

      /**
       * bind services
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
    })
  )
  .whenTargetNamed(RENDERER.WebGL);
