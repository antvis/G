import type { DisplayObject } from '@antv/g';
import { Syringe } from '@antv/g';

export const CreateElementContribution = Syringe.defineToken('CreateElementContribution', {
  multiple: false,
});
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface CreateElementContribution {
  createElement: (object: DisplayObject) => SVGElement;
  shouldUpdateElementAttribute: (object: DisplayObject, attributeName: string) => boolean;
  updateElementAttribute: (object: DisplayObject<any, any>, $el: SVGElement) => void;
}
