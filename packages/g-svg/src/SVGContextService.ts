import type {
  CanvasContext,
  DataURLOptions,
  GlobalRuntime,
  CanvasConfig,
  ContextService,
  DisplayObject,
} from '@antv/g-lite';
import { isBrowser, propertyMetadataCache } from '@antv/g-lite';
import { createSVGElement } from '@antv/g-plugin-svg-renderer';
import { isString } from '@antv/util';

export class SVGContextService implements ContextService<SVGElement> {
  private $container: HTMLElement | null;
  private $namespace: SVGElement | null;
  private dpr: number;

  private canvasConfig: Partial<CanvasConfig>;

  constructor(public context: GlobalRuntime & CanvasContext) {
    this.canvasConfig = context.config;
  }

  init() {
    const { container, document: doc, devicePixelRatio } = this.canvasConfig;

    // create container
    this.$container = isString(container)
      ? (doc || document).getElementById(container)
      : container;
    if (this.$container) {
      if (!this.$container.style.position) {
        this.$container.style.position = 'relative';
      }
      const $namespace = createSVGElement('svg', doc);
      $namespace.setAttribute('width', `${this.canvasConfig.width}`);
      $namespace.setAttribute('height', `${this.canvasConfig.height}`);

      this.$container.appendChild($namespace);

      this.$namespace = $namespace;
    }

    // use user-defined dpr first
    let dpr = devicePixelRatio || (isBrowser && window.devicePixelRatio) || 1;
    dpr = dpr >= 1 ? Math.ceil(dpr) : 1;
    this.dpr = dpr;
  }

  // @ts-ignore
  getDomElement() {
    return this.$namespace;
  }

  getContext() {
    return this.$namespace;
  }

  getDPR() {
    return this.dpr;
  }

  getBoundingClientRect() {
    return this.$namespace?.getBoundingClientRect();
  }

  destroy() {
    // destroy context
    if (this.$container && this.$namespace && this.$namespace.parentNode) {
      this.$container.removeChild(this.$namespace);
    }
  }

  resize(width: number, height: number) {
    // SVG should ignore DPR
    if (this.$namespace) {
      this.$namespace.setAttribute('width', `${width}`);
      this.$namespace.setAttribute('height', `${height}`);
    }
  }

  applyCursorStyle(cursor: string) {
    if (this.$container) {
      this.$container.style.cursor = cursor;
    }
  }

  private generateCSSText(
    animationName: string,
    selector: string,
    keyframes: ComputedKeyframe[],
    timing: ComputedEffectTiming,
    prefixes: Record<string, string> = {},
  ) {
    const { duration, easing, delay, direction, iterations, fill } = timing;

    return (
      `@keyframes ${animationName}{${keyframes
        .map((keyframe) => {
          const { offset, composite, computedOffset, easing, ...rest } =
            keyframe;
          const rules = Object.keys(rest)
            .map((attributeName) => {
              return `${attributeName}:${prefixes[attributeName] || ''}${
                rest[attributeName]
              };`;
            })
            .join('');
          return `${computedOffset * 100}%{${rules}}`;
        })
        .join('')}}` +
      `${selector} {animation: ${animationName} ${duration}ms ${easing} ${delay}ms ${
        iterations === Infinity ? 'infinite' : iterations
      } ${direction} ${fill};}`
    );
  }

  async toDataURL(options: Partial<DataURLOptions> = {}) {
    const cloneNode = this.$namespace.cloneNode(true);

    const { document: doc } = this.canvasConfig;
    let animationCounter = 0;
    let $style: HTMLStyleElement | null = null;

    this.context.renderingContext.root.forEach((object: DisplayObject) => {
      const animations = object.getAnimations();
      if (animations.length) {
        if (!$style) {
          // export animations to <style>, using CSS Transformation
          $style = (doc || document).createElement('style');
          cloneNode.appendChild($style);
        }

        // @ts-ignore
        const svgElement = object.elementSVG;
        const selfSelector = `#${svgElement.$el.id}`;
        const groupSelector = `#${svgElement.$groupEl.id}`;
        let selfCssText = '';
        let groupCssText = '';

        animations.forEach((animation) => {
          const keyframes = animation.effect.getKeyframes();

          // split attributes into self and group
          if (keyframes.length) {
            const selfAttributes = [];
            const groupAttributes = [];
            const {
              offset,
              composite,
              computedOffset,
              easing,
              transformOrigin,
              ...rest
            } = keyframes[0];
            Object.keys(rest).forEach((attributeName) => {
              if (attributeName === 'transform') {
                groupAttributes.push(attributeName);
              }

              const inherited = !!propertyMetadataCache[attributeName]?.inh;
              if (inherited) {
                groupAttributes.push(attributeName);
              } else if (attributeName !== 'transform') {
                selfAttributes.push(attributeName);
              }
            });

            if (groupAttributes.length) {
              const keyframesWithGroup = keyframes.map((keyframe) => {
                const {
                  offset,
                  composite,
                  computedOffset,
                  easing,
                  transformOrigin,
                  ...rest
                } = keyframe;

                const ret = { offset, composite, computedOffset, easing };
                Object.keys(rest).forEach((attributeName) => {
                  if (groupAttributes.includes(attributeName)) {
                    ret[attributeName] = keyframe[attributeName];
                  }
                });
                return ret;
              });
              groupCssText += this.generateCSSText(
                `a${animationCounter++}`,
                groupSelector,
                keyframesWithGroup,
                animation.effect.getComputedTiming(),
                { transform: svgElement.$groupEl.getAttribute('transform') },
              );
            }

            if (selfAttributes.length) {
              const keyframesWithSelf = keyframes.map((keyframe) => {
                const {
                  offset,
                  composite,
                  computedOffset,
                  easing,
                  transformOrigin,
                  ...rest
                } = keyframe;

                const ret = { offset, composite, computedOffset, easing };
                Object.keys(rest).forEach((attributeName) => {
                  if (selfAttributes.includes(attributeName)) {
                    ret[attributeName] = keyframe[attributeName];
                  }
                });
                return ret;
              });

              selfCssText += this.generateCSSText(
                `a${animationCounter++}`,
                selfSelector,
                keyframesWithSelf,
                animation.effect.getComputedTiming(),
              );
            }
          }
        });

        $style.textContent += selfCssText + groupCssText;
      }
    });

    const svgDocType = document.implementation.createDocumentType(
      'svg',
      '-//W3C//DTD SVG 1.1//EN',
      'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd',
    );
    const svgDoc = document.implementation.createDocument(
      'http://www.w3.org/2000/svg',
      'svg',
      svgDocType,
    );
    svgDoc.replaceChild(cloneNode, svgDoc.documentElement);
    return `data:image/svg+xml;charset=utf8,${encodeURIComponent(
      new XMLSerializer().serializeToString(svgDoc),
    )}`;
  }
}
