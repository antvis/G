import type { DisplayObject } from '@antv/g';
import { injectable, Shape } from '@antv/g';
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
