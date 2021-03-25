import { RendererFrameContribution } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { ResourcePool } from '../components/framegraph/ResourcePool';
import { Renderable3D, INSTANCING_STATUS } from '../components/Renderable3D';
import { RenderingEngine } from '../services/renderer';
import { FrameGraphEngine, IRenderPass, RenderPassFactory } from './FrameGraphEngine';
import { CopyPass, CopyPassData } from './passes/CopyPass';
import { RenderPass, RenderPassData } from './passes/RenderPass';

@injectable()
export class FrameGraphRenderer implements RendererFrameContribution {
  @inject(RenderPassFactory)
  private renderPassFactory: <T>(name: string) => IRenderPass<T>;

  @inject(ResourcePool)
  private resourcePool: ResourcePool;

  @inject(RenderingEngine)
  private engine: RenderingEngine;

  @inject(FrameGraphEngine)
  private frameGraphSystem: FrameGraphEngine;

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
    await this.frameGraphSystem.executePassNodes(entities);
  }

  async endFrame(entities: Entity[]) {
    entities.forEach((entity) => {
      const renderable3d = entity.getComponent(Renderable3D);
      if (renderable3d.source) {
        renderable3d.source.status = INSTANCING_STATUS.Rendered;
      }
    });
    this.engine.endFrame();
  }

  destroy() {
    this.resourcePool.clean();
    this.engine.destroy();
  }
}
