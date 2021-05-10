import {
  container,
  fromRotationTranslationScale,
  getEuler,
  Renderable,
  DisplayObjectPlugin,
  SceneGraphNode,
  SceneGraphService,
  SHAPE,
  DisplayObjectHooks,
  Sortable,
} from '@antv/g';
import { Entity } from '@antv/g-ecs';
import { vec3 } from 'gl-matrix';
import { inject, injectable } from 'inversify';
import { RENDERER } from '..';
import { ElementSVG } from '../components/ElementSVG';
import { ElementRenderer } from '../shapes/paths';
import { createSVGElement } from '../utils/dom';

export const SHAPE_TO_TAGS: Record<SHAPE, string> = {
  [SHAPE.Rect]: 'path',
  [SHAPE.Circle]: 'circle',
  [SHAPE.Ellipse]: 'ellipse',
  [SHAPE.Image]: 'image',
  [SHAPE.Group]: 'g', // FIXME: skip group
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
  // x1: 'x1',
  // x2: 'x2',
  // y1: 'y1',
  // y2: 'y2',
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
  static tag = 'SVGRenderShapePlugin';

  @inject(SceneGraphService)
  protected sceneGraphService: SceneGraphService;

  apply() {
    DisplayObjectHooks.mounted.tapPromise(
      RenderShapePlugin.tag,
      async (renderer: string, context: SVGElement, entity: Entity) => {
        if (renderer !== RENDERER) {
          return;
        }

        const sceneGraphNode = entity.getComponent(SceneGraphNode);

        // create svg element
        const svgElement = entity.addComponent(ElementSVG);

        const type = SHAPE_TO_TAGS[sceneGraphNode.tagName];
        if (type) {
          let $groupEl;

          const $el = createSVGElement(type);
          $el.id = entity.getName();

          if (type !== 'g') {
            $groupEl = createSVGElement('g');
            $groupEl.appendChild($el);
          } else {
            $groupEl = $el;
          }

          svgElement.$el = $el;
          svgElement.$groupEl = $groupEl;

          const $parentGroupEl = sceneGraphNode.parent?.getComponent(ElementSVG).$groupEl || context;

          if ($parentGroupEl) {
            $parentGroupEl.appendChild($groupEl);
          }
        }
      }
    );

    DisplayObjectHooks.unmounted.tapPromise(
      RenderShapePlugin.tag,
      async (renderer: string, context: SVGElement, entity: Entity) => {
        if (renderer !== RENDERER) {
          return;
        }

        const element = entity.getComponent(ElementSVG);
        if (element) {
          element.$el = null;
        }
      }
    );

    DisplayObjectHooks.render.tap(RenderShapePlugin.tag, (renderer: string, context: SVGElement, entity: Entity) => {
      if (renderer !== RENDERER) {
        return;
      }

      const $el = entity.getComponent(ElementSVG).$el;
      const $groupEl = entity.getComponent(ElementSVG).$groupEl;
      if ($el && $groupEl) {
        const sceneGraphNode = entity.getComponent(SceneGraphNode);

        // apply local RTS transformation to <group> wrapper
        this.applyTransform($groupEl, entity);

        $el.setAttribute('fill', 'none');
        if (sceneGraphNode.tagName === SHAPE.Image) {
          $el.setAttribute('preserveAspectRatio', 'none');
        }

        // apply attributes
        for (const name in sceneGraphNode.attributes) {
          this.updateAttribute(entity, name, `${sceneGraphNode.attributes[name]}`);
        }

        // generate path
        const tagName = entity.getComponent(SceneGraphNode).tagName;
        if (container.isBoundNamed(ElementRenderer, tagName)) {
          const renderer = container.getNamed<ElementRenderer>(ElementRenderer, tagName);
          renderer.apply($el, entity);
        }
      }

      // finish rendering, clear dirty flag
      const renderable = entity.getComponent(Renderable);
      renderable.dirty = false;
    });

    DisplayObjectHooks.changeAttribute.tapPromise(
      RenderShapePlugin.tag,
      async (entity: Entity, name: string, value: any) => {
        if (name === 'z-index') {
          const parentEntity = entity.getComponent(SceneGraphNode).parent;
          const $groupEl = parentEntity?.getComponent(ElementSVG)?.$groupEl;

          if ($groupEl) {
            // need to reorder parent's children
            const ids = entity.getComponent(Sortable).sorted;

            const entities = [...(parentEntity?.getComponent(SceneGraphNode).children || [])];
            entities.sort((a, b) => ids.indexOf(a) - ids.indexOf(b));

            // create empty fragment
            const fragment = document.createDocumentFragment();
            entities.forEach((entity) => {
              const $el = entity.getComponent(ElementSVG).$groupEl;
              if ($el) {
                fragment.appendChild($el);
              }
            });

            $groupEl.appendChild(fragment);
          }
        }

        this.updateAttribute(entity, name, value);
      }
    );
  }

  private applyTransform($el: SVGElement, entity: Entity) {
    const [ex, ey, ez] = getEuler(vec3.create(), this.sceneGraphService.getLocalRotation(entity));

    const [x, y] = this.sceneGraphService.getLocalPosition(entity);
    const [scaleX, scaleY] = this.sceneGraphService.getLocalScale(entity);

    // gimbal lock at 90 degrees
    const rts = fromRotationTranslationScale(ex || ez, x, y, scaleX, scaleY);

    // TODO: use proper precision avoiding too long string in `transform`
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
    $el.setAttribute('transform', `matrix(${rts[0]},${rts[1]},${rts[3]},${rts[4]},${rts[6]},${rts[7]})`);
  }

  private updateAttribute(entity: Entity, name: string, value: any) {
    if (SVG_ATTR_MAP[name]) {
      // update `visibility` on <group>
      if (name === 'visibility') {
        entity.getComponent(ElementSVG)?.$groupEl?.setAttribute(SVG_ATTR_MAP[name], `${value}`);
      } else {
        entity.getComponent(ElementSVG)?.$el?.setAttribute(SVG_ATTR_MAP[name], `${value}`);
      }
    }
  }
}
