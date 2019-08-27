import { IElement } from '@antv/g-base/lib/interfaces';
import Defs from './defs';

export interface ISVGElement extends IElement {
  draw(context: Defs);
}
