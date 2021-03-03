import { Entity, Matcher, System } from '@antv/g-ecs';
import * as d3Ease from 'd3-ease';
import { interpolate } from 'd3-interpolate';
import { Animator } from '../components/Animator';
import { Renderable } from '../components/Renderable';
import { inject, injectable, multiInject } from 'inversify';
import { Animation } from '../types';
import { ShapeRenderer, ShapeRendererFactory } from './Renderer';
import isFunction from 'lodash-es/isFunction';
import each from 'lodash-es/each';
import { isColorProp, isGradientColor } from '../utils/color';

export const AttributeAnimationUpdaters = Symbol('AttributeAnimationUpdaters');
export const AttributeAnimationUpdater = Symbol('AttributeAnimationUpdater');
export interface AttributeAnimationUpdater {
  filter(attribute: string, fromAttribute: any, toAttribute: any): boolean;
  update<T>(entity: Entity, fromAttribute: T, toAttribute: T, ratio: number): T;
}

/**
 * default updater, get updated value with d3-interpolate
 */
@injectable()
export class DefaultAttributeAnimationUpdater implements AttributeAnimationUpdater {
  filter(attribute: string, fromAttribute: any, toAttribute: any) {
    return !isFunction(toAttribute);
  }

  update(entity: Entity, fromAttribute: any, toAttribute: any, ratio: number) {
    const interf = interpolate(fromAttribute, toAttribute);
    return interf(ratio);
  }
}

/**
 * color updater, don't support color transition now
 */
@injectable()
export class ColorAttributeAnimationUpdater implements AttributeAnimationUpdater {
  filter(attribute: string, fromAttribute: any, toAttribute: any) {
    return isColorProp(attribute) && isGradientColor(toAttribute);
  }

  update(entity: Entity, fromAttribute: any, toAttribute: any, ratio: number) {
    // TODO: support color animation
    return toAttribute;
  }
}

/**
 * do animation
 */
@injectable()
export class Timeline extends System {
  static tag = 's-timeline';

  @inject(ShapeRendererFactory)
  private shapeRendererFactory: (type: string) => ShapeRenderer | null;

  @multiInject(AttributeAnimationUpdaters)
  private attributeAnimationUpdaters: AttributeAnimationUpdater[];

  trigger() {
    return new Matcher().allOf(Renderable, Animator);
  }

  execute(entities: Entity[], delta: number = 0, millis: number = 0) {
    entities.forEach((entity) => {
      const animator = entity.getComponent(Animator);
      const { animations } = animator;

      for (let j = animations.length - 1; j >= 0; j--) {
        const animation = animations[j];

        if (!animation.startTime) {
          animation.startTime = millis;
        }

        const isFinished = this.update(entity, animation, millis);
        if (isFinished) {
          animations.splice(j, 1);
          if (animation.callback) {
            animation.callback();
          }
        }
      }
    });
  }

  getAnimationAttrs(entity: Entity, props: Record<string, any>) {
    const toAttrs: Record<string, any> = {};
    const fromAttrs: Record<string, any> = {};
    const { attrs } = entity.getComponent(Renderable);

    for (const k in props) {
      if (attrs[k] !== props[k]) {
        fromAttrs[k] = attrs[k];
        toAttrs[k] = props[k];
      }
    }

    return { toAttrs, fromAttrs };
  }

  mergeAnimationAttrs(animations: Animation[], animation: Animation): Animation[] {
    if (animation.onFrame) {
      return animations;
    }
    const { startTime, delay = 0, duration } = animation;
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    each(animations, (item) => {
      // 后一个动画开始执行的时间 < 前一个动画的结束时间 && 后一个动画的执行时间 > 前一个动画的延迟
      if (startTime + delay < item.startTime + (item.delay || 0) + item.duration && duration > (item.delay || 0)) {
        each(animation.toAttrs, (v, k) => {
          if (hasOwnProperty.call(item.toAttrs, k)) {
            delete item.toAttrs[k];
            delete item.fromAttrs[k];
          }
        });
      }
    });

    return animations;
  }

  private update(entity: Entity, animation: Animation, elapsed: number) {
    const {
      startTime,
      delay = 0,
      fromAttrs,
      toAttrs,
      duration,
      easing = 'easeLinear',
      _paused,
      repeat,
      onFrame,
    } = animation;

    // 如果还没有开始执行或暂停，先不更新
    if (elapsed < startTime + delay || _paused) {
      return false;
    }
    let ratio;
    // 已执行时间
    elapsed = elapsed - startTime - delay;
    if (repeat) {
      // 如果动画重复执行，则 elapsed > duration，计算 ratio 时需取模
      ratio = (elapsed % duration) / duration;
      // @ts-ignore
      ratio = d3Ease[easing](ratio);
    } else {
      ratio = elapsed / duration;
      if (ratio < 1) {
        // 动画未执行完
        // @ts-ignore
        ratio = d3Ease[easing](ratio);
      } else {
        // 动画已执行完
        if (onFrame) {
          this.changeEntityAttributes(entity, onFrame(1));
        } else {
          this.changeEntityAttributes(entity, toAttrs);
        }
        return true;
      }
    }
    if (onFrame) {
      this.changeEntityAttributes(entity, onFrame(ratio));
    } else {
      const updatedAttrs: Record<string, any> = {};

      for (const k in toAttrs) {
        const updater = this.attributeAnimationUpdaters
          .reverse()
          .find((updater) => updater.filter(k, fromAttrs[k], toAttrs[k]));
        if (updater) {
          updatedAttrs[k] = updater.update(entity, fromAttrs[k], toAttrs[k], ratio);
        }
      }
      this.changeEntityAttributes(entity, updatedAttrs);
    }
    return false;
  }

  private changeEntityAttributes(entity: Entity, attributes: Record<string, any>) {
    const renderable = entity.getComponent(Renderable);
    const renderer = this.shapeRendererFactory(renderable.type);
    for (const k in attributes) {
      renderer?.onAttributeChanged(entity, k, attributes[k]);
    }
  }
}
