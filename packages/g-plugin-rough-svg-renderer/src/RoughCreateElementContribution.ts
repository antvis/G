import type {
  DisplayObject,
  ParsedCircleStyleProps,
  ParsedEllipseStyleProps,
  ParsedLineStyleProps,
  ParsedPathStyleProps,
  ParsedPolygonStyleProps,
  ParsedPolylineStyleProps,
  ParsedRectStyleProps,
} from '@antv/g';
import { CanvasConfig, ContextService, Shape } from '@antv/g';
import {
  CreateElementContribution,
  createSVGElement,
  ElementSVG,
  SHAPE2TAGS,
  SHAPE_UPDATE_DEPS,
  updateImageElementAttribute,
  updateTextElementAttribute,
} from '@antv/g-plugin-svg-renderer';
import { inject, singleton } from 'mana-syringe';
import type { RoughSVG } from 'roughjs/bin/svg';
import { formatPath, generateRoughOptions, SUPPORTED_ROUGH_OPTIONS } from './util';

@singleton({ token: CreateElementContribution })
export class RoughCreateElementContribution implements CreateElementContribution {
  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContextService)
  private contextService: ContextService<SVGSVGElement>;

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
        return this.wrapGroup(this.generateSVGElement(object));
      case Shape.GROUP:
      case Shape.IMAGE:
      case Shape.TEXT:
      case Shape.HTML:
        const { document: doc } = this.canvasConfig;
        const type = SHAPE2TAGS[nodeName] || 'g';
        return createSVGElement(type, doc || document);
    }
    return null;
  }

  private wrapGroup($el: SVGElement): SVGElement {
    $el.setAttribute('data-wrapgroup', '1');
    return $el;
  }

  shouldUpdateElementAttribute(object: DisplayObject, attributeName: string) {
    const { nodeName } = object;
    return (
      [...(SHAPE_UPDATE_DEPS[nodeName] || []), ...SUPPORTED_ROUGH_OPTIONS].indexOf(attributeName) >
      -1
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
        const $updatedEl = this.generateSVGElement(object);

        // replace old element
        $el.parentElement.replaceChild($updatedEl, $el);
        // @ts-ignore
        (object.elementSVG as ElementSVG).$el = $updatedEl;
        break;
      }
      case Shape.IMAGE: {
        updateImageElementAttribute($el, parsedStyle);
        break;
      }
      case Shape.TEXT: {
        updateTextElementAttribute($el, parsedStyle);
        break;
      }
    }
  }

  private generateSVGElement(object: DisplayObject<any, any>) {
    const { nodeName, parsedStyle } = object;
    // @ts-ignore
    const roughSVG = this.contextService.getContext().roughSVG as unknown as RoughSVG;
    switch (nodeName) {
      case Shape.CIRCLE: {
        const { r } = parsedStyle as ParsedCircleStyleProps;
        // rough.js use diameter instead of radius
        // @see https://github.com/rough-stuff/rough/wiki#circle-x-y-diameter--options
        return roughSVG.circle(r.value, r.value, r.value * 2, generateRoughOptions(object));
      }
      case Shape.ELLIPSE: {
        const { rx, ry } = parsedStyle as ParsedEllipseStyleProps;
        return roughSVG.ellipse(
          rx.value,
          ry.value,
          rx.value * 2,
          ry.value * 2,
          generateRoughOptions(object),
        );
      }
      case Shape.RECT: {
        const { width, height } = parsedStyle as ParsedRectStyleProps;
        // @see https://github.com/rough-stuff/rough/wiki#rectangle-x-y-width-height--options
        return roughSVG.rectangle(0, 0, width.value, height.value, generateRoughOptions(object));
      }
      case Shape.LINE: {
        const { x1, y1, x2, y2, defX = 0, defY = 0 } = parsedStyle as ParsedLineStyleProps;
        // @see https://github.com/rough-stuff/rough/wiki#line-x1-y1-x2-y2--options
        return roughSVG.line(
          x1.value - defX,
          y1.value - defY,
          x2.value - defX,
          y2.value - defY,
          generateRoughOptions(object),
        );
      }
      case Shape.POLYLINE: {
        const { points, defX = 0, defY = 0 } = parsedStyle as ParsedPolylineStyleProps;
        // @see https://github.com/rough-stuff/rough/wiki#linearpath-points--options
        return this.wrapGroup(
          roughSVG.linearPath(
            points.points.map(([x, y]) => [x - defX, y - defY]),
            generateRoughOptions(object),
          ),
        );
      }
      case Shape.POLYGON: {
        const { points, defX = 0, defY = 0 } = parsedStyle as ParsedPolygonStyleProps;
        // @see https://github.com/rough-stuff/rough/wiki#polygon-vertices--options
        return roughSVG.polygon(
          points.points.map(([x, y]) => [x - defX, y - defY]),
          generateRoughOptions(object),
        );
      }
      case Shape.PATH: {
        const { path, defX = 0, defY = 0 } = parsedStyle as ParsedPathStyleProps;
        const formatted = formatPath(path.absolutePath, defX, defY);
        return roughSVG.path(formatted, generateRoughOptions(object));
      }
    }
  }
}
