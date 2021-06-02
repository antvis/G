import EventEmitter from 'eventemitter3';
import { CanvasConfig, Cursor } from './types';
import { cleanExistedCanvas } from './utils/canvas';
import { DisplayObject, DISPLAY_OBJECT_EVENT } from './DisplayObject';
import { ContextService, SceneGraphService } from './services';
import { container } from './inversify.config';
import { RenderingService } from './services/RenderingService';
import { RenderingContext } from './services/RenderingContext';
import { RBushNode, Renderable } from './components';
import { DisplayObjectPool } from './DisplayObjectPool';
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

    this.container.bind<CanvasConfig>(CanvasConfig).toConstantValue(mergedConfig);
    // bind rendering context, shared by all renderers
    this.container.bind(RenderingContext).toConstantValue({
      /**
       * the root node in scene graph
       */
      root: new DisplayObject({
        id: '_root',
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
    });

    this.initDefaultCamera(mergedConfig.width, mergedConfig.height);
    this.init(mergedConfig.renderer);
  }

  private initDefaultCamera(width: number, height: number) {
    // set a default ortho camera
    const camera = new Camera();
    camera
      .setProjectionMode(CAMERA_PROJECTION_MODE.ORTHOGRAPHIC)
      // .setPosition(mergedConfig.width / 2, 0, 0)
      // .setPerspective(0.1, 100, 75, width / height);
      // .setOrthographic(width / -2, width / 2, height / 2, height / -2, -1000, 1000);
      // origin to be in the top left
      .setOrthographic(0, width, 0, height, -1000, 1000);

    // camera.setViewOffset(width, height, width * 0.25, height * 0.25, width / 2, height / 2);
    // camera.setViewOffset(width, height, 0, 0, width / 2, height / 2);

    // redraw when camera changed
    camera.on(CAMERA_EVENT.Updated, () => {
      const root = this.container.get<RenderingContext>(RenderingContext).root;
      root.forEach((node) => {
        node.getEntity().getComponent(Renderable).dirty = true;
      });
    });
    // bind camera
    this.container.bind(Camera).toConstantValue(camera);
  }

  getRoot() {
    return this.container.get<RenderingContext>(RenderingContext).root;
  }

  getCamera() {
    return this.container.get(Camera);
  }

  /**
   * override the initial config
   *
   * @example
   * // disable dirty rectangle
   * canvas.setConfig({
   *   renderer: {
   *     enableDirtyRectangleRendering: false,
   *   },
   * });
   *
   * // switch renderer at runtime
   * canvas.setConfig({
   *   renderer: {
   *     type: CANVAS_RENDERER,
   *   }
   * });
   *
   * // change size
   * canvas.setConfig({
   *   width: 200,
   *   height: 200,
   * });
   */
  setConfig(config: Partial<CanvasConfig>) {
    const canvasConfig = this.container.get<Partial<CanvasConfig>>(CanvasConfig);
    const { renderer, width, height } = config;

    // switch renderer at runtime
    if (renderer && canvasConfig.renderer !== renderer) {
      this.switchRenderer(renderer);
      canvasConfig.renderer = renderer;
    }

    let sizeChanged = false;
    // change canvas' size at runtime
    if (width && width !== canvasConfig.width) {
      canvasConfig.width = width;
      sizeChanged = true;
    }
    if (height && height !== canvasConfig.height) {
      canvasConfig.height = height;
      sizeChanged = true;
    }
    if (sizeChanged) {
      this.changeSize(width!, height!);
    }

    // TODO: change container, need to destroy first
  }

  destroy(destroyGroup = true) {
    if (this.frameId) {
      window.cancelAnimationFrame(this.frameId);
    }

    // unmount all children
    const root = this.container.get<RenderingContext>(RenderingContext).root;
    const renderingService = this.container.get<RenderingService>(RenderingService);
    if (destroyGroup) {
      root.forEach((child: DisplayObject) => {
        this.removeChild(child, true);
      });
    } else {
      this.unmountChildren(root);
    }

    // destroy services
    const contextService = this.container.get<ContextService<unknown>>(ContextService);

    contextService.destroy();
    renderingService.destroy();
  }

  changeSize(width: number, height: number) {
    const contextService = container.get<ContextService<unknown>>(ContextService);
    contextService.resize(width, height);
    const dpr = contextService.getDPR();

    // resize camera
    const camera = this.container.get(Camera);
    const projectionMode = camera.getProjectionMode();
    if (projectionMode === CAMERA_PROJECTION_MODE.ORTHOGRAPHIC) {
      camera.setOrthographic((width / -2) * dpr, (width / 2) * dpr, (height / 2) * dpr, (height / -2) * dpr, 0.5, 20);
    } else {
      // TODO: perspective
    }
  }

  appendChild(node: DisplayObject) {
    const root = this.container.get<RenderingContext>(RenderingContext).root;
    const renderingService = this.container.get<RenderingService>(RenderingService);
    root.appendChild(node);

    this.decorate(node, renderingService);
  }

  private decorate(object: DisplayObject, renderingService: RenderingService) {
    object.forEach((child: DisplayObject) => {
      // trigger mount on node's descendants
      if (!child.mounted) {
        renderingService.hooks.mounted.call(child);
        child.mounted = true;
      }

      child.on(DISPLAY_OBJECT_EVENT.ChildInserted, (grandchild) => this.decorate(grandchild, renderingService));
      child.on(DISPLAY_OBJECT_EVENT.ChildRemoved, (grandchild) => this.unmountChildren(grandchild));
    });
  }

  removeChild(node: DisplayObject, destroy?: boolean) {
    const root = this.container.get<RenderingContext>(RenderingContext).root;
    root.removeChild(node, destroy);
  }

  render() {
    this.emit('prerender');

    if (this.container.isBound(RenderingService)) {
      const renderingService = this.container.get<RenderingService>(RenderingService);
      renderingService.render();
    }

    this.emit('postrender');
  }

  private run() {
    const tick = () => {
      this.render();
      this.frameId = requestAnimationFrame(tick);
    };
    tick();
  }

  private init(renderer: IRenderer) {
    if (!renderer) {
      throw new Error('Renderer is required.');
    }

    this.container.snapshot();

    this.bindCommonContainerModule();
    this.bindCanvasContainerModule(renderer);

    // init context
    const contextService = this.container.get<ContextService<unknown>>(ContextService);
    const renderingService = this.container.get<RenderingService>(RenderingService);

    contextService.init();
    renderingService.init();

    if (renderer.getConfig().enableAutoRendering) {
      this.run();
    }
  }

  private bindCommonContainerModule() {
    this.container.load(commonContainerModule);
  }

  private bindCanvasContainerModule(renderer: IRenderer) {
    // load other container modules provided by g-canvas/g-svg/g-webgl
    const modules = renderer.getPlugins();
    modules.forEach((module) => {
      this.container.load(module);
    });
  }

  private switchRenderer(renderer: IRenderer) {
    // keep all children undestroyed
    this.destroy(false);
    this.container.restore();
    this.init(renderer);

    // keep current scenegraph unchanged, just trigger
    const root = this.container.get<RenderingContext>(RenderingContext).root;
    this.mountChildren(root);
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
