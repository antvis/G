import { inject, injectable } from 'inversify';
import { vec3, mat4, quat } from 'gl-matrix';
import {
  ContextService,
  RenderingService,
  RenderingContext,
  SceneGraphService,
  RenderingPlugin,
  SHAPE,
  fromRotationTranslationScale,
  getEuler,
  Renderable,
  DisplayObject,
  Camera,
  RENDER_REASON,
  PARSED_COLOR_TYPE,
  DefaultCamera,
  ElementEvent,
  FederatedEvent,
} from '@antv/g';
import type { LinearGradient, RadialGradient } from '@antv/g';
import { ElementSVG } from './components/ElementSVG';
import { createSVGElement } from './utils/dom';
import { numberToLongString } from './utils/format';
import { ElementRenderer, ElementRendererFactory } from './shapes/paths';
import { createOrUpdateFilter } from './shapes/defs/Filter';
import { createOrUpdateGradientAndPattern } from './shapes/defs/Pattern';
import { createOrUpdateShadow } from './shapes/defs/Shadow';

export const SHAPE_TO_TAGS: Record<SHAPE | string, string> = {
  [SHAPE.Rect]: 'path',
  [SHAPE.Circle]: 'circle',
  [SHAPE.Ellipse]: 'ellipse',
  [SHAPE.Image]: 'image',
  [SHAPE.Group]: 'g',
  [SHAPE.Line]: 'line',
  [SHAPE.Polyline]: 'polyline',
  [SHAPE.Polygon]: 'polygon',
  [SHAPE.Text]: 'text',
  [SHAPE.Path]: 'path',
  [SHAPE.HTML]: 'foreignObject',
};

export const SVG_ATTR_MAP: Record<string, string> = {
  opacity: 'opacity',
  fillStyle: 'fill',
  fill: 'fill',
  fillOpacity: 'fill-opacity',
  strokeStyle: 'stroke',
  strokeOpacity: 'stroke-opacity',
  stroke: 'stroke',
  clipPath: 'clip-path',
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
  anchor: 'anchor',
  shadowColor: 'flood-color',
  shadowBlur: 'stdDeviation',
  shadowOffsetX: 'dx',
  shadowOffsetY: 'dy',
  filter: 'filter',
  innerHTML: 'innerHTML',
};

export type GradientParams = (LinearGradient | RadialGradient) & { type: PARSED_COLOR_TYPE };

const G_SVG_PREFIX = 'g_svg';
const CLIP_PATH_PREFIX = 'clip-path-';

@injectable()
export class SVGRendererPlugin implements RenderingPlugin {
  static tag = 'SVGRendererPlugin';

  @inject(DefaultCamera)
  private camera: Camera;

  @inject(ContextService)
  private contextService: ContextService<SVGElement>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  @inject(ElementRendererFactory)
  private elementRendererFactory: (tagName: string) => ElementRenderer<any>;

  /**
   * container for <gradient> <clipPath>...
   */
  private $def: SVGDefsElement;

  /**
   * <camera>
   */
  private $camera: SVGElement;

  apply(renderingService: RenderingService) {
    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      // create SVG DOM Node
      this.createSVGDom(object, this.$camera);
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      this.removeSVGDom(object);
    };

    const handleAttributeChanged = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      const { attributeName, newValue } = e.detail;

      if (attributeName === 'zIndex') {
        const parent = object.parentNode;
        const parentEntity = object.parentNode?.getEntity();
        const $groupEl = parentEntity?.getComponent(ElementSVG)?.$groupEl;
        const children = [...(parent?.children || [])];

        if ($groupEl) {
          this.reorderChildren($groupEl, children as DisplayObject[]);
        }
      }

