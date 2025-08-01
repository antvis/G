// eslint-disable-next-line import/extensions
import RBush from 'rbush/rbush.js';
import type { IRenderer } from './AbstractRenderer';
import {
  CameraEvent,
  CameraProjectionMode,
  CameraTrackingMode,
  CameraType,
} from './camera';
import type { RBushNodeAABB } from './components';
import type { CustomElement } from './display-objects';
import type { MutationEvent } from './dom/MutationEvent';
import {
  DisplayObject,
  attrModifiedEvent as attrModifiedEventCache,
} from './display-objects/DisplayObject';
import {
  insertedEvent as insertedEventCache,
  removedEvent as removedEventCache,
  destroyEvent as destroyEventCache,
} from './dom/Element';
import type { CanvasContext, Element, IChildNode } from './dom';
import { CustomEvent, Document, ElementEvent, EventTarget } from './dom';
import { CustomElementRegistry } from './dom/CustomElementRegistry';
import type { ICanvas } from './dom/interfaces';
import { runtime } from './global-runtime';
import { CullingPlugin } from './plugins/CullingPlugin';
import { EventPlugin } from './plugins/EventPlugin';
import { FrustumCullingStrategy } from './plugins/FrustumCullingStrategy';
import { PrepareRendererPlugin } from './plugins/PrepareRendererPlugin';
import { EventService, RenderReason, RenderingService } from './services';
import type { PointLike } from './shapes';
import {
  type CanvasConfig,
  type ClipSpaceNearZ,
  type Cursor,
  type InteractivePointerEvent,
} from './types';
import {
  caf,
  cleanExistedCanvas,
  getHeight,
  getWidth,
  isBrowser,
  isInFragment,
  raf,
  memoize,
} from './utils';

export function isCanvas(value: any): value is Canvas {
  return !!(value as Canvas).document;
}

export enum CanvasEvent {
  READY = 'ready',
  BEFORE_RENDER = 'beforerender',
  RERENDER = 'rerender',
  AFTER_RENDER = 'afterrender',
  BEFORE_DESTROY = 'beforedestroy',
  AFTER_DESTROY = 'afterdestroy',
  RESIZE = 'resize',
  DIRTY_RECTANGLE = 'dirtyrectangle',
  RENDERER_CHANGED = 'rendererchanged',
}

const DEFAULT_CAMERA_Z = 500;
const DEFAULT_CAMERA_NEAR = 0.1;
const DEFAULT_CAMERA_FAR = 1000;

/**
 * reuse custom event preventing from re-create them in every frame
 */
const mountedEvent = new CustomEvent(ElementEvent.MOUNTED);
const unmountedEvent = new CustomEvent(ElementEvent.UNMOUNTED);
const beforeRenderEvent = new CustomEvent(CanvasEvent.BEFORE_RENDER);
const rerenderEvent = new CustomEvent(CanvasEvent.RERENDER);
const afterRenderEvent = new CustomEvent(CanvasEvent.AFTER_RENDER);

/**
 * can be treated like Window in DOM
 * provide some extra methods like `window`, such as:
 * * `window.requestAnimationFrame`
 * * `window.devicePixelRatio`
 *
 * prototype chains: Canvas(Window) -> EventTarget
 *
 * @docs https://g.antv.antgroup.com/api/canvas/intro
 */
export class Canvas extends EventTarget implements ICanvas {
  // #region environment
  customElements: ICanvas['customElements'];
  devicePixelRatio: ICanvas['devicePixelRatio'];
  requestAnimationFrame: ICanvas['requestAnimationFrame'];
  cancelAnimationFrame: ICanvas['cancelAnimationFrame'];
  createImage: ICanvas['createImage'];
  supportsTouchEvents: ICanvas['supportsTouchEvents'];
  supportsPointerEvents: ICanvas['supportsPointerEvents'];
  isTouchEvent: ICanvas['isTouchEvent'];
  isMouseEvent: ICanvas['isMouseEvent'];

  /**
   * window.document
   */
  document: Document;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element
   */
  Element = DisplayObject;
  // #endregion environment

