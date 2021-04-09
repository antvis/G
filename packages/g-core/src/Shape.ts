import { Entity, System } from '@antv/g-ecs';
import { SyncHook } from 'tapable';
import { SceneGraphNode } from './components';
import { IShape, OnFrame, AnimateCfg, ElementAttrs, ShapeCfg } from './types';
import { Timeline } from './systems/Timeline';
import { Animator, STATUS } from './components/Animator';
import { Group } from './Group';
import { ShapePluginContribution, lazyInjectNamed } from './inversify.config';
import { ContributionProvider } from './contribution-provider';

export interface ShapePlugin {
  apply(shape: Shape): void;
}

export function isShape(shape: any): shape is Shape {
  return !!(shape && shape.isGroup);
}

export class Shape extends Group implements IShape {
  @lazyInjectNamed(System, Timeline.tag)
  private timeline: Timeline;

  @lazyInjectNamed(ContributionProvider, ShapePluginContribution)
  private shapePluginContribution: ContributionProvider<ShapePlugin>;

  hooks = {
    init: new SyncHook<[Entity]>(['entity']),
    hit: new SyncHook<[Entity]>(['entity']),
    destroy: new SyncHook<[Entity]>(['entity']),
  };

  constructor(config: ShapeCfg) {
    super({
      zIndex: 0,
      visible: true,
      capture: true,
      ...config,
    });

    const sceneGraphNode = this.entity.getComponent(SceneGraphNode);
    sceneGraphNode.tagName = this.config.type;

    this.shapePluginContribution.getContributions().forEach((plugin) => {
      plugin.apply(this);
    });
    this.hooks.init.call(this.entity);
  }

  animate(toAttrs: ElementAttrs, duration: number, easing?: string, callback?: Function, delay?: number): void;
  animate(onFrame: OnFrame, duration: number, easing?: string, callback?: Function, delay?: number): void;
  animate(toAttrs: ElementAttrs, cfg: AnimateCfg): void;
  animate(onFrame: OnFrame, cfg: AnimateCfg): void;
  animate(...args: any) {
    this.timeline.createAnimation(this.entity, args);
  }

  /**
   * stop animation
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
   * pause animation
   */
  pauseAnimation() {
    this.timeline.pauseAnimation(this.entity);
  }
  pauseAnimate() {
    this.pauseAnimation();
  }

  /**
   * resume animation
   */
  resumeAnimation() {
    this.timeline.resumeAnimation(this.entity);
  }
  resumeAnimate() {
    this.resumeAnimation();
  }

  isAnimationPaused() {
    const animator = this.entity.getComponent(Animator);
    return animator && animator.status === STATUS.Paused;
  }
  isAnimatePaused() {
    return this.isAnimationPaused();
  }

  isGroup() {
    return false;
  }

  /**
   * create a instance of current shape
   *
   * @see https://doc.babylonjs.com/divingDeeper/mesh/copies/instances
   */
  createInstance(config?: ShapeCfg) {
    // make itself invisible first
    this.hide();

    const shape = new Shape({
      zIndex: 0,
      visible: true,
      capture: true,
      type: this.entity.getComponent(SceneGraphNode).tagName,
      ...this.config,
      attrs: {
        ...this.config.attrs, // copy attributes from root shape
        ...config?.attrs,
        instanceEntity: this.entity,
      },
    });

    return shape;
  }

  removeInstance(shape: Shape) {
    // TODO:
  }

  destroy() {
    this.hooks.destroy.call(this.entity);
    super.destroy();
  }
}
