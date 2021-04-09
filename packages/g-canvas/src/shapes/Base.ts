import {
  ContextService,
  ContributionProvider,
  DefaultShapeRenderer,
  fromRotationTranslationScale,
  getEuler,
  Renderable,
  SceneGraphNode,
} from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import { vec3 } from 'gl-matrix';

export const StyleRendererContribution = Symbol('StyleRendererContribution');
export interface StyleRendererContribution {
  apply(entity: Entity, context: CanvasRenderingContext2D): void;
}

@injectable()
export abstract class BaseRenderer extends DefaultShapeRenderer<CanvasRenderingContext2D> {
  @inject(ContributionProvider)
  @named(StyleRendererContribution)
  protected handlers: ContributionProvider<StyleRendererContribution>;

  abstract prepare?(context: CanvasRenderingContext2D, entity: Entity): Promise<void>;
  abstract generatePath?(context: CanvasRenderingContext2D, entity: Entity): void;
  abstract finishRenderingPath?(context: CanvasRenderingContext2D, entity: Entity): void;
  abstract isInStrokeOrPath(
    entity: Entity,
    params: {
      lineWidth: number;
      x: number;
      y: number;
    }
  ): boolean;

  async onAttributeChanged(entity: Entity, name: string, value: any) {
    await super.onAttributeChanged(entity, name, value);

    const renderable = entity.getComponent(Renderable);
    // set dirty rectangle flag
    renderable.dirty = true;
  }

  isHit(entity: Entity, { x, y }: { x: number; y: number }) {
    const lineWidth = this.getHitLineWidth(entity);
    return this.isInStrokeOrPath(entity, {
      lineWidth,
      x,
      y,
    });
  }

  async init(context: CanvasRenderingContext2D, entity: Entity) {
    if (this.prepare) {
      await this.prepare(context, entity);
    }
  }

  render(context: CanvasRenderingContext2D, entity: Entity) {
    const originMatrix = context.getTransform();

    // apply RTS transformation
    this.applyTransform(context, entity);

    if (this.generatePath) {
      context.beginPath();
      this.generatePath(context, entity);
      context.closePath();
    }

    this.handlers.getContributions().forEach((handler) => {
      handler.apply(entity, context);
    });

    if (this.finishRenderingPath) {
      this.finishRenderingPath(context, entity);
    }

    context.setTransform(originMatrix);

    // finish rendering, clear dirty flag
    const renderable = entity.getComponent(Renderable);
    renderable.dirty = false;
  }

  private applyTransform(context: CanvasRenderingContext2D, entity: Entity) {
    const [ex, ey, ez] = getEuler(vec3.create(), this.sceneGraphSystem.getRotation(entity));

    const [x, y] = this.sceneGraphSystem.getPosition(entity);
    const [scaleX, scaleY] = this.sceneGraphSystem.getScale(entity);

    // gimbal lock at 90 degrees
    const rts = fromRotationTranslationScale(ex || ez, x, y, scaleX, scaleY);

    // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
    context.transform(rts[0], rts[1], rts[3], rts[4], rts[6], rts[7]);
  }

  private getHitLineWidth(entity: Entity) {
    const renderable = entity.getComponent(SceneGraphNode);
    const { stroke, lineWidth = 0, lineAppendWidth = 0 } = renderable.attributes;
    if (!stroke) {
      return 0;
    }
    return lineWidth + lineAppendWidth;
  }
}
