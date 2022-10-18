import type { ParsedPathStyleProps } from '../../display-objects';
import type { GeometryAABBUpdater } from './interfaces';
export class PathUpdater implements GeometryAABBUpdater<ParsedPathStyleProps> {
  update(parsedStyle: ParsedPathStyleProps) {
    const { path } = parsedStyle;

    const { width, height } = path.rect;

    return {
      width,
      height,
    };
  }
}
