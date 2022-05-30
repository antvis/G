import type {
  DisplayObject,
  FederatedEvent,
  HTML,
  LinearGradient,
  MutationEvent,
  RenderingPlugin,
  RenderingService,
} from '@antv/g';
import {
  CanvasConfig,
  ContextService,
  CSSGradientValue,
  CSSRGB,
  ElementEvent,
  GradientPatternType,
  isString,
  RenderingContext,
  RenderingPluginContribution,
  Shape,
} from '@antv/g';
import { inject, singleton } from 'mana-syringe';

const HTML_PREFIX = 'g-html-';

@singleton({ contrib: RenderingPluginContribution })
export class HTMLRenderingPlugin implements RenderingPlugin {
  static tag = 'HTMLRendering';

  @inject(ContextService)
  private contextService: ContextService<CanvasRenderingContext2D>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  private $camera: HTMLDivElement;

  apply(renderingService: RenderingService) {
    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      if (object.nodeName === Shape.HTML) {
        const $el = this.getOrCreateEl(object);
        // apply documentElement's style
        const { attributes } = object.ownerDocument.documentElement;
        Object.keys(attributes).forEach((name) => {
          $el.style[name] = attributes[name];
        });

        Object.keys(object.attributes).forEach((name) => {
          this.updateAttribute(name, object as HTML);
        });
      }
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      if (object.nodeName === Shape.HTML) {
        const existedId = this.getId(object);
        const $container = (this.contextService.getDomElement() as unknown as HTMLElement)
          .parentNode;
        if ($container) {
          const $existedElement: HTMLElement | null = $container.querySelector('#' + existedId);
          if ($existedElement) {
            $container.removeChild($existedElement);
          }
        }
      }
    };

    const handleAttributeChanged = (e: MutationEvent) => {
      const object = e.target as HTML;
      if (object.nodeName === Shape.HTML) {
        const { attrName } = e;
        this.updateAttribute(attrName, object);
      }
    };

    renderingService.hooks.init.tapPromise(HTMLRenderingPlugin.tag, async () => {
      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.addEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
    });

    renderingService.hooks.destroy.tap(HTMLRenderingPlugin.tag, () => {
      this.renderingContext.root.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.removeEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
    });
  }

  private getId(object: DisplayObject) {
    return object.id || HTML_PREFIX + object.entity;
  }

  private getOrCreateEl(object: DisplayObject) {
    const { document: doc } = this.canvasConfig;
    const existedId = this.getId(object);
    const $container = (this.contextService.getDomElement() as unknown as HTMLElement).parentNode;
    if ($container) {
      let $existedElement: HTMLElement | null = $container.querySelector('#' + existedId);
      if (!$existedElement) {
        $existedElement = (doc || document).createElement('div');
        object.parsedStyle.$el = $existedElement;
        $existedElement.id = existedId;
        if (object.name) {
          $existedElement.setAttribute('name', object.name);
        }
        if (object.className) {
          $existedElement.className = object.className;
        }

        $container.appendChild($existedElement);

        // use absolute position
        $existedElement.style.position = 'absolute';
        $existedElement.style.left = '0';
        $existedElement.style.top = '0';
        $existedElement.style['will-change'] = 'transform';
        const worldTransform = object.getWorldTransform();
        $existedElement.style.transform = `matrix(${[
          worldTransform[0],
          worldTransform[1],
          worldTransform[4],
          worldTransform[5],
          worldTransform[12],
          worldTransform[13],
        ].join(',')})`;
      }

      return $existedElement;
    }

    return null;
  }

  private updateAttribute(name: string, object: HTML) {
    const $el = this.getOrCreateEl(object);
    switch (name) {
      case 'innerHTML':
        const { innerHTML } = object.parsedStyle;
        if (isString(innerHTML)) {
          $el.innerHTML = innerHTML;
        } else {
          $el.innerHTML = '';
          $el.appendChild(innerHTML);
        }
        break;
      case 'modelMatrix':
      case 'transformOrigin':
        const { transformOrigin } = object.parsedStyle;
        $el.style['transform-origin'] = `${transformOrigin[0].value} ${transformOrigin[1].value}`;
        const worldTransform = object.getWorldTransform();
        $el.style.transform = `matrix(${[
          worldTransform[0],
          worldTransform[1],
          worldTransform[4],
          worldTransform[5],
          worldTransform[12],
          worldTransform[13],
        ].join(',')})`;
        break;
      case 'width':
        const width = object.computedStyleMap().get('width');
        $el.style.width = width.toString();
        break;
      case 'height':
        const height = object.computedStyleMap().get('height');
        $el.style.height = height.toString();
        break;
      case 'zIndex':
        const { zIndex } = object.parsedStyle;
        $el.style['z-index'] = `${zIndex.value}`;
        break;
      case 'visibility':
        const { visibility } = object.parsedStyle;
        $el.style.visibility = visibility.value;
        break;
      case 'pointerEvents':
        const { pointerEvents } = object.parsedStyle;
        $el.style.pointerEvents = pointerEvents.value;
        break;
      case 'opacity':
        const { opacity } = object.parsedStyle;
        $el.style.opacity = `${opacity.value}`;
        break;
      case 'fill':
        const { fill } = object.parsedStyle;
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
        $el.style.background = color;
        break;
      case 'stroke':
        const { stroke } = object.parsedStyle;
        $el.style['border-color'] = stroke.toString();
        $el.style['border-style'] = 'solid';
        break;
      case 'lineWidth':
        const { lineWidth } = object.parsedStyle;
        $el.style['border-width'] = `${lineWidth.value || 0}px`;
        break;
      case 'lineDash':
        $el.style['border-style'] = 'dashed';
        break;
      case 'filter':
        const { filter } = object.parsedStyle;
        $el.style.filter = filter;
        break;
    }
  }
}
