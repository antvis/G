import { injectable } from 'mana-syringe';
import { DisplayObject, Shape } from '@antv/g';
import { Batch } from './Batch';
import { ShapeRenderer } from '../tokens';
import { ImageMesh } from '../meshes';

@injectable({
  token: [{ token: ShapeRenderer, named: Shape.IMAGE }],
})
export class ImageRenderer extends Batch {
  meshes = [ImageMesh];

  shouldSubmitRenderInst(object: DisplayObject, index: number) {
    return true;
  }
}
