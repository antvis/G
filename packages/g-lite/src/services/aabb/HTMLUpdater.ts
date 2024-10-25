import type { HTML } from '../../display-objects/HTML';
import type { GeometryAABBUpdater } from './interfaces';

export class HTMLUpdater implements GeometryAABBUpdater {
  update(object: HTML) {
    const { x = 0, y = 0, width = 0, height = 0 } = object.attributes;

    return {
      cx: x + width / 2,
      cy: y + height / 2,
      hwidth: width / 2,
      hheight: height / 2,
    };
  }
}
