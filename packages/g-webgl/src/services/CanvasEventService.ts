import {
  ContextService,
  EventService,
  Group,
  GroupPool,
  Renderable,
  SceneGraphNode,
  SHAPE,
  ShapeRenderer,
  ShapeRendererFactory,
} from '@antv/g-core';
import { inject, injectable } from 'inversify';
import { WebGLContextService, RenderingContext } from './WebGLContextService';
import { getEventPosition } from '../utils/dom';
import { IFramebuffer } from './renderer';
import { Camera } from '../Camera';
import { View } from '../View';
import { FrameGraphEngine } from '../plugins/FrameGraphEngine';
import { Material3D } from '../components/Material3D';
import { UNIFORM } from '../shapes/Base';
import { PickingIdGenerator } from '../plugins/PickingIdGenerator';
import { Renderable3D } from '../components/Renderable3D';
import { gl } from './renderer/constants';

const PickingStage = {
  NONE: 0.0,
  ENCODE: 1.0,
  HIGHLIGHT: 2.0,
};

const EVENTS = [
  'mousedown',
  'mouseup',
  'dblclick',
  'mouseout',
  'mouseover',
  'mousemove',
  'mouseleave',
  'mouseenter',
  'touchstart',
  'touchmove',
  'touchend',
  'dragenter',
  'dragover',
  'dragleave',
  'drop',
  'contextmenu',
  'mousewheel',
];

@injectable()
export class CanvasEventService implements EventService {
  @inject(ContextService)
  private contextService: WebGLContextService;

  @inject(GroupPool)
  private groupPool: GroupPool;

  @inject(ShapeRendererFactory)
  private shapeRendererFactory: (type: SHAPE) => ShapeRenderer<RenderingContext> | null;

  @inject(FrameGraphEngine)
  private frameGraphSystem: FrameGraphEngine;

  @inject(PickingIdGenerator)
  private pickingIdGenerator: PickingIdGenerator;

  @inject(Camera)
  private camera: Camera;

  @inject(View)
  private view: View;

  private lastShape: Group | null;
  private pickingFBO: IFramebuffer;

  /**
   * 简单的 throttle，防止连续触发 hover 时导致频繁渲染到 picking framebuffer
   */
  private alreadyInRendering: boolean = false;

  init() {
    const $canvas = this.contextService.getContext()?.engine.getCanvas();
    if ($canvas) {
      EVENTS.forEach((eventName) => {
        $canvas.addEventListener(eventName, this.eventHandler);
      });
    }
  }

  destroy() {
    const $canvas = this.contextService.getContext()?.engine.getCanvas();
    if ($canvas) {
      EVENTS.forEach((eventName) => {
        $canvas.removeEventListener(eventName, this.eventHandler);
      });
    }
  }

  pick({ x, y }: { x: number; y: number }): Group | null {
    if (this.alreadyInRendering) {
      return this.lastShape;
    }

    this.alreadyInRendering = true;

    const engine = this.contextService.getContext()?.engine;
    const dpr = this.contextService.getDPR();
    const { width, height } = this.view.getViewport();

    if (engine) {
      const { clear, useFramebuffer, createFramebuffer, readPixels } = engine;

      if (!this.pickingFBO) {
        // this.pickingFBO = createFramebuffer({ width, height });
        this.pickingFBO = createFramebuffer({ width: 1, height: 1 });
      }

      let pickedColors: Uint8Array | undefined;
      let pickedFeatureIdx = -1;

      clear({
        framebuffer: this.pickingFBO,
        color: [0, 0, 0, 0],
      });

      useFramebuffer(this.pickingFBO, () => {
        // this.camera.setViewOffset(1, 1, x * dpr / width, y * dpr / height, 1 / width, 1 / height);
        this.camera.setViewOffset(width, height, x * dpr, y * dpr, 1, 1);

        // render entities in last frame
        for (const entity of this.frameGraphSystem.entities) {
          const renderable = entity.getComponent(SceneGraphNode);
          const renderer = this.shapeRendererFactory(renderable.tagName);

          if (renderer) {
            const material = entity.getComponent(Material3D);
            material.setUniform(UNIFORM.PickingStage, PickingStage.ENCODE);
            // material.setCull({
            //   enable: false,
            // });
            // material.setBlend({
            //   enable: false,
            // });

            renderer.render(this.contextService.getContext()!, entity);

            material.setUniform(UNIFORM.PickingStage, PickingStage.NONE);
          }
        }

        this.camera.clearViewOffset();

        // avoid realloc, draw a 1x1 quad
        pickedColors = readPixels({
          x: 0,
          y: 0,
          // x: x * dpr,
          // y: y * dpr,
          // x: Math.round(x * dpr),
          // 视口坐标系原点在左上，而 WebGL 在左下，需要翻转 Y 轴
          // y: Math.round(height - (y + 1) * dpr),
          width: 1,
          height: 1,
          data: new Uint8Array(1 * 1 * 4),
          framebuffer: this.pickingFBO,
        });

        if (pickedColors[0] !== 0 || pickedColors[1] !== 0 || pickedColors[2] !== 0) {
          pickedFeatureIdx = this.pickingIdGenerator.decodePickingColor(pickedColors);
        }

        this.alreadyInRendering = false;
      });

      console.log(pickedFeatureIdx);

      if (pickedFeatureIdx > -1) {
        const pickedEntity = this.frameGraphSystem.entities.find(
          (entity) => entity.getComponent(Renderable3D)?.pickingId === pickedFeatureIdx
        );
        if (pickedEntity) {
          return this.groupPool.getByName(pickedEntity.getName());
        }
      }
    }
    return null;
  }

  private eventHandler = (ev: Event) => {
    const $canvas = this.contextService.getContext()?.engine.getCanvas();
    const position = getEventPosition($canvas!, ev);
    // const group = this.pick(position);

    // if (this.lastShape) {
    //   this.lastShape.emit('mouseleave');
    // }
    // if (group) {
    //   this.lastShape = group;
    //   group.emit('mouseenter');
    // }
  };
}
