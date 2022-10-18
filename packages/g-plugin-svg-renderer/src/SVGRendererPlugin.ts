import type {
  DisplayObject,
  FederatedEvent,
  LinearGradient,
  MutationEvent,
  ParsedBaseStyleProps,
  RadialGradient,
  RenderingPlugin,
  RenderingPluginContext,
  ContextService,
} from '@antv/g-lite';
import { CSSRGB, ElementEvent, propertyMetadataCache, RenderReason, Shape } from '@antv/g-lite';
import { mat4 } from 'gl-matrix';
import { ElementSVG } from './components/ElementSVG';
import type { DefElementManager } from './shapes/defs';
import type { SVGRendererPluginOptions } from './interfaces';
import { createSVGElement } from './utils/dom';
import { numberToLongString } from './utils/format';

export const SVG_ATTR_MAP: Record<string, string> = {
  opacity: 'opacity',
  fillStyle: 'fill',
  fill: 'fill',
  fillRule: 'fill-rule',
  fillOpacity: 'fill-opacity',
  strokeStyle: 'stroke',
  strokeOpacity: 'stroke-opacity',
  stroke: 'stroke',
  clipPath: 'clip-path',
  textPath: 'text-path',
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
  // style: 'style',
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
  pointerEvents: 'pointer-events',
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
  fillRule: 'nonzero',
  strokeOpacity: '1',
  strokeWidth: '0',
  strokeMiterLimit: '4',
  letterSpacing: '0',
  fontSize: 'inherit',
  fontFamily: 'inherit',
  pointerEvents: 'auto',
};

export type GradientParams = LinearGradient | RadialGradient;

/**
 * G_SVG_PREFIX + nodeName + entity
 *
 * eg. g_svg_circle_345
 */
export const G_SVG_PREFIX = 'g_svg';
export const CLIP_PATH_PREFIX = 'clip-path-';
export const TEXT_PATH_PREFIX = 'text-path-';

export class SVGRendererPlugin implements RenderingPlugin {
  static tag = 'SVGRenderer';

  constructor(
    private pluginOptions: SVGRendererPluginOptions,
    private defElementManager: DefElementManager,
    private context: RenderingPluginContext,
  ) {}

  /**
   * <camera>
   */
  private $camera: SVGElement;

  /**
   * render at the end of frame
   */
  private renderQueue: DisplayObject[] = [];

  /**
   * dirty attributes at the end of frame
   */
  private dirtyAttributes: WeakMap<DisplayObject, string[]> = new WeakMap();

  /**
   * reorder after mounted
   */
  private pendingReorderQueue: Set<DisplayObject> = new Set();

  /**
   * <use> elements in <clipPath>, which should be sync with clipPath
   *
   * @example
   * <clipPath transform="matrix(1,0,0,1,-100,-155)" id="clip-path-0-2">
   *  <use href="#g_svg_circle_0" transform="matrix(1.477115,0,0,1.477115,150,150)">
   *  </use>
   * </clipPath>
   */
  private clipPathUseMap: WeakMap<DisplayObject, SVGUseElement[]> = new WeakMap();

  apply(context: RenderingPluginContext) {
    const { renderingService, renderingContext } = context;
    this.context = context;

    const { document } = this.context.config;

    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      // create SVG DOM Node
      this.createSVGDom(document, object, this.$camera);
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      this.defElementManager.clear(object.entity);
      this.clipPathUseMap.delete(object);
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

      let attribtues = this.dirtyAttributes.get(object);
      if (!attribtues) {
        this.dirtyAttributes.set(object, []);
        attribtues = this.dirtyAttributes.get(object);
      }

      attribtues.push(attrName);
    };

    const handleGeometryBoundsChanged = (e: MutationEvent) => {
      const object = e.target as DisplayObject;
      // @ts-ignore
      const $el = object.elementSVG?.$el;

      const { fill, stroke } = object.parsedStyle as ParsedBaseStyleProps;

      if (fill && !(fill instanceof CSSRGB)) {
        this.defElementManager.createOrUpdateGradientAndPattern(object, $el, fill, 'fill');
      }
      if (stroke && !(stroke instanceof CSSRGB)) {
        this.defElementManager.createOrUpdateGradientAndPattern(object, $el, stroke, 'stroke');
      }
    };

