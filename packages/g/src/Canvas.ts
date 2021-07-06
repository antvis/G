import EventEmitter from 'eventemitter3';
import { CanvasConfig, Cursor } from './types';
import { cleanExistedCanvas } from './utils/canvas';
import { DisplayObject, DISPLAY_OBJECT_EVENT } from './DisplayObject';
import { ContextService } from './services';
import { container } from './inversify.config';
import { RenderingService } from './services/RenderingService';
import { RenderingContext } from './services/RenderingContext';
import { RBushNode, Renderable } from './components';
import { Camera, CAMERA_EVENT, CAMERA_PROJECTION_MODE } from './Camera';
import RBush from 'rbush';
import { containerModule as commonContainerModule } from './canvas-module';
import { IRenderer } from './AbstractRenderer';

export interface CanvasService {
  init(): void;
  destroy(): void;
}

export abstract class Canvas extends EventEmitter {
  /**
   * child container of current canvas, use hierarchy container
   */
  protected container = container.createChild();

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
    // bind rendering context, shared by all renderers
    this.container.bind(RenderingContext).toConstantValue({
      /**
       * the root node in scene graph
       */
      root: new DisplayObject({
        attrs: {},
      }),

      /**
       * spatial index with RTree which can speed up the search for AABBs
       */
      rBush: new RBush<RBushNode>(),

      /**
       * all the entities
       */
      entities: [],

      dirtyRectangle: undefined,
      dirtyEntities: [],
      removedAABBs: [],
      cameraDirty: true,
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
      this.getRoot().forEach((node) => {
        node.getEntity().getComponent(Renderable).dirty = true;
      });
      context.cameraDirty = true;
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
    this.getRoot().appendChild(node);

    this.decorate(node, renderingService);
  }

  private decorate(object: DisplayObject, renderingService: RenderingService) {
    object.forEach((child: DisplayObject) => {
      // trigger mount on node's descendants
      if (!child.mounted) {
        renderingService.hooks.mounted.call(child);
        child.mounted = true;
      }

      child.on(DISPLAY_OBJECT_EVENT.ChildInserted, (grandchild) =>
        this.decorate(grandchild, renderingService),
      );
      child.on(DISPLAY_OBJECT_EVENT.ChildRemoved, (grandchild) => this.unmountChildren(grandchild));
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
    const modules = renderer.getPlugins();
    modules.forEach((module) => {
      this.container.load(module);
    });
  }

  setRenderer(renderer: IRenderer) {
    // update canvas' config
    const canvasConfig = this.getConfig();
    if (canvasConfig.renderer === renderer) {
      return;
    }
    canvasConfig.renderer = renderer;

    // keep all children undestroyed
    this.destroy(false);
    this.container.restore();
    this.initRenderer(renderer);

    // keep current scenegraph unchanged, just trigger mounted event
    this.mountChildren(this.getRoot());
  }

  private unmountChildren(node: DisplayObject) {
    const renderingService = this.container.get<RenderingService>(RenderingService);
    node.forEach((child: DisplayObject) => {
      if (child.mounted) {
        renderingService.hooks.unmounted.call(child);
        child.mounted = false;
      }
    });
  }

  private mountChildren(node: DisplayObject) {
    const renderingService = this.container.get<RenderingService>(RenderingService);
    node.forEach((child: DisplayObject) => {
      if (!child.mounted) {
        renderingService.hooks.mounted.call(child);
        child.mounted = true;
      }
    });
  }
}
