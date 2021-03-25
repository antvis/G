import { inject, injectable } from 'inversify';
import { FrameGraphHandle } from '../../components/framegraph/FrameGraphHandle';
import { FrameGraphPass } from '../../components/framegraph/FrameGraphPass';
import { PassNode } from '../../components/framegraph/PassNode';
import { ResourcePool } from '../../components/framegraph/ResourcePool';
// import { Material3D } from '../../components/Material3D';
import { IFramebuffer, IView, RenderingEngine } from '../../services/renderer';
import { decodePickingColor } from '../../utils/math';
import { FrameGraphEngine, IRenderPass, RenderPassFactory } from '../FrameGraphEngine';
// import { RenderPass, RenderPassData } from './RenderPass';
import { Entity } from '@antv/g-ecs';

export interface PixelPickingPassData {
  output: FrameGraphHandle;
}

const PickingStage = {
  NONE: 0.0,
  ENCODE: 1.0,
  HIGHLIGHT: 2.0,
};

/**
 * color-based picking
 * @see https://threejsfundamentals.org/threejs/lessons/threejs-picking.html
 */
@injectable()
export class PixelPickingPass implements IRenderPass<PixelPickingPassData> {
  public static IDENTIFIER = 'PixelPicking Pass';

  @inject(RenderingEngine)
  private readonly engine: RenderingEngine;

  @inject(ResourcePool)
  private readonly resourcePool: ResourcePool;

  @inject(RenderPassFactory)
  private readonly renderPassFactory: <T>(name: string) => IRenderPass<T>;

  private pickingFBO: IFramebuffer;

  private highlightEnabled = true;
  private highlightColor = [255, 0, 0, 255];

  /**
   * 简单的 throttle，防止连续触发 hover 时导致频繁渲染到 picking framebuffer
   */
  private alreadyInRendering: boolean = false;

  public enableHighlight(enabled: boolean) {
    this.highlightEnabled = enabled;
  }

  public setHighlightColor(color: number[]) {
    this.highlightColor = color;
  }

  public setup = (fg: FrameGraphEngine, passNode: PassNode, pass: FrameGraphPass<PixelPickingPassData>): void => {
    const output = fg.createRenderTarget(passNode, 'picking fbo', {
      width: 1,
      height: 1,
    });

    pass.data = {
      output: passNode.write(fg, output),
    };

    // 防止被 FrameGraph 剔除
    passNode.hasSideEffect = true;
  };

  public execute = async (
    fg: FrameGraphEngine,
    pass: FrameGraphPass<PixelPickingPassData>,
    entities: Entity[]
  ): Promise<void> => {
    // this.views = views;
    // if (this.alreadyInRendering) {
    //   return;
    // }
    // for (const view of views) {
    //   const { width, height } = view.getViewport();
    //   // throttled
    //   this.alreadyInRendering = true;
    //   // 实例化资源
    //   const resourceNode = fg.getResourceNode(pass.data.output);
    //   this.pickingFBO = this.resourcePool.getOrCreateResource(
    //     resourceNode.resource,
    //   );
    //   // TODO: only draw 1x1 quad, with offset camera
    //   this.pickingFBO.resize({ width, height });
    //   this.engine.useFramebuffer(this.pickingFBO, () => {
    //     this.engine.clear({
    //       framebuffer: this.pickingFBO,
    //       color: [0, 0, 0, 0],
    //       stencil: 0,
    //       depth: 1,
    //     });
    //     // 渲染
    //     const renderPass = this.renderPassFactory<RenderPassData>(
    //       RenderPass.IDENTIFIER,
    //     );
    //     // 修改所有
    //     const materials: Material3D[] = [];
    //     const scene = view.getScene();
    //     for (const meshEntity of scene.getEntities()) {
    //       const material = meshEntity.getComponent(Material3D);
    //       material.setUniform('u_PickingStage', PickingStage.ENCODE);
    //       materials.push(material);
    //     }
    //     (renderPass as RenderPass).renderView(view);
    //     materials.forEach((material) => {
    //       material.setUniform('u_PickingStage', PickingStage.HIGHLIGHT);
    //     });
    //     this.alreadyInRendering = false;
    //   });
    // }
  };

  public pick = ({ x, y }: { x: number; y: number }, view: IView) => {
    const { readPixels, useFramebuffer } = this.engine;
    const { width, height } = view.getViewport();
    const xInDevicePixel = x * window.devicePixelRatio;
    const yInDevicePixel = y * window.devicePixelRatio;
    // const xInDevicePixel = x;
    // const yInDevicePixel = y;
    if (xInDevicePixel > width || xInDevicePixel < 0 || yInDevicePixel > height || yInDevicePixel < 0) {
      return;
    }

    let pickedColors: Uint8Array | undefined;
    let pickedFeatureIdx: number | undefined;
    useFramebuffer(this.pickingFBO, () => {
      // avoid realloc
      pickedColors = readPixels({
        x: Math.round(xInDevicePixel),
        // 视口坐标系原点在左上，而 WebGL 在左下，需要翻转 Y 轴
        y: Math.round(height - (y + 1) * window.devicePixelRatio),
        // y: Math.round(height - (y + 1)),
        width: 1,
        height: 1,
        data: new Uint8Array(1 * 1 * 4),
        framebuffer: this.pickingFBO,
      });

      if (pickedColors[0] !== 0 || pickedColors[1] !== 0 || pickedColors[2] !== 0) {
        pickedFeatureIdx = decodePickingColor(pickedColors);

        if (this.highlightEnabled) {
          // 高亮
          this.highlightPickedFeature(pickedColors, view);
        }
      }
    });
    return pickedFeatureIdx;
  };

  /**
   * highlight 如果直接修改选中 feature 的 buffer，存在两个问题：
   * 1. 鼠标移走时无法恢复
   * 2. 无法实现高亮颜色与原始原色的 alpha 混合
   * 因此高亮还是放在 shader 中做比较好
   */
  private highlightPickedFeature(pickedColors: Uint8Array | undefined, view: IView) {
    // if (pickedColors) {
    //   for (const meshEntity of view.getScene().getEntities()) {
    //     const material = meshEntity.getComponent(Material3D);
    //     material.setUniform('u_PickingStage', PickingStage.HIGHLIGHT);
    //     material.setUniform('u_PickingColor', [
    //       pickedColors[0],
    //       pickedColors[1],
    //       pickedColors[2],
    //     ]);
    //     material.setUniform('u_HighlightColor', this.highlightColor);
    //   }
    // }
  }
}
