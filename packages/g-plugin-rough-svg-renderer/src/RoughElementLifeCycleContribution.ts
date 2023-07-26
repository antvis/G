import type {
  CanvasContext,
  DisplayObject,
  GlobalRuntime,
  ParsedCircleStyleProps,
  ParsedEllipseStyleProps,
  ParsedLineStyleProps,
  ParsedPathStyleProps,
  ParsedPolygonStyleProps,
  ParsedPolylineStyleProps,
  ParsedRectStyleProps,
  Text,
} from '@antv/g-lite';
import { Shape, translatePathToString } from '@antv/g-lite';
import { SVGRenderer } from '@antv/g-svg';
import type { RoughSVG } from 'roughjs/bin/svg';
import { generateRoughOptions, SUPPORTED_ROUGH_OPTIONS } from './util';

export class RoughElementLifeCycleContribution
  implements SVGRenderer.ElementLifeCycleContribution
{
  constructor(private context: CanvasContext, private runtime: GlobalRuntime) {}

  createElement(
    object: DisplayObject<any, any>,
    svgElementMap: WeakMap<SVGElement, DisplayObject>,
  ): SVGElement {
    const { nodeName } = object;

    switch (nodeName) {
      case Shape.CIRCLE:
      case Shape.ELLIPSE:
      case Shape.RECT:
      case Shape.LINE:
      case Shape.POLYGON:
      case Shape.POLYLINE:
      case Shape.PATH:
        return this.wrapGroup(this.generateSVGElement(object, svgElementMap));
      case Shape.GROUP:
      case Shape.IMAGE:
      case Shape.TEXT:
      case Shape.HTML:
        const { document: doc } = this.context.config;
        const type = SVGRenderer.SHAPE2TAGS[nodeName] || 'g';
        return SVGRenderer.createSVGElement(type, doc || document);
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
        ...SUPPORTED_ROUGH_OPTIONS,
      ].indexOf(attributeName) > -1
    );
  }

  updateElementAttribute(
    object: DisplayObject<any, any>,
    $el: SVGElement,
    svgElementMap: WeakMap<SVGElement, DisplayObject>,
  ) {
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
        const $updatedEl = this.generateSVGElement(object, svgElementMap);
        const $updatedChildren = [];
        for (let i = 0; i < $updatedEl.childNodes.length; i++) {
          $updatedChildren.push($updatedEl.childNodes[i]);
        }
        // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/replaceChildren
        $el.replaceChildren(...$updatedChildren);
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

  private generateSVGElement(
    object: DisplayObject<any, any>,
    svgElementMap: WeakMap<SVGElement, DisplayObject>,
  ) {
    const { nodeName, parsedStyle } = object;

    const roughSVG = // @ts-ignore
      this.context.contextService.getContext().roughSVG as unknown as RoughSVG;

    let $roughG: SVGGElement = null;

    switch (nodeName) {
      case Shape.CIRCLE: {
        const { r } = parsedStyle as ParsedCircleStyleProps;
        // rough.js use diameter instead of radius
        // @see https://github.com/rough-stuff/rough/wiki#circle-x-y-diameter--options
        $roughG = roughSVG.circle(r, r, r * 2, generateRoughOptions(object));
        break;
      }
      case Shape.ELLIPSE: {
        const { rx, ry } = parsedStyle as ParsedEllipseStyleProps;
        $roughG = roughSVG.ellipse(
          rx,
          ry,
          rx * 2,
          ry * 2,
          generateRoughOptions(object),
        );
        break;
      }
      case Shape.RECT: {
        const { width, height } = parsedStyle as ParsedRectStyleProps;
        // @see https://github.com/rough-stuff/rough/wiki#rectangle-x-y-width-height--options
        $roughG = roughSVG.rectangle(
          0,
          0,
          width,
          height,
          generateRoughOptions(object),
        );
        break;
      }
      case Shape.LINE: {
        const {
          x1,
          y1,
          x2,
          y2,
          defX = 0,
          defY = 0,
        } = parsedStyle as ParsedLineStyleProps;
        // @see https://github.com/rough-stuff/rough/wiki#line-x1-y1-x2-y2--options
        $roughG = roughSVG.line(
          x1 - defX,
          y1 - defY,
          x2 - defX,
          y2 - defY,
          generateRoughOptions(object),
        );
        break;
      }
      case Shape.POLYLINE: {
        const {
          points,
          defX = 0,
          defY = 0,
        } = parsedStyle as ParsedPolylineStyleProps;
        // @see https://github.com/rough-stuff/rough/wiki#linearpath-points--options
        $roughG = roughSVG.linearPath(
          points.points.map(([x, y]) => [x - defX, y - defY]),
          generateRoughOptions(object),
        );
        break;
      }
      case Shape.POLYGON: {
        const {
          points,
          defX = 0,
          defY = 0,
        } = parsedStyle as ParsedPolygonStyleProps;
        // @see https://github.com/rough-stuff/rough/wiki#polygon-vertices--options
        $roughG = roughSVG.polygon(
          points.points.map(([x, y]) => [x - defX, y - defY]),
          generateRoughOptions(object),
        );
        break;
      }
      case Shape.PATH: {
        const {
          path,
          defX = 0,
          defY = 0,
        } = parsedStyle as ParsedPathStyleProps;
        $roughG = roughSVG.path(
          translatePathToString(path.absolutePath, defX, defY),
          generateRoughOptions(object),
        );
        break;
      }
    }

    if ($roughG) {
      for (let i = 0; i < $roughG.children.length; i++) {
        // <g> cannot be a target for hit testing
        // @see https://bugzilla.mozilla.org/show_bug.cgi?id=1428780
        svgElementMap.set($roughG.children[i] as SVGElement, object);
      }
    }

    return $roughG;
  }
}
