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
    const handleAttributeChanged = (object: DisplayObject, name: string, value: any) => {
      renderingService.hooks.attributeChanged.call(object, name, value);
    };

    renderingService.hooks.prepare.tap(PrepareRendererPlugin.tag, (objects: DisplayObject[]) => {
      objects.forEach((object) => {
        if (!object.mounted) {
          const entity = object.getEntity();
          const renderable = entity.getComponent(Renderable);
          this.sceneGraphService.emit(SCENE_GRAPH_EVENT.AABBChanged, entity);

          // delegate attribute-changed handler
          object.on(DISPLAY_OBJECT_EVENT.AttributeChanged, handleAttributeChanged);
          renderingService.hooks.mounted.call(object);
          object.mounted = true;

          renderable.dirty = true;
        }
      });
      return objects;
    });

    renderingService.hooks.unmounted.tap(PrepareRendererPlugin.tag, (object: DisplayObject) => {
      object.off(DISPLAY_OBJECT_EVENT.AttributeChanged, handleAttributeChanged);
      const entity = object.getEntity();
      const renderable = entity.getComponent(Renderable);
      this.renderingContext.rBush.remove(renderable.rBushNode);

      console.log('unmounted', object);
      object.mounted = false;
      renderable.dirty = true;
    });
  }
}
