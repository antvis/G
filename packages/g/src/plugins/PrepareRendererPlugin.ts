import { inject, injectable } from 'inversify';
import { Renderable } from '../components';
import { DisplayObject, DISPLAY_OBJECT_EVENT } from '../DisplayObject';
import { RenderingContext } from '../services';
import { RenderingService, RenderingPlugin } from '../services/RenderingService';
import { SceneGraphService, SCENE_GRAPH_EVENT } from '../services/SceneGraphService';

@injectable()
export class PrepareRendererPlugin implements RenderingPlugin {
  static tag = 'PrepareRendererPlugin';

  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  apply(renderingService: RenderingService) {
    const handleAttributeChanged = (name: string, value: any, object: DisplayObject) => {
      renderingService.hooks.attributeChanged.call(object, name, value);
    };

    renderingService.hooks.mounted.tap(PrepareRendererPlugin.tag, (object: DisplayObject) => {
      // console.log('mounted', object);
      const entity = object.getEntity();
      this.sceneGraphService.emit(SCENE_GRAPH_EVENT.AABBChanged, entity);

      // delegate attribute-changed handler
      object.on(DISPLAY_OBJECT_EVENT.AttributeChanged, handleAttributeChanged);

      const renderable = entity.getComponent(Renderable);
      renderable.dirty = true;
    });

    renderingService.hooks.unmounted.tap(PrepareRendererPlugin.tag, (object: DisplayObject) => {
      // console.log('unmounted', object);
      object.off(DISPLAY_OBJECT_EVENT.AttributeChanged, handleAttributeChanged);

      const entity = object.getEntity();
      const renderable = entity.getComponent(Renderable);
      this.renderingContext.rBush.remove(renderable.rBushNode);

      if (renderable.aabb) {
        this.renderingContext.removedAABBs.push(renderable.aabb);
      }
    });
  }
}
