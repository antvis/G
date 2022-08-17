import { GlobalContainer } from 'mana-syringe';
import {
  cancelAnimationFrame as cancelRAF,
  requestAnimationFrame as rAF,
} from 'request-animation-frame-polyfill';
import type { IRenderer } from './AbstractRenderer';
import { Camera, CameraEvent, CameraProjectionMode, DefaultCamera } from './camera';
import { containerModule as commonContainerModule } from './canvas-module';
import { CustomElement, DisplayObject } from './display-objects';
import type { Element, FederatedEvent, IChildNode } from './dom';
import { CustomEvent, Document, ElementEvent, EventTarget } from './dom';
import { CustomElementRegistry } from './dom/CustomElementRegistry';
import type { ICanvas } from './dom/interfaces';
import {
  ContextService,
  EventService,
  RenderingContext,
  RenderingService,
  RenderReason,
} from './services';
import type { PointLike } from './shapes';
import type { Cursor, InteractivePointerEvent } from './types';
import { CanvasConfig } from './types';
import { cleanExistedCanvas, getHeight, getWidth, isBrowser } from './utils';

export enum CanvasEvent {
  READY = 'ready',
  BEFORE_RENDER = 'beforerender',
  AFTER_RENDER = 'afterrender',
  BEFORE_DESTROY = 'beforedestroy',
  AFTER_DESTROY = 'afterdestroy',
  RESIZE = 'resize',
  DIRTY_RECTANGLE = 'dirtyrectangle',
}

/**
 * can be treated like Window in DOM
 * provide some extra methods like `window`, such as:
 * * `window.requestAnimationFrame`
 * * `window.devicePixelRatio`
 *
 * prototype chains: Canvas(Window) -> EventTarget
 */
export class Canvas extends EventTarget implements ICanvas {
  /**
   * child container of current canvas, use hierarchy container
   */
  container = GlobalContainer.createChild();

  /**
   * window.document
   */
  document: Document;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry
   */
  customElements: CustomElementRegistry;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
   */
  requestAnimationFrame: (callback: FrameRequestCallback) => number;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
   */
  cancelAnimationFrame: (handle: number) => void;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
   */
  devicePixelRatio: number;

  /**
   * whether the runtime supports PointerEvent?
   * if not, the event system won't trigger pointer events like `pointerdown`
   */
  supportsPointerEvents: boolean;

  /**
   * whether the runtime supports TouchEvent?
   * if not, the event system won't trigger touch events like `touchstart`
   */
  supportsTouchEvents: boolean;

  /**
   * is this native event a TouchEvent?
   */
  isTouchEvent: (event: InteractivePointerEvent) => event is TouchEvent;

  /**
   * is this native event a MouseEvent?
   */
  isMouseEvent: (event: InteractivePointerEvent) => event is MouseEvent;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element
   */
  Element = DisplayObject;

  /**
   * rAF in auto rendering
   */
  private frameId?: number;

  /**
   * cache here since inversify's resolving is very slow
   */
  private eventService: EventService;
  private renderingService: RenderingService;

  private inited = false;
  private readyPromise: Promise<any> | undefined;
  private resolveReadyPromise: () => void;

  /**
   * reuse custom event preventing from re-create them in every frame
   */
  private mountEvent = new CustomEvent(ElementEvent.MOUNTED);
  private unmountEvent = new CustomEvent(ElementEvent.UNMOUNTED);
  private beforeRenderEvent = new CustomEvent(CanvasEvent.BEFORE_RENDER);
  private afterRenderEvent = new CustomEvent(CanvasEvent.AFTER_RENDER);

