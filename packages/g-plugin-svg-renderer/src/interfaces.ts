import type { DisplayObject } from '@antv/g-lite';
export interface ElementLifeCycleContribution {
  createElement: (object: DisplayObject) => SVGElement;
  shouldUpdateElementAttribute: (object: DisplayObject, attributeName: string) => boolean;
  updateElementAttribute: (object: DisplayObject, $el: SVGElement) => void;
  destroyElement: (object: DisplayObject, $el: SVGElement) => void;
}
export interface SVGRendererPluginOptions {
  outputSVGElementId: boolean;
  outputSVGElementName: boolean;
}
