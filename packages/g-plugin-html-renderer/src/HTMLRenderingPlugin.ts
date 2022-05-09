import { inject, singleton } from 'mana-syringe';
import type {
  DisplayObject,
  RenderingService,
  RenderingPlugin,
  ParsedHTMLStyleProps,
  FederatedEvent,
  LinearGradient,
} from '@antv/g';
import { CSSRGB, CSSGradientValue, GradientPatternType } from '@antv/g';
import {
  Shape,
  RenderingPluginContribution,
  ContextService,
  RenderingContext,
  ElementEvent,
  isString,
} from '@antv/g';

const HTML_PREFIX = 'g-html-';

@singleton({ contrib: RenderingPluginContribution })
export class HTMLRenderingPlugin implements RenderingPlugin {
  static tag = 'HTMLRendering';

  @inject(ContextService)
  private contextService: ContextService<CanvasRenderingContext2D>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  private $camera: HTMLDivElement;

  apply(renderingService: RenderingService) {
    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      if (object.nodeName === Shape.HTML) {
        const { innerHTML } = object.parsedStyle;
        const existedId = HTML_PREFIX + object.entity;
        const $container = (this.contextService.getDomElement() as HTMLElement).parentNode;

        if ($container) {
          const $existedElement: HTMLElement | null = $container.querySelector('#' + existedId);
          if (!$existedElement) {
            const $div = document.createElement('div');
            object.parsedStyle.$el = $div;
            $div.id = existedId;
            if (isString(innerHTML)) {
              $div.innerHTML = innerHTML;
            } else {
              $div.appendChild(innerHTML);
            }
            $container.appendChild($div);
          }
        }
      }
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      if (object.nodeName === Shape.HTML) {
        const existedId = HTML_PREFIX + object.entity;
        const $container = (this.contextService.getDomElement() as HTMLElement).parentNode;
        if ($container) {
          const $existedElement: HTMLElement | null = $container.querySelector('#' + existedId);
          if ($existedElement) {
            $container.removeChild($existedElement);
          }
        }
      }
    };

    renderingService.hooks.init.tapPromise(HTMLRenderingPlugin.tag, async () => {
      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
    });

    renderingService.hooks.destroy.tap(HTMLRenderingPlugin.tag, () => {
      this.renderingContext.root.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
    });

    renderingService.hooks.render.tap(HTMLRenderingPlugin.tag, (object: DisplayObject) => {
      if (object.nodeName === Shape.HTML) {
        const existedId = HTML_PREFIX + object.entity;
        const $container = (this.contextService.getDomElement() as HTMLElement).parentNode;
        if ($container) {
          const $existedElement: HTMLElement | null = $container.querySelector('#' + existedId);
          this.updateCSSStyle($existedElement!, object.parsedStyle, object);
        }
      }
    });
  }

  private updateCSSStyle(
    $el: HTMLElement,
    parsedStyle: ParsedHTMLStyleProps,
    object: DisplayObject,
  ) {
    const {
      zIndex,
      visibility,
      opacity,
      fill,
      lineWidth,
      lineDash,
      stroke,
      width,
      height,
      style: initialStyle = '',
      className = '',
    } = parsedStyle;

    let contentWidth = 0;
    let contentHeight = 0;
    const { value: widthValue } = width;
    const { value: heightValue } = height;
    contentWidth = widthValue;
    contentHeight = heightValue;

    const style: Record<string, string | number> = {};
    // use absolute position
    style.position = 'absolute';
    style.top = 0;
    style.left = 0;
    style.width = `${contentWidth}px`;
    style.height = `${contentHeight}px`;

    // use transform
    style.transform = `matrix3d(${object.getWorldTransform().join(',')})`;

    // use unparsed transform origin
    if (object.style.transformOrigin) {
      style['transform-origin'] = object.style.transformOrigin;
    }

    // z-index
    style['z-index'] = zIndex.value;
    // visibility
    style.visibility = visibility.value;
    // opacity
    style.opacity = opacity.value;
    // backgroundColor
    if (fill) {
      let color = '';
      if (fill instanceof CSSRGB) {
        color = fill.toString();
      } else if (fill instanceof CSSGradientValue) {
        if (fill.type === GradientPatternType.LinearGradient) {
          const steps = (fill.value as LinearGradient).steps
            .map((cur) => {
              //  ['0', '#ffffff'],
              return `${cur[1]} ${Number(cur[0]) * 100}%`;
            })
            .join(',');
          // @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient()
          color = `linear-gradient(to right, ${steps});`;
        }
      }
      style.background = color;
    }

    // border
    style['border-width'] = `${lineWidth?.value || 0}px`;
    if (stroke) {
      style['border-color'] = stroke.toString();
      style['border-style'] = 'solid';
    }
    if (lineDash) {
      style['border-style'] = 'dashed';
    }

    // filters
    if (object.style.filter) {
      // use unparsed filter directly
      style.filter = object.style.filter;
    }

    if (className) {
      if (Array.isArray(className)) {
        className.forEach((c) => {
          $el.classList.add(c);
        });
      } else {
        $el.classList.add(className);
      }
    }
    $el.setAttribute(
      'style',
      Object.keys(style)
        .map((key) => `${key}:${style[key]}`)
        .join(';') + initialStyle,
    );
  }
}
