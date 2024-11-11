import type {
  FederatedEvent,
  Image,
  MutationEvent,
  RenderingPlugin,
  RenderingPluginContext,
  DisplayObject,
} from '@antv/g-lite';
import { ElementEvent, Shape } from '@antv/g-lite';
import { isString } from '@antv/util';
import { ImagePool } from './ImagePool';

export class LoadImagePlugin implements RenderingPlugin {
  static tag = 'LoadImage';

  apply(context: RenderingPluginContext & { imagePool: ImagePool }) {
    const { renderingService, renderingContext, imagePool } = context;
    const canvas = renderingContext.root.ownerDocument.defaultView;

    const calculateWithAspectRatio = (
      object: Image,
      imageWidth: number,
      imageHeight: number,
    ) => {
      const { width, height } = object.parsedStyle;
      if (width && !height) {
        object.setAttribute('height', (imageHeight / imageWidth) * width);
      } else if (!width && height) {
        object.setAttribute('width', (imageWidth / imageHeight) * height);
      }
    };

    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as Image;
      const { nodeName, attributes } = object;
      if (nodeName === Shape.IMAGE) {
        const { src, keepAspectRatio } = attributes;

        imagePool.getImageSync(
          src,
          object as DisplayObject,
          ({ img: { width, height } }) => {
            if (keepAspectRatio) {
              calculateWithAspectRatio(object, width, height);
            }

            // set dirty rectangle flag
            object.renderable.dirty = true;
            renderingService.dirtify();
          },
        );
      }
    };

    const handleAttributeChanged = (e: MutationEvent) => {
      const object = e.target as Image;
      const { attrName, prevValue, newValue } = e;

      if (object.nodeName !== Shape.IMAGE || attrName !== 'src') {
        return;
      }

      if (prevValue !== newValue) {
        imagePool.releaseImage(
          prevValue as Image['attributes']['src'],
          object as DisplayObject,
        );
      }

      if (isString(newValue)) {
        imagePool
          .getOrCreateImage(newValue, object as DisplayObject)
          .then(({ img: { width, height } }) => {
            if (object.attributes.keepAspectRatio) {
              calculateWithAspectRatio(object, width, height);
            }

            // set dirty rectangle flag
            object.renderable.dirty = true;
            renderingService.dirtify();
          })
          .catch(() => {
            //
          });
      }
    };

    renderingService.hooks.init.tap(LoadImagePlugin.tag, () => {
      canvas.addEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.addEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
    });

    renderingService.hooks.destroy.tap(LoadImagePlugin.tag, () => {
      canvas.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.removeEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
    });
  }
}
