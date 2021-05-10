import { Entity } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import { SyncHook, AsyncSeriesWaterfallHook, AsyncSeriesHook, SyncWaterfallHook } from 'tapable';
import { CanvasService } from '../Canvas';
import { RBushNode, Renderable, SceneGraphNode, Sortable } from '../components';
import { ContributionProvider } from '../contribution-provider';
import { DisplayObject } from '../DisplayObject';
import { DisplayObjectPool } from '../DisplayObjectPool';
import { DisplayObjectHooks } from '../hooks';
import { CanvasConfig, RendererConfig, EventPosition } from '../types';
import { ContextService } from './ContextService';
import { RenderingContext } from './RenderingContext';
import { SceneGraphAdapter } from './SceneGraphAdapter';
import { SceneGraphService } from './SceneGraphService';

export interface RenderingPlugin {
  apply(renderer: RenderingService): void;
}
export const RenderingPluginContribution = Symbol('RenderingPluginContribution');

export interface PickingResult {
  position: EventPosition;
  picked: DisplayObject | null;
}

function sortByZIndex(e1: Entity, e2: Entity) {
  const sortable1 = e1.getComponent(Sortable);
  const sortable2 = e2.getComponent(Sortable);

  return sortable1.zIndex - sortable2.zIndex;
}

/**
 * Use frame renderer implemented by `g-canvas/svg/webgl`, in every frame we do followings:
 * * update & merge dirty rectangles
 * * begin frame
 * * filter by visible
 * * sort by z-index in scene graph
 * * culling with strategies registered in `g-canvas/webgl`
 * * end frame
 */
@injectable()
export class RenderingService implements CanvasService {
  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContributionProvider)
  @named(RenderingPluginContribution)
  private renderingPluginContribution: ContributionProvider<RenderingPlugin>;

  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  @inject(ContextService)
  private contextService: ContextService<unknown>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  hooks = {
    init: new SyncHook<[]>(),
    prepareEntities: new AsyncSeriesWaterfallHook<[Entity[], DisplayObject]>(['entities', 'root']),
    beginFrame: new AsyncSeriesHook<[Entity[], Entity[]]>(['entitiesToRender', 'entities']),
    renderFrame: new AsyncSeriesHook<[Entity[]]>(['entities']),
    endFrame: new AsyncSeriesHook<[Entity[], Entity[]]>(['entitiesToRender', 'entities']),
    destroy: new SyncHook<[]>(),
    pick: new SyncWaterfallHook<[PickingResult]>(['result']),
  };

  async init() {
    // register rendering plugins
    this.renderingPluginContribution.getContributions(true).forEach((plugin) => {
      plugin.apply(this);
    });
    this.hooks.init.call();
  }

  async render() {
    const root = this.renderingContext.root;
    const entities: Entity[] = [];
    this.sceneGraphService.visit(root.getEntity(), (entity) => {
      entities.push(entity);
    });
    // const entities = root.getEntity().getComponent(SceneGraphNode).children;

    this.renderingContext.entities = entities;

    const entitiesToRender = await this.hooks.prepareEntities.promise(entities, root);
    if (entitiesToRender.length === 0) {
      return;
    }

    this.renderingContext.dirtyEntities = entitiesToRender;

    // console.log('render', entitiesToRender);

    await this.hooks.beginFrame.promise(entitiesToRender, entities);
    // if (this.hooks.renderFrame.isUsed()) {
    await this.hooks.renderFrame.promise(entitiesToRender);
    // } else {
    for (const entity of entitiesToRender) {
      DisplayObjectHooks.render.call(
        (this.canvasConfig.renderer as RendererConfig).type,
        this.contextService.getContext(),
        entity
      );
    }
    // }
    await this.hooks.endFrame.promise(entitiesToRender, entities);
  }

  destroy() {
    this.hooks.destroy.call();
  }

  private flatten(entities: Entity[], result: Entity[]) {
    if (entities.length) {
      entities.sort(sortByZIndex).forEach((entity) => {
        result.push(entity);
        const hierarchy = entity.getComponent(SceneGraphNode);
        this.flatten(hierarchy.children, result);
      });
    }
  }
}
