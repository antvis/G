import type { Path } from '../../display-objects';
import type { GeometryAABBUpdater } from './interfaces';

export class PathUpdater implements GeometryAABBUpdater {
  update(object: Path) {
    const { d } = object.parsedStyle;

    const { x, y, width, height } = d.rect;
    const hwidth = width / 2;
    const hheight = height / 2;

    return {
      cx: x + hwidth,
      cy: y + hheight,
      hwidth,
      hheight,
    };
  }
}
