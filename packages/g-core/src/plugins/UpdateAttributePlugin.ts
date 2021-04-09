import { inject, injectable } from 'inversify';
import { SceneGraphNode } from '../components';
import { RenderingPlugin, RenderingService } from '../services';
import { ShapeRenderer, ShapeRendererFactory } from '../systems';
import { SHAPE } from '../types';

@injectable()
export class UpdateAttributePlugin implements RenderingPlugin {
  @inject(ShapeRendererFactory)
  private shapeRendererFactory: (type: SHAPE) => ShapeRenderer<CanvasRenderingContext2D> | null;

  apply(renderingService: RenderingService) {
    renderingService.hooks.changeAttribute.tap('UpdateAttributePlugin', (entity, name, value) => {
      const sceneGraphNode = entity.getComponent(SceneGraphNode);
      const renderer = this.shapeRendererFactory(sceneGraphNode.tagName);
      renderer?.onAttributeChanged(entity, name, value);
    });
  }
}
