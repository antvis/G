import { Entity, System } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import RBush from 'rbush';
import { SyncHook, AsyncSeriesWaterfallHook, AsyncSeriesHook } from 'tapable';
import { RBushNode, Renderable } from '../components';
import { ContributionProvider } from '../contribution-provider';
import { Group, GROUP_EVENT } from '../Group';
import { Shape } from '../Shape';
import { AABB } from '../shapes';
import { SceneGraphService } from './SceneGraphService';

export interface RenderingPlugin {
  apply(renderer: RenderingService): void;
}
export const RenderingPluginContribution = Symbol('RenderingPluginContribution');

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
  @inject(ContributionProvider)
  @named(RenderingPluginContribution)
  private renderingPluginContribution: ContributionProvider<RenderingPlugin>;

  @inject(SceneGraphService)
  private sceneGraph: SceneGraphService;

  /**
   * spatial index with RTree which can speed up the search for AABBs
   */
  private rBush = new RBush<RBushNode>();

  hooks = {
    prepareEntities: new AsyncSeriesWaterfallHook<[Entity[], Group]>(['entities', 'root']),
    beginFrame: new AsyncSeriesHook<[Entity[], AABB | undefined]>(['entities', 'dirtyRectangle']),
    renderFrame: new AsyncSeriesHook<[Entity[]]>(['entities']),
    endFrame: new AsyncSeriesHook<[Entity[]]>(['entities']),
    destroy: new SyncHook<[]>(),
    changeAttribute: new SyncHook<[Entity, string, any]>(['entity', 'name', 'value']),
  };

  dirtyRectangle: AABB | undefined;

  init() {
    // register rendering plugins
    this.renderingPluginContribution.getContributions().forEach((plugin) => {
      plugin.apply(this);
    });
  }

  getRBush() {
    return this.rBush;
  }

  setDirtyRectangle(dirtyRectangle: AABB | undefined) {
    this.dirtyRectangle = dirtyRectangle;
  }

  async render(group: Group) {
    const entities: Entity[] = [];
    this.sceneGraph.visit(group.getEntity(), (entity) => {
      entities.push(entity);
    });

    const entitiesToRender = await this.hooks.prepareEntities.promise(entities, group);
    if (entitiesToRender.length === 0) {
      return;
    }

    await this.hooks.beginFrame.promise(entitiesToRender, this.dirtyRectangle);
    await this.hooks.renderFrame.promise(entitiesToRender);
    await this.hooks.endFrame.promise(entitiesToRender);
  }

  destroy() {
    this.hooks.destroy.call();

    // clear r-bush
    this.rBush.clear();
  }
}
