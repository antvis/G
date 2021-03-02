import { Renderable, RendererFrameContribution, ShapeRenderer, ShapeRendererFactory } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';

@injectable()
export class CanvasFrameRenderer implements RendererFrameContribution {
  @inject(ShapeRendererFactory)
  private shapeRendererFactory: (type: string) => ShapeRenderer | null;

  async beginFrame() {
    //
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
