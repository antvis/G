import { Entity, Matcher, System } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import { SHAPE } from '..';
import { Geometry, Transform, Visible } from '../components';
import { Cullable } from '../components/Cullable';
import { Renderable } from '../components/Renderable';
import { ContributionProvider } from '../contribution-provider';
import { AABB } from '../shapes';
import { ShapeCfg, ShapeAttrs, CanvasConfig } from '../types';
import { SceneGraph } from './SceneGraph';
import { AABB as AABBSystem } from './AABB';

export const ShapeRendererFactory = Symbol('ShapeRendererFactory');
export const ShapeRenderer = Symbol('ShapeRenderer');
export interface ShapeRenderer {
  getDefaultAttributes(): ShapeAttrs;
  init(entity: Entity, type: string, cfg: ShapeCfg, instanceEntity?: Entity): void;
  render(entity: Entity): Promise<void>;
  onAttributeChanged(entity: Entity, name: string, value: any): void;
  isHit(entity: Entity, position: { x: number; y: number }): boolean;
}
@injectable()
export abstract class DefaultShapeRenderer {
  @inject(System)
  @named(AABBSystem.tag)
  private aabbSystem: AABBSystem;

  getDefaultAttributes() {
    return {
      opacity: 1,
      strokeOpacity: 1,
    };
  }

  init(entity: Entity, type: SHAPE, cfg: ShapeCfg) {
    const renderable = entity.getComponent(Renderable);
    const transform = entity.getComponent(Transform);
    const geometry = entity.getComponent(Geometry);

    renderable.type = type;
    renderable.attrs = { ...this.getDefaultAttributes(), ...cfg.attrs };

    const {
      attrs: { x = 0, y = 0 },
    } = cfg;

    // set position in world space
    transform.setPosition(x, y);

    // calc geometry's aabb
    this.aabbSystem.updateAABB(type, cfg.attrs, geometry.aabb);
  }

  abstract render(entity: Entity): Promise<void>;

  onAttributeChanged(entity: Entity, name: string, value: any) {
    const renderable = entity.getComponent(Renderable);
    const transform = entity.getComponent(Transform);
    const geometry = entity.getComponent(Geometry);

    const [x, y] = transform.getPosition();

    // set dirty rectangle flag
    renderable.dirty = true;

    renderable.attrs[name] = value;

    if (name === 'x') {
      transform.setPosition(value, y);
    } else if (name === 'y') {
      transform.setPosition(x, value);
    } else if (
      name === 'lineWidth' ||
      name === 'r' || // circle
      name === 'rx' ||
      name === 'rx' || // ellipse
      name === 'width' ||
      name === 'height' // rect
    ) {
      this.aabbSystem.updateAABB(renderable.type, renderable.attrs, geometry.aabb);
      renderable.aabbDirty = true;
    }
  }
}

export const RendererFrameContribution = Symbol('RendererFrameContribution');
export interface RendererFrameContribution {
  beginFrame(dirtyRectangle?: AABB): Promise<void>;
  renderFrame(entities: Entity[]): Promise<void>;
  endFrame(entities: Entity[]): Promise<void>;
  destroy(): void;
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
export class Renderer implements System {
  static tag = 's-renderer';
  static trigger = new Matcher().allOf(Renderable);
  /**
   * do rendering at last
   */
  static priority = Infinity;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContributionProvider)
  @named(RendererFrameContribution)
  private frameContribution: ContributionProvider<RendererFrameContribution>;

  @inject(System)
  @named(SceneGraph.tag)
  private sceneGraph: SceneGraph;

  @inject(System)
  @named(AABBSystem.tag)
  private aabbSystem: AABBSystem;

  async execute(entities: Entity[]) {
    const dirtyRenderables = entities
      .map((entity) => entity.getComponent(Renderable))
      .filter((renderable) => renderable.dirty);

    // skip rendering if nothing to redraw
    if (dirtyRenderables.length === 0) {
      return;
    }

    // use dirty rectangle or refresh all?
    let dirtyEntities: Entity[] = entities;
    let dirtyRectangle: AABB | undefined;
    if (this.canvasConfig.dirtyRectangle?.enable) {
      // TODO: use threshold when too much dirty renderables
      const { rectangle, entities: affectedEntities } = this.aabbSystem.mergeDirtyRectangles(dirtyRenderables);

      if (!rectangle || affectedEntities.length === 0) {
        return;
      }

      dirtyEntities = affectedEntities;
      dirtyRectangle = rectangle;
    }

    for (const f of this.frameContribution.getContributions()) {
      await f.beginFrame(dirtyRectangle);
    }

    // filter by renderable.visible
    const renderableEntities = dirtyEntities.filter((entity) => {
      const visible = entity.getComponent(Visible);
      return visible.visible;
    });

    // sort by z-index
    const ids = this.sceneGraph.sort();
    const sortedEntities = renderableEntities.sort((a, b) => ids.indexOf(a) - ids.indexOf(b));
    // const sortedEntities = renderableEntities;

    // do culling
    const visibleEntities = sortedEntities.filter((entity) => {
      const cullable = entity.getComponent(Cullable);
      return !cullable || cullable.visible;
    });

    // render each entity
    for (const f of this.frameContribution.getContributions()) {
      await f.renderFrame(visibleEntities);
    }

    for (const f of this.frameContribution.getContributions()) {
      await f.endFrame(visibleEntities);
    }

    // after rendering
    dirtyEntities.forEach((entity) => {
      const renderable = entity.getComponent(Renderable);
      renderable.dirty = false;
    });
  }

  tearDown() {
    for (const f of this.frameContribution.getContributions()) {
      f.destroy();
    }
  }
}
