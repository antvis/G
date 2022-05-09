import { inject, singleton } from 'mana-syringe';
import type {
  DisplayObject,
  RenderingService,
  RenderingPlugin,
  FederatedEvent,
  MutationEvent,
} from '@antv/g';
import {
  Shape,
  RenderingPluginContribution,
  RenderingContext,
  ElementEvent,
  isString,
} from '@antv/g';
import { ImagePool } from './shapes/ImagePool';

@singleton({ contrib: RenderingPluginContribution })
export class LoadImagePlugin implements RenderingPlugin {
  static tag = 'LoadImage';

  @inject(ImagePool)
  private imagePool: ImagePool;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  apply(renderingService: RenderingService) {
    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      const { nodeName, attributes } = object;
      if (nodeName === Shape.IMAGE) {
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

      if (object.nodeName === Shape.IMAGE) {
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

    renderingService.hooks.init.tapPromise(LoadImagePlugin.tag, async () => {
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
