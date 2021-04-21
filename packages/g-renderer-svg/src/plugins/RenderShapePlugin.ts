import {
  container,
  fromRotationTranslationScale,
  getEuler,
  Renderable,
  RENDERER,
  DisplayObjectPlugin,
  SceneGraphNode,
  SceneGraphService,
  DisplayObject,
  SHAPE,
  DisplayObjectHooks,
} from '@antv/g';
import { Entity } from '@antv/g-ecs';
import { vec3 } from 'gl-matrix';
import { inject, injectable } from 'inversify';
import { ElementSVG } from '../components/ElementSVG';
import { ElementRenderer } from '../shapes/paths';
import { createSVGElement } from '../utils/dom';

export const SHAPE_TO_TAGS: Record<SHAPE, string> = {
  [SHAPE.Rect]: 'path',
  [SHAPE.Circle]: 'circle',
  [SHAPE.Ellipse]: 'ellipse',
  [SHAPE.Image]: 'image',
  [SHAPE.Group]: 'group',
  [SHAPE.Line]: 'line',
  [SHAPE.Polyline]: 'polyline',
  [SHAPE.Polygon]: 'polygon',
  [SHAPE.Text]: 'text',
  // path: 'path',
  // marker: 'path',
  // dom: 'foreignObject',
};

export const SVG_ATTR_MAP: Record<string, string> = {
  opacity: 'opacity',
  fillStyle: 'fill',
  fill: 'fill',
  fillOpacity: 'fill-opacity',
  strokeStyle: 'stroke',
  strokeOpacity: 'stroke-opacity',
  stroke: 'stroke',
  r: 'r',
  rx: 'rx',
  ry: 'ry',
  width: 'width',
  height: 'height',
  x1: 'x1',
  x2: 'x2',
  y1: 'y1',
  y2: 'y2',
  lineCap: 'stroke-linecap',
  lineJoin: 'stroke-linejoin',
  lineWidth: 'stroke-width',
  lineDash: 'stroke-dasharray',
  lineDashOffset: 'stroke-dashoffset',
  miterLimit: 'stroke-miterlimit',
  font: 'font',
  fontSize: 'font-size',
  fontStyle: 'font-style',
  fontVariant: 'font-variant',
  fontWeight: 'font-weight',
  fontFamily: 'font-family',
  letterSpacing: 'letter-spacing',
  startArrow: 'marker-start',
  endArrow: 'marker-end',
  path: 'd',
  class: 'class',
  id: 'id',
  style: 'style',
  preserveAspectRatio: 'preserveAspectRatio',
  visibility: 'visibility',
};

@injectable()
export class RenderShapePlugin implements DisplayObjectPlugin {
  @inject(SceneGraphService)
  protected sceneGraphService: SceneGraphService;

  apply(shape: DisplayObject) {
    DisplayObjectHooks.mounted.tapPromise(
      'SVGRenderShapePlugin',
      async (renderer: RENDERER, context: SVGElement, entity: Entity) => {
        if (renderer !== RENDERER.SVG) {
          return;
        }

        const sceneGraphNode = entity.getComponent(SceneGraphNode);

        // create svg element
        const svgElement = entity.addComponent(ElementSVG);

        const type = SHAPE_TO_TAGS[sceneGraphNode.tagName];
        if (!type) {
          throw new Error(`the type ${sceneGraphNode.tagName} is not supported by svg`);
        }
        const $el = createSVGElement(type);
        $el.id = entity.getName();
        svgElement.$el = $el;

        $el.setAttribute('fill', 'none');
        if (type === SHAPE.Image) {
          $el.setAttribute('preserveAspectRatio', 'none');
        }

        // apply attributes
        for (const name in sceneGraphNode.attributes) {
          if (SVG_ATTR_MAP[name]) {
            $el.setAttribute(SVG_ATTR_MAP[name], `${sceneGraphNode.attributes[name]}`);
          }
        }

        context.appendChild($el);
      }
    );

    DisplayObjectHooks.unmounted.tapPromise(
      'SVGRenderShapePlugin',
      async (renderer: RENDERER, context: SVGElement, entity: Entity) => {
        if (renderer !== RENDERER.SVG) {
          return;
        }

        const element = entity.getComponent(ElementSVG);
        if (element) {
          element.$el = null;
        }
      }
    );

    DisplayObjectHooks.render.tap('SVGRenderShapePlugin', (renderer: RENDERER, context: SVGElement, entity: Entity) => {
      if (renderer !== RENDERER.SVG) {
        return;
      }

      const $el = entity.getComponent(ElementSVG).$el;
      if ($el) {
        // apply RTS transformation
        this.applyTransform($el, entity);

        // generate path
        const tagName = entity.getComponent(SceneGraphNode).tagName;
        if (container.isBoundNamed(ElementRenderer, tagName)) {
          const renderer = container.getNamed<ElementRenderer>(ElementRenderer, tagName);
          renderer.apply($el, entity);
        }

        // finish rendering, clear dirty flag
        const renderable = entity.getComponent(Renderable);
        renderable.dirty = false;
      }
    });

    DisplayObjectHooks.changeAttribute.tapPromise(
      'SVGRenderShapePlugin',
      async (entity: Entity, name: string, value: any) => {
        if (SVG_ATTR_MAP[name]) {
          entity.getComponent(ElementSVG)?.$el?.setAttribute(SVG_ATTR_MAP[name], `${value}`);
        }
      }
    );
  }

  private applyTransform($el: SVGElement, entity: Entity) {
    const [ex, ey, ez] = getEuler(vec3.create(), this.sceneGraphService.getRotation(entity));

    const [x, y] = this.sceneGraphService.getPosition(entity);
    const [scaleX, scaleY] = this.sceneGraphService.getScale(entity);

    // gimbal lock at 90 degrees
    const rts = fromRotationTranslationScale(ex || ez, x, y, scaleX, scaleY);

    // TODO: use proper precision avoiding too long string in `transform`
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
    $el.setAttribute('transform', `matrix(${rts[0]},${rts[1]},${rts[3]},${rts[4]},${rts[6]},${rts[7]})`);
  }
}
