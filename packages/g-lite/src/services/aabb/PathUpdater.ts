import type { ParsedPathStyleProps } from '../../display-objects';
import type { GeometryAABBUpdater } from './interfaces';
export class PathUpdater implements GeometryAABBUpdater<ParsedPathStyleProps> {
  update(parsedStyle: ParsedPathStyleProps) {
    const { path } = parsedStyle;

    const { x, y, width, height } = path.rect;
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
