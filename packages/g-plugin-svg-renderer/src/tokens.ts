import type { DisplayObject } from '@antv/g';
import { Syringe } from '@antv/g';

export const ElementLifeCycleContribution = Syringe.defineToken('ElementLifeCycleContribution', {
  multiple: false,
});
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface ElementLifeCycleContribution {
  createElement: (object: DisplayObject) => SVGElement;
  shouldUpdateElementAttribute: (object: DisplayObject, attributeName: string) => boolean;
  updateElementAttribute: (object: DisplayObject, $el: SVGElement) => void;
  destroyElement: (object: DisplayObject, $el: SVGElement) => void;
}
