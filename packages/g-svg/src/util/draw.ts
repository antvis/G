import { IElement } from '@antv/g-base/lib/interfaces';
import { ISVGElement } from '../interfaces';
import { SVG_ATTR_MAP } from '../constant';
import Defs from '../defs';

export function drawChildren(context: Defs, children: IElement[]) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as ISVGElement;
    child.draw(context);
  }
}
