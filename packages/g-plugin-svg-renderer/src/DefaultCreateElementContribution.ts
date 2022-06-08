import type { DisplayObject } from '@antv/g';
import { CanvasConfig, inject, Shape, singleton } from '@antv/g';
import {
  updateImageElementAttribute,
  updateLineElementAttribute,
  updatePathElementAttribute,
  updatePolylineElementAttribute,
  updateRectElementAttribute,
  updateTextElementAttribute,
} from './shapes/paths';
import { CreateElementContribution } from './tokens';
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
  [Shape.LINE]: ['x1', 'y1', 'x2', 'y2'],
  [Shape.POLYLINE]: ['points'],
  [Shape.POLYGON]: ['points'],
  [Shape.PATH]: ['path'],
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
    'whiteSpace',
    'dx',
    'dy',
  ],
};

@singleton({ token: CreateElementContribution })
export class DefaultCreateElementContribution implements CreateElementContribution {
  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  createElement(object: DisplayObject<any, any>): SVGElement {
    const { document: doc } = this.canvasConfig;

    const type = SHAPE2TAGS[object.nodeName] || 'g';
    return createSVGElement(type, doc || document);
  }

  shouldUpdateElementAttribute(object: DisplayObject<any, any>, attributeName: string) {
    const { nodeName } = object;
    return (SHAPE_UPDATE_DEPS[nodeName] || []).indexOf(attributeName) > -1;
  }

  updateElementAttribute(object: DisplayObject<any, any>) {
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
