import { inject, injectable } from 'inversify';
import { Entity } from '@antv/g-ecs';
import { vec3, mat4, quat } from 'gl-matrix';
import {
  ContextService,
  RenderingService,
  SceneGraphService,
  RenderingPlugin,
  SHAPE,
  fromRotationTranslationScale,
  getEuler,
  Renderable,
  DisplayObject,
  Camera,
} from '@antv/g';
import { ElementSVG } from './components/ElementSVG';
import { createSVGElement } from './utils/dom';
import { ElementRenderer, ElementRendererFactory } from './shapes/paths';

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
  [SHAPE.Path]: 'path',
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
  // path: 'd',
  class: 'class',
  id: 'id',
  style: 'style',
  preserveAspectRatio: 'preserveAspectRatio',
  visibility: 'visibility',
};

@injectable()
export class SVGRendererPlugin implements RenderingPlugin {
  static tag = 'SVGRendererPlugin';

  @inject(Camera)
  private camera: Camera;

  @inject(ContextService)
  private contextService: ContextService<SVGElement>;

  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  @inject(ElementRendererFactory)
  private elementRendererFactory: (tagName: string) => ElementRenderer;

  apply(renderingService: RenderingService) {
    renderingService.hooks.mounted.tap(SVGRendererPlugin.tag, (object: DisplayObject) => {
      const entity = object.getEntity();

      // create svg element
      const svgElement = entity.addComponent(ElementSVG);

      const type = SHAPE_TO_TAGS[object.nodeType];
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

        const $parentGroupEl =
          (object.parentNode && object.parentNode.getEntity().getComponent(ElementSVG).$groupEl) ||
          this.contextService.getContext();

        if ($parentGroupEl) {
          $parentGroupEl.appendChild($groupEl);
        }
      }
    });

    renderingService.hooks.unmounted.tap(SVGRendererPlugin.tag, (object: DisplayObject) => {
      object.getEntity().removeComponent(ElementSVG, true);
    });

    renderingService.hooks.render.tap(SVGRendererPlugin.tag, (objects: DisplayObject[]) => {
      const $namespace = this.contextService.getDomElement();
      if ($namespace) {
        this.applyTransform($namespace, this.camera.getOrthoMatrix());
      }

      objects.forEach((object) => {
        const entity = object.getEntity();
        const $el = entity.getComponent(ElementSVG).$el;
        const $groupEl = entity.getComponent(ElementSVG).$groupEl;
        if ($el && $groupEl) {
          const { nodeType, attributes } = object;
          // apply local RTS transformation to <group> wrapper
          this.applyTransform($groupEl, object.getLocalTransform());

          $el.setAttribute('fill', 'none');
          if (nodeType === SHAPE.Image) {
            $el.setAttribute('preserveAspectRatio', 'none');
          }

          // apply attributes
          for (const name in attributes) {
            this.updateAttribute(entity, name, `${attributes[name]}`);
          }

          // generate path
          const elementRenderer = this.elementRendererFactory(nodeType);
          if (elementRenderer) {
            elementRenderer.apply($el, attributes);
          }
        }

        // finish rendering, clear dirty flag
        const renderable = entity.getComponent(Renderable);
        renderable.dirty = false;
      });
    });

    renderingService.hooks.attributeChanged.tap(
      SVGRendererPlugin.tag,
      (object: DisplayObject, name: string, value: any) => {
        const entity = object.getEntity();
        if (name === 'z-index') {
          const parent = object.parentNode;
          const parentEntity = object.parentNode?.getEntity();
          const $groupEl = parentEntity?.getComponent(ElementSVG)?.$groupEl;
          const children = [...(parent?.children || [])];

          if ($groupEl) {
            // need to reorder parent's children
            children.sort(this.sceneGraphService.sort);

            // create empty fragment
            const fragment = document.createDocumentFragment();
            children.forEach((child: DisplayObject) => {
              const $el = child.getEntity().getComponent(ElementSVG).$groupEl;
              if ($el) {
                fragment.appendChild($el);
              }
            });

            $groupEl.appendChild(fragment);
          }
        }

        this.updateAttribute(entity, name, value);
      },
    );
  }

  private applyTransform($el: SVGElement, transform: mat4) {
    const translation = mat4.getTranslation(vec3.create(), transform);
    const scaling = mat4.getScaling(vec3.create(), transform);
    const rotation = mat4.getRotation(quat.create(), transform);

    const [x, y] = translation;
    const [scaleX, scaleY] = scaling;
    const [ex, ey, ez] = getEuler(vec3.create(), rotation);

    // gimbal lock at 90 degrees
    const rts = fromRotationTranslationScale(ex || ez, x, y, scaleX, scaleY);

    // TODO: use proper precision avoiding too long string in `transform`
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
    $el.setAttribute(
      'transform',
      `matrix(${rts[0]},${rts[1]},${rts[3]},${rts[4]},${rts[6]},${rts[7]})`,
    );
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
