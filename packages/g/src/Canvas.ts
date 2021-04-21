import { World } from '@antv/g-ecs';
import { Container, ContainerModule } from 'inversify';
import { CanvasConfig, GroupCfg, IShape, RENDERER, ShapeCfg } from './types';
import { cleanExistedCanvas } from './utils/canvas';
import { DisplayObject } from './DisplayObject';
import { ContextService, EventService, SceneGraphService } from './services';
import { container, lazyInject } from './inversify.config';
import { bindContributionProvider } from './contribution-provider';
import { RenderingPlugin, RenderingPluginContribution, RenderingService } from './services/RenderingService';
import { DirtyCheckPlugin } from './plugins/renderer/DirtyCheckPlugin';
import { CullingPlugin, CullingStrategy } from './plugins/renderer/CullingPlugin';
import { SortPlugin } from './plugins/renderer/SortPlugin';
import { PrepareRendererPlugin } from './plugins/renderer/PrepareRendererPlugin';
import { Renderable } from './components';
import { DisplayObjectPool } from './DisplayObjectPool';
import { FrustumCullingStrategy } from './plugins/renderer/FrustumCullingStrategy';
import { Camera } from './Camera';
import { DisplayObjectHooks } from './hooks';

export const CanvasContainerModule = Symbol('CanvasContainerModule');

export abstract class Canvas {
  private initialized = false;

  @lazyInject(World)
  protected world: World;
  protected container = new Container();

  private frameId: number;
  private frameCallback: Function;

  /**
   * root group node
   */
  private root: DisplayObject = new DisplayObject();

  constructor(config: CanvasConfig) {
    cleanExistedCanvas(config.container, this);

    // use hierarchy container
    this.container.parent = container;
    this.container.bind(CanvasConfig).toConstantValue({
      dirtyRectangle: {
        enable: true,
        debug: false,
      },
      ...config,
    });

    this.init(config);
  }

