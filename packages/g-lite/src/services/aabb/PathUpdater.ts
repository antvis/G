import { singleton } from 'tsyringe';
import type { ParsedPathStyleProps } from '../../display-objects';
import { GeometryAABBUpdater } from './interfaces';

@singleton()
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
