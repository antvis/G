import {
  DisplayObject,
  FederatedEvent,
  LinearGradient,
  MutationEvent,
  RadialGradient,
  RenderingPlugin,
  RenderingPluginContext,
  ContextService,
  ElementEvent,
  propertyMetadataCache,
  RenderReason,
  Shape,
  isCSSRGB,
} from '@antv/g-lite';
import { isNil } from '@antv/util';
import { mat4 } from 'gl-matrix';
import { ElementSVG } from './components/ElementSVG';
import { resetPatternCounter, type DefElementManager } from './shapes/defs';
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
  cx: 'cx',
  cy: 'cy',
  rx: 'rx',
  ry: 'ry',
  x: 'x',
  y: 'y',
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
  transform: 'matrix(1,0,0,1,0,0)',
};

export type GradientParams = LinearGradient | RadialGradient;

/**
 * G_SVG_PREFIX + nodeName + entity
 *
 * eg. g_svg_circle_345
 */
export const G_SVG_PREFIX = 'g-svg';
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
   * Will be used in g-plugin-svg-picker for finding relative SVG element of current DisplayObject.
   */
  private svgElementMap: WeakMap<SVGElement, DisplayObject> = new WeakMap();

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
  private clipPathUseMap: WeakMap<DisplayObject, SVGUseElement[]> =
    new WeakMap();

  apply(context: RenderingPluginContext) {
    const { renderingService, renderingContext } = context;
    this.context = context;
    // @ts-ignore
    this.context.svgElementMap = this.svgElementMap;
    const canvas = renderingContext.root.ownerDocument.defaultView;

    const { document } = this.context.config;

    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;

      // should remove clipPath already existed in <defs>
      const $useRefs = this.clipPathUseMap.get(object);
      if ($useRefs) {
        const $def = this.defElementManager.getDefElement();
        const existed = $def.querySelector(`#${this.getId(object)}`);
        if (existed) {
          existed.remove();
        }
      }

      // create SVG DOM Node
      this.createSVGDom(document, object, this.$camera);
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      this.defElementManager.clear(object.entity);
      this.clipPathUseMap.delete(object);
      this.removeSVGDom(object);
    };

    const reorderChildren = (object: DisplayObject) => {
      const parent = object.parentNode;
      // @ts-ignore
      const $groupEl = object.parentNode?.elementSVG?.$groupEl;
      const children = (parent?.children || []).slice();

      if ($groupEl) {
        this.reorderChildren(document, $groupEl, children as DisplayObject[]);
      }
    };

    const handleReparent = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      reorderChildren(object);
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
      const target = e.target as DisplayObject;

      const nodes =
        target.nodeName === Shape.FRAGMENT ? target.childNodes : [target];
      nodes.forEach((object: DisplayObject) => {
        // @ts-ignore
        const $el = object.elementSVG?.$el;

        const { fill, stroke, clipPath } = object.parsedStyle;

        if (fill && !isCSSRGB(fill)) {
          this.defElementManager.createOrUpdateGradientAndPattern(
            object,
            $el,
            fill,
            'fill',
            this,
          );
        }
        if (stroke && !isCSSRGB(stroke)) {
          this.defElementManager.createOrUpdateGradientAndPattern(
            object,
            $el,
            stroke,
            'stroke',
            this,
          );
        }
        if (clipPath) {
          const parentInvert = mat4.invert(
            mat4.create(),
            object.getWorldTransform(),
          );

          const clipPathId = `${CLIP_PATH_PREFIX + clipPath.entity}-${object.entity}`;
          const $def = this.defElementManager.getDefElement();
          const $existed = $def.querySelector<SVGElement>(`#${clipPathId}`);
          if ($existed) {
            this.applyTransform($existed, parentInvert);
          }
        }
      });
    };

    renderingService.hooks.init.tap(SVGRendererPlugin.tag, () => {
      const { background, document } = this.context.config;

      // <defs>
      this.defElementManager.init();

      const $svg = (
        this.context.contextService as ContextService<SVGElement>
      ).getContext();
      if (background) {
        $svg.style.background = background;
      }

      // @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/color-interpolation-filters
      $svg.setAttribute('color-interpolation-filters', 'sRGB');

      this.$camera = createSVGElement('g', document);
      this.$camera.id = `${G_SVG_PREFIX}-camera`;
      this.applyTransform(this.$camera, this.context.camera.getOrthoMatrix());
      $svg.appendChild(this.$camera);

      canvas.addEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.addEventListener(ElementEvent.REPARENT, handleReparent);
      canvas.addEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
      canvas.addEventListener(
        ElementEvent.BOUNDS_CHANGED,
        handleGeometryBoundsChanged,
      );
    });

    renderingService.hooks.destroy.tap(SVGRendererPlugin.tag, () => {
      canvas.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.removeEventListener(ElementEvent.REPARENT, handleReparent);
      canvas.removeEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
      canvas.removeEventListener(
        ElementEvent.BOUNDS_CHANGED,
        handleGeometryBoundsChanged,
      );
      resetPatternCounter();
    });

    renderingService.hooks.render.tap(
      SVGRendererPlugin.tag,
      (object: DisplayObject) => {
        this.renderQueue.push(object);
      },
    );

    renderingService.hooks.beginFrame.tap(SVGRendererPlugin.tag, () => {
      const { document: doc } = this.context.config;

      if (this.pendingReorderQueue.size) {
        this.pendingReorderQueue.forEach((object) => {
          const children = (object?.children || []).slice() as DisplayObject[];
          const $parentGroupEl =
            // @ts-ignore
            object?.elementSVG?.$groupEl;

          if ($parentGroupEl) {
            this.reorderChildren(
              doc || document,
              $parentGroupEl,
              children || [],
            );
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
        const $el = ((object as any).elementSVG as ElementSVG)?.$el;
        const $groupEl = ((object as any).elementSVG as ElementSVG)?.$groupEl;

        if ($el && $groupEl) {
          // apply local RTS transformation to <group> wrapper
          // account for anchor
          const localTransform = object.getLocalTransform();
          this.applyTransform($groupEl, localTransform);

          // clipped shapes should also be informed

          const $useRefs = this.clipPathUseMap.get(object);
          if ($useRefs && $useRefs.length) {
            $useRefs.forEach(($use) => {
              // <clipPath transform="matrix()"><circle /></clipPath>
              this.applyTransform($use, object.getWorldTransform());
              // const parentInvert = mat4.invert(
              //   mat4.create(),
              //   (object as DisplayObject).getWorldTransform(),
              // );
              // this.applyTransform($clipPath, parentInvert);
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
              reorderChildren(object);
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
    return object.id || `${G_SVG_PREFIX}-${object.entity}`;
  }

  private reorderChildren(
    doc: Document,
    $groupEl: SVGElement,
    children: DisplayObject[],
  ) {
    // need to reorder parent's children
    children.sort((a, b) => a.sortable.renderOrder - b.sortable.renderOrder);

    if (children.length) {
      // create empty fragment
      const fragment = (doc || document).createDocumentFragment();
      children.forEach((child: DisplayObject) => {
        if (child.isConnected) {
          const $el = ((child as any).elementSVG as ElementSVG).$groupEl;
          if ($el) {
            fragment.appendChild($el);
          }
        }
      });

      $groupEl.appendChild(fragment);
    }
  }

  applyTransform($el: SVGElement, rts: mat4) {
    const matrix = `matrix(${numberToLongString(rts[0])},${numberToLongString(
      rts[1],
    )},${numberToLongString(rts[4])},${numberToLongString(
      rts[5],
    )},${numberToLongString(rts[12])},${numberToLongString(rts[13])})`;

    if (matrix !== $el.getAttribute('transform')) {
      // use proper precision avoiding too long string in `transform`
      // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
      $el.setAttribute('transform', matrix);
    }
    if (matrix === DEFAULT_VALUE_MAP.transform) {
      $el.removeAttribute('transform');
    }
  }

  private applyAttributes(object: DisplayObject) {
    const elementSVG = (object as any).elementSVG as ElementSVG;
    const $el = elementSVG?.$el;
    const $groupEl = elementSVG?.$groupEl;
    if ($el && $groupEl) {
      const { nodeName, attributes } = object;

      if (nodeName !== Shape.HTML) {
        $el.setAttribute('fill', 'none');
      }
      if (nodeName === Shape.IMAGE) {
        $el.setAttribute('preserveAspectRatio', 'none');
      }

      // apply attributes
      this.updateAttribute(object, Object.keys(attributes));
    }
  }

  private updateAttribute(object: DisplayObject, attributes: string[]) {
    const { document } = this.context.config;

    const { $el, $hitTestingEl } = (object as any).elementSVG as ElementSVG;
    const { parsedStyle, nodeName } = object;
    const shouldUpdateElementAttribute = attributes.some((name) =>
      // @ts-ignore
      this.context.SVGElementLifeCycleContribution.shouldUpdateElementAttribute(
        object,
        name,
      ),
    );

    // need re-generate path
    if (shouldUpdateElementAttribute && $el) {
      [$el, $hitTestingEl].forEach(($el) => {
        if ($el) {
          // @ts-ignore
          this.context.SVGElementLifeCycleContribution.updateElementAttribute(
            object,
            $el,
            this.svgElementMap,
          );
        }
      });
    }

    // update common attributes
    attributes.forEach((name) => {
      const usedName = SVG_ATTR_MAP[name];
      const computedValue = parsedStyle[name];
      const computedValueStr =
        !isNil(computedValue) && computedValue.toString();
      const formattedValueStr =
        FORMAT_VALUE_MAP[name]?.[computedValueStr] || computedValueStr;
      const usedValue = parsedStyle[name];
      const inherited = usedName && !!propertyMetadataCache[name]?.inh;

      // <foreignObject>
      if (nodeName === Shape.HTML) {
        if (name === 'fill') {
          $el.style.background = usedValue.toString();
        } else if (name === 'stroke') {
          $el.style['border-color'] = usedValue.toString();
          $el.style['border-style'] = 'solid';
        } else if (name === 'lineWidth') {
          $el.style['border-width'] = `${usedValue || 0}px`;
        } else if (name === 'lineDash') {
          $el.style['border-style'] = 'dashed';
        } else if (name === 'innerHTML') {
          this.createOrUpdateInnerHTML(document, $el, usedValue);
        } else if (name === 'width' || name === 'height' || name === 'class') {
          // width & height are both required for <foreignObject> and cannot be used as style.
          $el.setAttribute(name, usedValue.toString());
        } else if (!isNil(object.style[name]) && object.style[name] !== '') {
          $el.style[name] = object.style[name];
        }
      } else {
        if (
          !usedName ||
          ((nodeName === Shape.GROUP || object.isCustomElement) &&
            (inherited || usedName === 'fill' || usedName === 'stroke'))
        ) {
          return;
        }

        if (name === 'fill') {
          this.defElementManager.createOrUpdateGradientAndPattern(
            object,
            $el,
            usedValue,
            usedName,
            this,
          );
        } else if (name === 'stroke') {
          this.defElementManager.createOrUpdateGradientAndPattern(
            object,
            $el,
            usedValue,
            usedName,
            this,
          );
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
        } else if (!isNil(computedValue)) {
          // use computed value so that we can use cascaded effect in SVG
          // ignore 'unset' and default value
          [$el, $hitTestingEl].forEach(($el: SVGElement) => {
            if ($el && usedName) {
              if (
                computedValueStr !== 'unset' &&
                computedValueStr !== DEFAULT_VALUE_MAP[name]
              ) {
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

  createSVGDom(
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
    const $el =
      // @ts-ignore
      this.context.SVGElementLifeCycleContribution.createElement(
        object,
        this.svgElementMap,
      );
    if ($el) {
      let $groupEl: SVGElement;

      // save $el on parsedStyle, which will be returned in getDomElement()
      if (object.nodeName === Shape.HTML) {
        object.parsedStyle.$el = $el;
      }

      if (this.pluginOptions.outputSVGElementId) {
        // use user-defined id first.
        $el.id = this.getId(object);
      }
      if (this.pluginOptions.outputSVGElementName && object.name) {
        $el.setAttribute('name', object.name);
      }

      if (
        ($el.hasAttribute('data-wrapgroup') || $el.nodeName !== 'g') &&
        !noWrapWithGroup
      ) {
        $groupEl = createSVGElement('g', document);
        // if (this.pluginOptions.outputSVGElementId) {
        //   $groupEl.id = $el.id + '-g';
        // }
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
        root ||
        // @ts-ignore
        (object.parentNode && object.parentNode.elementSVG?.$groupEl);

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
      this.context.SVGElementLifeCycleContribution.destroyElement(
        object,
        $groupEl,
      );
      // object.entity.removeComponent(ElementSVG, true);
    }
  }

  private createOrUpdateHitArea(
    object: DisplayObject,
    $el: SVGElement,
    $groupEl: SVGElement,
  ) {
    const svgElement = (object as any).elementSVG as ElementSVG;
    let { $hitTestingEl } = svgElement;
    const increasedLineWidthForHitTesting = Number(
      object.parsedStyle.increasedLineWidthForHitTesting,
    );

    // account for hitArea
    if (increasedLineWidthForHitTesting) {
      if (!$hitTestingEl) {
        $hitTestingEl = $el.cloneNode() as SVGElement;
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

        // g-plugin-svg-picker will use this map to find target object
        this.svgElementMap.set($hitTestingEl, object);
      }

      // increase interactive line width
      $hitTestingEl.setAttribute(
        'stroke-width',
        `${increasedLineWidthForHitTesting + object.parsedStyle.lineWidth}`,
      );
    } else if ($hitTestingEl) {
      $groupEl.removeChild($hitTestingEl);
      svgElement.$hitTestingEl = null;
    }
  }

  private createOrUpdateInnerHTML(
    doc: Document,
    $el: SVGElement,
    usedValue: any,
  ) {
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
    const { $groupEl } = (object as any).elementSVG as ElementSVG;
    const PREFIX = isTextPath ? TEXT_PATH_PREFIX : CLIP_PATH_PREFIX;
    const attributeNameCamel = isTextPath ? 'g' : 'clipPath';
    const attributeNameHyphen = isTextPath ? 'text-path' : 'clip-path';

    if (clipPath) {
      const clipPathId = `${PREFIX + clipPath.entity}-${object.entity}`;
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
            const $existedClipPath = $def.querySelector(
              `#${this.getId(clipPath)}`,
            );
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
            object.getWorldTransform(),
          );
          this.applyTransform($clipPath, parentInvert);
        }

        if (this.pluginOptions.outputSVGElementId) {
          $clipPath.id = clipPathId;
        }
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
    } else if (!isTextPath) {
      // remove clip path
      $groupEl.removeAttribute(attributeNameHyphen);
    }
  }
}
