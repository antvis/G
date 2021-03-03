import { Entity, System } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import isNumber from 'lodash-es/isNumber';
import isFunction from 'lodash-es/isFunction';
import isObject from 'lodash-es/isObject';
import { Renderable } from './components';
import { Animator } from './components/Animator';
import { ContributionProvider } from './contribution-provider';
import { RendererFrameContribution, ShapeRenderer, ShapeRendererFactory } from './systems';
import { IShape, OnFrame, AnimateCfg, ElementAttrs, Animation } from './types';
import { Timeline } from './systems/Timeline';

const noop = () => {};

@injectable()
export class Shape implements IShape {
  private entity: Entity;

  @inject(ShapeRendererFactory)
  private shapeRendererFactory: (type: string) => ShapeRenderer | null;

  @inject(System)
  @named(Timeline.tag)
  private timeline: Timeline;

  setEntity(entity: Entity) {
    this.entity = entity;
  }

  getEntity(): Entity {
    return this.entity;
  }

  attr(): any;
  attr(name: string): any;
  attr(name: string, value: any): void;
  attr(name: Record<string, any>): any;
  attr(...args: any) {
    const [name, value] = args;

    const renderable = this.entity.getComponent(Renderable);
    if (!name) return renderable.attrs;
    if (isObject(name)) {
      for (const k in name) {
        this.setAttribute(k, (name as Record<string, any>)[k]);
      }
      return this;
    }
    if (args.length === 2) {
      this.setAttribute(name, value);
      return this;
    }
    return renderable.attrs[name];
  }

  animate(toAttrs: ElementAttrs, duration: number, easing?: string, callback?: Function, delay?: number): void;
  animate(onFrame: OnFrame, duration: number, easing?: string, callback?: Function, delay?: number): void;
  animate(toAttrs: ElementAttrs, cfg: AnimateCfg): void;
  animate(onFrame: OnFrame, cfg: AnimateCfg): void;
  animate(...args: any) {
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

    const { fromAttrs, toAttrs: _toAttrs } = this.timeline.getAnimationAttrs(this.entity, toAttrs);
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
      // id: uniqueId(),
      id: '0',
      onFrame,
      pathFormatted: false,
    };

    if (this.entity.hasComponent(Animator)) {
      const animator = this.entity.getComponent(Animator);
      // 先检查是否需要合并属性。若有相同的动画，将该属性从前一个动画中删除,直接用后一个动画中
      animator.animations = this.timeline.mergeAnimationAttrs(animator.animations, animation);
    } else {
      const animator = this.entity.addComponent(Animator);
      animator.animations.push(animation);
    }
  }

  /**
   * 停止图形的动画
   * @param {boolean} toEnd 是否到动画的最终状态
   */
  stopAnimate(toEnd?: boolean) {
    this.entity.removeComponent(Animator);
  }

  /**
   * 暂停图形的动画
   */
  pauseAnimate() {}

  /**
   * 恢复暂停的动画
   */
  resumeAnimate() {}

  private setAttribute(name: string, value: any) {
    const renderable = this.entity.getComponent(Renderable);
    if (value !== renderable.attrs[name]) {
      renderable.attrs[name] = value;
      this.shapeRendererFactory(renderable.type)?.onAttributeChanged(this.entity, name, value);
    }
  }
}
