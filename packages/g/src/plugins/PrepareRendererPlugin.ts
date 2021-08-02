import { inject, injectable } from 'inversify';
import { Renderable } from '../components';
import { DisplayObject, DISPLAY_OBJECT_EVENT } from '../DisplayObject';
import { RenderingContext, RENDER_REASON } from '../services';
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
    const handleAttributeChanged = (name: string, oldValue: any, value: any, object: DisplayObject) => {
      // need re-render
      this.renderingContext.renderReasons.add(RENDER_REASON.DisplayObjectChanged);

      // trigger hooks
      renderingService.hooks.attributeChanged.call(object, name, value);
    };

    const handleAABBChanged = () => {
      // need re-render
      this.renderingContext.renderReasons.add(RENDER_REASON.DisplayObjectChanged);
    };

    renderingService.hooks.init.tap(PrepareRendererPlugin.tag, () => {
      this.sceneGraphService.on(SCENE_GRAPH_EVENT.AABBChanged, handleAABBChanged);
    });

    renderingService.hooks.destroy.tap(PrepareRendererPlugin.tag, () => {
      this.sceneGraphService.off(SCENE_GRAPH_EVENT.AABBChanged, handleAABBChanged);
    });

    renderingService.hooks.mounted.tap(PrepareRendererPlugin.tag, (object: DisplayObject) => {
      const entity = object.getEntity();

      // delegate attribute-changed handler
      object.on(DISPLAY_OBJECT_EVENT.AttributeChanged, handleAttributeChanged);

      const renderable = entity.getComponent(Renderable);
      renderable.dirty = true;

      // need re-render
      this.renderingContext.renderReasons.add(RENDER_REASON.DisplayObjectChanged);
    });

    renderingService.hooks.unmounted.tap(PrepareRendererPlugin.tag, (object: DisplayObject) => {
      // console.log('unmounted', object);
      object.off(DISPLAY_OBJECT_EVENT.AttributeChanged, handleAttributeChanged);

      const entity = object.getEntity();
      const renderable = entity.getComponent(Renderable);

      if (renderable.aabb) {
        this.renderingContext.removedAABBs.push(renderable.aabb);
      }

      // need re-render
      this.renderingContext.renderReasons.add(RENDER_REASON.DisplayObjectChanged);
    });
  }
}
