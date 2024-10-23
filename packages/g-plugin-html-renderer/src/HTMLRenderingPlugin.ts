import {
  DisplayObject,
  FederatedEvent,
  GlobalRuntime,
  HTML,
  ICamera,
  MutationEvent,
  RenderingPlugin,
  RenderingPluginContext,
  CanvasEvent,
  RenderReason,
  isCSSRGB,
  ElementEvent,
  isPattern,
  Shape,
} from '@antv/g-lite';
import { isNil, isNumber, isString } from '@antv/util';
import type { mat4, vec3 } from 'gl-matrix';

const CANVAS_CAMERA_ID = 'g-canvas-camera';

export class HTMLRenderingPlugin implements RenderingPlugin {
  static tag = 'HTMLRendering';

  private context: RenderingPluginContext;

  /**
   * wrapper for camera
   */
  private $camera: HTMLDivElement;

  private displayObjectHTMLElementMap = new WeakMap<
    DisplayObject,
    HTMLElement
  >();

  /**
   * ! The reason for adding `offset` is that the `transform-origin` coordinate system of DOM is the local coordinate system of the element, while the `transform-origin` coordinate system of canvas drawing is the local coordinate system of the element's parent element. At the same time, the `transform` attribute value of the DOM element does not include `transform-origin`.
   */
  private joinTransformMatrix(matrix: mat4, offset: vec3 = [0, 0, 0]) {
    return `matrix(${[
      matrix[0],
      matrix[1],
      matrix[4],
      matrix[5],
      matrix[12] + offset[0],
      matrix[13] + offset[1],
    ].join(',')})`;
  }

  apply(context: RenderingPluginContext, runtime: GlobalRuntime) {
    const { camera, renderingContext, renderingService } = context;
    this.context = context;
    const canvas = renderingContext.root.ownerDocument.defaultView;
    const { nativeHTMLMap } = canvas.context.eventService;

    const setTransform = (object: HTML, $el: HTMLElement) => {
      $el.style.transform = this.joinTransformMatrix(
        object.getWorldTransform(),
        object.getOrigin(),
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

        Object.keys(object.attributes).forEach((name) => {
          this.updateAttribute(name, object);
        });

        setTransform(object, $el);

        nativeHTMLMap.set($el, object);
      }
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const object = e.target as HTML;
      if (object.nodeName === Shape.HTML && this.$camera) {
        const $el = this.getOrCreateEl(object);
        if ($el) {
          $el.remove();
          nativeHTMLMap.delete($el);
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
      const nodes =
        object.nodeName === Shape.FRAGMENT ? object.childNodes : [object];

      nodes.forEach((node: HTML) => {
        if (node.nodeName === Shape.HTML) {
          const $el = this.getOrCreateEl(node);
          setTransform(node, $el);
        }
      });
    };

    const handleCanvasResize = () => {
      if (this.$camera) {
        const { width, height } = this.context.config;
        this.$camera.parentElement.style.width = `${width || 0}px`;
        this.$camera.parentElement.style.height = `${height || 0}px`;
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

  private createCamera(camera: ICamera) {
    const { document: doc, width, height } = this.context.config;
    const $canvas =
      this.context.contextService.getDomElement() as unknown as HTMLElement;
    const $container = $canvas.parentNode;
    if ($container) {
      const cameraId = CANVAS_CAMERA_ID;
      let $existedCamera = $container.querySelector<HTMLDivElement>(
        `#${cameraId}`,
      );
      if (!$existedCamera) {
        // fix @see https://github.com/antvis/G/issues/1702
        const $cameraContainer = (doc || document).createElement('div');
        // HTML elements should not overflow with canvas @see https://github.com/antvis/G/issues/1163
        $cameraContainer.style.overflow = 'hidden';
        $cameraContainer.style.pointerEvents = 'none';
        $cameraContainer.style.position = 'absolute';
        $cameraContainer.style.left = `0px`;
        $cameraContainer.style.top = `0px`;
        $cameraContainer.style.width = `${width || 0}px`;
        $cameraContainer.style.height = `${height || 0}px`;

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
        $camera.style.pointerEvents = 'none';
        $camera.style.width = `100%`;
        $camera.style.height = `100%`;

        $cameraContainer.appendChild($camera);
        $container.appendChild($cameraContainer);
      }

      return $existedCamera;
    }
    return null;
  }

  private getOrCreateEl(object: DisplayObject) {
    const { document: doc } = this.context.config;
    let $existedElement: HTMLElement | null =
      this.displayObjectHTMLElementMap.get(object);

    if (!$existedElement) {
      $existedElement = (doc || document).createElement('div');
      object.parsedStyle.$el = $existedElement;
      this.displayObjectHTMLElementMap.set(object, $existedElement);
      if (object.id) {
        $existedElement.id = object.id;
      }
      if (object.name) {
        $existedElement.setAttribute('name', object.name);
      }
      if (object.className) {
        $existedElement.className = object.className;
      }

      // use absolute position
      $existedElement.style.position = 'absolute';
      // @see https://github.com/antvis/G/issues/1150
      $existedElement.style['will-change'] = 'transform';
      $existedElement.style.transform = this.joinTransformMatrix(
        object.getWorldTransform(),
        object.getOrigin(),
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
      case 'x':
        $el.style.left = `${object.parsedStyle.x}px`;
        break;
      case 'y':
        $el.style.top = `${object.parsedStyle.y}px`;
        break;
      case 'transformOrigin':
        const { transformOrigin } = object.parsedStyle;
        $el.style['transform-origin'] = `${transformOrigin[0].buildCSSText(
          null,
          null,
          '',
        )} ${transformOrigin[1].buildCSSText(null, null, '')}`;
        break;
      case 'width':
        const { width } = object.parsedStyle;
        $el.style.width = isNumber(width)
          ? `${width}px`
          : (width as string).toString();
        break;
      case 'height':
        const { height } = object.parsedStyle;
        $el.style.height = isNumber(height)
          ? `${height}px`
          : (height as string).toString();
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
        const { pointerEvents = 'auto' } = object.parsedStyle;
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
        if (!isNil(object.style[name]) && object.style[name] !== '') {
          $el.style[name] = object.style[name];
        }
    }
  }
}
