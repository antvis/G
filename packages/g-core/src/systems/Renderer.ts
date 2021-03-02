import { Entity, Matcher, System } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import { Transform } from '../components';
import { Cullable } from '../components/Cullable';
import { Renderable as CRenderable, Renderable } from '../components/Renderable';
import { ContributionProvider } from '../contribution-provider';
import { ShapeCfg } from '../types';

export const ShapeConfigHandlerContribution = Symbol('ShapeConfigHandlerContribution');
export interface ShapeConfigHandlerContribution {
  handle(entity: Entity, type: string, cfg: ShapeCfg): void;
}

export const ShapeRendererFactory = Symbol('ShapeRendererFactory');
export const ShapeRenderer = Symbol('ShapeRenderer');
export interface ShapeRenderer {
  render(entity: Entity): void;
}

export const RendererFrameContribution = Symbol('RendererFrameContribution');
export interface RendererFrameContribution {
  beginFrame(): Promise<void>;
  renderFrame(entities: Entity[]): Promise<void>;
  endFrame(): Promise<void>;
  destroy(): void;
}

@injectable()
export class DefaultShapeConfigHandler implements ShapeConfigHandlerContribution {
  handle(entity: Entity, type: string, cfg: ShapeCfg) {
    const renderable = entity.getComponent(Renderable);
    const transform = entity.getComponent(Transform);

    renderable.type = type;
    renderable.attrs = cfg.attrs;

    const {
      attrs: { x = 0, y = 0 },
    } = cfg;

    // set position
    transform.setPosition(x, y);
  }
}

/**
 * 使用上层 g-canvas/svg/webgl 提供的渲染服务
 */
@injectable()
export class Renderer extends System {
  static tag = 's-renderer';

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