  constructor(config: CanvasConfig) {
    super();

    // create document
    this.document = new Document();
    this.document.defaultView = this;

    // create registry of custom elements
    this.customElements = new CustomElementRegistry();

    const {
      container,
      canvas,
      offscreenCanvas,
      width,
      height,
      devicePixelRatio,
      renderer,
      background,
      cursor,
      document,
      requestAnimationFrame,
      cancelAnimationFrame,
      createImage,
      supportsPointerEvents,
      supportsTouchEvents,
      isTouchEvent,
      isMouseEvent,
    } = config;

    cleanExistedCanvas(container, this);

    let canvasWidth = width;
    let canvasHeight = height;
    let dpr = devicePixelRatio;
    // use user-defined <canvas> or OffscreenCanvas
    if (canvas) {
      // infer width & height with dpr
      dpr = devicePixelRatio || (isBrowser && window.devicePixelRatio) || 1;
      dpr = dpr >= 1 ? Math.ceil(dpr) : 1;
      canvasWidth = width || getWidth(canvas) || canvas.width / dpr;
      canvasHeight = height || getHeight(canvas) || canvas.height / dpr;
    }

    /**
     * implements `Window` interface
     */
    this.devicePixelRatio = dpr;
    this.requestAnimationFrame = requestAnimationFrame ?? rAF.bind(globalThis);
    this.cancelAnimationFrame = cancelAnimationFrame ?? cancelRAF.bind(globalThis);

    /**
     * limits query
     */
    // the following feature-detect from hammer.js
    // @see https://github.com/hammerjs/hammer.js/blob/master/src/inputjs/input-consts.js#L5
    this.supportsTouchEvents = supportsTouchEvents ?? 'ontouchstart' in globalThis;
    this.supportsPointerEvents = supportsPointerEvents ?? !!globalThis.PointerEvent;
    this.isTouchEvent =
      isTouchEvent ??
      ((event: InteractivePointerEvent): event is TouchEvent =>
        this.supportsTouchEvents && event instanceof globalThis.TouchEvent);
    this.isMouseEvent =
      isMouseEvent ??
      ((event: InteractivePointerEvent): event is MouseEvent =>
        !globalThis.MouseEvent ||
        (event instanceof globalThis.MouseEvent &&
          (!this.supportsPointerEvents || !(event instanceof globalThis.PointerEvent))));

    this.initRenderingContext({
      container,
      canvas,
      width: canvasWidth,
      height: canvasHeight,
      renderer,
      offscreenCanvas,
      devicePixelRatio: dpr,
      cursor: cursor || ('default' as Cursor),
      background,
      createImage,
      document,
    });

    this.initDefaultCamera(canvasWidth, canvasHeight);

    (async () => {
      await this.initRenderer(renderer);

      this.dispatchEvent(new CustomEvent(CanvasEvent.READY));

      if (this.readyPromise) {
        this.resolveReadyPromise();
      }
    })();
  }

  private initRenderingContext(mergedConfig: CanvasConfig) {
    this.container.register({ token: CanvasConfig, useValue: mergedConfig });

    // bind rendering context, shared by all renderers
    this.container.register({
      token: RenderingContext,
      useValue: {
        /**
         * the root node in scene graph
         */
        root: this.document.documentElement,
        renderListCurrentFrame: [],
        unculledEntities: [],

        renderReasons: new Set(),

        force: false,
        dirty: false,
      },
    });

    this.document.documentElement.addEventListener(
      ElementEvent.CHILD_INSERTED,
      (e: FederatedEvent<Event, { child: DisplayObject }>) => {
        this.mountChildren(e.detail.child);
      },
    );

    this.document.documentElement.addEventListener(
      ElementEvent.CHILD_REMOVED,
      (e: FederatedEvent<Event, { child: DisplayObject }>) => {
        this.unmountChildren(e.detail.child);
      },
    );
  }

  private initDefaultCamera(width: number, height: number) {
    // set a default ortho camera
    const camera = new Camera()
      .setPosition(width / 2, height / 2, 500)
      .setFocalPoint(width / 2, height / 2, 0)
      .setOrthographic(width / -2, width / 2, height / 2, height / -2, 0.1, 1000);

    // keep ref since it will use raf in camera animation
    camera.canvas = this;

    // redraw when camera changed
    const context = this.container.get<RenderingContext>(RenderingContext);
    camera.on(CameraEvent.UPDATED, () => {
      context.renderReasons.add(RenderReason.CAMERA_CHANGED);
    });
    // bind camera
    this.container.register({ token: DefaultCamera, useValue: camera });
  }

  getConfig() {
    return this.container.get<Partial<CanvasConfig>>(CanvasConfig);
  }

  getContainer() {
    return this.container;
  }

  /**
   * get the root displayObject in scenegraph
   * @alias this.document.documentElement
   */
  getRoot() {
    return this.document.documentElement;
  }

