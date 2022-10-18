import type { DisplayObject } from '@antv/g-lite';
import { ImageMesh } from '../meshes';
import { Batch } from './Batch';
export class ImageRenderer extends Batch {
  meshes = [ImageMesh];

  shouldSubmitRenderInst(object: DisplayObject, index: number) {
    return true;
  }
}
