import { inject, singleton } from 'mana-syringe';
import { vec3, mat4, quat } from 'gl-matrix';
import {
  ContextService,
  RenderingContext,
  RenderingPluginContribution,
  Shape,
  fromRotationTranslationScale,
  getEuler,
  Camera,
  RenderReason,
  DefaultCamera,
  ElementEvent,
  CanvasConfig,
} from '@antv/g';
import type {
  LinearGradient,
  RadialGradient,
  RenderingService,
  RenderingPlugin,
  DisplayObject,
  MutationEvent,
  FederatedEvent,
  ParsedBaseStyleProps,
} from '@antv/g';
import { ElementSVG } from './components/ElementSVG';
import { createSVGElement } from './utils/dom';
import { numberToLongString } from './utils/format';
import type { ElementRenderer } from './shapes/paths';
import { ElementRendererFactory } from './shapes/paths';
import { createOrUpdateFilter } from './shapes/defs/Filter';
import { createOrUpdateGradientAndPattern } from './shapes/defs/Pattern';
import { createOrUpdateShadow } from './shapes/defs/Shadow';

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
  textAlign: 'text-anchor',
};

const FORMAT_VALUE_MAP = {
  textAlign: {
    inherit: 'inherit',
    left: 'left',
    start: 'left',
    center: 'middle',
    right: 'end',
    end: 'end',
  },
};

export const DEFAULT_VALUE_MAP: Record<string, string> = {
  textAlign: 'inherit',
  // textBaseline: 'alphabetic',
  // @see https://www.w3.org/TR/SVG/painting.html#LineCaps
  lineCap: 'butt',
  // @see https://www.w3.org/TR/SVG/painting.html#LineJoin
  lineJoin: 'miter',
  // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke-width
  lineWidth: '1px',
  opacity: '1',
  fillOpacity: '1',
  strokeOpacity: '1',
  strokeWidth: '0',
  strokeMiterLimit: '4',
  letterSpacing: '0',
  fontSize: 'inherit',
  fontFamily: 'inherit',
};

export type GradientParams = LinearGradient | RadialGradient;

/**
 * G_SVG_PREFIX + nodeName + entity
 *
 * eg. g_svg_circle_345
 */
export const G_SVG_PREFIX = 'g_svg';
const CLIP_PATH_PREFIX = 'clip-path-';

@singleton({ contrib: RenderingPluginContribution })
export class SVGRendererPlugin implements RenderingPlugin {
  static tag = 'SVGRenderer';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(DefaultCamera)
  private camera: Camera;

  @inject(ContextService)
  private contextService: ContextService<SVGElement>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

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

  /**
   * render at the end of frame
   */
  private renderQueue: DisplayObject[] = [];

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

    const handleAttributeChanged = (e: MutationEvent) => {
      const object = e.target as DisplayObject;

      // @see https://github.com/antvis/g/issues/994
      // @ts-ignore
      if (!object.elementSVG) {
        return;
      }

      const { attrName } = e;

      if (attrName === 'zIndex') {
        const parent = object.parentNode;
        // @ts-ignore
        const $groupEl = object.parentNode?.elementSVG?.$groupEl;
        const children = (parent?.children || []).slice();

        if ($groupEl) {
          this.reorderChildren($groupEl, children as DisplayObject[]);
        }
      } else if (attrName === 'increasedLineWidthForHitTesting') {
        // @ts-ignore
        const svgElement = object.elementSVG as ElementSVG;
        this.createOrUpdateHitArea(object, svgElement.$el, svgElement.$groupEl);
      }

      this.updateAttribute(object, [attrName]);
    };

    renderingService.hooks.init.tapPromise(SVGRendererPlugin.tag, async () => {
      this.$def = createSVGElement('defs') as SVGDefsElement;
      const $svg = this.contextService.getContext()!;

      const { background } = this.canvasConfig;
      if (background) {
        $svg.style.background = background;
      }

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
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
    });

