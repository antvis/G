import { RenderingPlugin, RenderingService, CanvasConfig, SceneGraphNode, SHAPE } from '@antv/g';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { ResourcePool } from '../components/framegraph/ResourcePool';
import { Renderable3D, INSTANCING_STATUS } from '../components/Renderable3D';
import { RenderingEngine } from '../services/renderer';
import { TexturePool } from '../shapes/TexturePool';
import { FrameGraphEngine, IRenderPass, RenderPassFactory } from './FrameGraphEngine';
import { CopyPass, CopyPassData } from './passes/CopyPass';
import { RenderPass, RenderPassData } from './passes/RenderPass';

export const ATTRIBUTE = {
  ModelMatrix0: 'a_ModelMatrix0',
  ModelMatrix1: 'a_ModelMatrix1',
  ModelMatrix2: 'a_ModelMatrix2',
  ModelMatrix3: 'a_ModelMatrix3',
  PickingColor: 'a_PickingColor',
};

export const UNIFORM = {
  ProjectionMatrix: 'u_ProjectionMatrix',
  ModelViewMatrix: 'u_ModelViewMatrix',
  ModelMatrix: 'u_ModelMatrix',
  ViewMatrix: 'u_ViewMatrix',
  CameraPosition: 'u_CameraPosition',
  Viewport: 'u_Viewport',
  DPR: 'u_DevicePixelRatio',
  Opacity: 'u_Opacity',
  PickingStage: 'u_PickingStage',
};

export const STYLE = {
  Opacity: 'opacity',
  FillOpacity: 'fillOpacity',
};

@injectable()
export class FrameGraphPlugin implements RenderingPlugin {
  static tag = 'FrameGraphPlugin';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(RenderPassFactory)
  private renderPassFactory: <T>(name: string) => IRenderPass<T>;

  @inject(ResourcePool)
  private resourcePool: ResourcePool;

  @inject(TexturePool)
  private texturePool: TexturePool;

  @inject(RenderingEngine)
  private engine: RenderingEngine;

  @inject(FrameGraphEngine)
  private frameGraphSystem: FrameGraphEngine;

  apply(renderer: RenderingService) {
    // compile frame graph at beginning
    // renderpass -> copypass -> present
    renderer.hooks.beginFrame.tapPromise(FrameGraphPlugin.tag, async () => {
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
      // skip group
      const entitiesToRender = entities.filter((e) => e.getComponent(SceneGraphNode).tagName !== SHAPE.Group);

      this.frameGraphSystem.compile();
      this.frameGraphSystem.executePassNodes(entitiesToRender);
    });

    renderer.hooks.destroy.tap(FrameGraphPlugin.tag, () => {
      this.resourcePool.clean();
      this.texturePool.destroy();
      this.engine.destroy();
    });
  }
}
