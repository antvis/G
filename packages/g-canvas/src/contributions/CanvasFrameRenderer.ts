import {
  CanvasCfg,
  CanvasConfig,
  ContextService,
  Renderable,
  RendererFrameContribution,
  ShapeRenderer,
  ShapeRendererFactory,
} from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';

@injectable()
export class CanvasFrameRenderer implements RendererFrameContribution {
  @inject(CanvasConfig)
  private canvasConfig: CanvasCfg;

  @inject(ContextService)
  private contextService: ContextService<CanvasRenderingContext2D>;

  @inject(ShapeRendererFactory)
  private shapeRendererFactory: (type: string) => ShapeRenderer | null;

  async beginFrame() {
    const context = this.contextService.getContext();
    if (context) {
      context.clearRect(0, 0, this.canvasConfig.width, this.canvasConfig.height);
    }
  }

  async endFrame() {
    //
  }

  async renderFrame(entities: Entity[]) {
    for (const entity of entities) {
      const renderable = entity.getComponent(Renderable);
      const renderer = this.shapeRendererFactory(renderable.type);
      if (renderer) {
        renderer.render(entity);
      }
    }
  }

  destroy() {
    //
  }
}
