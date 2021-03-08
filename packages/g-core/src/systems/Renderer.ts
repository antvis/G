import { Entity, Matcher, System } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import { Transform } from '../components';
import { Cullable } from '../components/Cullable';
import { Renderable as CRenderable, Renderable } from '../components/Renderable';
import { ContributionProvider } from '../contribution-provider';
import { ShapeCfg, ShapeAttrs } from '../types';

export const ShapeRendererFactory = Symbol('ShapeRendererFactory');
export const ShapeRenderer = Symbol('ShapeRenderer');
export interface ShapeRenderer {
  getDefaultAttributes(): ShapeAttrs;
  init(entity: Entity, type: string, cfg: ShapeCfg): void;
  render(entity: Entity): void;
  onAttributeChanged(entity: Entity, name: string, value: any): void;
}
@injectable()
export class DefaultShapeRenderer {
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

    // set position
    transform.setPosition(x, y);
  }

  render(entity: Entity) {
    //
  }

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
  renderFrame(entities: Entity[]): Promise<void>;
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

  trigger() {
    return new Matcher().allOf(CRenderable);
  }

  async execute(entities: Entity[]) {
    for (const f of this.frameContribution.getContributions()) {
      await f.beginFrame();
    }

    // do culling first
    const visibleEntities = entities.filter((entity) => {
      const cullable = entity.getComponent(Cullable);
      return !cullable || cullable.visible;
    });
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
}
