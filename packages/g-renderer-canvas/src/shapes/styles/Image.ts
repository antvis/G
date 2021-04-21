import { SceneGraphNode } from '@antv/g';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { isNil } from '@antv/util';
import { ImagePool } from '../ImagePool';
import { StyleRenderer } from '.';

@injectable()
export class ImageRenderer implements StyleRenderer {
  @inject(ImagePool)
  private imagePool: ImagePool;

  render(context: CanvasRenderingContext2D, entity: Entity) {
    const { attributes } = entity.getComponent(SceneGraphNode);
    const { width = 0, height = 0, img, sx, sy, swidth, sheight, anchor = [0, 0] } = attributes;
    // image has been loaded in `mounted` hook
    const image = this.imagePool.getImageSync(img);
    if (!isNil(sx) && !isNil(sy) && !isNil(swidth) && !isNil(sheight)) {
      context.drawImage(image, sx, sy, swidth, sheight, -anchor[0] * width, -anchor[1] * height, width, height);
    } else {
      context.drawImage(image, -anchor[0] * width, -anchor[1] * height, width, height);
    }
  }
}
