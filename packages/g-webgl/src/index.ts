// tslint:disable-next-line:no-reference
/// <reference path="../../../node_modules/@webgpu/types/dist/index.d.ts" />
import {
  ContextService,
  CullingStrategy,
  RendererFrameContribution,
  SHAPE,
  ShapeConfigHandlerContribution,
  ShapeRenderer,
} from '@antv/g-core';
import { ContainerModule, interfaces } from 'inversify';
import { Canvas } from './Canvas';
import { BaseRenderer } from './shapes/Base';
import { CircleRenderer } from './shapes/Circle';
import { ShaderModuleService, DefaultShaderModuleService } from './services/shader-module';
import { WebGLContext as WebGLContextService } from './WebGLContext';
import { RenderingEngine } from './services/renderer';
import { WebGLEngine } from './services/renderer/regl';
import { ResourcePool } from './components/framegraph/ResourcePool';
import { IRenderPass, RenderPassFactory } from './systems/FrameGraph';
import { RenderPass } from './contributions/passes/RenderPass';
import { CopyPass } from './contributions/passes/CopyPass';
import { PixelPickingPass } from './contributions/passes/PixelPickingPass';
import { Renderable3DCreator } from './contributions/Renderable3DCreator';
import { FrustumCulling } from './contributions/FrustumCulling';
import { Camera } from './Camera';
import { View } from './View';
import { CompileFrameGraph } from './contributions/CompileFrameGraph';

export const module = new ContainerModule((bind) => {
  bind(WebGLContextService).toSelf().inSingletonScope();
  bind(ContextService).toService(WebGLContextService);
  bind(BaseRenderer).toSelf().inSingletonScope();

  /**
   * register shape renderers
   */
  bind(CircleRenderer).toSelf().inSingletonScope();
  bind(ShapeRenderer).to(CircleRenderer).whenTargetNamed(SHAPE.Circle);
  bind(ShapeRenderer).to(CircleRenderer).whenTargetNamed(SHAPE.Ellipse);

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
   * bind shape contribution points
   */
  bind(Renderable3DCreator).toSelf().inSingletonScope();
  bind(ShapeConfigHandlerContribution).toService(Renderable3DCreator);

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
  bind(CompileFrameGraph).toSelf().inSingletonScope();
  // unbind(RendererFrameContribution);
  // bindContributionProvider(bind, RendererFrameContribution);
  bind(RendererFrameContribution).toService(CompileFrameGraph);
});

export { Canvas };