  /**
   * rAF in auto rendering
   */
  private frameId?: number;

  private inited = false;
  private readyPromise: Promise<any> | undefined;
  private resolveReadyPromise: () => void;

  context = {} as CanvasContext;

  constructor(config: CanvasConfig) {
    super();

    const {
      container,
      canvas,
      renderer,
      width,
      height,
      background,
      cursor,
      supportsMutipleCanvasesInOneContainer,
      cleanUpOnDestroy = true,
      offscreenCanvas,
      devicePixelRatio,
      requestAnimationFrame,
      cancelAnimationFrame,
      createImage,
      supportsTouchEvents,
      supportsPointerEvents,
      isTouchEvent,
      isMouseEvent,
      dblClickSpeed,
    } = config;
    let canvasWidth = width;
    let canvasHeight = height;
    let dpr = devicePixelRatio || (isBrowser && window.devicePixelRatio) || 1;
    dpr = dpr >= 1 ? Math.ceil(dpr) : 1;

    // use user-defined <canvas> or OffscreenCanvas
    if (canvas) {
      // infer width & height with dpr
      canvasWidth = width || getWidth(canvas) || canvas.width / dpr;
      canvasHeight = height || getHeight(canvas) || canvas.height / dpr;
    }

    /**
     * implements `Window` interface
     */
    this.customElements = new CustomElementRegistry();
    this.devicePixelRatio = dpr;
    this.requestAnimationFrame =
      requestAnimationFrame ?? (raf.bind(runtime.globalThis) as typeof raf);
    this.cancelAnimationFrame =
      cancelAnimationFrame ?? (caf.bind(runtime.globalThis) as typeof caf);
    this.createImage = createImage ?? (() => new window.Image());
    // the following feature-detect from hammer.js
    // @see https://github.com/hammerjs/hammer.js/blob/master/src/inputjs/input-consts.js#L5
    this.supportsTouchEvents =
      supportsTouchEvents ?? 'ontouchstart' in runtime.globalThis;
    this.supportsPointerEvents =
      supportsPointerEvents ?? !!runtime.globalThis.PointerEvent;
    this.isTouchEvent =
      isTouchEvent ??
      ((event: InteractivePointerEvent): event is TouchEvent =>
        this.supportsTouchEvents &&
        event instanceof runtime.globalThis.TouchEvent);
    this.isMouseEvent =
      isMouseEvent ??
      ((event: InteractivePointerEvent): event is MouseEvent =>
        !runtime.globalThis.MouseEvent ||
        (event instanceof runtime.globalThis.MouseEvent &&
          (!this.supportsPointerEvents ||
            !(event instanceof runtime.globalThis.PointerEvent))));

    // override it in runtime
    if (offscreenCanvas) {
      runtime.offscreenCanvas = offscreenCanvas;
    }

    // create document
    this.document = new Document();
    this.document.defaultView = this;

    if (!supportsMutipleCanvasesInOneContainer) {
      cleanExistedCanvas(container, this, cleanUpOnDestroy);
    }

    this.initRenderingContext({
      ...config,
      width: canvasWidth,
      height: canvasHeight,
      background: background ?? 'transparent',
      cursor: cursor ?? ('default' as Cursor),
      cleanUpOnDestroy,
      devicePixelRatio: dpr,
      requestAnimationFrame: this.requestAnimationFrame,
      cancelAnimationFrame: this.cancelAnimationFrame,
      createImage: this.createImage,
      supportsTouchEvents: this.supportsTouchEvents,
      supportsPointerEvents: this.supportsPointerEvents,
      isTouchEvent: this.isTouchEvent,
      isMouseEvent: this.isMouseEvent,
      dblClickSpeed: dblClickSpeed ?? 200,
    });

    this.initDefaultCamera(canvasWidth, canvasHeight, renderer.clipSpaceNearZ);

    this.initRenderer(renderer, true);
  }

  private initRenderingContext(mergedConfig: CanvasConfig) {
    this.context.config = mergedConfig;

    // bind rendering context, shared by all renderers
    this.context.renderingContext = {
      /**
       * the root node in scene graph
       */
      root: this.document.documentElement,

      unculledEntities: [],

      renderListCurrentFrame: [],

      renderReasons: new Set(),

      force: false,
      dirty: false,
    };
  }

