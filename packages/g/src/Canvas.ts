import { CanvasConfig, Cursor } from './types';
import { cleanExistedCanvas } from './utils/canvas';
import { DisplayObject } from './DisplayObject';
import { ContextService } from './services';
import { container } from './inversify.config';
import { RenderingService } from './services/RenderingService';
import { RenderingContext, RENDER_REASON } from './services/RenderingContext';
import { EventService } from './services/EventService';
import { Camera, CAMERA_EVENT, CAMERA_PROJECTION_MODE, DefaultCamera } from './Camera';
import { containerModule as commonContainerModule } from './canvas-module';
import { AbstractRenderer, IRenderer } from './AbstractRenderer';
import { cancelAnimationFrame } from './utils/raf';
import { Point } from './shapes';
import { DISPLAY_OBJECT_EVENT } from './dom/Element';
import { EventTarget } from './dom/EventTarget';
import { Document } from './dom/Document';

export interface CanvasService {
  init(): void;
  destroy(): void;
}

/**
 * can be treated like Window in DOM
 *
 * prototype chains: Canvas(Window) -> EventTarget
 */
export class Canvas extends EventTarget {
  /**
   * child container of current canvas, use hierarchy container
   */
  container = container.createChild();

  /**
   * window.document
   */
  document: Document;

  Element = DisplayObject;

  /**
   * rAF in auto rendering
   */
  private frameId?: number;

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

  private initRenderingContext(mergedConfig: CanvasConfig) {
    this.container.bind<CanvasConfig>(CanvasConfig).toConstantValue(mergedConfig);

    this.document = new Document();
    this.document.defaultView = this;

    // bind rendering context, shared by all renderers
    this.container.bind<RenderingContext>(RenderingContext).toConstantValue({
      /**
       * the root node in scene graph
       */
      root: this.document.documentElement,

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
    this.container.bind(DefaultCamera).toConstantValue(camera);
  }

  getConfig() {
    return this.container.get<Partial<CanvasConfig>>(CanvasConfig);
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
    return this.container.get(DefaultCamera);
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
    return node.parsedStyle;
  }

  destroy(destroyScenegraph = true) {
    this.emit('beforedestroy', () => {});
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }

    // unmount all children
    const root = this.getRoot();
    const renderingService = this.container.get<RenderingService>(RenderingService);
    if (destroyScenegraph) {
      root.forEach((child: DisplayObject) => {
        this.removeChild(child, true);
      });
      // destroy timeline
      this.document.timeline.destroy();
    } else {
      this.unmountChildren(root);
    }

    // destroy services
    this.getContextService().destroy();
    renderingService.destroy();

    this.emit('afterdestroy', {});
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
    const camera = this.container.get<Camera>(DefaultCamera);
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

  // proxy to document.documentElement
  appendChild(node: DisplayObject) {
    return this.document.documentElement.appendChild(node);
  }
  insertBefore(group: DisplayObject, reference?: DisplayObject): DisplayObject {
    return this.document.documentElement.insertBefore(group, reference);
  }
  removeChild(node: DisplayObject, destroy?: boolean) {
    return this.document.documentElement.removeChild(node, destroy);
  }
  removeChildren() {
    this.document.documentElement.removeChildren();
  }

  decorate(object: DisplayObject, renderingService: RenderingService, root: DisplayObject) {
    object.forEach((child: DisplayObject) => {
      this.mountChild(child);

      child.on(DISPLAY_OBJECT_EVENT.ChildInserted, (grandchild: DisplayObject) =>
        this.decorate(grandchild, renderingService, root),
      );
      child.on(DISPLAY_OBJECT_EVENT.ChildRemoved, (grandchild: DisplayObject) =>
        this.unmountChildren(grandchild),
      );
    });
  }

  render() {
    this.emit('beforerender', {});

    if (this.container.isBound(RenderingService)) {
      const renderingService = this.container.get<RenderingService>(RenderingService);
      renderingService.render();
    }

    this.emit('afterrender', {});
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

    // keep current scenegraph unchanged, just trigger mounted event
    this.mountChildren(this.getRoot());
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

  getPointByClient(clientX: number, clientY: number): Point {
    const bbox = this.getContextService().getBoundingClientRect();
    return new Point(clientX - (bbox?.left || 0), clientY - (bbox?.top || 0));
  }

  getClientByPoint(x: number, y: number): Point {
    const bbox = this.getContextService().getBoundingClientRect();
    return new Point(x + (bbox?.left || 0), y + (bbox?.top || 0));
  }
}
