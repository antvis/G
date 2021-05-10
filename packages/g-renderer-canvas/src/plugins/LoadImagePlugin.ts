import { Renderable, DisplayObjectPlugin, SceneGraphNode, SHAPE, DisplayObjectHooks } from '@antv/g';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { RENDERER } from '..';
import { ImagePool } from '../shapes/ImagePool';

/**
 * load image before rendering
 */
@injectable()
export class LoadImagePlugin implements DisplayObjectPlugin {
  @inject(ImagePool)
  private imagePool: ImagePool;

  apply() {
    DisplayObjectHooks.mounted.tapPromise(
      'LoadImagePlugin',
      async (renderer: string, context: CanvasRenderingContext2D, entity: Entity) => {
        if (renderer !== RENDERER) {
          return;
        }

        const { tagName, attributes } = entity.getComponent(SceneGraphNode);
        if (tagName === SHAPE.Image) {
          const { width = 0, height = 0, img } = attributes;
          await this.imagePool.getOrCreateImage(img, width, height);
        }
      }
    );

    DisplayObjectHooks.changeAttribute.tapPromise(
      'LoadImagePlugin',
      async (entity: Entity, name: string, value: any) => {
        const { tagName } = entity.getComponent(SceneGraphNode);
        if (tagName === SHAPE.Image) {
          if (name === 'img') {
            await this.imagePool.getOrCreateImage(value);

            // set dirty rectangle flag
            entity.getComponent(Renderable).dirty = true;
          }
        }
      }
    );
  }
}