    renderingService.hooks.init.tapPromise(SVGRendererPlugin.tag, async () => {
      const { background, document } = this.context.config;

      // <defs>
      this.defElementManager.init();

      const $svg = (this.context.contextService as ContextService<SVGElement>).getContext()!;
      if (background) {
        $svg.style.background = background;
      }

      // @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/color-interpolation-filters
      $svg.setAttribute('color-interpolation-filters', 'sRGB');

      this.$camera = createSVGElement('g', document);
      this.$camera.id = `${G_SVG_PREFIX}_camera`;
      this.applyTransform(this.$camera, this.context.camera.getOrthoMatrix());
      $svg.appendChild(this.$camera);

      renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      renderingContext.root.addEventListener(ElementEvent.ATTR_MODIFIED, handleAttributeChanged);
      renderingContext.root.addEventListener(
        ElementEvent.BOUNDS_CHANGED,
        handleGeometryBoundsChanged,
      );
    });

    renderingService.hooks.destroy.tap(SVGRendererPlugin.tag, () => {
      renderingContext.root.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      renderingContext.root.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      renderingContext.root.removeEventListener(ElementEvent.ATTR_MODIFIED, handleAttributeChanged);
      renderingContext.root.removeEventListener(
        ElementEvent.BOUNDS_CHANGED,
        handleGeometryBoundsChanged,
      );
    });

    renderingService.hooks.render.tap(SVGRendererPlugin.tag, (object: DisplayObject) => {
      // if (!object.isCulled()) {
      this.renderQueue.push(object);
      // }
    });

    renderingService.hooks.beginFrame.tap(SVGRendererPlugin.tag, () => {
      const { document: doc } = this.context.config;

      if (this.pendingReorderQueue.size) {
        this.pendingReorderQueue.forEach((object) => {
          const children = (object?.children || []).slice() as DisplayObject[];
          const $parentGroupEl =
            // @ts-ignore
            object?.elementSVG?.$groupEl;

          if ($parentGroupEl) {
            this.reorderChildren(doc || document, $parentGroupEl, children || []);
          }
        });
        this.pendingReorderQueue.clear();
      }
    });