  /**
   * get the camera of canvas
   */
  getCamera() {
    return this.container.get<Camera>(DefaultCamera);
  }

  getContextService() {
    return this.container.get<ContextService<unknown>>(ContextService);
  }

  getEventService() {
    return this.eventService;
  }

  getRenderingService() {
    return this.renderingService;
  }

  getRenderingContext() {
    return this.container.get<RenderingContext>(RenderingContext);
  }

  getStats() {
    return this.getRenderingService().getStats();
  }

  // /**
  //  * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Window/getComputedStyle
  //  */
  // getComputedStyle(node: DisplayObject) {
  //   return node.computedStyle;
  // }

  get ready() {
    if (!this.readyPromise) {
      this.readyPromise = new Promise((resolve) => {
        this.resolveReadyPromise = () => {
          resolve(this);
        };
      });
      if (this.inited) {
        this.resolveReadyPromise();
      }
    }
    return this.readyPromise;
  }

  destroy(destroyScenegraph = true, skipTriggerEvent = false) {
    if (!skipTriggerEvent) {
      this.dispatchEvent(new CustomEvent(CanvasEvent.BEFORE_DESTROY));
    }
    if (this.frameId) {
      const cancelRAF = this.getConfig().cancelAnimationFrame || cancelAnimationFrame;
      cancelRAF(this.frameId);
    }

    // unmount all children
    const root = this.getRoot();
    this.unmountChildren(root);
    // root.children.forEach((child: DisplayObject) => {
    //   this.unmountChildren(child);
    // });

    if (destroyScenegraph) {
      // destroy Document
      this.document.destroy();
    }

    // destroy services
    this.getContextService().destroy();
    this.getRenderingService().destroy();

    if (!skipTriggerEvent) {
      this.dispatchEvent(new CustomEvent(CanvasEvent.AFTER_DESTROY));
    }
  }

  /**
   * compatible with G 3.0
   * @deprecated
   * @alias resize
   */
  changeSize(width: number, height: number) {
    this.resize(width, height);
  }
  resize(width: number, height: number) {
    // update canvas' config
    const canvasConfig = this.container.get<Partial<CanvasConfig>>(CanvasConfig);
    canvasConfig.width = width;
    canvasConfig.height = height;

    // resize context
    this.getContextService().resize(width, height);

    // resize camera
    const camera = this.container.get<Camera>(DefaultCamera);
    const projectionMode = camera.getProjectionMode();
    camera.setPosition(width / 2, height / 2, 500).setFocalPoint(width / 2, height / 2, 0);
    if (projectionMode === CameraProjectionMode.ORTHOGRAPHIC) {
      camera.setOrthographic(
        width / -2,
        width / 2,
        height / 2,
        height / -2,
        camera.getNear(),
        camera.getFar(),
      );
    } else {
      camera.setAspect(width / height);
    }

    this.dispatchEvent(new CustomEvent(CanvasEvent.RESIZE, { width, height }));
  }

  // proxy to document.documentElement
  appendChild<T extends IChildNode>(child: T, index?: number): T {
    return this.document.documentElement.appendChild(child, index);
  }
  insertBefore<T extends IChildNode, N extends IChildNode>(newChild: T, refChild: N | null): T {
    return this.document.documentElement.insertBefore(newChild, refChild);
  }
  removeChild<T extends IChildNode>(child: T, destroy = true): T {
    return this.document.documentElement.removeChild(child, destroy);
  }
  removeChildren(destroy = true) {
    this.document.documentElement.removeChildren(destroy);
  }

  render() {
    this.dispatchEvent(this.beforeRenderEvent);

    if (this.container.isBound(RenderingService)) {
      const renderingService = this.container.get<RenderingService>(RenderingService);
      renderingService.render(this.getConfig());
    }

    this.dispatchEvent(this.afterRenderEvent);
  }

  private run() {
    const tick = () => {
      this.render();
      this.frameId = requestAnimationFrame(tick);
    };
    tick();
  }

