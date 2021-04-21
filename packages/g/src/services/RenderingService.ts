import { Entity } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import RBush from 'rbush';
import { SyncHook, AsyncSeriesWaterfallHook, AsyncSeriesHook } from 'tapable';
import { RBushNode, Renderable } from '../components';
import { ContributionProvider } from '../contribution-provider';
import { DisplayObject } from '../DisplayObject';
// import { DisplayObjectPool } from '../DisplayObjectPool';
import { DisplayObjectHooks } from '../hooks';
import { AABB } from '../shapes';
import { CanvasConfig } from '../types';
import { ContextService } from './ContextService';
import { SceneGraphService } from './SceneGraphService';

export interface RenderingPlugin {
  apply(renderer: RenderingService): void;
}
export const RenderingPluginContribution = Symbol('RenderingPluginContribution');

export interface RenderingContext {
  dirtyRectangle: AABB | undefined;
  rBush: RBush<RBushNode>;
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
export class RenderingService {
  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContributionProvider)
  @named(RenderingPluginContribution)
  private renderingPluginContribution: ContributionProvider<RenderingPlugin>;

  @inject(SceneGraphService)
  private sceneGraph: SceneGraphService;

  @inject(ContextService)
  private contextService: ContextService<unknown>;

  hooks = {
    prepareEntities: new AsyncSeriesWaterfallHook<[Entity[], DisplayObject]>(['entities', 'root']),
    beginFrame: new AsyncSeriesHook<[Entity[]]>(['entities']),
    renderFrame: new AsyncSeriesHook<[Entity[]]>(['entities']),
    endFrame: new AsyncSeriesHook<[Entity[]]>(['entities']),
    destroy: new SyncHook<[]>(),
  };

  context: RenderingContext = {
    dirtyRectangle: undefined,
    /**
     * spatial index with RTree which can speed up the search for AABBs
     */
    rBush: new RBush<RBushNode>(),
  };

  init() {
    // register rendering plugins
    this.renderingPluginContribution.getContributions(true).forEach((plugin) => {
      plugin.apply(this);
    });
  }

  async render(group: DisplayObject) {
    const entities: Entity[] = [];
    this.sceneGraph.visit(group.getEntity(), (entity) => {
      entities.push(entity);
    });

    const entitiesToRender = await this.hooks.prepareEntities.promise(entities, group);
    if (entitiesToRender.length === 0) {
      return;
    }

    await this.hooks.beginFrame.promise(entitiesToRender);
    if (this.hooks.renderFrame.isUsed()) {
      await this.hooks.renderFrame.promise(entitiesToRender);
    } else {
      for (const entity of entitiesToRender) {
        DisplayObjectHooks.render.call(this.canvasConfig.renderer!, this.contextService.getContext(), entity);
      }
    }
    await this.hooks.endFrame.promise(entitiesToRender);

    // finish rendering, clear dirty flag
    entities.forEach((e) => {
      const renderable = e.getComponent(Renderable);
      if (renderable) {
        renderable.dirty = false;
      }
    });
  }

  destroy() {
    this.hooks.destroy.call();

    // clear r-bush
    // this.context.rBush.clear();
  }
}
