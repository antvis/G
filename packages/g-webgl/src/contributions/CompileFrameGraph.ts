import { RendererFrameContribution } from '@antv/g-core';
import { Entity, System } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import { ResourcePool } from '../components/framegraph/ResourcePool';
import { RenderingEngine } from '../services/renderer';
import { FrameGraphSystem, IRenderPass, RenderPassFactory } from '../systems/FrameGraph';
import { CopyPass, CopyPassData } from './passes/CopyPass';
import { RenderPass, RenderPassData } from './passes/RenderPass';

@injectable()
export class CompileFrameGraph implements RendererFrameContribution {
  @inject(RenderPassFactory)
  private readonly renderPassFactory: <T>(name: string) => IRenderPass<T>;

  @inject(ResourcePool)
  private readonly resourcePool: ResourcePool;

  @inject(RenderingEngine)
  private readonly engine: RenderingEngine;

  @inject(System)
  @named(FrameGraphSystem.tag)
  private frameGraphSystem: FrameGraphSystem;

  async beginFrame() {
    this.engine.beginFrame();

    // const pixelPickingPass = this.renderPassFactory<PixelPickingPassData>(
    //   PixelPickingPass.IDENTIFIER,
    // );
    // const {
    //   setup: setupPixelPickingPass,
    //   execute: executePixelPickingPass,
    //   tearDown: tearDownPickingPass,
    // } = pixelPickingPass;
    // this.frameGraphSystem.addPass<PixelPickingPassData>(
    //   PixelPickingPass.IDENTIFIER,
    //   setupPixelPickingPass,
    //   executePixelPickingPass,
    //   tearDownPickingPass,
    // );

    const { setup: setupRenderPass, execute: executeRenderPass } = this.renderPassFactory<RenderPassData>(
      RenderPass.IDENTIFIER
    );
    this.frameGraphSystem.addPass<RenderPassData>(RenderPass.IDENTIFIER, setupRenderPass, executeRenderPass);

    const {
      setup: setupCopyPass,
      execute: executeCopyPass,
      tearDown: tearDownCopyPass,
    } = this.renderPassFactory<CopyPassData>(CopyPass.IDENTIFIER);
    const copyPass = this.frameGraphSystem.addPass<CopyPassData>(
      CopyPass.IDENTIFIER,
      setupCopyPass,
      executeCopyPass,
      tearDownCopyPass
    );

    this.frameGraphSystem.present(copyPass.data.output);
    // this.frameGraphSystem.present(renderPass.data.output);
  }

  async renderFrame(entities: Entity[]) {
    this.frameGraphSystem.compile();
    this.frameGraphSystem.executePassNodes(entities);
    // await this.frameGraphSystem.executePassNodes(entities);
  }

  async endFrame() {
    this.engine.endFrame();
  }

  destroy() {
    this.resourcePool.clean();
    this.engine.destroy();
  }
}
