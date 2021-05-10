import { ContainerModule } from 'inversify';
import { isString } from '@antv/util';
import EventEmitter from 'eventemitter3';
import { CanvasConfig, RendererConfig } from './types';
import { cleanExistedCanvas } from './utils/canvas';
import { DisplayObject } from './DisplayObject';
import { ContextService, SceneGraphService } from './services';
import { container, lazyInject, lazyInjectNamed } from './inversify.config';
import { RenderingService } from './services/RenderingService';
import { RenderingContext } from './services/RenderingContext';
import { RBushNode, Renderable } from './components';
import { DisplayObjectPool } from './DisplayObjectPool';
import { Camera } from './Camera';
import { DisplayObjectHooks } from './hooks';
import RBush from 'rbush';
import { containerModule as commonContainerModule } from './canvas-module';

export const CanvasContainerModule = Symbol('CanvasContainerModule');

export const CanvasServiceContribution = Symbol('CanvasServiceContribution');
export interface CanvasService {
  init(): Promise<void>;
  destroy(): void;
}

export abstract class Canvas extends EventEmitter {
  /**
   * container of current canvas, use hierarchy container
   */
  protected container = container.createChild();

  /**
   * rAF in auto rendering
   */
  private frameId: number;

  private initialized = false;

  constructor(config: CanvasConfig) {
    super();

    cleanExistedCanvas(config.container, this);

    const { renderer, ...rest } = config;
    const mergedConfig = {
      renderer: {
        type: '', // set renderer's type later
        enableAutoRendering: true,
        enableDirtyRectangleRendering: true,
        ...(isString(config.renderer) ? { type: config.renderer } : config.renderer),
      },
      cursor: 'default',
      ...rest,
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
    });
    // this.container.bind(RenderingContext).toSelf().inSingletonScope();

    this.init(mergedConfig.renderer as RendererConfig);
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
    const { renderer, ...rest } = config;
    const { width, height } = rest;
    const currentRendererType = (canvasConfig.renderer as RendererConfig).type;

    Object.assign(canvasConfig, {
      renderer: {
        ...(canvasConfig.renderer as RendererConfig),
        ...(isString(renderer) ? { type: renderer } : renderer),
      },
      ...rest,
    });

    const newRendererType = (canvasConfig.renderer as RendererConfig).type;

    // switch renderer at runtime
    if (currentRendererType !== newRendererType) {
      this.switchRenderer(canvasConfig);
    }

    // change canvas' size at runtime
    if ((width && width !== canvasConfig.width) || (height && height !== canvasConfig.height)) {
      this.changeSize(width || canvasConfig.width || 0, height || canvasConfig.height || 0);
    }

    // TODO: change container, need to destroy first
  }

  destroy(destroyGroup = true) {
    if (this.frameId) {
      window.cancelAnimationFrame(this.frameId);
    }

    const root = this.container.get<RenderingContext>(RenderingContext).root;

    this.unmountGroup(root);

    const contextService = this.container.get<ContextService<unknown>>(ContextService);
    const renderingService = this.container.get<RenderingService>(RenderingService);

    contextService.destroy();
    renderingService.destroy();

    // const canvasServiceContribution = this.container.getNamed<ContributionProvider<CanvasService>>(ContributionProvider, CanvasServiceContribution);
    // canvasServiceContribution.getContributions().forEach((service) => {
    //   service.destroy();
    // });

    if (destroyGroup) {
      // destroy all shapes
      const sceneGraph = this.container.get(SceneGraphService);
      const displayObjectPool = this.container.get(DisplayObjectPool);
      sceneGraph.visit(root.getEntity(), (entity) => {
        const group = displayObjectPool.getByName(entity.getName());
        if (group) {
          group.destroy();
        }
      });

      // this.container.get<RenderingContext>(RenderingContext).destroy();
    }
  }

  changeSize(width: number, height: number) {
    const contextService = container.get<ContextService<unknown>>(ContextService);
    if (contextService) {
      contextService.resize(width, height);
    }
  }

  appendChild(group: DisplayObject) {
    const root = this.container.get<RenderingContext>(RenderingContext).root;
    root.appendChild(group);
  }

  removeChild(group: DisplayObject) {
    const root = this.container.get<RenderingContext>(RenderingContext).root;
    root.removeChild(group);
    this.unmountGroup(group);
  }

  async render() {
    if (!this.initialized) {
      return;
    }

    this.emit('prerender');

    if (this.container.isBound(RenderingService)) {
      const renderingService = this.container.get<RenderingService>(RenderingService);
      await renderingService.render();
    }

    this.emit('postrender');
  }

  private run() {
    const tick = async () => {
      await this.render();
      this.frameId = requestAnimationFrame(tick);
    };
    tick();
  }

  private async init(rendererConfig: RendererConfig) {
    // const rendererType = isString(config.renderer) ? config.renderer : config.renderer?.type!;
    if (!rendererConfig.type) {
      throw new Error('Renderer is required.');
    }

    this.initialized = false;

    this.container.snapshot();

    this.bindCommonContainerModule();
    this.bindCanvasContainerModule(rendererConfig.type);

    const { width, height } = this.container.get<CanvasConfig>(CanvasConfig);

    // init context
    const contextService = this.container.get<ContextService<unknown>>(ContextService);
    const renderingService = this.container.get<RenderingService>(RenderingService);

    // const canvasServiceContribution = this.container.getNamed<ContributionProvider<CanvasService>>(ContributionProvider, CanvasServiceContribution);
    // for (const service of canvasServiceContribution.getContributions().reverse()) {
    await contextService.init();
    await renderingService.init();
    // }

    // default camera
    const dpr = contextService.getDPR();
    const camera = this.container.get(Camera);
    camera
      .setPosition(0, 0, 1)
      .setOrthographic((width / -2) * dpr, (width / 2) * dpr, (height / 2) * dpr, (height / -2) * dpr, 0.5, 2);

    this.initialized = true;

    if (rendererConfig.enableAutoRendering) {
      this.run();
    }
  }

  private bindCommonContainerModule() {
    this.container.load(commonContainerModule);
  }

  private bindCanvasContainerModule(renderer: string) {
    // bind other container modules provided by g-canvas/g-svg/g-webgl
    const canvasContainerModule = this.container.getNamed<ContainerModule>(CanvasContainerModule, renderer);
    this.container.load(canvasContainerModule);
  }

  private async switchRenderer(config: Partial<CanvasConfig>) {
    this.destroy(false);
    this.container.restore();
    await this.init(config.renderer as RendererConfig);
  }

  private unmountGroup(group: DisplayObject) {
    const sceneGraph = this.container.get(SceneGraphService);
    const contextService = this.container.get<ContextService<unknown>>(ContextService);
    const config = this.container.get<CanvasConfig>(CanvasConfig);
    const renderingContext = this.container.get<RenderingContext>(RenderingContext);

    sceneGraph.visit(group.getEntity(), (entity) => {
      const renderable = entity.getComponent(Renderable);
      DisplayObjectHooks.unmounted.callAsync(
        (config.renderer as RendererConfig).type,
        contextService.getContext(),
        entity,
        () => {
          renderable.didMount = false;
          renderingContext.rBush.remove(renderable.rBushNode);
        }
      );
    });
  }
}