    renderingService.hooks.endFrame.tap(SVGRendererPlugin.tag, () => {
      if (renderingContext.renderReasons.has(RenderReason.CAMERA_CHANGED)) {
        this.applyTransform(this.$camera, this.context.camera.getOrthoMatrix());
      }

      this.renderQueue.forEach((object) => {
        // @ts-ignore
        const $el = object.elementSVG?.$el;
        // @ts-ignore
        const $groupEl = object.elementSVG?.$groupEl;

        if ($el && $groupEl) {
          // apply local RTS transformation to <group> wrapper
          // account for anchor
          const localTransform = object.getLocalTransform();
          this.applyTransform($groupEl, localTransform);

          // clipped shapes should also be informed

          const $useRefs = this.clipPathUseMap.get(object);
          if ($useRefs && $useRefs.length) {
            $useRefs.forEach(($use) => {
              this.applyTransform($use, localTransform);
            });
          }

          // finish rendering, clear dirty flag
          object.renderable.dirty = false;
        }

        // update dirty attributes
        const attributes = this.dirtyAttributes.get(object);
        if (attributes) {
          attributes.forEach((attrName) => {
            if (attrName === 'zIndex') {
              const parent = object.parentNode;
              // @ts-ignore
              const $groupEl = object.parentNode?.elementSVG?.$groupEl;
              const children = (parent?.children || []).slice();

              if ($groupEl) {
                this.reorderChildren(document, $groupEl, children as DisplayObject[]);
              }
            } else if (attrName === 'increasedLineWidthForHitTesting') {
              this.createOrUpdateHitArea(object, $el, $groupEl);
            }

            this.updateAttribute(object, [attrName]);
          });

          this.dirtyAttributes.delete(object);
        }
      });
      this.renderQueue = [];
    });
  }

  private getId(object: DisplayObject) {
    return `${G_SVG_PREFIX}_${object.nodeName}_${object.entity}`;
  }

  private reorderChildren(doc: Document, $groupEl: SVGElement, children: DisplayObject[]) {
    // need to reorder parent's children
    children.sort((a, b) => a.sortable.renderOrder - b.sortable.renderOrder);

    if (children.length) {
      // create empty fragment
      const fragment = (doc || document).createDocumentFragment();
      children.forEach((child: DisplayObject) => {
        if (child.isConnected) {
          // @ts-ignore
          const $el = child.elementSVG.$groupEl;
          if ($el) {
            fragment.appendChild($el);
          }
        }
      });

      $groupEl.appendChild(fragment);
    }
  }

  private applyTransform($el: SVGElement, rts: mat4) {
    // use proper precision avoiding too long string in `transform`
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
    $el.setAttribute(
      'transform',
      `matrix(${numberToLongString(rts[0])},${numberToLongString(rts[1])},${numberToLongString(
        rts[4],
      )},${numberToLongString(rts[5])},${numberToLongString(rts[12])},${numberToLongString(
        rts[13],
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
    const { document } = this.context.config;

    // @ts-ignore
    const { $el, $groupEl, $hitTestingEl } = object.elementSVG as ElementSVG;
    const { parsedStyle, computedStyle } = object;
    const shouldUpdateElementAttribute = attributes.some((name) =>
      // @ts-ignore
      this.context.SVGElementLifeCycleContribution.shouldUpdateElementAttribute(object, name),
    );

    // need re-generate path
    if (shouldUpdateElementAttribute && $el) {
      [$el, $hitTestingEl].forEach(($el) => {
        if ($el) {
          // @ts-ignore
          this.context.SVGElementLifeCycleContribution.updateElementAttribute(object, $el);
          if (object.nodeName !== Shape.TEXT) {
            this.updateAnchorWithTransform(object);
          }
        }
      });
    }

    // update common attributes
    attributes.forEach((name) => {
      const usedName = SVG_ATTR_MAP[name];
      const computedValue = computedStyle[name];
      const computedValueStr = computedValue && computedValue.toString();
      const formattedValueStr = FORMAT_VALUE_MAP[name]?.[computedValueStr] || computedValueStr;
      const usedValue = parsedStyle[name];
      const inherited = !!propertyMetadataCache[name]?.inh;

      if (!usedName) {
        return;
      }

      // <foreignObject>
      if (object.nodeName === Shape.HTML) {
        if (name === 'lineWidth') {
          $el.style['border-width'] = `${usedValue || 0}px`;
        } else if (name === 'lineDash') {
          $el.style['border-style'] = 'dashed';
        }
      }

      if (name === 'fill') {
        if (object.nodeName === Shape.HTML) {
          $el.style.background = usedValue.toString();
        } else {
          this.defElementManager.createOrUpdateGradientAndPattern(object, $el, usedValue, usedName);
        }
      } else if (name === 'stroke') {
        if (object.nodeName === Shape.HTML) {
          $el.style['border-color'] = usedValue.toString();
          $el.style['border-style'] = 'solid';
        } else {
          this.defElementManager.createOrUpdateGradientAndPattern(object, $el, usedValue, usedName);
        }
      } else if (inherited && usedName) {
        // use computed value
        // update `visibility` on <group>
        if (computedValueStr !== 'unset' && computedValueStr !== DEFAULT_VALUE_MAP[name]) {
          $groupEl?.setAttribute(usedName, formattedValueStr);
        } else {
          $groupEl?.removeAttribute(usedName);
        }
      } else if (name === 'clipPath') {
        this.createOrUpdateClipOrTextPath(document, usedValue, object);
      } else if (name === 'textPath') {
        this.createOrUpdateClipOrTextPath(document, usedValue, object, true);
      } else if (
        name === 'shadowType' ||
        name === 'shadowColor' ||
        name === 'shadowBlur' ||
        name === 'shadowOffsetX' ||
        name === 'shadowOffsetY'
      ) {
        this.defElementManager.createOrUpdateShadow(object, $el, name);
      } else if (name === 'filter') {
        this.defElementManager.createOrUpdateFilter(object, $el, usedValue);
      } else if (name === 'innerHTML') {
        this.createOrUpdateInnerHTML(document, $el, usedValue);
      } else if (name === 'anchor') {
        // text' anchor is controlled by `textAnchor` property
        if (object.nodeName !== Shape.TEXT) {
          this.updateAnchorWithTransform(object);
        }
      } else {
        if (computedValue) {
          // use computed value so that we can use cascaded effect in SVG
          // ignore 'unset' and default value
          [$el, $hitTestingEl].forEach(($el: SVGElement) => {
            if ($el && usedName) {
              if (computedValueStr !== 'unset' && computedValueStr !== DEFAULT_VALUE_MAP[name]) {
                $el.setAttribute(usedName, formattedValueStr);
              } else {
                $el.removeAttribute(usedName);
              }
            }
          });
        }
      }
    });
  }

  private createSVGDom(
    document: Document,
    object: DisplayObject,
    root: SVGElement,
    noWrapWithGroup = false,
  ) {
    // create svg element
    // @ts-ignore
    object.elementSVG = new ElementSVG();
    // @ts-ignore
    const svgElement = object.elementSVG;

    // use <group> as default, eg. CustomElement
    // @ts-ignore
    const $el = this.context.SVGElementLifeCycleContribution.createElement(object);
    if ($el) {
      let $groupEl: SVGElement;

      // save $el on parsedStyle, which will be returned in getDomElement()
      if (object.nodeName === Shape.HTML) {
        object.parsedStyle.$el = $el;
      }

      if (this.pluginOptions.outputSVGElementId) {
        $el.id = this.getId(object);
      }
      if (this.pluginOptions.outputSVGElementName && object.name) {
        $el.setAttribute('name', object.name);
      }

      if (($el.hasAttribute('data-wrapgroup') || $el.nodeName !== 'g') && !noWrapWithGroup) {
        $groupEl = createSVGElement('g', document);
        $groupEl.appendChild($el);
      } else {
        $groupEl = $el;
      }

      svgElement.$el = $el;
      svgElement.$groupEl = $groupEl;

      // apply attributes at first time
      this.applyAttributes(object);

      // create hitArea if necessary
      this.createOrUpdateHitArea(object, $el, $groupEl);

      const $parentGroupEl =
        // @ts-ignore
        (object.parentNode && object.parentNode.elementSVG?.$groupEl) || root;

      if ($parentGroupEl) {
        $parentGroupEl.appendChild($groupEl);

        // need reorder children later
        this.pendingReorderQueue.add(object.parentNode as DisplayObject);
      }
    }
  }

  private removeSVGDom(object: DisplayObject) {
    // @ts-ignore
    const $groupEl = object.elementSVG?.$groupEl;
    if ($groupEl && $groupEl.parentNode) {
      $groupEl.parentNode.removeChild($groupEl);

      // @ts-ignore
      this.context.SVGElementLifeCycleContribution.destroyElement(object, $groupEl);
      // object.entity.removeComponent(ElementSVG, true);
    }
  }

  private createOrUpdateHitArea(object: DisplayObject, $el: SVGElement, $groupEl: SVGElement) {
    // @ts-ignore
    const svgElement = object.elementSVG as ElementSVG;
    let $hitTestingEl = svgElement.$hitTestingEl;
    const increasedLineWidthForHitTesting = object.parsedStyle.increasedLineWidthForHitTesting;

    // account for hitArea
    if (increasedLineWidthForHitTesting) {
      if (!$hitTestingEl) {
        $hitTestingEl = $el.cloneNode() as SVGElement;

        if (this.pluginOptions.outputSVGElementId) {
          // use the entity suffix, so that `g-plugin-svg-picker` can extract
          $hitTestingEl.id = `${G_SVG_PREFIX}_${object.nodeName}_hittesting_${object.entity}`;
        }
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
        `${increasedLineWidthForHitTesting + object.parsedStyle.lineWidth}`,
      );
    } else {
      if ($hitTestingEl) {
        $groupEl.removeChild($hitTestingEl);
        svgElement.$hitTestingEl = null;
      }
    }
  }

  private createOrUpdateInnerHTML(doc: Document, $el: SVGElement, usedValue: any) {
    const $div = (doc || document).createElement('div');
    if (typeof usedValue === 'string') {
      $div.innerHTML = usedValue;
    } else {
      $div.appendChild(usedValue);
    }
    $el.innerHTML = '';
    $el.appendChild($div);
  }

  private createOrUpdateClipOrTextPath(
    document: Document,
    clipPath: DisplayObject,
    object: DisplayObject,
    isTextPath = false,
  ) {
    // @ts-ignore
    const { $groupEl } = object.elementSVG;
    const PREFIX = isTextPath ? TEXT_PATH_PREFIX : CLIP_PATH_PREFIX;
    const attributeNameCamel = isTextPath ? 'g' : 'clipPath';
    const attributeNameHyphen = isTextPath ? 'text-path' : 'clip-path';

    if (clipPath) {
      const clipPathId = PREFIX + clipPath.entity + '-' + object.entity;
      const $def = this.defElementManager.getDefElement();

      const existed = $def.querySelector(`#${clipPathId}`);
      if (!existed) {
        let $clipPath: SVGElement;
        if (isTextPath) {
          // use <path> directly instead of wrapping with <g>
          this.createSVGDom(document, clipPath, null, true);
          // @ts-ignore
          $clipPath = clipPath.elementSVG.$el;
        } else {
          // the clipPath is allowed to be detached from canvas
          if (!clipPath.isConnected) {
            const $existedClipPath = $def.querySelector(`#${this.getId(clipPath)}`);
            if (!$existedClipPath) {
              this.createSVGDom(document, clipPath, $def, true);
            }
          }

          // create <clipPath> dom node
          $clipPath = createSVGElement(attributeNameCamel, document);
          const $use = createSVGElement('use', document) as SVGUseElement;
          // @ts-ignore
          $use.setAttribute('href', `#${clipPath.elementSVG.$el.id}`);
          $clipPath.appendChild($use);

          let $useRefs = this.clipPathUseMap.get(clipPath);
          if (!$useRefs) {
            this.clipPathUseMap.set(clipPath, []);
            $useRefs = this.clipPathUseMap.get(clipPath);
          }
          $useRefs.push($use);

          // <clipPath transform="matrix()"><circle /></clipPath>
          this.applyTransform($use, clipPath.getWorldTransform());
          const parentInvert = mat4.invert(
            mat4.create(),
            (object as DisplayObject).getWorldTransform(),
          );
          this.applyTransform($clipPath, parentInvert);
        }

        $clipPath.id = clipPathId;
        // append it to <defs>
        $def.appendChild($clipPath);
      }

      // apply attributes
      this.applyAttributes(clipPath);

      if (!isTextPath) {
        // apply clipPath to $group
        // @see https://github.com/antvis/g/issues/961
        $groupEl.setAttribute(attributeNameHyphen, `url(#${clipPathId})`);
      }
    } else {
      if (!isTextPath) {
        // remove clip path
        $groupEl.removeAttribute(attributeNameHyphen);
      }
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
        const tx = -(anchor[0] * width);
        const ty = -(anchor[1] * height);

        if (tx !== 0 || ty !== 0) {
          // apply anchor to element's `transform` property
          $el.setAttribute(
            'transform',
            // can't use percent unit like translate(-50%, -50%)
            // @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/transform#translate
            `translate(${tx},${ty})`,
          );
        }

        if (object.nodeName === Shape.CIRCLE || object.nodeName === Shape.ELLIPSE) {
          $el.setAttribute('cx', `${width / 2}`);
          $el.setAttribute('cy', `${height / 2}`);
        }
      }
    });
  }
}
