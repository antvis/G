import type { DisplayObject } from '@antv/g-lite';

export const ElementLifeCycleContribution = Symbol('ElementLifeCycleContribution');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface ElementLifeCycleContribution {
  createElement: (object: DisplayObject) => SVGElement;
  shouldUpdateElementAttribute: (object: DisplayObject, attributeName: string) => boolean;
  updateElementAttribute: (object: DisplayObject, $el: SVGElement) => void;
  destroyElement: (object: DisplayObject, $el: SVGElement) => void;
}
