import { EventEmitter } from 'eventemitter3';
import { CanvasConfig, Cursor } from './types';
import { cleanExistedCanvas } from './utils/canvas';
import { DisplayObject, DISPLAY_OBJECT_EVENT } from './DisplayObject';
import { ContextService } from './services';
import { container } from './inversify.config';
import { RenderingService } from './services/RenderingService';
import { RenderingContext, RENDER_REASON } from './services/RenderingContext';
import { EventService } from './services/EventService';
import { Camera, CAMERA_EVENT, CAMERA_PROJECTION_MODE } from './Camera';
import { containerModule as commonContainerModule } from './canvas-module';
import { AbstractRenderer, IRenderer } from './AbstractRenderer';
import { AnimationTimeline } from './Timeline';

export interface CanvasService {
  init(): void;
  destroy(): void;
}

/**
 * mix Window and Document
 */
export class Canvas extends EventEmitter {
  /**
   * child container of current canvas, use hierarchy container
   */
  protected container = container.createChild();

  /**
   * rAF in auto rendering
   */
  private frameId?: number;

  /**
   * window.document
   */
  document: DisplayObject;

  scrollX = 0;
  scrollY = 0;

  Element = DisplayObject;

  /**
   * document.timeline in WAAPI
   */
  timeline = new AnimationTimeline();

