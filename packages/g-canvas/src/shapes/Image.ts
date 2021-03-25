import { Renderable } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import isNil from 'lodash-es/isNil';
import { BaseRenderer } from './Base';
import { ImagePool } from './ImagePool';

@injectable()
export class ImageRenderer extends BaseRenderer {
  @inject(ImagePool)
  private imagePool: ImagePool;

  onAttributeChanged(entity: Entity, name: string, value: any) {
    super.onAttributeChanged(entity, name, value);

    // reload image if `img` changed
    if (name === 'img') {
      this.imagePool.getOrCreateImage(value);
    }
  }

  isInStrokeOrPath(entity: Entity, params: { lineWidth: number; x: number; y: number }): boolean {
    return true;
  }

  generatePath() {}

  async draw(entity: Entity) {
    super.draw(entity);

    const renderable = entity.getComponent(Renderable);
    // TODO: support callback when image loaded
    const { width = 0, height = 0, img, sx, sy, swidth, sheight } = renderable.attrs;
    const context = this.contextService.getContext();
    if (context) {
      try {
        const image = await this.imagePool.getOrCreateImage(img, width, height);
        if (!isNil(sx) && !isNil(sy) && !isNil(swidth) && !isNil(sheight)) {
          context.drawImage(image, sx, sy, swidth, sheight, 0, 0, width, height);
        } else {
          context.drawImage(image, 0, 0, width, height);
        }
      } catch (e) {
        // TODO: handle image load error
        console.error(e);
      }
    }
  }
}
