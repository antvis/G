import type {
  CSSGradientValue,
  CSSRGB,
  DisplayObject,
  ParsedBaseStyleProps,
  Pattern,
} from '@antv/g-lite';
import { CanvasConfig, ContextService, inject, singleton } from '@antv/g-lite';
import { createSVGElement } from '../../utils/dom';
import { createOrUpdateFilter } from './Filter';
import { createOrUpdateGradientAndPattern } from './Pattern';
import { createOrUpdateShadow } from './Shadow';

const urlRegexp = /url\(#(.*)\)/;

@singleton()
export class DefElementManager {
  constructor(
    @inject(CanvasConfig)
    private canvasConfig: CanvasConfig,

    @inject(ContextService)
    private contextService: ContextService<SVGElement>,
  ) {}

  /**
   * container for <gradient> <clipPath>...
   */
  private $def: SVGDefsElement;

  private gradientCache: Record<string, Set<number>> = {};

  getDefElement() {
    return this.$def;
  }

  init() {
    const { document } = this.canvasConfig;
    const $svg = this.contextService.getContext();
    this.$def = createSVGElement('defs', document) as SVGDefsElement;
    $svg.appendChild(this.$def);
  }

  clear(entity: number) {
    Object.keys(this.gradientCache).forEach((id) => {
      this.clearUnusedDefElement(this.gradientCache, id, entity);
    });
  }

  private clearUnusedDefElement(cache: Record<string, Set<number>>, id: string, entity: number) {
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
  ) {
    const { document: doc, createImage } = this.canvasConfig;

    if ($el) {
      // `url(#${gradientId})`
      const matches = $el.getAttribute(name)?.match(urlRegexp);
      if (matches && matches.length > 1) {
        this.clearUnusedDefElement(this.gradientCache, matches[1], object.entity);
      }

      const newDefElementId = createOrUpdateGradientAndPattern(
        doc || document,
        this.$def,
        object,
        $el,
        parsedColor,
        name,
        createImage,
      );
      if (!this.gradientCache[newDefElementId]) {
        this.gradientCache[newDefElementId] = new Set();
      }
      this.gradientCache[newDefElementId].add(object.entity);
    }
  }

  createOrUpdateShadow(object: DisplayObject, $el: SVGElement, name: string) {
    const { document: doc } = this.canvasConfig;
    createOrUpdateShadow(doc || document, this.$def, object, $el, name);
  }

  createOrUpdateFilter(
    object: DisplayObject,
    $el: SVGElement,
    filters: ParsedBaseStyleProps['filter'],
  ) {
    const { document: doc } = this.canvasConfig;
    createOrUpdateFilter(doc || document, this.$def, object, $el, filters);
  }
}
