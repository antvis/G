import type { DisplayObject } from '@antv/g';
import { singleton, Syringe } from 'mana-syringe';
import { createSVGElement } from './utils/dom';

export const CreateElementContribution = Syringe.defineToken('CreateElementContribution', {
  multiple: false,
});
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface CreateElementContribution {
  createElement: (object: DisplayObject) => SVGElement;
}

@singleton({ token: CreateElementContribution })
export class DefaultElementContribution implements CreateElementContribution {
  createElement(object: DisplayObject<any, any>): SVGElement {
    return createSVGElement(object.nodeName);
  }
}
