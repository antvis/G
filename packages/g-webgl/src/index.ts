// tslint:disable-next-line:no-reference
/// <reference path="../../../node_modules/@webgpu/types/dist/index.d.ts" />
import {
  ContextService,
  CullingStrategy,
  EventService,
  RendererFrameContribution,
  SHAPE,
  ShapeRenderer,
} from '@antv/g-core';
import { ContainerModule, interfaces } from 'inversify';
import { Canvas } from './Canvas';
import { BaseRenderer } from './shapes/Base';
import { CircleRenderer } from './shapes/Circle';
import { ImageRenderer } from './shapes/Image';
import { ShaderModuleService, DefaultShaderModuleService } from './services/shader-module';
import { WebGLContextService } from './services/WebGLContextService';
import { RenderingEngine } from './services/renderer';
import { WebGLEngine } from './services/renderer/regl';
import { ResourcePool } from './components/framegraph/ResourcePool';
import { IRenderPass, RenderPassFactory } from './contributions/FrameGraphEngine';
import { RenderPass } from './contributions/passes/RenderPass';
import { CopyPass } from './contributions/passes/CopyPass';
import { PixelPickingPass } from './contributions/passes/PixelPickingPass';
import { FrustumCulling } from './contributions/FrustumCulling';
import { FrameGraphRenderer } from './contributions/FrameGraphRenderer';
import { FrameGraphEngine } from './contributions/FrameGraphEngine';
import { Camera } from './Camera';
import { View } from './View';
import { TexturePool } from './shapes/TexturePool';
import { CanvasEventService } from './services/CanvasEventService';

export const module = new ContainerModule((bind) => {
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
  bind<IRenderPass<any>>(IRenderPass)
    .to(PixelPickingPass)
    .inSingletonScope()
    .whenTargetNamed(PixelPickingPass.IDENTIFIER);

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
  bind(FrameGraphRenderer).toSelf().inSingletonScope();
  // unbind(RendererFrameContribution);
  // bindContributionProvider(bind, RendererFrameContribution);
  bind(RendererFrameContribution).toService(FrameGraphRenderer);
});

export { Canvas };
