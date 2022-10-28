import type {
  DisplayObject,
  FederatedEvent,
  MutationEvent,
  RenderingPlugin,
  RenderingPluginContext,
} from '@antv/g-lite';
import { ElementEvent, Shape } from '@antv/g-lite';
import { isString } from '@antv/util';

export class LoadImagePlugin implements RenderingPlugin {
  static tag = 'LoadImage';

  apply(context: RenderingPluginContext) {
    // @ts-ignore
    const { renderingService, renderingContext, imagePool } = context;
    const canvas = renderingContext.root.ownerDocument.defaultView;
    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      const { nodeName, attributes } = object;
      if (nodeName === Shape.IMAGE) {
        const { img } = attributes;

        if (isString(img)) {
          imagePool.getImageSync(img, () => {
            // set dirty rectangle flag
            object.renderable.dirty = true;
            renderingService.dirtify();
          });
        }
      }
    };

    const handleAttributeChanged = (e: MutationEvent) => {
      const object = e.target as DisplayObject;
      const { attrName, newValue } = e;

      if (object.nodeName === Shape.IMAGE) {
        if (attrName === 'img') {
          if (isString(newValue)) {
            imagePool.getOrCreateImage(newValue).then(() => {
              // set dirty rectangle flag
              object.renderable.dirty = true;
              renderingService.dirtify();
            });
          }
        }
      }
    };

    renderingService.hooks.init.tapPromise(LoadImagePlugin.tag, async () => {
      canvas.addEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.addEventListener(ElementEvent.ATTR_MODIFIED, handleAttributeChanged);
    });

    renderingService.hooks.destroy.tap(LoadImagePlugin.tag, () => {
      canvas.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.removeEventListener(ElementEvent.ATTR_MODIFIED, handleAttributeChanged);
    });
  }
}
