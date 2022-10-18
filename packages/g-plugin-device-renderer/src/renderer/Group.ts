import type { DisplayObject } from '@antv/g-lite';
import { Batch } from './Batch';
export class GroupRenderer extends Batch {
  meshes = [];

  shouldSubmitRenderInst(object: DisplayObject, index: number) {
    return true;
  }
}
