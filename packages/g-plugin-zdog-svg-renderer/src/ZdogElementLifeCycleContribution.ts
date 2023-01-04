import type {
  CanvasContext,
  DisplayObject,
  ParsedCircleStyleProps,
  ParsedEllipseStyleProps,
  ParsedLineStyleProps,
  ParsedPathStyleProps,
  ParsedPolygonStyleProps,
  ParsedPolylineStyleProps,
  ParsedRectStyleProps,
} from '@antv/g-lite';
import { Shape, translatePathToString } from '@antv/g-lite';
import { SVGRenderer } from '@antv/g-svg';
import { Anchor, Ellipse } from 'zdog';

export class ZdogElementLifeCycleContribution
  implements SVGRenderer.ElementLifeCycleContribution
{
  constructor(private context: CanvasContext) {}

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

  private wrapGroup($el: SVGElement): SVGElement {
    $el.setAttribute('data-wrapgroup', '1');
    return $el;
  }

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
        SVGRenderer.updateTextElementAttribute($el, parsedStyle);
        break;
      }
    }
  }

  private generateSVGElement(object: DisplayObject<any, any>) {
    const { nodeName, parsedStyle } = object;
    const $svg = this.context.contextService.getContext();
    // @ts-ignore
    const scene = $svg.scene as Anchor;

    switch (nodeName) {
      case Shape.CIRCLE: {
        // const { cx, cy, r, lineWidth, fill } = parsedStyle as ParsedCircleStyleProps;
        // const c = new Ellipse({
        //   addTo: scene,
        //   diameter: 2 * r,
        //   stroke: lineWidth,
        //   color: fill.toString(),
        //   translate: {
        //     x: 200,
        //     y: 200,
        //     z: 40,
        //   },
        // });
        break;
      }
      case Shape.ELLIPSE: {
        break;
      }
      case Shape.RECT: {
        break;
      }
      case Shape.LINE: {
        break;
      }
      case Shape.POLYLINE: {
        break;
      }
      case Shape.POLYGON: {
        break;
      }
      case Shape.PATH: {
        break;
      }
    }

    // if ($roughG) {
    //   for (let i = 0; i < $roughG.children.length; i++) {
    //     // <g> cannot be a target for hit testing
    //     // @see https://bugzilla.mozilla.org/show_bug.cgi?id=1428780
    //     $roughG.children[
    //       i
    //     ].id = `${SVGRenderer.G_SVG_PREFIX}-${object.nodeName}-rough${i}-${object.entity}`;
    //   }
    // }

    // return $roughG;
  }
}
