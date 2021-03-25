import {
  ContextService,
  ContributionProvider,
  DefaultShapeRenderer,
  Transform,
  fromRotationTranslationScale,
  getEuler,
  Renderable,
} from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import { vec3 } from 'gl-matrix';

export const StyleRendererContribution = Symbol('StyleRendererContribution');
export interface StyleRendererContribution {
  apply(entity: Entity, context: CanvasRenderingContext2D): void;
}

@injectable()
export abstract class BaseRenderer extends DefaultShapeRenderer {
  @inject(ContextService)
  protected contextService: ContextService<CanvasRenderingContext2D>;

  @inject(ContributionProvider)
  @named(StyleRendererContribution)
  protected handlers: ContributionProvider<StyleRendererContribution>;

  abstract generatePath(entity: Entity): Promise<void> | void;

  protected draw(entity: Entity): Promise<void> | void {
    const context = this.contextService.getContext()!;
    this.handlers.getContributions().forEach((handler) => {
      handler.apply(entity, context);
    });
  }

  abstract isInStrokeOrPath(
    entity: Entity,
    params: {
      lineWidth: number;
      x: number;
      y: number;
    }
  ): boolean;

  onAttributeChanged(entity: Entity, name: string, value: any) {
    super.onAttributeChanged(entity, name, value);
  }

  isHit(entity: Entity, { x, y }: { x: number; y: number }) {
    const lineWidth = this.getHitLineWidth(entity);
    return this.isInStrokeOrPath(entity, {
      lineWidth,
      x,
      y,
    });
  }

  async render(entity: Entity) {
    const context = this.contextService.getContext();

    if (context) {
      const originMatrix = context.getTransform();

      context.beginPath();

      // apply RTS transformation
      this.applyTransform(entity, context);

      // implemented by subclass
      await this.generatePath(entity);

      await this.draw(entity);

      context.closePath();

      context.setTransform(originMatrix);
    }
  }

  private applyTransform(entity: Entity, context: CanvasRenderingContext2D) {
    const transform = entity.getComponent(Transform);
    const [ex, ey, ez] = getEuler(vec3.create(), transform.getRotation());

    const [x, y] = transform.getPosition();
    const [scaleX, scaleY] = transform.getScale();

    // gimbal lock at 90 degrees
    const rts = fromRotationTranslationScale(ex || ez, x, y, scaleX, scaleY);

    // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
    context.transform(rts[0], rts[1], rts[3], rts[4], rts[6], rts[7]);
  }

  private getHitLineWidth(entity: Entity) {
    const renderable = entity.getComponent(Renderable);
    const { stroke, lineWidth = 0, lineAppendWidth = 0 } = renderable.attrs;
    if (!stroke) {
      return 0;
    }
    return lineWidth + lineAppendWidth;
  }
}
