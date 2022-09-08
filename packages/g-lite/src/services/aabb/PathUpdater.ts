import { singleton } from '@alipay/mana-syringe';
import type { ParsedPathStyleProps } from '../../display-objects';
import { Shape } from '../../types';
import { GeometryAABBUpdater } from './interfaces';

@singleton({ token: { token: GeometryAABBUpdater, named: Shape.PATH } })
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