  private initDefaultCamera(
    width: number,
    height: number,
    clipSpaceNearZ: ClipSpaceNearZ,
  ) {
    // set a default ortho camera
    const camera = new runtime.CameraContribution();
    camera.clipSpaceNearZ = clipSpaceNearZ;

    camera
      .setType(CameraType.EXPLORING, CameraTrackingMode.DEFAULT)
      .setPosition(width / 2, height / 2, DEFAULT_CAMERA_Z)
      .setFocalPoint(width / 2, height / 2, 0)
      .setOrthographic(
        width / -2,
        width / 2,
        height / 2,
        height / -2,
        DEFAULT_CAMERA_NEAR,
        DEFAULT_CAMERA_FAR,
      );

    // keep ref since it will use raf in camera animation
    camera.canvas = this;

    // redraw when camera changed
    camera.eventEmitter.on(CameraEvent.UPDATED, () => {
      this.context.renderingContext.renderReasons.add(
        RenderReason.CAMERA_CHANGED,
      );

      if (
        runtime.enableSizeAttenuation &&
        this.getConfig().renderer.getConfig().enableSizeAttenuation
      ) {
        this.updateSizeAttenuation();
      }
    });

    // bind camera
    this.context.camera = camera;
  }

  private updateSizeAttenuation() {
    const zoom = this.getCamera().getZoom();
    this.document.documentElement.forEach((node: DisplayObject) => {
      runtime.styleValueRegistry.updateSizeAttenuation(node, zoom);
    });
  }

  getConfig() {
    return this.context.config;
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
    return this.context.camera;
  }

  getContextService() {
    return this.context.contextService;
  }

  getEventService() {
    return this.context.eventService;
  }

  getRenderingService() {
    return this.context.renderingService;
  }

