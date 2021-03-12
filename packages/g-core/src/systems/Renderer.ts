import { Entity, Matcher, System } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import { Hierarchy, Transform, Visible } from '../components';
import { Cullable } from '../components/Cullable';
import { Renderable } from '../components/Renderable';
import { ContributionProvider } from '../contribution-provider';
import { ShapeCfg, ShapeAttrs } from '../types';
import { SceneGraph } from './SceneGraph';

export const ShapeRendererFactory = Symbol('ShapeRendererFactory');
export const ShapeRenderer = Symbol('ShapeRenderer');
export interface ShapeRenderer {
  getDefaultAttributes(): ShapeAttrs;
  init(entity: Entity, type: string, cfg: ShapeCfg): void;
  render(entity: Entity): void;
  onAttributeChanged(entity: Entity, name: string, value: any): void;
}
@injectable()
export abstract class DefaultShapeRenderer {
  getDefaultAttributes() {
    return {
      opacity: 1,
      strokeOpacity: 1,
    };
  }

  init(entity: Entity, type: string, cfg: ShapeCfg) {
    const renderable = entity.getComponent(Renderable);
    const transform = entity.getComponent(Transform);

    renderable.type = type;
    renderable.attrs = { ...this.getDefaultAttributes(), ...cfg.attrs };

    const {
      attrs: { x = 0, y = 0 },
    } = cfg;

    // set position in world space
    transform.setPosition(x, y);
    // update world transform immediately
    // transform.updateTransform();
  }

  abstract render(entity: Entity): void;

  onAttributeChanged(entity: Entity, name: string, value: any) {
    const renderable = entity.getComponent(Renderable);
    const transform = entity.getComponent(Transform);
    const [x, y] = transform.getPosition();

    renderable.attrs[name] = value;

    if (name === 'x') {
      transform.setPosition(value, y);
    } else if (name === 'y') {
      transform.setPosition(x, value);
    }
  }
}

export const RendererFrameContribution = Symbol('RendererFrameContribution');
export interface RendererFrameContribution {
  beginFrame(): Promise<void>;
  renderFrame(entity: Entity[]): Promise<void>;
  endFrame(): Promise<void>;
  destroy(): void;
}

/**
 * 使用上层 g-canvas/svg/webgl 提供的渲染服务
 */
@injectable()
export class Renderer implements System {
  static tag = 's-renderer';

  public priority = Infinity;

  @inject(ContributionProvider)
  @named(RendererFrameContribution)
  private frameContribution: ContributionProvider<RendererFrameContribution>;

  @inject(System)
  @named(SceneGraph.tag)
  private sceneGraph: SceneGraph;

  trigger() {
    return new Matcher().allOf(Renderable);
  }

  async execute(entities: Entity[]) {
    for (const f of this.frameContribution.getContributions()) {
      await f.beginFrame();
    }

    // filter by renderable.visible
    const renderableEntities = entities.filter((entity) => {
      const visible = entity.getComponent(Visible);
      return visible.visible;
    });

    // sort by z-index
    const ids = this.sceneGraph.sort();
    const sortedEntities = renderableEntities.sort((a, b) => ids.indexOf(a) - ids.indexOf(b));

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
      await f.endFrame();
    }
  }

  tearDown() {
    for (const f of this.frameContribution.getContributions()) {
      f.destroy();
    }
  }

  // private sort(entities: Entity[], sorted: Entity[]) {
  //   entities.forEach((entity) => {
  //     const hierarchy = entity.getComponent(Hierarchy);
  //     this.sort(hierarchy.children, sorted);

  //     sorted.push(entity);
  //   });
  // }
}