  /**
   * override the initial config
   *
   * @example
   * // disable dirty rectangle
   * canvas.setConfig({
   *   dirtyRectangle: {
   *     enable: false,
   *   },
   * });
   *
   * // switch renderer at runtime
   * canvas.setConfig({
   *   renderer: RENDERER.Canvas,
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
    const { renderer, width, height, container } = config;

    // switch renderer at runtime
    if (renderer && renderer !== canvasConfig.renderer) {
      this.switchRenderer(config);
    }

    // change canvas' size at runtime
    if ((width && width !== canvasConfig.width) || (height && height !== canvasConfig.height)) {
      this.changeSize(width || canvasConfig.width || 0, height || canvasConfig.height || 0);
    }

    // TODO: change container, need to destroy first

    Object.assign(canvasConfig, config);
  }

  onFrame(callback: Function) {
    this.frameCallback = callback;
  }

  destroy(destroyGroup = true) {
    if (this.frameId) {
      window.cancelAnimationFrame(this.frameId);
    }

    const contextService = this.container.get<ContextService<unknown>>(ContextService);
    contextService.destroy();

    const renderingService = this.container.get<RenderingService>(RenderingService);
    renderingService.destroy();

    const eventService = this.container.get<EventService>(EventService);
    eventService.destroy();

    if (destroyGroup) {
      // destroy all shapes
      const sceneGraph = this.container.get(SceneGraphService);
      const displayObjectPool = this.container.get(DisplayObjectPool);
      sceneGraph.visit(this.root.getEntity(), (entity) => {
        const group = displayObjectPool.getByName(entity.getName());
        if (group) {
          group.destroy();
        }
      });
    }
  }

  changeSize(width: number, height: number) {
    const contextService = container.get<ContextService<unknown>>(ContextService);
    if (contextService) {
      contextService.resize(width, height);
    }
  }

  appendChild(group: DisplayObject) {
    this.root.appendChild(group);
  }

  removeChild(group: DisplayObject) {
    this.root.removeChild(group);
    this.unmountGroup(group);
  }

  // addShape(shape: Shape): IShape;
  // addShape(cfg: ShapeCfg): IShape;
  // addShape(type: string, cfg: ShapeCfg): IShape;
  // addShape(type: string | ShapeCfg | Shape, cfg?: ShapeCfg): IShape {
  //   let shape: Shape;
  //   if (isShape(type)) {
  //     shape = type;
  //   } else {
  //     let config: ShapeCfg;
  //     let shapeType: string;
  //     if (typeof type !== 'string') {
  //       config = type;
  //       // @ts-ignore
  //       shapeType = cfg.type || '';
  //     } else {
  //       config = cfg!;
  //       shapeType = type;
  //     }

  //     // TODO: 增加更新能力，通过 name 判断如果已经存在则更新，否则新建

  //     shape = new Shape({
  //       type: shapeType,
  //       ...config,
  //     });
  //   }

  //   this.root.appendChild(shape);
  //   return shape;
  // }

  // addGroup(group: Group): Group;
  // addGroup(config: GroupCfg): Group;
  // addGroup(config: GroupCfg | Group): Group {
  //   let group: Group;
  //   if (!isGroup(config)) {
  //     group = new Group({
  //       attrs: {},
  //       ...config,
  //     });
  //   } else {
  //     group = config;
  //   }

  //   this.root.appendChild(group);
  //   return group;
  // }

  async render() {
    if (!this.initialized) {
      return;
    }

    if (this.container.isBound(RenderingService)) {
      const renderingService = this.container.get<RenderingService>(RenderingService);
      await renderingService.render(this.root);
    }
  }

  // registerRenderingPlugin<T extends RenderingPlugin>(pluginClazz: T) {
  //   this.container.bind(pluginClazz).toSelf().inSingletonScope();
  //   this.container.bind(RenderingPluginContribution).toService(pluginClazz);
  // }

  private run() {
    const tick = async () => {
      if (this.frameCallback) {
        this.frameCallback();
      }
      await this.render();
      this.frameId = requestAnimationFrame(tick);
    };
    tick();
  }

  private async init(config: Partial<CanvasConfig>) {
    this.container.snapshot();

    this.bindRenderingPlugins();
    this.bindCanvasContainerModule(config.renderer || RENDERER.Canvas);

    const { width, height } = this.container.get<CanvasConfig>(CanvasConfig);

    // init context
    const contextService = this.container.get<ContextService<unknown>>(ContextService);
    await contextService.init();
    contextService.resize(width, height);

    // default camera
    const dpr = contextService.getDPR();
    const camera = this.container.get(Camera);
    camera
      .setPosition(0, 0, 1)
      .setOrthographic((width / -2) * dpr, (width / 2) * dpr, (height / 2) * dpr, (height / -2) * dpr, 0.5, 2);

    // init event
    const eventService = this.container.get<EventService>(EventService);
    await eventService.init(this.root);

    // init renderer
    const renderingService = this.container.get<RenderingService>(RenderingService);
    renderingService.init();

    this.initialized = true;

    if (config.autoRendering !== false) {
      this.run();
    }
  }

  private bindRenderingPlugins() {
    this.container.bind(RenderingService).toSelf().inSingletonScope();
    bindContributionProvider(this.container, RenderingPluginContribution);

    this.container.bind(PrepareRendererPlugin).toSelf().inSingletonScope();
    this.container.bind(RenderingPluginContribution).toService(PrepareRendererPlugin);

    this.container.bind(DirtyCheckPlugin).toSelf().inSingletonScope();
    this.container.bind(RenderingPluginContribution).toService(DirtyCheckPlugin);

    // culling strategies
    bindContributionProvider(this.container, CullingStrategy);
    this.container.bind(FrustumCullingStrategy).toSelf().inSingletonScope();
    this.container.bind(CullingStrategy).toService(FrustumCullingStrategy);
    this.container.bind(CullingPlugin).toSelf().inSingletonScope();
    this.container.bind(RenderingPluginContribution).toService(CullingPlugin);

    this.container.bind(SortPlugin).toSelf().inSingletonScope();
    this.container.bind(RenderingPluginContribution).toService(SortPlugin);
  }

  private bindCanvasContainerModule(renderer: RENDERER) {
    // bind other container modules provided by g-canvas/g-svg/g-webgl
    const canvasContainerModule = this.container.getNamed<ContainerModule>(CanvasContainerModule, renderer);
    this.container.load(canvasContainerModule);
  }

  private async switchRenderer(config: Partial<CanvasConfig>) {
    let renderingService = this.container.get(RenderingService);

    const context = renderingService.context;

    this.unmountGroup(this.root);

    this.destroy(false);

    this.container.restore();
    await this.init(config);

    renderingService = this.container.get(RenderingService);
    renderingService.context = context;
  }

  private unmountGroup(group: DisplayObject) {
    const sceneGraph = this.container.get(SceneGraphService);
    const contextService = this.container.get<ContextService<unknown>>(ContextService);
    const config = this.container.get<CanvasConfig>(CanvasConfig);

    sceneGraph.visit(group.getEntity(), (entity) => {
      const renderable = entity.getComponent(Renderable);
      DisplayObjectHooks.unmounted.callAsync(config.renderer!, contextService.getContext(), entity, () => {
        renderable.didMount = false;
      });
    });
  }
}