      this.updateAttribute(object, attributeName, object.parsedStyle[attributeName]);
    };

    renderingService.hooks.init.tap(SVGRendererPlugin.tag, () => {
      this.$def = createSVGElement('defs') as SVGDefsElement;
      const $svg = this.contextService.getContext()!;
      $svg.appendChild(this.$def);

      // @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/color-interpolation-filters
      $svg.setAttribute('color-interpolation-filters', 'sRGB');

      this.$camera = createSVGElement('g');
      this.$camera.id = `${G_SVG_PREFIX}_camera`;
      this.applyTransform(this.$camera, this.camera.getOrthoMatrix());
      $svg.appendChild(this.$camera);

      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.addEventListener(
        ElementEvent.ATTRIBUTE_CHANGED,
        handleAttributeChanged,
      );
    });

    renderingService.hooks.destroy.tap(SVGRendererPlugin.tag, () => {
      this.renderingContext.root.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.removeEventListener(
        ElementEvent.ATTRIBUTE_CHANGED,
        handleAttributeChanged,
      );
    });

    renderingService.hooks.render.tap(SVGRendererPlugin.tag, (object: DisplayObject) => {
      if (this.renderingContext.renderReasons.has(RENDER_REASON.CameraChanged)) {
        this.applyTransform(this.$camera, this.camera.getOrthoMatrix());
      }

      const entity = object.getEntity();
      const $el = entity.getComponent(ElementSVG)?.$el;
      const $groupEl = entity.getComponent(ElementSVG)?.$groupEl;

      if ($el && $groupEl) {
        // apply local RTS transformation to <group> wrapper
        // account for anchor
        this.applyTransform($groupEl, object.getLocalTransform());

        this.reorderChildren($groupEl, (object.children as DisplayObject[]) || []);
        // finish rendering, clear dirty flag
        const renderable = entity.getComponent(Renderable);
        renderable.dirty = false;
      }
    });
  }

  private reorderChildren($groupEl: SVGElement, children: DisplayObject[]) {
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

  private applyTransform($el: SVGElement, transform: mat4) {
    const translation = mat4.getTranslation(vec3.create(), transform);
    const scaling = mat4.getScaling(vec3.create(), transform);
    const rotation = mat4.getRotation(quat.create(), transform);

    const [x, y] = translation;
    const [scaleX, scaleY] = scaling;
    const [ex, ey, ez] = getEuler(vec3.create(), rotation);

    // gimbal lock at 90 degrees
    const rts = fromRotationTranslationScale(ex || ez, x, y, scaleX, scaleY);

    // use proper precision avoiding too long string in `transform`
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
    $el.setAttribute(
      'transform',
      `matrix(${numberToLongString(rts[0])},${numberToLongString(rts[1])},${numberToLongString(
        rts[3],
      )},${numberToLongString(rts[4])},${numberToLongString(rts[6])},${numberToLongString(
        rts[7],
      )})`,
    );
  }

  private applyAttributes(object: DisplayObject) {
    const entity = object.getEntity();
    const $el = entity.getComponent(ElementSVG)?.$el;
    const $groupEl = entity.getComponent(ElementSVG)?.$groupEl;
    if ($el && $groupEl) {
      const { nodeName, attributes, parsedStyle } = object;

      $el.setAttribute('fill', 'none');
      if (nodeName === SHAPE.Image) {
        $el.setAttribute('preserveAspectRatio', 'none');
      }

      // apply attributes
      for (const name in attributes) {
        this.updateAttribute(object, name, parsedStyle[name], true);
      }

      // generate path
      const elementRenderer = this.elementRendererFactory(nodeName);
      if (elementRenderer) {
        elementRenderer.apply($el, parsedStyle);
      }
    }
  }

  private updateAttribute(
    object: DisplayObject,
    name: string,
    value: any,
    skipGeneratePath = false,
  ) {
    const entity = object.getEntity();
    const $el = entity.getComponent(ElementSVG)?.$el;
    const $groupEl = entity.getComponent(ElementSVG)?.$groupEl;
    const { parsedStyle } = object;
    if (SVG_ATTR_MAP[name]) {
      if (name === 'fill' || name === 'stroke') {
        createOrUpdateGradientAndPattern(
          this.$def,
          object,
          $el!,
          parsedStyle[name],
          SVG_ATTR_MAP[name],
        );
      } else if (name === 'visibility') {
        // update `visibility` on <group>
        $groupEl?.setAttribute(SVG_ATTR_MAP[name], `${value}`);
      } else if (name === 'clipPath') {
        const clipPath = value as DisplayObject;
        if (clipPath) {
          const clipPathId = CLIP_PATH_PREFIX + clipPath.getEntity().getName();

          const existed = this.$def.querySelector(`#${clipPathId}`);
          if (!existed) {
            // create <clipPath> dom node, append it to <defs>
            const $clipPath = createSVGElement('clipPath');
            $clipPath.id = clipPathId;
            this.$def.appendChild($clipPath);

            // <clipPath><circle /></clipPath>
            this.createSVGDom(clipPath, $clipPath, true);

            clipPath.getEntity().getComponent(ElementSVG).$groupEl = $clipPath;
          }

          const $groupEl = clipPath.getEntity().getComponent(ElementSVG)?.$groupEl;
          if ($groupEl) {
            // apply local RTS transformation to <group> wrapper
            this.applyTransform($groupEl, clipPath.getLocalTransform());
          }
          // apply attributes
          this.applyAttributes(clipPath);
          $el?.setAttribute('clip-path', `url(#${clipPathId})`);
        } else {
          // remove clip path
          $el?.removeAttribute('clip-path');
        }
      } else if (
        name === 'shadowColor' ||
        name === 'shadowBlur' ||
        name === 'shadowOffsetX' ||
        name === 'shadowOffsetY'
      ) {
        createOrUpdateShadow(this.$def, object, $el!, name);
      } else if (name === 'filter') {
        createOrUpdateFilter(this.$def, object, $el!, parsedStyle[name]);
      } else if (name === 'innerHTML') {
        const $div = document.createElement('div');
        if (typeof value === 'string') {
          $div.innerHTML = value;
        } else {
          $div.appendChild(value);
        }
        $el!.innerHTML = '';
        $el!.appendChild($div);
      } else {
        if (
          // (!object.style.clipPathTargets) &&
          object.nodeName !== SHAPE.Text && // text' anchor is controlled by `textAnchor` property
          ['anchor', 'width', 'height', 'r', 'rx', 'ry'].indexOf(name) > -1
        ) {
          this.updateAnchorWithTransform(object);
        }
        if (name !== 'anchor') {
          $el?.setAttribute(SVG_ATTR_MAP[name], `${value}`);
        }
      }
    }

    // need re-generate path
    if (!skipGeneratePath && $el) {
      const elementRenderer = this.elementRendererFactory(object.nodeName);
      if (elementRenderer && elementRenderer.dependencies.indexOf(name) > -1) {
        elementRenderer.apply($el, object.parsedStyle);
      }
    }
  }

  private createSVGDom(object: DisplayObject, root: SVGElement, noWrapWithGroup = false) {
    const entity = object.getEntity();
    // create svg element
    const svgElement = entity.addComponent(ElementSVG);

    // use <group> as default, eg. CustomElement
    const type = SHAPE_TO_TAGS[object.nodeName] || 'g';
    if (type) {
      let $groupEl;

      const $el = createSVGElement(type);

      // save $el on parsedStyle, which will be returned in getDomElement()
      if (object.nodeName === SHAPE.HTML) {
        object.parsedStyle.$el = $el;
      }

      $el.id = `${G_SVG_PREFIX}_${object.nodeName}_${entity.getName()}`;

      if (type !== 'g' && !noWrapWithGroup) {
        $groupEl = createSVGElement('g');
        $groupEl.appendChild($el);
      } else {
        $groupEl = $el;
      }

      svgElement.$el = $el;
      svgElement.$groupEl = $groupEl;

      const $parentGroupEl =
        (object.parentNode && object.parentNode.getEntity().getComponent(ElementSVG)?.$groupEl) ||
        root;

      if ($parentGroupEl) {
        $parentGroupEl.appendChild($groupEl);
      }

      // apply attributes at first time
      this.applyAttributes(object);
    }
  }

  private removeSVGDom(object: DisplayObject) {
    const $groupEl = object.getEntity().getComponent(ElementSVG)?.$groupEl;
    if ($groupEl && $groupEl.parentNode) {
      $groupEl.parentNode.removeChild($groupEl);

      object.getEntity().removeComponent(ElementSVG, true);
    }
  }

  /**
   * the origin is bounding box's top left corner
   */
  private updateAnchorWithTransform(object: DisplayObject) {
    const bounds = object.getGeometryBounds();
    const width = (bounds && bounds.halfExtents[0] * 2) || 0;
    const height = (bounds && bounds.halfExtents[1] * 2) || 0;
    const { anchor = [0, 0] } = object.parsedStyle || {};

    const $el = object.getEntity().getComponent(ElementSVG)?.$el;
    // apply anchor to element's `transform` property
    $el?.setAttribute(
      'transform',
      // can't use percent unit like translate(-50%, -50%)
      // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/transform#translate
      `translate(-${anchor[0] * width},-${anchor[1] * height})`,
    );

    if (object.nodeName === SHAPE.Circle || object.nodeName === SHAPE.Ellipse) {
      $el?.setAttribute('cx', `${width / 2}`);
      $el?.setAttribute('cy', `${height / 2}`);
    }
  }
}