  private async initRenderer(renderer: IRenderer) {
    if (!renderer) {
      throw new Error('Renderer is required.');
    }

    // reset
    this.inited = false;
    this.readyPromise = undefined;

    this.loadCommonContainerModule();
    this.loadRendererContainerModule(renderer);

    // init services
    const contextService = this.container.get<ContextService<unknown>>(ContextService);
    this.renderingService = this.container.get<RenderingService>(RenderingService);
    this.eventService = this.container.get<EventService>(EventService); // auto init post-contruct

    await contextService.init();
    await this.renderingService.init();

    this.inited = true;

    this.getRoot().forEach((node) => {
      const renderable = (node as Element).renderable;
      if (renderable) {
        renderable.renderBoundsDirty = true;
        renderable.boundsDirty = true;
        renderable.dirty = true;
      }
    });

    // keep current scenegraph unchanged, just trigger mounted event
    this.mountChildren(this.getRoot());

    if (renderer.getConfig().enableAutoRendering) {
      this.run();
    }
  }

  private loadCommonContainerModule() {
    this.container.unload(commonContainerModule);
    this.container.load(commonContainerModule, true);
  }

  private loadRendererContainerModule(renderer: IRenderer) {
    // load other container modules provided by g-canvas/g-svg/g-webgl
    const plugins = renderer.getPlugins();
    plugins.forEach((plugin) => {
      plugin.container = this.container;
      plugin.init();
    });
  }

  async setRenderer(renderer: IRenderer) {
    // update canvas' config
    const canvasConfig = this.getConfig();
    if (canvasConfig.renderer === renderer) {
      return;
    }

    const oldRenderer = canvasConfig.renderer;
    canvasConfig.renderer = renderer;

    // keep all children undestroyed
    this.destroy(false, true);

    // destroy all plugins, reverse will mutate origin array
    [...oldRenderer?.getPlugins()].reverse().forEach((plugin) => {
      plugin.destroy();
    });

    await this.initRenderer(renderer);
  }

  setCursor(cursor: Cursor) {
    const canvasConfig = this.container.get<Partial<CanvasConfig>>(CanvasConfig);
    canvasConfig.cursor = cursor;
    this.getContextService().applyCursorStyle(cursor);
  }

  private unmountChildren(parent: DisplayObject) {
    if (this.inited) {
      const path = [];
      parent.forEach((child) => {
        if (child.isConnected) {
          path.push(child);
        }
      });

      // unmount from leaf to root
      path.reverse().forEach((child: DisplayObject) => {
        // trigger before unmounted
        if (child instanceof CustomElement) {
          if (child.disconnectedCallback) {
            child.disconnectedCallback();
          }
        }

        child.dispatchEvent(this.unmountEvent);

        // skip document.documentElement
        if (child !== this.document.documentElement) {
          child.ownerDocument = null;
        }
        child.isConnected = false;
      });
    }
  }

  private mountChildren(parent: DisplayObject) {
    if (this.inited) {
      parent.forEach((child) => {
        if (!child.isConnected) {
          child.ownerDocument = this.document;
          child.isConnected = true;
          child.dispatchEvent(this.mountEvent);

          // trigger after mounted
          if (child instanceof CustomElement) {
            if (child.connectedCallback) {
              child.connectedCallback();
            }
          }
        }
      });
    } else {
      console.warn(
        "[g]: You are trying to call `canvas.appendChild` before canvas' initialization finished. You can either await `canvas.ready` or listen to `CanvasEvent.READY` manually.",
        'appended child: ',
        parent.nodeName,
      );
    }
  }

  client2Viewport(client: PointLike): PointLike {
    return this.getEventService().client2Viewport(client);
  }

  viewport2Client(canvas: PointLike): PointLike {
    return this.getEventService().viewport2Client(canvas);
  }

  viewport2Canvas(viewport: PointLike): PointLike {
    return this.getEventService().viewport2Canvas(viewport);
  }

  canvas2Viewport(canvas: PointLike): PointLike {
    return this.getEventService().canvas2Viewport(canvas);
  }

  /**
   * @deprecated
   * @alias client2Viewport
   */
  getPointByClient(clientX: number, clientY: number): PointLike {
    return this.client2Viewport({ x: clientX, y: clientY });
  }

  /**
   * @deprecated
   * @alias viewport2Client
   */
  getClientByPoint(x: number, y: number): PointLike {
    return this.viewport2Client({ x, y });
  }
}