  getRenderingContext() {
    return this.context.renderingContext;
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

  /**
   * @param cleanUp - whether to clean up all the internal services of Canvas
   * @param skipTriggerEvent - whether to skip trigger destroy event
   */
  destroy(cleanUp = true, skipTriggerEvent?: boolean) {
    memoize.clearCache();

    const enableCancelEventPropagation =
      this.getConfig().future?.experimentalCancelEventPropagation === true;

    if (!skipTriggerEvent) {
      this.dispatchEvent(
        new CustomEvent(CanvasEvent.BEFORE_DESTROY),
        enableCancelEventPropagation,
        enableCancelEventPropagation,
      );
    }
    if (this.frameId) {
      this.cancelAnimationFrame(this.frameId);
    }

    // unmount all children
    const root = this.getRoot();

    if (cleanUp) {
      this.unmountChildren(root);
      // destroy Document
      this.document.destroy();
      this.getEventService().destroy();
    }

    // destroy services
    this.getRenderingService().destroy();
    this.getContextService().destroy();

    // clear root after render service destroyed
    if (this.context.rBushRoot) {
      // clear rbush
      this.context.rBushRoot.clear();
    }

    if (!skipTriggerEvent) {
      this.dispatchEvent(
        new CustomEvent(CanvasEvent.AFTER_DESTROY),
        enableCancelEventPropagation,
        enableCancelEventPropagation,
      );
    }

    const clearEventRetain = (event: CustomEvent | MutationEvent) => {
      event.currentTarget = null;
      event.manager = null;
      event.target = null;
      (event as MutationEvent).relatedNode = null;
    };

    clearEventRetain(mountedEvent);
    clearEventRetain(unmountedEvent);
    clearEventRetain(beforeRenderEvent);
    clearEventRetain(rerenderEvent);
    clearEventRetain(afterRenderEvent);
    clearEventRetain(attrModifiedEventCache);
    clearEventRetain(insertedEventCache);
    clearEventRetain(removedEventCache);
    clearEventRetain(destroyEventCache);
    runtime.textService.clearCache();
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
    const canvasConfig = this.context.config;
    canvasConfig.width = width;
    canvasConfig.height = height;

    // resize context
    this.getContextService().resize(width, height);

    // resize camera
    const { camera } = this.context;
    const projectionMode = camera.getProjectionMode();
    camera
      .setPosition(width / 2, height / 2, DEFAULT_CAMERA_Z)
      .setFocalPoint(width / 2, height / 2, 0);
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

    const enableCancelEventPropagation =
      canvasConfig.future?.experimentalCancelEventPropagation === true;

    this.dispatchEvent(
      new CustomEvent(CanvasEvent.RESIZE, { width, height }),
      enableCancelEventPropagation,
      enableCancelEventPropagation,
    );
  }

  // proxy to document.documentElement
  appendChild<T extends IChildNode>(child: T, index?: number): T {
    return this.document.documentElement.appendChild(child, index);
  }
  insertBefore<T extends IChildNode, N extends IChildNode>(
    newChild: T,
    refChild: N | null,
  ): T {
    return this.document.documentElement.insertBefore(newChild, refChild);
  }
  removeChild<T extends IChildNode>(child: T): T {
    return this.document.documentElement.removeChild(child);
  }

  /**
   * Remove all children which can be appended to its original parent later again.
   */
  removeChildren() {
    this.document.documentElement.removeChildren();
  }

  /**
   * Recursively destroy all children which can not be appended to its original parent later again.
   * But the canvas remains running which means display objects can be appended later.
   */
  destroyChildren() {
    this.document.documentElement.destroyChildren();
  }

  render(frame?: XRFrame) {
    // console.log('render ----------------------');
    if (frame) {
      beforeRenderEvent.detail = frame;
      afterRenderEvent.detail = frame;
    }

    const enableCancelEventPropagation =
      this.getConfig().future?.experimentalCancelEventPropagation === true;

    this.dispatchEvent(
      beforeRenderEvent,
      enableCancelEventPropagation,
      enableCancelEventPropagation,
    );

    const renderingService = this.getRenderingService();
    renderingService.render(this.getConfig(), frame, () => {
      // trigger actual rerender event
      // @see https://github.com/antvis/G/issues/1268
      this.dispatchEvent(
        rerenderEvent,
        enableCancelEventPropagation,
        enableCancelEventPropagation,
      );
    });

    this.dispatchEvent(
      afterRenderEvent,
      enableCancelEventPropagation,
      enableCancelEventPropagation,
    );
  }

  private run() {
    const tick = (time: number, frame?: XRFrame) => {
      this.render(frame);
      this.frameId = this.requestAnimationFrame(tick);
    };
    tick(0);
  }

  private initRenderer(renderer: IRenderer, firstContentfullPaint = false) {
    if (!renderer) {
      throw new Error('Renderer is required.');
    }

    // reset
    this.inited = false;
    this.readyPromise = undefined;

    // FIXME: should re-create here?
    this.context.rBushRoot = new RBush<RBushNodeAABB>();

    // reset rendering plugins
    this.context.renderingPlugins = [];
    this.context.renderingPlugins.push(
      new EventPlugin(),
      new PrepareRendererPlugin(),
      // new DirtyCheckPlugin(),
      new CullingPlugin([new FrustumCullingStrategy()]),
    );

    //
    this.loadRendererContainerModule(renderer);

    // init context service
    this.context.contextService = new this.context.ContextService({
      ...runtime,
      ...this.context,
    });

    // init rendering service
    this.context.renderingService = new RenderingService(runtime, this.context);

    // init event service
    this.context.eventService = new EventService(runtime, this.context);
    this.context.eventService.init();

    if (this.context.contextService.init) {
      this.context.contextService.init();
      this.initRenderingService(renderer, firstContentfullPaint, true);
    } else {
      this.context.contextService
        .initAsync()
        .then(() => {
          this.initRenderingService(renderer, firstContentfullPaint);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  private initRenderingService(
    renderer: IRenderer,
    firstContentfullPaint = false,
    async = false,
  ) {
    this.context.renderingService.init(() => {
      this.inited = true;

      const enableCancelEventPropagation =
        this.getConfig().future?.experimentalCancelEventPropagation === true;

      if (firstContentfullPaint) {
        if (async) {
          this.requestAnimationFrame(() => {
            this.dispatchEvent(
              new CustomEvent(CanvasEvent.READY),
              enableCancelEventPropagation,
              enableCancelEventPropagation,
            );
          });
        } else {
          this.dispatchEvent(
            new CustomEvent(CanvasEvent.READY),
            enableCancelEventPropagation,
            enableCancelEventPropagation,
          );
        }
      } else {
        this.dispatchEvent(
          new CustomEvent(CanvasEvent.RENDERER_CHANGED),
          enableCancelEventPropagation,
          enableCancelEventPropagation,
        );
      }

      if (this.readyPromise) {
        this.resolveReadyPromise();
      }

      if (!firstContentfullPaint) {
        this.getRoot().forEach((node) => {
          (node as Element).dirty?.(true, true);
        });
      }

      // keep current scenegraph unchanged, just trigger mounted event
      this.mountChildren(this.getRoot());

      if (renderer.getConfig().enableAutoRendering) {
        this.run();
      }
    });
  }

  private loadRendererContainerModule(renderer: IRenderer) {
    // load other container modules provided by g-canvas/g-svg/g-webgl
    const plugins = renderer.getPlugins();
    plugins.forEach((plugin) => {
      plugin.context = this.context;
      plugin.init(runtime);
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
    this.destroy(false, true);

    // destroy all plugins, reverse will mutate origin array
    [...(oldRenderer?.getPlugins() || [])].reverse().forEach((plugin) => {
      plugin.destroy(runtime);
    });

    this.initRenderer(renderer);
  }

  setCursor(cursor: Cursor) {
    const canvasConfig = this.getConfig();
    canvasConfig.cursor = cursor;
    this.getContextService().applyCursorStyle(cursor);
  }

  unmountChildren(parent: DisplayObject) {
    // unmountChildren recursively
    parent.childNodes.forEach((child: DisplayObject) => {
      this.unmountChildren(child);
    });

    if (this.inited) {
      if (parent.isMutationObserved) {
        parent.dispatchEvent(unmountedEvent);
      } else {
        const enableCancelEventPropagation =
          this.getConfig().future?.experimentalCancelEventPropagation === true;

        unmountedEvent.target = parent;
        this.dispatchEvent(unmountedEvent, true, enableCancelEventPropagation);
      }

      // skip document.documentElement
      if (parent !== this.document.documentElement) {
        parent.ownerDocument = null;
      }
      parent.isConnected = false;
    }

    // trigger after unmounted
    if (parent.isCustomElement) {
      if ((parent as CustomElement<any>).disconnectedCallback) {
        (parent as CustomElement<any>).disconnectedCallback();
      }
    }
  }

  mountChildren(
    child: DisplayObject,
    skipTriggerEvent: boolean = isInFragment(child),
  ) {
    if (this.inited) {
      if (!child.isConnected) {
        child.ownerDocument = this.document;
        child.isConnected = true;

        if (!skipTriggerEvent) {
          if (child.isMutationObserved) {
            child.dispatchEvent(mountedEvent);
          } else {
            const enableCancelEventPropagation =
              this.getConfig().future?.experimentalCancelEventPropagation ===
              true;

            mountedEvent.target = child;
            this.dispatchEvent(
              mountedEvent,
              true,
              enableCancelEventPropagation,
            );
          }
        }
      }
    } else {
      console.warn(
        "[g]: You are trying to call `canvas.appendChild` before canvas' initialization finished. You can either await `canvas.ready` or listen to `CanvasEvent.READY` manually.",
        'appended child: ',
        child.nodeName,
      );
    }

    // recursively mount children
    child.childNodes.forEach((c: DisplayObject) => {
      this.mountChildren(c, skipTriggerEvent);
    });

    // trigger after mounted
    if (child.isCustomElement) {
      if ((child as CustomElement<any>).connectedCallback) {
        (child as CustomElement<any>).connectedCallback();
      }
    }
  }

  mountFragment(child: DisplayObject) {
    this.mountChildren(child, false);
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
