import { World } from '@antv/g-ecs';
import { Container } from 'inversify';
import { createRootContainer } from './inversify.config';
import { Transform as CTransform } from './components/Transform';
import { Hierarchy as CHierarchy } from './components/Hierarchy';
import { Geometry as CGeometry } from './components/Geometry';
import { Material as CMaterial } from './components/Material';
import { Renderable as CRenderable } from './components/Renderable';
import { Cullable as CCullable } from './components/Cullable';
import { CanvasConfig, Context as SContext } from './systems/Context';
import { SceneGraph as SSceneGraph } from './systems/SceneGraph';
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

  constructor(private config: CanvasCfg) {
    this.container = createRootContainer();
    this.init();
  }

  protected loadModule() {
    throw new Error('method not implemented');
  }

  public changeSize(width: number, height: number) {
    // this.contextService.resize(width, height);
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

    const shape = new Shape();
    shape.setEntity(entity);

    return shape;
  }

  private async init() {
    this.container.bind(CanvasConfig).toConstantValue(this.config);
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

      lastTime = time;
      requestAnimationFrame(tick);
    };
    await tick();
  }
}
