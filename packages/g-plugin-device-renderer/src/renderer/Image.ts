import { ImageDrawcall } from '../drawcalls';
import { Batch } from './Batch';

export class ImageRenderer extends Batch {
  getDrawcallCtors() {
    return [ImageDrawcall];
  }
}
