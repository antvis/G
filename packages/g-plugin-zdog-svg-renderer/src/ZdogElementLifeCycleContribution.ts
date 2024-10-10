import type {
  CanvasContext,
  DisplayObject,
  GlobalRuntime,
  Text,
  // ParsedCircleStyleProps,
  // ParsedEllipseStyleProps,
  // ParsedLineStyleProps,
  // ParsedPathStyleProps,
  // ParsedPolygonStyleProps,
  // ParsedPolylineStyleProps,
  // ParsedRectStyleProps,
} from '@antv/g-lite';
import { Shape } from '@antv/g-lite';
import { SVGRenderer } from '@antv/g-svg';

export class ZdogElementLifeCycleContribution
  implements SVGRenderer.ElementLifeCycleContribution
{
  constructor(
    private context: CanvasContext,
    private runtime: GlobalRuntime,
  ) {}

  createElement(object: DisplayObject<any, any>): SVGElement {
    const { nodeName } = object;

    switch (nodeName) {
      case Shape.CIRCLE:
      case Shape.ELLIPSE:
      case Shape.RECT:
      case Shape.LINE:
      case Shape.POLYGON:
      case Shape.POLYLINE:
      case Shape.PATH:
      // this.generateSVGElement(object);
      // return null;
      case Shape.GROUP:
      case Shape.IMAGE:
      case Shape.TEXT:
      case Shape.HTML:
      // const { document: doc } = this.context.config;
      // const type = SVGRenderer.SHAPE2TAGS[nodeName] || 'g';
      // return SVGRenderer.createSVGElement(type, doc || document);
    }
    return null;
  }

  destroyElement(object: DisplayObject, $el: SVGElement) {}

  shouldUpdateElementAttribute(object: DisplayObject, attributeName: string) {
    const { nodeName } = object;
    return (
      [
        ...(SVGRenderer.SHAPE_UPDATE_DEPS[nodeName] || []),
        // , ...SUPPORTED_ROUGH_OPTIONS
      ].indexOf(attributeName) > -1
    );
  }

  updateElementAttribute(object: DisplayObject<any, any>, $el: SVGElement) {
    const { nodeName, parsedStyle } = object;
    switch (nodeName) {
      case Shape.CIRCLE:
      case Shape.ELLIPSE:
      case Shape.RECT:
      case Shape.LINE:
      case Shape.POLYGON:
      case Shape.POLYLINE:
      case Shape.PATH: {
        // regenerate rough path
        // this.generateSVGElement(object);
        // const $updatedChildren = [];
        // for (let i = 0; i < $updatedEl.childNodes.length; i++) {
        //   $updatedChildren.push($updatedEl.childNodes[i]);
        // }
        // // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/replaceChildren
        // $el.replaceChildren(...$updatedChildren);
        break;
      }
      case Shape.IMAGE: {
        SVGRenderer.updateImageElementAttribute($el, parsedStyle);
        break;
      }
      case Shape.TEXT: {
        SVGRenderer.updateTextElementAttribute(
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
