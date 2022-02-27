import { injectable } from 'mana-syringe';
import { DisplayObject, SHAPE } from '@antv/g';
import { Batch } from './Batch';
import { ShapeRenderer } from '../tokens';
import { ImageMesh } from '../meshes';

@injectable({
  token: [{ token: ShapeRenderer, named: SHAPE.Image }],
})
export class ImageRenderer extends Batch {
  meshes = [ImageMesh];

  shouldSubmitRenderInst(object: DisplayObject, index: number) {
    return true;
  }
}
