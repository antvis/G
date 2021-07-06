import {
  DisplayObject,
  ContextService,
  RenderingService,
  RenderingPlugin,
  SceneGraphService,
  PickingResult,
  Camera,
} from '@antv/g';
import { inject, injectable } from 'inversify';
import { View } from './View';
import { IRenderPass, RenderPassFactory } from './FrameGraphEngine';
import { IFramebuffer, RenderingEngine } from './services/renderer';
import { PickingIdGenerator } from './PickingIdGenerator';
import { RenderPass, RenderPassData } from './passes/RenderPass';
import { UNIFORM } from './FrameGraphPlugin';
import { Material3D } from './components/Material3D';
import { WebGLRenderingContext } from '.';

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

  @inject(SceneGraphService)
  protected sceneGraphService: SceneGraphService;

  @inject(ContextService)
  private contextService: ContextService<WebGLRenderingContext>;

  @inject(PickingIdGenerator)
  private pickingIdGenerator: PickingIdGenerator;

  @inject(Camera)
  private camera: Camera;

  @inject(View)
  private view: View;

  @inject(RenderingEngine)
  private engine: RenderingEngine;

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

      const engine = this.engine;
      const dpr = this.contextService.getDPR();
      const { width, height } = this.view.getViewport();

      if (engine) {
        const { clear, useFramebuffer, createFramebuffer, readPixels } = engine;

        if (!this.pickingFBO) {
          this.pickingFBO = createFramebuffer({ width: 1, height: 1 });
        }

        let pickedColors: Uint8Array | undefined;
        let pickedFeatureIdx = -1;

        clear({
          framebuffer: this.pickingFBO,
          color: [0, 0, 0, 0],
          depth: 1,
        });

        useFramebuffer({ framebuffer: this.pickingFBO }, () => {
          this.camera.setViewOffset(width, height, x * dpr, y * dpr, 1, 1);

          // render
          const renderPass = this.renderPassFactory<RenderPassData>(
            RenderPass.IDENTIFIER,
          ) as RenderPass;
          const pickedDisplayObjects: DisplayObject[] = renderPass.displayObjectsLastFrame;

          for (const object of pickedDisplayObjects) {
            const material = object.getEntity().getComponent(Material3D);
            material.setUniform(UNIFORM.PickingStage, PickingStage.ENCODE);
          }

          renderPass.renderDisplayObjects(pickedDisplayObjects);

          for (const object of pickedDisplayObjects) {
            const material = object.getEntity().getComponent(Material3D);
            material.setUniform(UNIFORM.PickingStage, PickingStage.NONE);
          }

          this.camera.clearViewOffset();

          // avoid realloc, draw a 1x1 quad
          pickedColors = readPixels({
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            data: new Uint8Array(1 * 1 * 4),
            framebuffer: this.pickingFBO,
          });

          if (
            pickedColors &&
            (pickedColors[0] !== 0 || pickedColors[1] !== 0 || pickedColors[2] !== 0)
          ) {
            pickedFeatureIdx = this.pickingIdGenerator.decodePickingColor(pickedColors);
          }

          this.alreadyInRendering = false;
        });

        if (pickedFeatureIdx > -1) {
          const pickedDisplayObject = this.pickingIdGenerator.getById(pickedFeatureIdx);
          if (pickedDisplayObject) {
            return {
              position: result.position,
              picked: pickedDisplayObject,
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
