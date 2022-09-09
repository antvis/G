import type { DisplayObject } from '@antv/g-lite';
import { injectable, Shape } from '@antv/g-lite';
import { InstancedLineMesh } from '../meshes';
import { ShapeRenderer } from '../tokens';
import { Batch } from './Batch';

/**
 * use instanced for each segment
 * @see https://blog.scottlogic.com/2019/11/18/drawing-lines-with-webgl.html
 *
 * support dash array
 * TODO: joint & cap
 */
@injectable({
  token: { token: ShapeRenderer, named: Shape.LINE },
})
export class LineRenderer extends Batch {
  meshes = [InstancedLineMesh];

  shouldSubmitRenderInst(object: DisplayObject, index: number) {
    return true;
  }
}
