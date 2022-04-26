import { GlobalContainer } from 'mana-syringe';
import {
  requestAnimationFrame as rAF,
  cancelAnimationFrame as cancelRAF,
} from 'request-animation-frame-polyfill';
import type { Cursor, InteractivePointerEvent } from './types';
import { CanvasConfig } from './types';
import { cleanExistedCanvas, isBrowser } from './utils/canvas';
import { DisplayObject } from './display-objects/DisplayObject';
import { ContextService } from './services';
import { RenderingService } from './services/RenderingService';
import { RenderingContext, RenderReason } from './services/RenderingContext';
import { EventService } from './services/EventService';
import { Camera, CameraEvent, CAMERA_PROJECTION_MODE, DefaultCamera } from './camera';
import { containerModule as commonContainerModule } from './canvas-module';
import type { IRenderer } from './AbstractRenderer';
import type { PointLike } from './shapes';
import type { FederatedEvent, Element, IChildNode } from './dom';
import { Document, EventTarget, ElementEvent } from './dom';
import type { INode, ICanvas } from './dom/interfaces';
import { CustomElementRegistry } from './dom/CustomElementRegistry';

export enum CanvasEvent {
  READY = 'ready',
  BEFORE_RENDER = 'beforerender',
  AFTER_RENDER = 'afterrender',
  BEFORE_DESTROY = 'beforedestroy',
  AFTER_DESTROY = 'afterdestroy',
  RESIZE = 'resize',
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
  supportPointerEvent: boolean;

  /**
   * whether the runtime supports TouchEvent?
   * if not, the event system won't trigger touch events like `touchstart`
   */
  supportTouchEvent: boolean;

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
      requestAnimationFrame,
      cancelAnimationFrame,
      createImage,
      supportPointerEvent,
      supportTouchEvent,
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
      canvasWidth = width || canvas.width / dpr;
      canvasHeight = height || canvas.height / dpr;
    }

    /**
     * implements `Window` interface
     */
    this.devicePixelRatio = dpr;
    this.requestAnimationFrame = requestAnimationFrame || rAF.bind(globalThis);
    this.cancelAnimationFrame = cancelAnimationFrame || cancelRAF.bind(globalThis);

    /**
     * limits query
     */
    this.supportTouchEvent = supportTouchEvent || 'ontouchstart' in globalThis;
    this.supportPointerEvent = supportPointerEvent || !!globalThis.PointerEvent;
    this.isTouchEvent =
      isTouchEvent ||
      ((event: InteractivePointerEvent): event is TouchEvent =>
        this.supportTouchEvent && event instanceof globalThis.TouchEvent);
    this.isMouseEvent =
      isMouseEvent ||
      ((event: InteractivePointerEvent): event is MouseEvent =>
        !globalThis.MouseEvent ||
        (event instanceof globalThis.MouseEvent &&
          (!this.supportPointerEvent || !(event instanceof globalThis.PointerEvent))));

    this.initRenderingContext({
      container,
      canvas,
      width: canvasWidth,
      height: canvasHeight,
      renderer,
      offscreenCanvas,
      devicePixelRatio: dpr,
      cursor: 'default' as Cursor,
      background,
      createImage,
    });

    this.initDefaultCamera(canvasWidth, canvasHeight);
    this.initRenderer(renderer);
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

  destroy(destroyScenegraph = true) {
    this.emit(CanvasEvent.BEFORE_DESTROY, () => {});
    if (this.frameId) {
      const cancelRAF = this.getConfig().cancelAnimationFrame || cancelAnimationFrame;
      cancelRAF(this.frameId);
    }

    // unmount all children
    const root = this.getRoot();
    // this.unmountChildren(root);
    root.children.forEach((child: DisplayObject) => {
      this.unmountChildren(child);
    });

    if (destroyScenegraph) {
      // destroy Document
      this.document.destroy();
    }

    // destroy services
    this.getContextService().destroy();
    this.getRenderingService().destroy();

    this.emit(CanvasEvent.AFTER_DESTROY, {});
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
    if (projectionMode === CAMERA_PROJECTION_MODE.ORTHOGRAPHIC) {
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

    this.emit(CanvasEvent.RESIZE, { width, height });
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
    this.emit(CanvasEvent.BEFORE_RENDER, {});

    if (this.container.isBound(RenderingService)) {
      const renderingService = this.container.get<RenderingService>(RenderingService);
      renderingService.render(this.getConfig());
    }

    this.emit(CanvasEvent.AFTER_RENDER, {});
  }

  private run() {
    const tick = () => {
      this.render();
      this.frameId = requestAnimationFrame(tick);
    };
    tick();
  }

  private initRenderer(renderer: IRenderer) {
    if (!renderer) {
      throw new Error('Renderer is required.');
    }

    // reset
    this.inited = false;
    this.readyPromise = undefined;

    this.loadCommonContainerModule();
    this.loadRendererContainerModule(renderer);

    // init context
    const contextService = this.container.get<ContextService<unknown>>(ContextService);

    this.renderingService = this.container.get<RenderingService>(RenderingService);
    this.eventService = this.container.get<EventService>(EventService);

    contextService.init();
    this.renderingService.init().then(() => {
      this.emit(CanvasEvent.READY, {});

      if (this.readyPromise) {
        this.resolveReadyPromise();
      }

      this.inited = true;
    });

    if (renderer.getConfig().enableAutoRendering) {
      this.run();
    }

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
  }

  private loadCommonContainerModule() {
    this.container.unload(commonContainerModule);
    this.container.load(commonContainerModule, true);
  }

  private loadRendererContainerModule(renderer: IRenderer) {
    // load other container modules provided by g-canvas/g-svg/g-webgl
    const plugins = renderer.getPlugins();
    plugins.forEach((plugin) => {
      plugin.init(this.container);
    });
  }

  setRenderer(renderer: IRenderer) {
    // update canvas' config
    const canvasConfig = this.getConfig();
    if (canvasConfig.renderer === renderer) {
      return;
    }

    const oldRenderer = canvasConfig.renderer;
    canvasConfig.renderer = renderer;

    // keep all children undestroyed
    this.destroy(false);

    // destroy all plugins
    oldRenderer
      ?.getPlugins()
      .reverse()
      .forEach((plugin) => {
        plugin.destroy(this.container);
      });

    this.initRenderer(renderer);
  }

  setCursor(cursor: Cursor) {
    this.getContextService().applyCursorStyle(cursor);
  }

  private unmountChildren(parent: DisplayObject) {
    const path = [];
    parent.forEach((child) => {
      if (child.isConnected) {
        path.push(child);
      }
    });

    // unmount from leaf to root
    path.reverse().forEach((child) => {
      child.emit(ElementEvent.UNMOUNTED, {});
      child.ownerDocument = null;
      child.isConnected = false;
    });
  }

  private mountChildren(parent: INode) {
    parent.forEach((child) => {
      if (!child.isConnected) {
        child.ownerDocument = this.document;
        child.isConnected = true;
        child.emit(ElementEvent.MOUNTED, {});
      }
    });
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
