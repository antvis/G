import type { DisplayObject } from '@antv/g-lite';
import { injectable, Shape } from '@antv/g-lite';
import { ImageMesh } from '../meshes';
import { ShapeRenderer } from '../tokens';
import { Batch } from './Batch';

@injectable({
  token: [{ token: ShapeRenderer, named: Shape.IMAGE }],
})
export class ImageRenderer extends Batch {
  meshes = [ImageMesh];

  shouldSubmitRenderInst(object: DisplayObject, index: number) {
    return true;
  }
}
