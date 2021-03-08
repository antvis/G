import { Entity, Matcher, System } from '@antv/g-ecs';
import * as d3Ease from 'd3-ease';
import { interpolate } from 'd3-interpolate';
import { Animator, STATUS } from '../components/Animator';
import { Renderable } from '../components/Renderable';
import { inject, injectable, multiInject } from 'inversify';
import { AnimateCfg, Animation, OnFrame } from '../types';
import { ShapeRenderer, ShapeRendererFactory } from './Renderer';
import isNumber from 'lodash-es/isNumber';
import isFunction from 'lodash-es/isFunction';
import isObject from 'lodash-es/isObject';
import each from 'lodash-es/each';
import { isColorProp, isGradientColor } from '../utils/color';

const noop = () => {};

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
export class Timeline implements System {
  static tag = 's-timeline';

  @inject(ShapeRendererFactory)
  private shapeRendererFactory: (type: string) => ShapeRenderer | null;

  @multiInject(AttributeAnimationUpdaters)
  private attributeAnimationUpdaters: AttributeAnimationUpdater[];

  trigger() {
    return new Matcher().allOf(Renderable, Animator);
  }

  async execute(entities: Entity[], delta: number = 0, millis: number = 0) {
    entities.forEach((entity) => {
      const animator = entity.getComponent(Animator);
      const { animations } = animator;

      if (animator.status === STATUS.Running) {
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
      }
    });
  }

  createAnimation(entity: Entity, args: any) {
    let [toAttrs, duration, easing = 'easeLinear', callback = noop, delay = 0] = args;
    let onFrame: OnFrame | undefined;
    let repeat = false;
    let pauseCallback;
    let resumeCallback;
    let animateCfg: AnimateCfg;
    // 第二个参数，既可以是动画最终状态 toAttrs，也可以是自定义帧动画函数 onFrame
    if (isFunction(toAttrs)) {
      onFrame = toAttrs as OnFrame;
      toAttrs = {};
    } else if (isObject(toAttrs) && (toAttrs as any).onFrame) {
      // 兼容 3.0 中的写法，onFrame 和 repeat 可在 toAttrs 中设置
      onFrame = (toAttrs as any).onFrame as OnFrame;
      repeat = (toAttrs as any).repeat;
    }
    // 第二个参数，既可以是执行时间 duration，也可以是动画参数 animateCfg
    if (isObject(duration)) {
      animateCfg = duration as AnimateCfg;
      duration = animateCfg.duration;
      easing = animateCfg.easing || 'easeLinear';
      delay = animateCfg.delay || 0;
      // animateCfg 中的设置优先级更高
      repeat = animateCfg.repeat || repeat || false;
      callback = animateCfg.callback || noop;
      pauseCallback = animateCfg.pauseCallback || noop;
      resumeCallback = animateCfg.resumeCallback || noop;
    } else {
      // 第四个参数，既可以是回调函数 callback，也可以是延迟时间 delay
      if (isNumber(callback)) {
        delay = callback;
        callback = null;
      }
      // 第三个参数，既可以是缓动参数 easing，也可以是回调函数 callback
      if (isFunction(easing)) {
        callback = easing;
        easing = 'easeLinear';
      } else {
        easing = easing || 'easeLinear';
      }
    }

    const { fromAttrs, toAttrs: _toAttrs } = this.getAnimationAttrs(entity, toAttrs);
    if (Object.keys(_toAttrs).length) {
      const animation: Animation = {
        fromAttrs,
        toAttrs: _toAttrs,
        duration,
        easing,
        repeat,
        callback,
        pauseCallback,
        resumeCallback,
        delay,
        startTime: 0,
        id: '0',
        onFrame,
        pathFormatted: false,
      };

      if (entity.hasComponent(Animator)) {
        const animator = entity.getComponent(Animator);
        // 先检查是否需要合并属性。若有相同的动画，将该属性从前一个动画中删除,直接用后一个动画中
        animator.animations = this.mergeAnimationAttrs(animator.animations, animation);
      } else {
        const animator = entity.addComponent(Animator);
        animator.status = STATUS.Running;
        animator.animations.push(animation);
      }
    }
  }

  stopAnimation(entity: Entity, toEnd: boolean, update: Function) {
    const animator = entity.getComponent(Animator);
    if (animator) {
      animator.status === STATUS.Stopped;
      for (const animation of animator.animations) {
        // 将动画执行到最后一帧
        if (toEnd) {
          update(animation.onFrame ? animation.onFrame(1) : animation.toAttrs);
        }
        if (animation.callback) {
          animation.callback();
        }
      }
      entity.removeComponent(Animator, true);
    }
  }

  pauseAnimation(entity: Entity) {
    const animator = entity.getComponent(Animator);
    if (!animator || animator.status !== STATUS.Running) {
      return;
    }

    animator.status = STATUS.Paused;
    for (const animation of animator.animations) {
      animation.pauseTime = new Date().getTime();
      if (animation.pauseCallback) {
        // 动画暂停时的回调
        animation.pauseCallback();
      }
    }
  }

  resumeAnimation(entity: Entity) {
    const animator = entity.getComponent(Animator);
    if (!animator || animator.status !== STATUS.Paused) {
      return;
    }

    animator.status = STATUS.Running;
    const currentTime = new Date().getTime();
    for (const animation of animator.animations) {
      animation.startTime = animation.startTime + currentTime - (animation.pauseTime || 0);
      animation.pauseTime = 0;
      if (animation.resumeCallback) {
        animation.resumeCallback();
      }
    }
  }

  private getAnimationAttrs(entity: Entity, props: Record<string, any>) {
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

  private mergeAnimationAttrs(animations: Animation[], animation: Animation): Animation[] {
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
    const { startTime, delay = 0, fromAttrs, toAttrs, duration, easing = 'easeLinear', repeat, onFrame } = animation;

    // 如果还没有开始执行或暂停，先不更新
    if (elapsed < startTime + delay) {
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
