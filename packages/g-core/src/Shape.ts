import { Entity, System } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import isObject from 'lodash-es/isObject';
import { Geometry, Material, Renderable } from './components';
import { ShapeRenderer, ShapeRendererFactory } from './systems';
import { IShape, OnFrame, AnimateCfg, ElementAttrs, ShapeCfg } from './types';
import { Timeline } from './systems/Timeline';
import { Animator, STATUS } from './components/Animator';
import { Group } from './Group';
import { Cullable } from './components/Cullable';

@injectable()
export class Shape extends Group implements IShape {
  @inject(ShapeRendererFactory)
  private shapeRendererFactory: (type: string) => ShapeRenderer | null;

  @inject(System)
  @named(Timeline.tag)
  private timeline: Timeline;

  init(entity: Entity) {
    super.init(entity);
    entity.addComponent(Cullable);
    entity.addComponent(Material);
    entity.addComponent(Geometry);
    entity.addComponent(Renderable);
  }

  setType(type: string, cfg: ShapeCfg) {
    const renderer = this.shapeRendererFactory(type);
    if (renderer) {
      renderer.init(this.entity, type, cfg);
    }
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
    this.timeline.createAnimation(this.entity, args);
  }

  /**
   * 停止图形的动画
   */
  stopAnimation(toEnd: boolean = false) {
    this.timeline.stopAnimation(this.entity, toEnd, (attributes: any) => {
      this.attr(attributes);
    });
  }
  stopAnimate(toEnd: boolean = false) {
    this.stopAnimation(toEnd);
  }

  /**
   * 暂停图形的动画
   */
  pauseAnimation() {
    this.timeline.pauseAnimation(this.entity);
  }
  pauseAnimate() {
    this.pauseAnimation();
  }

  /**
   * 恢复暂停的动画
   */
  resumeAnimation() {
    this.timeline.resumeAnimation(this.entity);
  }
  resumeAnimate() {
    this.resumeAnimation();
  }

  /**
   * 当前动画是否处于暂停状态
   */
  isAnimationPaused() {
    const animator = this.entity.getComponent(Animator);
    return animator && animator.status === STATUS.Paused;
  }
  isAnimatePaused() {
    return this.isAnimationPaused();
  }

  private setAttribute(name: string, value: any) {
    const renderable = this.entity.getComponent(Renderable);
    if (value !== renderable.attrs[name]) {
      renderable.attrs[name] = value;
      this.shapeRendererFactory(renderable.type)?.onAttributeChanged(this.entity, name, value);
    }
  }
}
