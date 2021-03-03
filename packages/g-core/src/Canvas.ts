import { World } from '@antv/g-ecs';
import { Container } from 'inversify';
import { createRootContainer } from './inversify.config';
import { Transform as CTransform } from './components/Transform';
import { Hierarchy as CHierarchy } from './components/Hierarchy';
import { Geometry as CGeometry } from './components/Geometry';
import { Material as CMaterial } from './components/Material';
import { Renderable as CRenderable } from './components/Renderable';
import { Cullable as CCullable } from './components/Cullable';
import { Animator as CAnimator } from './components/Animator';
import { CanvasConfig, Context as SContext, ContextService } from './systems/Context';
import { SceneGraph as SSceneGraph } from './systems/SceneGraph';
import { Timeline as STimeline } from './systems/Timeline';
import { Renderer as SRenderer, ShapeConfigHandlerContribution } from './systems/Renderer';
import { Culling as SCulling } from './systems/Culling';
import { AABB as SAABB } from './systems/AABB';
import { CanvasCfg, IShape, ShapeCfg } from './types';
import { Shape } from './Shape';
import { ContributionProvider } from './contribution-provider';

export class Canvas {
  protected container: Container;
  protected world: World;
  protected shapeConfigHandlerProvider: ContributionProvider<ShapeConfigHandlerContribution>;
  private frameId: number;
  private frameCallback: Function;

  constructor(private config: CanvasCfg) {
    this.container = createRootContainer();
    this.init();
  }

  protected loadModule() {
    throw new Error('method not implemented');
  }

  public onFrame(callback: Function) {
    this.frameCallback = callback;
  }

  public destroy() {
    this.world.destroy();
    if (this.frameId) {
      window.cancelAnimationFrame(this.frameId);
    }
  }

  public changeSize(width: number, height: number) {
    const contextService = this.container.get<ContextService<unknown>>(ContextService);
    if (contextService) {
      contextService.resize(width, height);
    }
  }

  public addShape(cfg: ShapeCfg): IShape;
  public addShape(type: string, cfg: ShapeCfg): IShape;
  public addShape(type: string | ShapeCfg, cfg?: ShapeCfg): IShape {
    let config: ShapeCfg;
    let shapeType: string;
    if (typeof type !== 'string') {
      config = type;
      // @ts-ignore
      shapeType = cfg.type || '';
    } else {
      config = cfg!;
      shapeType = type;
    }

    const entity = this.world.createEntity();
    entity.addComponent(CTransform);
    entity.addComponent(CHierarchy);
    entity.addComponent(CCullable);
    entity.addComponent(CMaterial);
    entity.addComponent(CGeometry);
    entity.addComponent(CRenderable);

    this.shapeConfigHandlerProvider.getContributions().forEach((handler) => {
      handler.handle(entity, shapeType, config);
    });

    const shape = this.container.get(Shape);
    shape.setEntity(entity);

    return shape;
  }

  private async init() {
    this.container.bind(CanvasConfig).toConstantValue(this.config);
    this.container.bind(Shape).toSelf();
    this.world = this.container.get(World);

    /**
     * register components
     */
    this.world
      .registerComponent(CTransform)
      .registerComponent(CHierarchy)
      .registerComponent(CCullable)
      .registerComponent(CGeometry)
      .registerComponent(CMaterial)
      .registerComponent(CAnimator)
      .registerComponent(CRenderable);

    this.shapeConfigHandlerProvider = this.container.getNamed(ContributionProvider, ShapeConfigHandlerContribution);

    this.loadModule();

    /**
     * register systems
     */
    this.world
      .registerSystem(SContext)
      .registerSystem(SAABB)
      .registerSystem(SCulling)
      .registerSystem(SSceneGraph)
      .registerSystem(STimeline)
      .registerSystem(SRenderer);

    await this.run();
  }

  private async run() {
    let lastTime = performance.now();
    const tick = async () => {
      const time = performance.now();
      const delta = time - lastTime;
      // run all the systems
      await this.world.execute(delta, time);

      if (this.frameCallback) {
        this.frameCallback();
      }
      lastTime = time;
      this.frameId = requestAnimationFrame(tick);
    };
    await tick();
  }
}
