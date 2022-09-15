import type { DisplayObject } from '@antv/g-lite';
import { CanvasConfig, inject, Shape, singleton } from '@antv/g-lite';
import {
  updateImageElementAttribute,
  updateLineElementAttribute,
  updatePathElementAttribute,
  updatePolylineElementAttribute,
  updateRectElementAttribute,
  updateTextElementAttribute,
} from './shapes/paths';
import { ElementLifeCycleContribution } from './tokens';
import { createSVGElement } from './utils/dom';

export const SHAPE2TAGS: Record<Shape | string, string> = {
  [Shape.RECT]: 'path',
  [Shape.CIRCLE]: 'circle',
  [Shape.ELLIPSE]: 'ellipse',
  [Shape.IMAGE]: 'image',
  [Shape.GROUP]: 'g',
  [Shape.LINE]: 'line',
  [Shape.POLYLINE]: 'polyline',
  [Shape.POLYGON]: 'polygon',
  [Shape.TEXT]: 'text',
  [Shape.PATH]: 'path',
  [Shape.HTML]: 'foreignObject',
};

export const SHAPE_UPDATE_DEPS: Record<Shape | string, string[]> = {
  [Shape.CIRCLE]: ['r'],
  [Shape.ELLIPSE]: ['rx', 'ry'],
  [Shape.RECT]: ['width', 'height', 'radius'],
  [Shape.IMAGE]: ['img', 'width', 'height'],
  [Shape.LINE]: [
    'x1',
    'y1',
    'x2',
    'y2',
    'markerStart',
    'markerEnd',
    'markerStartOffset',
    'markerEndOffset',
  ],
  [Shape.POLYLINE]: [
    'points',
    'markerStart',
    'markerEnd',
    'markerMid',
    'markerStartOffset',
    'markerEndOffset',
  ],
  [Shape.POLYGON]: [
    'points',
    'markerStart',
    'markerEnd',
    'markerMid',
    'markerStartOffset',
    'markerEndOffset',
  ],
  [Shape.PATH]: [
    'path',
    'markerStart',
    'markerEnd',
    'markerMid',
    'markerStartOffset',
    'markerEndOffset',
  ],
  [Shape.TEXT]: [
    'text',
    'font',
    'fontSize',
    'fontFamily',
    'fontStyle',
    'fontWeight',
    'fontVariant',
    'lineHeight',
    'letterSpacing',
    'wordWrap',
    'wordWrapWidth',
    'leading',
    'textBaseline',
    'textAlign',
    'textTransform',
    // 'whiteSpace',
    'dx',
    'dy',
  ],
};

@singleton({ token: ElementLifeCycleContribution })
export class DefaultElementLifeCycleContribution implements ElementLifeCycleContribution {
  constructor(
    @inject(CanvasConfig)
    private canvasConfig: CanvasConfig,
  ) {}

  createElement(object: DisplayObject): SVGElement {
    const { document: doc } = this.canvasConfig;

    const type = SHAPE2TAGS[object.nodeName] || 'g';
    return createSVGElement(type, doc || document);
  }

  destroyElement(object: DisplayObject, $el: SVGElement) {}

  shouldUpdateElementAttribute(object: DisplayObject, attributeName: string) {
    const { nodeName } = object;
    return (SHAPE_UPDATE_DEPS[nodeName] || []).indexOf(attributeName) > -1;
  }

  updateElementAttribute(object: DisplayObject) {
    // @ts-ignore
    const { $el } = object.elementSVG as ElementSVG;
    const { nodeName, parsedStyle } = object;

    switch (nodeName) {
      case Shape.IMAGE: {
        updateImageElementAttribute($el, parsedStyle);
        break;
      }
      case Shape.RECT: {
        updateRectElementAttribute($el, parsedStyle);
        break;
      }
      case Shape.LINE: {
        updateLineElementAttribute($el, parsedStyle);
        break;
      }
      case Shape.POLYGON:
      case Shape.POLYLINE: {
        updatePolylineElementAttribute($el, parsedStyle);
        break;
      }
      case Shape.PATH: {
        updatePathElementAttribute($el, parsedStyle);
        break;
      }
      case Shape.TEXT: {
        updateTextElementAttribute($el, parsedStyle);
        break;
      }
    }
  }
}
