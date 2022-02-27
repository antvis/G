import { DisplayObject, SHAPE } from '@antv/g';
import { injectable } from 'mana-syringe';
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
  token: { token: ShapeRenderer, named: SHAPE.Line },
})
export class LineRenderer extends Batch {
  meshes = [InstancedLineMesh];

  shouldSubmitRenderInst(object: DisplayObject, index: number) {
    return true;
  }
}
