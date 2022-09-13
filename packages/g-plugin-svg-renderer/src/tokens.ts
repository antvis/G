import type { DisplayObject } from '@antv/g-lite';
import { Syringe } from '@antv/g-lite';

export const ElementLifeCycleContribution = Syringe.defineToken('', {
  multiple: false,
});
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface ElementLifeCycleContribution {
  createElement: (object: DisplayObject) => SVGElement;
  shouldUpdateElementAttribute: (object: DisplayObject, attributeName: string) => boolean;
  updateElementAttribute: (object: DisplayObject, $el: SVGElement) => void;
  destroyElement: (object: DisplayObject, $el: SVGElement) => void;
}

export const SVGRendererPluginOptions = Syringe.defineToken('');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface SVGRendererPluginOptions {
  outputSVGElementId: boolean;
}
