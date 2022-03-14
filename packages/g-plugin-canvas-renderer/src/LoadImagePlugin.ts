import { inject, singleton } from 'mana-syringe';
import {
  SHAPE,
  DisplayObject,
  RenderingService,
  RenderingPlugin,
  RenderingPluginContribution,
  RenderingContext,
  ElementEvent,
  FederatedEvent,
  MutationEvent,
} from '@antv/g';
import { ImagePool } from './shapes/ImagePool';
import { isString } from '@antv/util';

@singleton({ contrib: RenderingPluginContribution })
export class LoadImagePlugin implements RenderingPlugin {
  static tag = 'LoadImagePlugin';

  @inject(ImagePool)
  private imagePool: ImagePool;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  apply(renderingService: RenderingService) {
    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      const { nodeName, attributes } = object;
      if (nodeName === SHAPE.Image) {
        const { img } = attributes;

        if (isString(img)) {
          this.imagePool.getOrCreateImage(img).then(() => {
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

      if (object.nodeName === SHAPE.Image) {
        if (attrName === 'img') {
          if (isString(newValue)) {
            this.imagePool.getOrCreateImage(newValue).then(() => {
              // set dirty rectangle flag
              object.renderable.dirty = true;
              renderingService.dirtify();
            });
          }
        }
      }
    };

    renderingService.hooks.init.tap(LoadImagePlugin.tag, () => {
      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.addEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
    });

    renderingService.hooks.destroy.tap(LoadImagePlugin.tag, () => {
      this.renderingContext.root.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.removeEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
    });
  }
}
