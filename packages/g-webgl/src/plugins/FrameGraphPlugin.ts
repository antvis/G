import { AABB, RenderingPlugin, RenderingService } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { ResourcePool } from '../components/framegraph/ResourcePool';
import { Renderable3D, INSTANCING_STATUS } from '../components/Renderable3D';
import { RenderingEngine } from '../services/renderer';
import { FrameGraphEngine, IRenderPass, RenderPassFactory } from './FrameGraphEngine';
import { CopyPass, CopyPassData } from './passes/CopyPass';
import { RenderPass, RenderPassData } from './passes/RenderPass';

@injectable()
export class FrameGraphPlugin implements RenderingPlugin {
  static tag = 'FrameGraphPlugin';

  @inject(RenderPassFactory)
  private renderPassFactory: <T>(name: string) => IRenderPass<T>;

  @inject(ResourcePool)
  private resourcePool: ResourcePool;

  @inject(RenderingEngine)
  private engine: RenderingEngine;

  @inject(FrameGraphEngine)
  private frameGraphSystem: FrameGraphEngine;

  apply(renderer: RenderingService) {
    // compile frame graph at beginning
    // renderpass -> copypass -> present
    renderer.hooks.beginFrame.tapPromise(FrameGraphPlugin.tag, async (entities: Entity[], dirtyAABB?: AABB) => {
      this.engine.beginFrame();

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
    });

    renderer.hooks.endFrame.tapPromise(FrameGraphPlugin.tag, async (entities: Entity[]) => {
      entities.forEach((entity) => {
        const renderable3d = entity.getComponent(Renderable3D);
        if (renderable3d && renderable3d.source) {
          renderable3d.status = INSTANCING_STATUS.Rendered;
          renderable3d.source.status = INSTANCING_STATUS.Rendered;
        }
      });
      this.engine.endFrame();
    });

    renderer.hooks.renderFrame.tapPromise(FrameGraphPlugin.tag, async (entities: Entity[]) => {
      this.frameGraphSystem.compile();
      this.frameGraphSystem.executePassNodes(entities);
    });

    renderer.hooks.destroy.tap(FrameGraphPlugin.tag, () => {
      this.resourcePool.clean();
      this.engine.destroy();
    });
  }
}
