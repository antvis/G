import { InstancedLineDrawcall } from '../drawcalls';
import { Batch } from './Batch';

/**
 * use instanced for each segment
 * @see https://blog.scottlogic.com/2019/11/18/drawing-lines-with-webgl.html
 *
 * support dash array
 * TODO: joint & cap
 */
export class LineRenderer extends Batch {
  getDrawcallCtors() {
    return [InstancedLineDrawcall];
  }
}
