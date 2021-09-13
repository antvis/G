import { inject, injectable } from 'inversify';
import {
  SHAPE,
  DisplayObject,
  RenderingService,
  RenderingPlugin,
  Renderable,
  ContextService,
  ParsedHTMLStyleProps,
  PARSED_COLOR_TYPE,
  fromRotationTranslationScale,
  getEuler,
} from '@antv/g';
import { isString } from '@antv/util';

const HTML_PREFIX = 'g-html-';

@injectable()
export class HTMLRenderingPlugin implements RenderingPlugin {
  static tag = 'HTMLRenderingPlugin';

  @inject(ContextService)
  private contextService: ContextService<CanvasRenderingContext2D>;

  private $camera: HTMLDivElement;

  apply(renderingService: RenderingService) {
    renderingService.hooks.unmounted.tap(HTMLRenderingPlugin.tag, (object: DisplayObject) => {
      if (object.nodeName === SHAPE.HTML) {
        const existedId = HTML_PREFIX + object.getEntity().getName();
        const $container = this.contextService.getDomElement()!.parentNode!;
        const $existedElement: HTMLElement | null = $container.querySelector('#' + existedId);
        if ($existedElement) {
          $container.removeChild($existedElement);
        }
      }
    });

    renderingService.hooks.mounted.tap(HTMLRenderingPlugin.tag, (object: DisplayObject) => {
      if (object.nodeName === SHAPE.HTML) {
        const { innerHTML } = object.parsedStyle;
        const existedId = HTML_PREFIX + object.getEntity().getName();
        const $container = this.contextService.getDomElement()!.parentNode!;

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
    });

    renderingService.hooks.render.tap(HTMLRenderingPlugin.tag, (object: DisplayObject) => {
      if (object.nodeName === SHAPE.HTML) {
        const existedId = HTML_PREFIX + object.getEntity().getName();
        const $container = this.contextService.getDomElement()!.parentNode!;

        const $existedElement: HTMLElement | null = $container.querySelector('#' + existedId);
        this.updateCSSStyle($existedElement!, object.parsedStyle, object);
      }
    });
  }

  private updateCSSStyle(
    $el: HTMLElement,
    parsedStyle: ParsedHTMLStyleProps,
    object: DisplayObject,
  ) {
    const {
      zIndex = 0,
      visibility = 'visible',
      opacity = 1,
      fill,
      lineWidth = 0,
      lineDash,
      stroke,
      anchor,
      width = 0,
      height = 0,
      style: initialStyle = '',
      className = '',
    } = parsedStyle;

    const style: Record<string, string | number> = {};
    // use absolute position
    style.position = 'absolute';
    style.top = 0;
    style.left = 0;
    style.width = `${width}px`;
    style.height = `${height}px`;

    // use transform
    style.transform = `matrix3d(${object.getWorldTransform().join(',')})`;

    if (anchor) {
      style.transform += ` translate(${anchor[0] * 100}%, ${anchor[0] * 100}%)`;
    }

    // use unparsed transform origin
    if (object.style.transformOrigin) {
      style['transform-origin'] = object.style.transformOrigin;
    }

    // z-index
    style['z-index'] = zIndex;
    // visibility
    style.visibility = visibility;
    // opacity
    style.opacity = opacity;
    // backgroundColor
    if (fill) {
      let color = '';
      if (fill.type === PARSED_COLOR_TYPE.Constant) {
        color = fill.formatted;
      } else if (fill.type === PARSED_COLOR_TYPE.LinearGradient) {
        const steps = fill.value.steps
          .map((cur) => {
            //  ['0', '#ffffff'],
            return `${cur[1]} ${Number(cur[0]) * 100}%`;
          })
          .join(',');
        // @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient()
        color = `linear-gradient(to right, ${steps});`;
      } else if (fill.type === PARSED_COLOR_TYPE.RadialGradient) {
      } else if (fill.type === PARSED_COLOR_TYPE.Pattern) {
      }
      style.background = color;
    }

    // border
    style['border-width'] = `${lineWidth}px`;
    if (stroke && stroke.type === PARSED_COLOR_TYPE.Constant) {
      style['border-color'] = stroke.formatted;
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
