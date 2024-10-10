import type { Group, ParsedImageStyleProps } from '../../display-objects';
import type { GeometryAABBUpdater } from './interfaces';

export class GroupUpdater
  implements GeometryAABBUpdater<ParsedImageStyleProps>
{
  update(parsedStyle: ParsedImageStyleProps, object: Group) {
    return {
      cx: 0,
      cy: 0,
      hwidth: 0,
      hheight: 0,
    };
  }
}
