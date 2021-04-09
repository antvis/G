// tslint:disable-next-line:no-reference
/// <reference path="../../../node_modules/@webgpu/types/dist/index.d.ts" />
import {
  container,
  CanvasContainerModule,
  ContextService,
  CullingStrategy,
  EventService,
  ShapePluginContribution,
  RenderingPluginContribution,
  SHAPE,
  ShapeRenderer,
  RENDERER,
} from '@antv/g-core';
import { World } from '@antv/g-ecs';
import { ContainerModule, interfaces } from 'inversify';
import { Geometry3D } from './components/Geometry3D';
import { Material3D } from './components/Material3D';
import { Renderable3D } from './components/Renderable3D';
import { InitShapePlugin } from './plugins/InitShapePlugin';
import { PickingIdGenerator } from './plugins/PickingIdGenerator';
import { GeometrySystem } from './systems/Geometry';
import { BaseRenderer } from './shapes/Base';
import { CircleRenderer } from './shapes/Circle';
import { RenderingEngine } from './services/renderer';
import { WebGLEngine } from './services/renderer/regl';
import { ResourcePool } from './components/framegraph/ResourcePool';
import { IRenderPass, RenderPassFactory } from './plugins/FrameGraphEngine';
import { RenderPass } from './plugins/passes/RenderPass';
import { CopyPass } from './plugins/passes/CopyPass';
import { FrustumCulling } from './contributions/FrustumCulling';
import { FrameGraphEngine } from './plugins/FrameGraphEngine';
import { Camera } from './Camera';
import { View } from './View';
import { TexturePool } from './shapes/TexturePool';
import { CanvasEventService } from './services/CanvasEventService';
import { WebGLContextService } from './services/WebGLContextService';
import { ImageRenderer } from './shapes/Image';
import { DefaultShaderModuleService, ShaderModuleService } from './services/shader-module';
import { FrameGraphPlugin } from './plugins/FrameGraphPlugin';

const world = container.get(World);
world.registerComponent(Geometry3D);
world.registerComponent(Material3D);
world.registerComponent(Renderable3D);
world.registerSystem(GeometrySystem);

container.bind(PickingIdGenerator).toSelf().inSingletonScope();
container.bind(InitShapePlugin).toSelf().inSingletonScope();
container.bind(ShapePluginContribution).toService(InitShapePlugin);

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
      bind(BaseRenderer).toSelf().inSingletonScope();

      /**
       * register shape renderers
       */
      bind(TexturePool).toSelf().inSingletonScope();
      bind(ShapeRenderer).to(CircleRenderer).inSingletonScope().whenTargetNamed(SHAPE.Circle);
      bind(ShapeRenderer).to(CircleRenderer).inSingletonScope().whenTargetNamed(SHAPE.Ellipse);
      bind(ShapeRenderer).to(CircleRenderer).inSingletonScope().whenTargetNamed(SHAPE.Rect);
      bind(ShapeRenderer).to(ImageRenderer).inSingletonScope().whenTargetNamed(SHAPE.Image);

      /**
       * bind services
       */
      bind(DefaultShaderModuleService).toSelf().inSingletonScope();
      bind(ShaderModuleService).toService(DefaultShaderModuleService);
      bind(WebGLEngine).toSelf().inSingletonScope();
      bind(RenderingEngine).toService(WebGLEngine);

      bind(ResourcePool).toSelf().inSingletonScope();

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

      /**
       * bind culling strategies
       */
      bind(FrustumCulling).toSelf().inSingletonScope();
      bind(CullingStrategy).toService(FrustumCulling);

      bind(View).toSelf().inSingletonScope();
      bind(Camera).toSelf().inSingletonScope();

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
