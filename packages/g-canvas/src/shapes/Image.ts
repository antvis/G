import { Renderable, SceneGraphNode } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { isNil } from '@antv/util';
import { BaseRenderer } from './Base';
import { ImagePool } from './ImagePool';

@injectable()
export class ImageRenderer extends BaseRenderer {
  @inject(ImagePool)
  private imagePool: ImagePool;

  async onAttributeChanged(entity: Entity, name: string, value: any) {
    await super.onAttributeChanged(entity, name, value);
    const renderable = entity.getComponent(Renderable);

    // reload image if `img` changed
    if (name === 'img') {
      await this.imagePool.getOrCreateImage(value);

      // set dirty rectangle flag
      renderable.dirty = true;
    }
  }

  isInStrokeOrPath(entity: Entity, params: { lineWidth: number; x: number; y: number }): boolean {
    return true;
  }

  async prepare(context: CanvasRenderingContext2D, entity: Entity) {
    const { width = 0, height = 0, img } = entity.getComponent(SceneGraphNode).attributes;
    await this.imagePool.getOrCreateImage(img, width, height);
  }

  finishRenderingPath(context: CanvasRenderingContext2D, entity: Entity) {
    const { width = 0, height = 0, img, sx, sy, swidth, sheight, anchor = [0, 0] } = entity.getComponent(
      SceneGraphNode
    ).attributes;
    try {
      const image = this.imagePool.getImageSync(img);
      if (!isNil(sx) && !isNil(sy) && !isNil(swidth) && !isNil(sheight)) {
        context.drawImage(image, sx, sy, swidth, sheight, -anchor[0] * width, -anchor[1] * height, width, height);
      } else {
        context.drawImage(image, -anchor[0] * width, -anchor[1] * height, width, height);
      }
    } catch (e) {
      // TODO: handle image load error
      console.error(e);
    }
  }
}
