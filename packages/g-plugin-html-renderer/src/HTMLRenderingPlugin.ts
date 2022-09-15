import type {
  DisplayObject,
  FederatedEvent,
  HTML,
  MutationEvent,
  RenderingPlugin,
  RenderingService,
} from '@antv/g-lite';
import {
  CanvasConfig,
  ContextService,
  CSSRGB,
  ElementEvent,
  inject,
  isPattern,
  RenderingContext,
  RenderingPluginContribution,
  Shape,
  singleton,
} from '@antv/g-lite';
import { isString } from '@antv/util';

const HTML_PREFIX = 'g-html-';

@singleton({ contrib: RenderingPluginContribution })
export class HTMLRenderingPlugin implements RenderingPlugin {
  static tag = 'HTMLRendering';

  constructor(
    @inject(ContextService)
    private contextService: ContextService<CanvasRenderingContext2D>,

    @inject(RenderingContext)
    private renderingContext: RenderingContext,

    @inject(CanvasConfig)
    private canvasConfig: CanvasConfig,
  ) {}

  private $camera: HTMLDivElement;

  apply(renderingService: RenderingService) {
    const setTransform = (object: DisplayObject, $el: HTMLElement) => {
      const worldTransform = object.getWorldTransform();
      $el.style.transform = `matrix(${[
        worldTransform[0],
        worldTransform[1],
        worldTransform[4],
        worldTransform[5],
        worldTransform[12],
        worldTransform[13],
      ].join(',')})`;
    };

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

        setTransform(object, $el);
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

    const handleBoundsChanged = (e: MutationEvent) => {
      const object = e.target as HTML;
      if (object.nodeName === Shape.HTML) {
        const $el = this.getOrCreateEl(object);
        setTransform(object, $el);
      }
    };

    renderingService.hooks.init.tapPromise(HTMLRenderingPlugin.tag, async () => {
      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.addEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
      this.renderingContext.root.addEventListener(ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
    });

    renderingService.hooks.destroy.tap(HTMLRenderingPlugin.tag, () => {
      this.renderingContext.root.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.removeEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
      this.renderingContext.root.removeEventListener(
        ElementEvent.BOUNDS_CHANGED,
        handleBoundsChanged,
      );
    });
  }

  private getId(object: DisplayObject) {
    return object.id || HTML_PREFIX + object.entity;
  }

  private getOrCreateEl(object: DisplayObject) {
    const { document: doc } = this.canvasConfig;
    const existedId = this.getId(object);
    const $canvas = this.contextService.getDomElement() as unknown as HTMLElement;
    const $container = $canvas.parentNode;
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
        // @see https://github.com/antvis/G/issues/1150
        $existedElement.style.left = `${$canvas.offsetLeft || 0}px`;
        $existedElement.style.top = `${$canvas.offsetTop || 0}px`;
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
      case 'transformOrigin':
        const { transformOrigin } = object.parsedStyle;
        $el.style['transform-origin'] = `${transformOrigin[0].value} ${transformOrigin[1].value}`;
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
        $el.style['z-index'] = `${zIndex}`;
        break;
      case 'visibility':
        const { visibility } = object.parsedStyle;
        $el.style.visibility = visibility;
        break;
      case 'pointerEvents':
        const { pointerEvents } = object.parsedStyle;
        $el.style.pointerEvents = pointerEvents;
        break;
      case 'opacity':
        const { opacity } = object.parsedStyle;
        $el.style.opacity = `${opacity}`;
        break;
      case 'fill':
        const { fill } = object.parsedStyle;
        let color = '';
        if (fill instanceof CSSRGB) {
          if (fill.isNone) {
            color = 'transparent';
          } else {
            color = object.getAttribute('fill') as string;
          }
        } else if (Array.isArray(fill)) {
          color = object.getAttribute('fill') as string;
        } else if (isPattern(fill)) {
          // TODO: pattern, use background?
        }
        $el.style.background = color;
        break;
      case 'stroke':
        const { stroke } = object.parsedStyle;
        let borderColor = '';
        if (stroke instanceof CSSRGB) {
          if (stroke.isNone) {
            borderColor = 'transparent';
          } else {
            borderColor = object.getAttribute('stroke') as string;
          }
        } else if (Array.isArray(stroke)) {
          borderColor = object.getAttribute('stroke') as string;
        } else if (isPattern(stroke)) {
          // TODO: pattern, use background?
        }

        $el.style['border-color'] = borderColor;
        $el.style['border-style'] = 'solid';
        break;
      case 'lineWidth':
        const { lineWidth } = object.parsedStyle;
        $el.style['border-width'] = `${lineWidth || 0}px`;
        break;
      case 'lineDash':
        $el.style['border-style'] = 'dashed';
        break;
      case 'filter':
        const { filter } = object.style;
        $el.style.filter = filter;
        break;
    }
  }
}
