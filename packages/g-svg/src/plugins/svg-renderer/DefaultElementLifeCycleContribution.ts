import type {
  CanvasContext,
  DisplayObject,
  GlobalRuntime,
  Text,
} from '@antv/g-lite';
import { Shape } from '@antv/g-lite';
import {
  updateImageElementAttribute,
  updateLineElementAttribute,
  updatePathElementAttribute,
  updatePolylineElementAttribute,
  updateRectElementAttribute,
  updateTextElementAttribute,
} from './shapes/paths';
import type { ElementLifeCycleContribution } from './interfaces';
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
  [Shape.CIRCLE]: ['cx', 'cy', 'r'],
  [Shape.ELLIPSE]: ['cx', 'cy', 'rx', 'ry'],
  [Shape.RECT]: ['x', 'y', 'width', 'height', 'radius'],
  [Shape.IMAGE]: ['x', 'y', 'src', 'width', 'height'],
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
    'd',
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
    'maxLines',
    'leading',
    'textBaseline',
    'textAlign',
    'textTransform',
    'textOverflow',
    'textPath',
    'textPathSide',
    'textPathStartOffset',
    'textDecorationLine',
    'textDecorationColor',
    'textDecorationStyle',
    // 'whiteSpace',
    'dx',
    'dy',
  ],
};

export class DefaultElementLifeCycleContribution
  implements ElementLifeCycleContribution
{
  constructor(
    private context: CanvasContext,
    private runtime: GlobalRuntime,
  ) {}

  createElement(
    object: DisplayObject,
    svgElementMap: WeakMap<SVGElement, DisplayObject>,
  ): SVGElement {
    const { document: doc } = this.context.config;

    const type = SHAPE2TAGS[object.nodeName] || 'g';
    const $el = createSVGElement(type, doc || document);

    svgElementMap.set($el, object);
    return $el;
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
        updateTextElementAttribute(
          $el,
          parsedStyle,
          object as Text,
          this.runtime,
        );
        break;
      }
    }
  }
}
