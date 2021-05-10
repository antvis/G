import { Entity } from '@antv/g-ecs';
import {
  DisplayObjectPool,
  CanvasConfig,
  ContextService,
  RenderingService,
  RenderingPlugin,
  RenderingContext,
  SceneGraphService,
  PickingResult,
  Camera,
} from '@antv/g';
import { inject, injectable } from 'inversify';
import { View } from '../View';
import { FrameGraphEngine, IRenderPass, RenderPassFactory } from './FrameGraphEngine';
import { IFramebuffer } from '../services/renderer';
import { PickingIdGenerator } from './PickingIdGenerator';
import { Renderable3D } from '../components/Renderable3D';
import { RenderPass, RenderPassData } from './passes/RenderPass';
import { UNIFORM } from './FrameGraphPlugin';
import { Material3D } from '../components/Material3D';

const PickingStage = {
  NONE: 0.0,
  ENCODE: 1.0,
  HIGHLIGHT: 2.0,
};

/**
 * pick shape(s) with Mouse/Touch event
 *
 * 1. find AABB with r-tree
 * 2. do math calculation with geometry in an accurate way
 */
@injectable()
export class PickingPlugin implements RenderingPlugin {
  static tag = 'PickingPlugin';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(SceneGraphService)
  protected sceneGraphService: SceneGraphService;

  @inject(ContextService)
  private contextService: ContextService<CanvasRenderingContext2D>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(DisplayObjectPool)
  private displayObjectPool: DisplayObjectPool;

  @inject(FrameGraphEngine)
  private frameGraphSystem: FrameGraphEngine;

  @inject(PickingIdGenerator)
  private pickingIdGenerator: PickingIdGenerator;

  @inject(Camera)
  private camera: Camera;

  @inject(View)
  private view: View;

  @inject(RenderPassFactory)
  private renderPassFactory: <T>(name: string) => IRenderPass<T>;

  private pickingFBO: IFramebuffer;

  /**
   * 简单的 throttle，防止连续触发 hover 时导致频繁渲染到 picking framebuffer
   */
  private alreadyInRendering: boolean = false;

  apply(renderingService: RenderingService) {
    renderingService.hooks.pick.tap(PickingPlugin.tag, (result: PickingResult) => {
      const { x, y } = result.position;

      if (this.alreadyInRendering) {
        return {
          position: result.position,
          picked: null,
        };
      }

      this.alreadyInRendering = true;

      const engine = this.contextService.getContext()?.engine;
      const dpr = this.contextService.getDPR();
      const { width, height } = this.view.getViewport();

      if (engine) {
        const { clear, useFramebuffer, createFramebuffer, readPixels } = engine;

        if (!this.pickingFBO) {
          this.pickingFBO = createFramebuffer({ width, height });
          // this.pickingFBO = createFramebuffer({ width: 1, height: 1 });
        }

        let pickedColors: Uint8Array | undefined;
        let pickedFeatureIdx = -1;

        clear({
          framebuffer: this.pickingFBO,
          color: [0, 0, 0, 0],
          depth: 1,
        });

        useFramebuffer(this.pickingFBO, () => {
          // this.camera.setViewOffset(1, 1, x * dpr / width, y * dpr / height, 1 / width, 1 / height);
          // this.camera.setViewOffset(width, height, x * dpr, y * dpr, 1, 1);

          // console.log(width, height, x * dpr, y * dpr);

          // render entities in last frame
          // FIXME: filter invisible entities
          for (const entity of this.renderingContext.entities) {
            const material = entity.getComponent(Material3D);
            material.setUniform(UNIFORM.PickingStage, PickingStage.ENCODE);
          }

          const renderPass = this.renderPassFactory<RenderPassData>(RenderPass.IDENTIFIER) as RenderPass;
          renderPass.renderEntities(this.renderingContext.entities);

          for (const entity of this.renderingContext.entities) {
            const material = entity.getComponent(Material3D);
            material.setUniform(UNIFORM.PickingStage, PickingStage.NONE);
          }

          // this.camera.clearViewOffset();

          // avoid realloc, draw a 1x1 quad
          pickedColors = readPixels({
            // x: 0,
            // y: 0,
            // x: x * dpr,
            // y: y * dpr,
            x: Math.round(x * dpr),
            // // 视口坐标系原点在左上，而 WebGL 在左下，需要翻转 Y 轴
            y: Math.round(height - (y + 1) * dpr),
            width: 1,
            height: 1,
            data: new Uint8Array(1 * 1 * 4),
            framebuffer: this.pickingFBO,
          });

          if (pickedColors && (pickedColors[0] !== 0 || pickedColors[1] !== 0 || pickedColors[2] !== 0)) {
            pickedFeatureIdx = this.pickingIdGenerator.decodePickingColor(pickedColors);
          }

          this.alreadyInRendering = false;
        });

        console.log('pickedFeatureIdx', pickedFeatureIdx);

        if (pickedFeatureIdx > -1) {
          const pickedEntity = this.renderingContext.entities.find(
            (entity: Entity) => entity.getComponent(Renderable3D)?.pickingId === pickedFeatureIdx
          );
          if (pickedEntity) {
            return {
              position: result.position,
              picked: this.displayObjectPool.getByName(pickedEntity.getName()),
            };
          }
        }
      }

      return {
        position: result.position,
        picked: null,
      };
    });
  }
}
