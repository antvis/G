import { MeshDrawcall } from '../drawcalls';
import { Batch } from './Batch';

export class MeshRenderer extends Batch {
  getDrawcallCtors() {
    return [MeshDrawcall];
  }
}