    renderingService.hooks.destroy.tap(SVGRendererPlugin.tag, () => {
      this.renderingContext.root.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.removeEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
    });

    renderingService.hooks.render.tap(SVGRendererPlugin.tag, (object: DisplayObject) => {
      // if (!object.isCulled()) {
      this.renderQueue.push(object);
      // }
    });

    renderingService.hooks.endFrame.tap(SVGRendererPlugin.tag, () => {
      if (this.renderingContext.renderReasons.has(RenderReason.CAMERA_CHANGED)) {
        this.applyTransform(this.$camera, this.camera.getOrthoMatrix());
      }

      this.renderQueue.forEach((object) => {
        // @ts-ignore
        const $el = object.elementSVG?.$el;
        // @ts-ignore
        const $groupEl = object.elementSVG?.$groupEl;

        if ($el && $groupEl) {
          // apply local RTS transformation to <group> wrapper
          // account for anchor
          this.applyTransform($groupEl, object.getLocalTransform());

          const children = (object?.children || []).slice() as DisplayObject[];
          this.reorderChildren($groupEl, children || []);
          // finish rendering, clear dirty flag
          object.renderable.dirty = false;
        }
      });
      this.renderQueue = [];
    });
  }

  private reorderChildren($groupEl: SVGElement, children: DisplayObject[]) {
    // need to reorder parent's children
    children.sort((a, b) => a.sortable.renderOrder - b.sortable.renderOrder);

    if (children.length) {
      // create empty fragment
      const fragment = document.createDocumentFragment();
      children.forEach((child: DisplayObject) => {
        // @ts-ignore
        const $el = child.elementSVG.$groupEl;
        if ($el) {
          fragment.appendChild($el);
        }
      });

      $groupEl.appendChild(fragment);
    }
  }

  private applyTransform($el: SVGElement, transform: mat4) {
    const translation = mat4.getTranslation(vec3.create(), transform);
    const scaling = mat4.getScaling(vec3.create(), transform);
    const rotation = mat4.getRotation(quat.create(), transform);

    const [x, y] = translation;
    const [scaleX, scaleY] = scaling;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // @ts-ignore
    const elementSVG = object.elementSVG as ElementSVG;
    const $el = elementSVG?.$el;
    const $groupEl = elementSVG?.$groupEl;
    if ($el && $groupEl) {
      const { nodeName, attributes } = object;

      $el.setAttribute('fill', 'none');
      if (nodeName === Shape.IMAGE) {
        $el.setAttribute('preserveAspectRatio', 'none');
      }

      // apply attributes
      this.updateAttribute(object, Object.keys(attributes));
    }
  }

  private updateAttribute(object: DisplayObject, attributes: string[]) {
    let needGeneratePath = false;
    // @ts-ignore
    const { $el, $groupEl, $hitTestingEl } = object.elementSVG as ElementSVG;
    const { parsedStyle, computedStyle } = object;
    const elementRenderer = this.elementRendererFactory(object.nodeName);

    attributes.forEach((name) => {
      const usedName = SVG_ATTR_MAP[name];
      const computedValue = computedStyle[name];
      const usedValue = parsedStyle[name];

      // generate path only once
      if (!needGeneratePath && elementRenderer && elementRenderer.dependencies.indexOf(name) > -1) {
        needGeneratePath = true;
      }

      // <foreignObject>
      if (object.nodeName === Shape.HTML) {
        if (name === 'fill') {
          $el.style.background = usedValue.toString();
        } else if (name === 'stroke') {
          $el.style['border-color'] = usedValue.toString();
          $el.style['border-style'] = 'solid';
        } else if (name === 'lineWidth') {
          $el.style['border-width'] = `${usedValue.value || 0}px`;
        } else if (name === 'lineDash') {
          $el.style['border-style'] = 'dashed';
        }
      }

      if (name === 'fill' || name === 'stroke') {
        createOrUpdateGradientAndPattern(this.$def, object, $el!, usedValue, usedName);
      } else if (name === 'visibility') {
        // use computed value
        // update `visibility` on <group>
        $groupEl?.setAttribute(usedName, `${computedValue.value}`);
      } else if (name === 'clipPath') {
        this.createOrUpdateClipPath(usedValue, $groupEl);
      } else if (
        name === 'shadowColor' ||
        name === 'shadowBlur' ||
        name === 'shadowOffsetX' ||
        name === 'shadowOffsetY'
      ) {
        createOrUpdateShadow(this.$def, object, $el, name);
      } else if (name === 'filter') {
        createOrUpdateFilter(this.$def, object, $el, usedValue);
      } else if (name === 'innerHTML') {
        this.createOrUpdateInnerHTML($el, usedValue);
      } else {
        if (
          // (!object.style.clipPathTargets) &&
          object.nodeName !== Shape.TEXT && // text' anchor is controlled by `textAnchor` property
          ['width', 'height', 'r', 'rx', 'ry', 'anchor'].indexOf(name) > -1
        ) {
          this.updateAnchorWithTransform(object);
        }
        if (name !== 'anchor' && computedValue) {
          // use computed value so that we can use cascaded effect in SVG
          const valueStr = computedValue.toString();

          // ignore 'unset' and default value
          if (valueStr !== 'unset' && valueStr !== DEFAULT_VALUE_MAP[name]) {
            const formattedValueStr = FORMAT_VALUE_MAP[name]?.[valueStr] || valueStr;

            [$el, $hitTestingEl].forEach(($el: SVGElement) => {
              if ($el && usedName) {
                $el.setAttribute(usedName, formattedValueStr);
              }
            });
          }
        }
      }
    });

    // need re-generate path
    if (needGeneratePath && $el) {
      [$el, $hitTestingEl].forEach(($el) => {
        if ($el) {
          elementRenderer.apply($el, object.parsedStyle);
        }
      });
    }
  }

  private createSVGDom(object: DisplayObject, root: SVGElement, noWrapWithGroup = false) {
    // create svg element
    // @ts-ignore
    object.elementSVG = new ElementSVG();
    // @ts-ignore
    const svgElement = object.elementSVG;

    // use <group> as default, eg. CustomElement
    const type = SHAPE2TAGS[object.nodeName] || 'g';
    if (type) {
      let $groupEl: SVGElement;

      const $el = createSVGElement(type);

      // save $el on parsedStyle, which will be returned in getDomElement()
      if (object.nodeName === Shape.HTML) {
        object.parsedStyle.$el = $el;
      }

      $el.id = `${G_SVG_PREFIX}_${object.nodeName}_${object.entity}`;

      if (type !== 'g' && !noWrapWithGroup) {
        $groupEl = createSVGElement('g');
        $groupEl.appendChild($el);
      } else {
        $groupEl = $el;
      }

      svgElement.$el = $el;
      svgElement.$groupEl = $groupEl;

      const $parentGroupEl =
        // @ts-ignore
        (object.parentNode && object.parentNode.elementSVG?.$groupEl) || root;

      if ($parentGroupEl) {
        $parentGroupEl.appendChild($groupEl);
      }

      // apply attributes at first time
      this.applyAttributes(object);

      // create hitArea if necessary
      this.createOrUpdateHitArea(object, $el, $groupEl);
    }
  }

  private removeSVGDom(object: DisplayObject) {
    // @ts-ignore
    const $groupEl = object.elementSVG?.$groupEl;
    if ($groupEl && $groupEl.parentNode) {
      $groupEl.parentNode.removeChild($groupEl);

      // object.entity.removeComponent(ElementSVG, true);
    }
  }

  private createOrUpdateHitArea(object: DisplayObject, $el: SVGElement, $groupEl: SVGElement) {
    // @ts-ignore
    const svgElement = object.elementSVG as ElementSVG;
    let $hitTestingEl = svgElement.$hitTestingEl;
    const increasedLineWidthForHitTesting =
      object.parsedStyle.increasedLineWidthForHitTesting?.value;

    // account for hitArea
    if (increasedLineWidthForHitTesting) {
      if (!$hitTestingEl) {
        $hitTestingEl = $el.cloneNode() as SVGElement;

        // use the entity suffix, so that `g-plugin-svg-picker` can extract
        $hitTestingEl.id = `${G_SVG_PREFIX}_${object.nodeName}_hittesting_${object.entity}`;
        // clear attributes like `filter` `font-size`
        ['filter'].forEach((attribute) => {
          $hitTestingEl.removeAttribute(attribute);
        });
        // hitArea should be 'transparent' but not 'none'
        const hasFill = $el.getAttribute('fill') !== 'none';
        $hitTestingEl.setAttribute('fill', hasFill ? 'transparent' : 'none');
        $hitTestingEl.setAttribute('stroke', 'transparent');
        $groupEl.appendChild($hitTestingEl);
        svgElement.$hitTestingEl = $hitTestingEl;
      }

      // increase interactive line width
      $hitTestingEl.setAttribute(
        'stroke-width',
        `${increasedLineWidthForHitTesting + object.parsedStyle.lineWidth?.value}`,
      );
    } else {
      if ($hitTestingEl) {
        $groupEl.removeChild($hitTestingEl);
        svgElement.$hitTestingEl = null;
      }
    }
  }

  private createOrUpdateInnerHTML($el: SVGElement, usedValue: any) {
    const $div = document.createElement('div');
    if (typeof usedValue === 'string') {
      $div.innerHTML = usedValue;
    } else {
      $div.appendChild(usedValue);
    }
    $el.innerHTML = '';
    $el.appendChild($div);
  }

  private createOrUpdateClipPath(clipPath: DisplayObject, $groupEl: SVGElement) {
    if (clipPath) {
      const clipPathId = CLIP_PATH_PREFIX + clipPath.entity;

      const existed = this.$def.querySelector(`#${clipPathId}`);
      if (!existed) {
        // create <clipPath> dom node, append it to <defs>
        const $clipPath = createSVGElement('clipPath');
        $clipPath.id = clipPathId;
        this.$def.appendChild($clipPath);

        // <clipPath><circle /></clipPath>
        this.createSVGDom(clipPath, $clipPath, true);

        // @ts-ignore
        clipPath.elementSVG.$groupEl = $clipPath;
      }

      // @ts-ignore
      const $clipPathGroupEl = clipPath.elementSVG?.$groupEl;
      if ($clipPathGroupEl) {
        // apply local RTS transformation to <group> wrapper
        this.applyTransform($clipPathGroupEl, clipPath.getLocalTransform());
      }
      // apply attributes
      this.applyAttributes(clipPath);

      // apply clipPath to $group
      // @see https://github.com/antvis/g/issues/961
      $groupEl.setAttribute('clip-path', `url(#${clipPathId})`);
    } else {
      // remove clip path
      $groupEl.removeAttribute('clip-path');
    }
  }

  /**
   * the origin is bounding box's top left corner
   */
  private updateAnchorWithTransform(object: DisplayObject) {
    const bounds = object.getGeometryBounds();
    const width = (bounds && bounds.halfExtents[0] * 2) || 0;
    const height = (bounds && bounds.halfExtents[1] * 2) || 0;
    const { anchor } = (object.parsedStyle || {}) as ParsedBaseStyleProps;

    // @ts-ignore
    [object.elementSVG?.$el, object.elementSVG?.$hitTestingEl].forEach(($el: SVGElement) => {
      if ($el) {
        // apply anchor to element's `transform` property
        $el.setAttribute(
          'transform',
          // can't use percent unit like translate(-50%, -50%)
          // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/transform#translate
          `translate(-${anchor[0].value * width},-${anchor[1].value * height})`,
        );

        if (object.nodeName === Shape.CIRCLE || object.nodeName === Shape.ELLIPSE) {
          $el.setAttribute('cx', `${width / 2}`);
          $el.setAttribute('cy', `${height / 2}`);
        }
      }
    });
  }
}
