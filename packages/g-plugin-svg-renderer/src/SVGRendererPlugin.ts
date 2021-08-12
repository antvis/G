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
} from '@antv/g';
import type {
  ParsedStyleProperty,
  ParsedColorStyleProperty,
  LinearGradient,
  RadialGradient,
  Pattern,
} from '@antv/g';
import { ElementSVG } from './components/ElementSVG';
import { createSVGElement } from './utils/dom';
import { ElementRenderer, ElementRendererFactory } from './shapes/paths';

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
};

export type GradientParams = (LinearGradient | RadialGradient) & { type: PARSED_COLOR_TYPE; };

const CLIP_PATH_PREFIX = 'clip-path-';
let counter = 0;

@injectable()
export class SVGRendererPlugin implements RenderingPlugin {
  static tag = 'SVGRendererPlugin';

  @inject(Camera)
  private camera: Camera;

  @inject(ContextService)
  private contextService: ContextService<SVGElement>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  @inject(ElementRendererFactory)
  private elementRendererFactory: (tagName: string) => ElementRenderer<any>;

  private $def: SVGDefsElement;

  private cacheKey2IDMap: Record<string, string> = {};

  apply(renderingService: RenderingService) {
    renderingService.hooks.init.tap(SVGRendererPlugin.tag, () => {
      this.$def = createSVGElement('defs') as SVGDefsElement;
      this.contextService.getContext()?.appendChild(this.$def);
    });

    renderingService.hooks.mounted.tap(SVGRendererPlugin.tag, (object: DisplayObject) => {
      // create SVG DOM Node
      this.createSVGDom(object, this.contextService.getContext() as SVGElement);
    });

    renderingService.hooks.unmounted.tap(SVGRendererPlugin.tag, (object: DisplayObject) => {
      object.getEntity().removeComponent(ElementSVG, true);
    });

    renderingService.hooks.render.tap(SVGRendererPlugin.tag, (object: DisplayObject) => {
      const $namespace = this.contextService.getDomElement();
      if ($namespace) {
        if (this.renderingContext.renderReasons.has(RENDER_REASON.CameraChanged)) {
          // @ts-ignore
          this.applyTransform($namespace, this.camera.getOrthoMatrix());
        }

        const entity = object.getEntity();
        const $el = entity.getComponent(ElementSVG)?.$el;
        const $groupEl = entity.getComponent(ElementSVG)?.$groupEl;

        if ($el && $groupEl) {
          // apply local RTS transformation to <group> wrapper
          // account for anchor
          this.applyTransform($groupEl, object.getLocalTransform());

          this.reorderChildren($groupEl, object.children || []);
          // finish rendering, clear dirty flag
          const renderable = entity.getComponent(Renderable);
          renderable.dirty = false;
        }
      }
    });

    renderingService.hooks.attributeChanged.tap(
      SVGRendererPlugin.tag,
      (object: DisplayObject, name: string, value: any) => {
        if (name === 'zIndex') {
          const parent = object.parentNode;
          const parentEntity = object.parentNode?.getEntity();
          const $groupEl = parentEntity?.getComponent(ElementSVG)?.$groupEl;
          const children = [...(parent?.children || [])];

          if ($groupEl) {
            this.reorderChildren($groupEl, children);
          }
        }

        this.updateAttribute(object, name, value);
      },
    );
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
      `matrix(${rts[0].toFixed(5)},${rts[1].toFixed(5)},${rts[3].toFixed(5)},${rts[4].toFixed(5)},${rts[6].toFixed(5)},${rts[7].toFixed(5)})`,
    );
  }

  private applyAttributes(object: DisplayObject) {
    const entity = object.getEntity();
    const $el = entity.getComponent(ElementSVG)?.$el;
    const $groupEl = entity.getComponent(ElementSVG)?.$groupEl;
    if ($el && $groupEl) {
      const { nodeName, attributes } = object;

      $el.setAttribute('fill', 'none');
      if (nodeName === SHAPE.Image) {
        $el.setAttribute('preserveAspectRatio', 'none');
      }

      // apply attributes
      for (const name in attributes) {
        this.updateAttribute(object, name, attributes[name], true);
      }

      // generate path
      const elementRenderer = this.elementRendererFactory(nodeName);
      if (elementRenderer) {
        elementRenderer.apply($el, attributes);
      }
    }
  }

  private updateAttribute(object: DisplayObject, name: string, value: any, skipGeneratePath = false) {
    const entity = object.getEntity();
    const $el = entity.getComponent(ElementSVG)?.$el;
    const $groupEl = entity.getComponent(ElementSVG)?.$groupEl;
    const { parsedStyle } = object;
    if (SVG_ATTR_MAP[name]) {
      if (name === 'fill' || name === 'stroke') {
        const parsedColor = parsedStyle[name] as ParsedColorStyleProperty;
        const gradientId = this.generateCacheKey(parsedColor);
        const existed = this.$def.querySelector(`#${gradientId}`);
        if (
          parsedColor.type === PARSED_COLOR_TYPE.LinearGradient ||
          parsedColor.type === PARSED_COLOR_TYPE.RadialGradient
        ) {
          if (!existed) {
            this.createGradient(parsedColor, gradientId);
          }
          $el?.setAttribute(SVG_ATTR_MAP[name], `url(#${gradientId})`);
        } else if (parsedColor.type === PARSED_COLOR_TYPE.Pattern) {
          if (!existed) {
            this.createPattern(parsedColor, gradientId);
          }
          $el?.setAttribute(SVG_ATTR_MAP[name], `url(#${gradientId})`);
        } else {
          $el?.setAttribute(SVG_ATTR_MAP[name], `${parsedColor.formatted}`);
        }
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
        elementRenderer.apply($el, object.attributes);
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
      $el.id = entity.getName();

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

  /**
   * the origin is bounding box's top left corner
   */
  private updateAnchorWithTransform(object: DisplayObject) {
    const anchor = object.style.anchor || [0, 0];
    const { width = 0, height = 0 } = object.style || {};

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

  private generateCacheKey(params: ParsedColorStyleProperty): string {
    let cacheKey = '';
    const { type } = params;
    if (type === PARSED_COLOR_TYPE.Pattern) {
      const { src } = params.value;
      cacheKey = src;
    } else if (
      type === PARSED_COLOR_TYPE.LinearGradient ||
      type === PARSED_COLOR_TYPE.RadialGradient
    ) {
      // @ts-ignore
      const { x0, y0, x1, y1, r1, steps } = params.value;
      cacheKey = `${type}${x0}${y0}${x1}${y1}${r1 || 0}${steps.map(
        (step: string[]) => step.join('')).join('')}`;
    }

    if (cacheKey) {
      if (!this.cacheKey2IDMap[cacheKey]) {
        this.cacheKey2IDMap[cacheKey] = `_pattern_${type}_${counter++}`;
      }
    }

    return this.cacheKey2IDMap[cacheKey];
  }

  private createPattern(
    parsedColor: ParsedStyleProperty<PARSED_COLOR_TYPE.Pattern, Pattern, string>,
    patternId: string
  ) {
    const { src } = parsedColor.value;
    // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/pattern
    const $pattern = createSVGElement('pattern') as SVGPatternElement;
    $pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    const $image = createSVGElement('image');
    $pattern.appendChild($image);
    $pattern.id = patternId;
    this.$def.appendChild($pattern);

    $image.setAttribute('href', src);

    const img = new Image();
    if (!src.match(/^data:/i)) {
      img.crossOrigin = 'Anonymous';
    }
    img.src = src;
    function onload() {
      $pattern.setAttribute('width', `${img.width}`);
      $pattern.setAttribute('height', `${img.height}`);
    }
    if (img.complete) {
      onload();
    } else {
      img.onload = onload;
      // Fix onload() bug in IE9
      img.src = img.src;
    }
  }

  private createGradient(
    parsedColor: ParsedStyleProperty<PARSED_COLOR_TYPE.LinearGradient, LinearGradient, string> | ParsedStyleProperty<PARSED_COLOR_TYPE.RadialGradient, RadialGradient, string>,
    gradientId: string
  ) {
    // <linearGradient> <radialGradient>
    // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/linearGradient
    // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/radialGradient
    const $gradient = createSVGElement(
      parsedColor.type === PARSED_COLOR_TYPE.LinearGradient ?
        'linearGradient' : 'radialGradient');
    if (parsedColor.type === PARSED_COLOR_TYPE.LinearGradient) {
      const { x0, y0, x1, y1 } = parsedColor.value;
      $gradient.setAttribute('x1', `${x0}`);
      $gradient.setAttribute('y1', `${y0}`);
      $gradient.setAttribute('x2', `${x1}`);
      $gradient.setAttribute('y2', `${y1}`);
    } else {
      const { x0, y0, r1 } = parsedColor.value;
      $gradient.setAttribute('cx', `${x0}`);
      $gradient.setAttribute('cy', `${y0}`);
      $gradient.setAttribute('r', `${r1 / 2}`);
    }

    // add stops
    let innerHTML = '';
    parsedColor.value.steps.forEach(([offset, color]) => {
      innerHTML += `<stop offset="${offset}" stop-color="${color}"></stop>`;
    });
    $gradient.innerHTML = innerHTML;
    $gradient.id = gradientId;
    this.$def.appendChild($gradient);
  }
}
