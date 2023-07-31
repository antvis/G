import {
  DisplayObject,
  FederatedEvent,
  GlobalRuntime,
  HTML,
  ICamera,
  MutationEvent,
  RenderingPlugin,
  RenderingPluginContext,
} from '@antv/g-lite';
import {
  CanvasEvent,
  RenderReason,
  isCSSRGB,
  ElementEvent,
  isPattern,
  Shape,
} from '@antv/g-lite';
import { isNil, isNumber, isString } from '@antv/util';
import type { mat4 } from 'gl-matrix';

const HTML_PREFIX = 'g-html-';
const CANVAS_CAMERA_ID = 'g-canvas-camera';

export class HTMLRenderingPlugin implements RenderingPlugin {
  static tag = 'HTMLRendering';

  private context: RenderingPluginContext;

  /**
   * wrapper for camera
   */
  private $camera: HTMLDivElement;

  private joinTransformMatrix(matrix: mat4) {
    return `matrix(${[
      matrix[0],
      matrix[1],
      matrix[4],
      matrix[5],
      matrix[12],
      matrix[13],
    ].join(',')})`;
  }

  apply(context: RenderingPluginContext, runtime: GlobalRuntime) {
    const { camera, renderingContext, renderingService } = context;
    this.context = context;
    const canvas = renderingContext.root.ownerDocument.defaultView;

    const setTransform = (object: HTML, $el: HTMLElement) => {
      $el.style.transform = this.joinTransformMatrix(
        object.getWorldTransform(),
      );
    };

    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as HTML;
      if (object.nodeName === Shape.HTML) {
        if (!this.$camera) {
          this.$camera = this.createCamera(camera);
        }

        // create DOM element
        const $el = this.getOrCreateEl(object);
        this.$camera.appendChild($el);

        // apply documentElement's style
        if (runtime.enableCSSParsing) {
          const { attributes } = object.ownerDocument.documentElement;
          Object.keys(attributes).forEach((name) => {
            $el.style[name] = attributes[name];
          });
        }

        Object.keys(object.attributes).forEach((name) => {
          this.updateAttribute(name, object as HTML);
        });

        setTransform(object, $el);

        this.context.nativeHTMLMap.set($el, object);
      }
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const object = e.target as HTML;
      if (object.nodeName === Shape.HTML && this.$camera) {
        const $el = this.getOrCreateEl(object);
        if ($el) {
          $el.remove();
          this.context.nativeHTMLMap.delete($el);
        }

        // const existedId = this.getId(object);
        // const $existedElement: HTMLElement | null = this.$camera.querySelector('#' + existedId);
        // if ($existedElement) {
        //   this.$camera.removeChild($existedElement);
        // }
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

    const handleCanvasResize = () => {
      if (this.$camera) {
        const { width, height } = this.context.config;
        this.$camera.style.width = `${width || 0}px`;
        this.$camera.style.height = `${height || 0}px`;
      }
    };

    renderingService.hooks.init.tap(HTMLRenderingPlugin.tag, () => {
      canvas.addEventListener(CanvasEvent.RESIZE, handleCanvasResize);
      canvas.addEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.addEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
      canvas.addEventListener(ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
    });

    renderingService.hooks.endFrame.tap(HTMLRenderingPlugin.tag, () => {
      if (
        this.$camera &&
        renderingContext.renderReasons.has(RenderReason.CAMERA_CHANGED)
      ) {
        this.$camera.style.transform = this.joinTransformMatrix(
          camera.getOrthoMatrix(),
        );
      }
    });

    renderingService.hooks.destroy.tap(HTMLRenderingPlugin.tag, () => {
      // remove camera
      if (this.$camera) {
        this.$camera.remove();
      }

      canvas.removeEventListener(CanvasEvent.RESIZE, handleCanvasResize);
      canvas.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.removeEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
      canvas.removeEventListener(
        ElementEvent.BOUNDS_CHANGED,
        handleBoundsChanged,
      );
    });
  }

  private getId(object: DisplayObject) {
    return object.id || HTML_PREFIX + object.entity;
  }

  private createCamera(camera: ICamera) {
    const { document: doc, width, height } = this.context.config;
    const $canvas =
      this.context.contextService.getDomElement() as unknown as HTMLElement;
    const $container = $canvas.parentNode;
    if ($container) {
      const cameraId = CANVAS_CAMERA_ID;
      let $existedCamera = $container.querySelector<HTMLDivElement>(
        '#' + cameraId,
      );
      if (!$existedCamera) {
        const $camera = (doc || document).createElement('div');
        $existedCamera = $camera;
        $camera.id = cameraId;
        // use absolute position
        $camera.style.position = 'absolute';
        // account for DOM element's offset @see https://github.com/antvis/G/issues/1150
        $camera.style.left = `${$canvas.offsetLeft || 0}px`;
        $camera.style.top = `${$canvas.offsetTop || 0}px`;
        $camera.style.transformOrigin = 'left top';
        $camera.style.transform = this.joinTransformMatrix(
          camera.getOrthoMatrix(),
        );
        // HTML elements should not overflow with canvas @see https://github.com/antvis/G/issues/1163
        $camera.style.overflow = 'hidden';
        $camera.style.pointerEvents = 'none';
        $camera.style.width = `${width || 0}px`;
        $camera.style.height = `${height || 0}px`;

        $container.appendChild($camera);
      }

      return $existedCamera;
    }
    return null;
  }

  private getOrCreateEl(object: DisplayObject) {
    const { document: doc } = this.context.config;
    const existedId = this.getId(object);

    let $existedElement: HTMLElement | null = this.$camera.querySelector(
      '#' + existedId,
    );
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

      // use absolute position
      $existedElement.style.position = 'absolute';
      // @see https://github.com/antvis/G/issues/1150
      $existedElement.style.left = `0px`;
      $existedElement.style.top = `0px`;
      $existedElement.style['will-change'] = 'transform';
      $existedElement.style.transform = this.joinTransformMatrix(
        object.getWorldTransform(),
      );
    }

    return $existedElement;
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
        $el.style[
          'transform-origin'
        ] = `${transformOrigin[0].value} ${transformOrigin[1].value}`;
        break;
      case 'width':
        if (this.context.enableCSSParsing) {
          const width = object.computedStyleMap().get('width');
          $el.style.width = width.toString();
        } else {
          const { width } = object.parsedStyle;
          $el.style.width = isNumber(width)
            ? `${width}px`
            : (width as string).toString();
        }
        break;
      case 'height':
        if (this.context.enableCSSParsing) {
          const height = object.computedStyleMap().get('height');
          $el.style.height = height.toString();
        } else {
          const { height } = object.parsedStyle;
          $el.style.height = isNumber(height)
            ? `${height}px`
            : (height as string).toString();
        }
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
        if (isCSSRGB(fill)) {
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
        if (isCSSRGB(stroke)) {
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
      default:
        if (name !== 'x' && name !== 'y') {
          if (!isNil(object.style[name]) && object.style[name] !== '') {
            $el.style[name] = object.style[name];
          }
        }
    }
  }
}
