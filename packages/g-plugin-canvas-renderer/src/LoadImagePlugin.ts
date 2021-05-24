import { inject, injectable } from 'inversify';
import { SHAPE, DisplayObject, RenderingService, RenderingPlugin, Renderable } from '@antv/g';
import { ImagePool } from './shapes/ImagePool';

@injectable()
export class LoadImagePlugin implements RenderingPlugin {
  static tag = 'LoadImagePlugin';

  @inject(ImagePool)
  private imagePool: ImagePool;

  apply(renderingService: RenderingService) {
    renderingService.hooks.mounted.tap(LoadImagePlugin.tag, async (object: DisplayObject) => {
      const { nodeType, attributes } = object;
      if (nodeType === SHAPE.Image) {
        const { width = 0, height = 0, img } = attributes;
        await this.imagePool.getOrCreateImage(img, width, height);
        // set dirty rectangle flag
        object.getEntity().getComponent(Renderable).dirty = true;
      }
    });

    renderingService.hooks.attributeChanged.tap(
      LoadImagePlugin.tag,
      async (object: DisplayObject, name: string, value: string) => {
        const { nodeType } = object;
        if (nodeType === SHAPE.Image) {
          if (name === 'img') {
            await this.imagePool.getOrCreateImage(value);

            // set dirty rectangle flag
            object.getEntity().getComponent(Renderable).dirty = true;
          }
        }
      }
    );
  }
}
