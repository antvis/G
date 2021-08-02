import { inject, injectable } from 'inversify';
import { SHAPE, DisplayObject, RenderingService, RenderingPlugin, Renderable } from '@antv/g';
import { ImagePool } from './shapes/ImagePool';
import { isString } from '@antv/util';

@injectable()
export class LoadImagePlugin implements RenderingPlugin {
  static tag = 'LoadImagePlugin';

  @inject(ImagePool)
  private imagePool: ImagePool;

  apply(renderingService: RenderingService) {
    renderingService.hooks.mounted.tap(LoadImagePlugin.tag, (object: DisplayObject) => {
      const { nodeName, attributes } = object;
      if (nodeName === SHAPE.Image) {
        const { img } = attributes;

        if (isString(img)) {
          this.imagePool.getOrCreateImage(img).then(() => {
            // set dirty rectangle flag
            object.getEntity().getComponent(Renderable).dirty = true;
            renderingService.dirtify();
          });
        }
      }
    });

    renderingService.hooks.attributeChanged.tap(
      LoadImagePlugin.tag,
      (object: DisplayObject, name: string, value: string) => {
        const { nodeName } = object;
        if (nodeName === SHAPE.Image) {
          if (name === 'img') {
            if (isString(value)) {
              this.imagePool.getOrCreateImage(value).then(() => {
                // set dirty rectangle flag
                object.getEntity().getComponent(Renderable).dirty = true;
                renderingService.dirtify();
              });
            }
          }
        }
      }
    );
  }
}
