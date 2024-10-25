import type { Group } from '../../display-objects';
import type { GeometryAABBUpdater } from './interfaces';

export class GroupUpdater implements GeometryAABBUpdater {
  update(object: Group) {
    return {
      cx: 0,
      cy: 0,
      hwidth: 0,
      hheight: 0,
    };
  }
}
