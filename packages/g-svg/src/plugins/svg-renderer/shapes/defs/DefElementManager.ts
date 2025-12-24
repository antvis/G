import {
  CanvasContext,
  CSSGradientValue,
  CSSRGB,
  DisplayObject,
  ParsedBaseStyleProps,
  Pattern,
  ContextService,
  isPattern,
} from '@antv/g-lite';
import { SVGRendererPlugin } from '../../SVGRendererPlugin';
import { createSVGElement } from '../../utils/dom';
import { createOrUpdateFilter } from './Filter';
import { createOrUpdateGradientAndPattern } from './Pattern';
import { createOrUpdateShadow } from './Shadow';

const urlRegexp = /url\("?#(.*)\)/;

export class DefElementManager {
  constructor(private context: CanvasContext) {}

  /**
   * container for <gradient> <clipPath>...
   */
  private $def: SVGDefsElement;

  private gradientCache: Record<string, Set<number>> = {};

  getDefElement() {
    return this.$def;
  }

  init() {
    const { document } = this.context.config;
    const $svg = (
      this.context.contextService as ContextService<SVGElement>
    ).getContext();
    this.$def = createSVGElement('defs', document) as SVGDefsElement;
    $svg.appendChild(this.$def);
  }

  clear(entity: number) {
    Object.keys(this.gradientCache).forEach((id) => {
      this.clearUnusedDefElement(this.gradientCache, id, entity);
    });
  }

  private clearUnusedDefElement(
    cache: Record<string, Set<number>>,
    id: string,
    entity: number,
  ) {
    if (cache[id] && cache[id].size === 1 && cache[id].has(entity)) {
      const targetElement = this.$def.querySelector(`#${id}`);
      if (targetElement) {
        this.$def.removeChild(targetElement);
      }
    }
  }

  createOrUpdateGradientAndPattern(
    object: DisplayObject,
    $el: SVGElement,
    parsedColor: CSSGradientValue[] | CSSRGB | Pattern,
    name: string,
    plugin: SVGRendererPlugin,
  ) {
    const { document: doc, createImage } = this.context.config;

    if ($el) {
      let attributeValue = '';
      if (isPattern(parsedColor)) {
        // `fill: url(#${patternId})`
        attributeValue = $el.style[name];
      } else {
        // `url(#${gradientId})`
        attributeValue = $el.getAttribute(name) || '';
      }

      const matches = attributeValue.match(urlRegexp);
      if (matches && matches.length > 1) {
        this.clearUnusedDefElement(
          this.gradientCache,
          matches[1].replace('"', ''),
          object.entity,
        );
      }

      const newDefElementId = createOrUpdateGradientAndPattern(
        doc || document,
        this.$def,
        object,
        $el,
        parsedColor,
        name,
        createImage,
        plugin,
      );
      if (newDefElementId) {
        if (!this.gradientCache[newDefElementId]) {
          this.gradientCache[newDefElementId] = new Set();
        }
        this.gradientCache[newDefElementId].add(object.entity);
      }
    }
  }

  createOrUpdateShadow(object: DisplayObject, $el: SVGElement, name: string) {
    const { document: doc } = this.context.config;
    createOrUpdateShadow(doc || document, this.$def, object, $el, name);
  }

  createOrUpdateFilter(
    object: DisplayObject,
    $el: SVGElement,
    filters: ParsedBaseStyleProps['filter'],
  ) {
    const { document: doc } = this.context.config;
    createOrUpdateFilter(doc || document, this.$def, object, $el, filters);
  }
}