  constructor(config: CanvasConfig) {
    super();

    cleanExistedCanvas(config.container, this);

    const mergedConfig = {
      ...config,
      cursor: 'default' as Cursor,
    };

    this.initRenderingContext(mergedConfig);
    this.initDefaultCamera(mergedConfig.width, mergedConfig.height);
    this.initRenderer(mergedConfig.renderer);
  }

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    const root = this.getRoot();
    root.addEventListener(type, listener, options);
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    const root = this.getRoot();
    root.removeEventListener(type, listener, options);
  }

  private initRenderingContext(mergedConfig: CanvasConfig) {
    this.container.bind<CanvasConfig>(CanvasConfig).toConstantValue(mergedConfig);
    // bind rendering context, shared by all renderers
    const root = new DisplayObject({
      style: {},
    });
    // ref to Canvas @see https://developer.mozilla.org/en-US/docs/Web/API/Document/defaultView
    root.defaultView = this;
    // ref to itself @see https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement
    root.documentElement = root;

    // window.document
    this.document = root;
    root.ownerDocument = root;
    this.container.bind<RenderingContext>(RenderingContext).toConstantValue({
      /**
       * the root node in scene graph
       */
      root,

      removedAABBs: [],

      renderReasons: new Set(),

      force: false,
      dirty: false,
    });
  }

  private initDefaultCamera(width: number, height: number) {
    // set a default ortho camera
    const camera = new Camera()
      .setPosition(width / 2, height / 2, 500)
      .setFocalPoint(width / 2, height / 2, 0)
      // origin to be in the top left
      .setOrthographic(width / -2, width / 2, height / -2, height / 2, 0.1, 1000);

    // redraw when camera changed
    const context = this.container.get<RenderingContext>(RenderingContext);
    camera.on(CAMERA_EVENT.Updated, () => {
      context.renderReasons.add(RENDER_REASON.CameraChanged);
    });
    // bind camera
    this.container.bind(Camera).toConstantValue(camera);
  }

  getConfig() {
    return this.container.get<Partial<CanvasConfig>>(CanvasConfig);
  }

  /**
   * get the root displayObject in scenegraph
   */
  getRoot() {
    return this.container.get<RenderingContext>(RenderingContext).root;
  }

  /**
   * get the camera of canvas
   */
  getCamera() {
    return this.container.get(Camera);
  }

  getContextService() {
    return this.container.get<ContextService<unknown>>(ContextService);
  }

  getEventService() {
    return this.container.get<EventService>(EventService);
  }

  getRenderingService() {
    return this.container.get<RenderingService>(RenderingService);
  }

  getRenderingContext() {
    return this.container.get<RenderingContext>(RenderingContext);
  }

  getComputedStyle(node: DisplayObject) {
    return node.style;
  }

  destroy(destroyScenegraph = true) {
    this.emit('beforeDestroy');
    if (this.frameId) {
      window.cancelAnimationFrame(this.frameId);
    }

    // unmount all children
    const root = this.getRoot();
    const renderingService = this.container.get<RenderingService>(RenderingService);
    if (destroyScenegraph) {
      root.forEach((child: DisplayObject) => {
        this.removeChild(child, true);
      });
      // destroy timeline
      this.timeline.destroy();
    } else {
      this.unmountChildren(root);
    }

    // destroy services
    this.getContextService().destroy();
    renderingService.destroy();

    this.emit('afterDestroy');
  }

  /**
   * compatible with G 3.0
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
    const camera = this.container.get(Camera);
    const projectionMode = camera.getProjectionMode();
    if (projectionMode === CAMERA_PROJECTION_MODE.ORTHOGRAPHIC) {
      camera.setOrthographic(
        width / -2,
        width / 2,
        height / -2,
        height / 2,
        camera.getNear(),
        camera.getFar(),
      );
    } else {
      camera.setAspect(width / height);
    }
  }

  appendChild(node: DisplayObject) {
    const renderingService = this.container.get<RenderingService>(RenderingService);
    const root = this.getRoot();
    root.appendChild(node);
    node.ownerDocument = root;

    this.decorate(node, renderingService, root);
  }

  private decorate(object: DisplayObject, renderingService: RenderingService, root: DisplayObject) {
    object.forEach((child: DisplayObject) => {
      this.mountChild(child);

      child.on(DISPLAY_OBJECT_EVENT.ChildInserted, (grandchild: DisplayObject) =>
        this.decorate(grandchild, renderingService, root),
      );
      child.on(DISPLAY_OBJECT_EVENT.ChildRemoved, (grandchild: DisplayObject) => this.unmountChildren(grandchild));
    });
  }

  removeChild(node: DisplayObject, destroy?: boolean) {
    this.getRoot().removeChild(node, destroy);
  }

  render() {
    this.emit('beforeRender');

    if (this.container.isBound(RenderingService)) {
      const renderingService = this.container.get<RenderingService>(RenderingService);
      renderingService.render();
    }

    this.emit('afterRender');
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

    this.container.snapshot();

    this.loadCommonContainerModule();
    this.loadRendererContainerModule(renderer);

    // init context
    const contextService = this.container.get<ContextService<unknown>>(ContextService);
    const renderingService = this.container.get<RenderingService>(RenderingService);

    contextService.init();
    renderingService.init();

    if (renderer.getConfig().enableAutoRendering) {
      this.run();
    }
  }

  private loadCommonContainerModule() {
    this.container.load(commonContainerModule);
  }

  private loadRendererContainerModule(renderer: IRenderer) {
    // load other container modules provided by g-canvas/g-svg/g-webgl
    const plugins = renderer.getPlugins();
    plugins.forEach((plugin) => {
      plugin.init(this.container);
    });
  }

  setRenderer(renderer: AbstractRenderer) {
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
    oldRenderer?.getPlugins().forEach((plugin) => {
      plugin.destroy(this.container);
    });

    this.container.restore();
    this.initRenderer(renderer);

    // keep current scenegraph unchanged, just trigger mounted event
    this.mountChildren(this.getRoot());
  }

  private unmountChildren(node: DisplayObject) {
    const renderingService = this.container.get<RenderingService>(RenderingService);
    node.forEach((child: DisplayObject) => {
      if (child.isConnected) {
        renderingService.hooks.unmounted.call(child);
        child.isConnected = false;
        child.ownerDocument = null;
      }
    });
  }

  private mountChildren(parent: DisplayObject) {
    parent.forEach((child: DisplayObject) => {
      this.mountChild(child);
    });
  }

  private mountChild(child: DisplayObject) {
    // trigger mount on node's descendants
    if (!child.isConnected) {
      const renderingService = this.container.get<RenderingService>(RenderingService);
      child.ownerDocument = this.document;
      renderingService.hooks.mounted.call(child);
      child.isConnected = true;
    }
  }
}
