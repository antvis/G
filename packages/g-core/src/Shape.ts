import { Entity, System, World } from '@antv/g-ecs';
import { Container, inject, injectable, named } from 'inversify';
import isObject from 'lodash-es/isObject';
import { Geometry, Material, Renderable, Cullable } from './components';
import { ShapeRenderer, ShapeRendererFactory } from './systems';
import { IShape, OnFrame, AnimateCfg, ElementAttrs, ShapeCfg } from './types';
import { Timeline } from './systems/Timeline';
import { Animator, STATUS } from './components/Animator';
import { Group, GroupOrShape } from './Group';

@injectable()
export class Shape extends Group implements IShape {
  @inject(ShapeRendererFactory)
  private shapeRendererFactory: (type: string) => ShapeRenderer | null;

  @inject(System)
  @named(Timeline.tag)
  private timeline: Timeline;

  private type: string;

  private instanceEntity: Entity;

  init(container: Container, world: World, entity: Entity, type: string, config: ShapeCfg) {
    super.init(container, world, entity, '', config);

    entity.addComponent(Cullable);
    entity.addComponent(Material);
    entity.addComponent(Geometry);
    entity.addComponent(Renderable);

    this.type = type;

    const renderer = this.shapeRendererFactory(type);
    if (renderer) {
      renderer.init(this.entity, type, config, this.instanceEntity);
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

    const entity = this.world.createEntity(config?.name || '');
    const shape = this.container.get(Shape);

    shape.instanceEntity = this.entity;
    shape.init(this.container, this.world, entity, this.type, {
      zIndex: 0,
      visible: true,
      capture: true,
      ...this.config,
      attrs: {
        ...this.config.attrs, // copy attributes from root shape
        ...config?.attrs,
      },
    });

    this.container.bind(GroupOrShape).toConstantValue(shape).whenTargetNamed(entity.getName());
    return shape;
  }

  removeInstance(shape: Shape) {
    // TODO:
  }

  private setAttribute(name: string, value: any) {
    const renderable = this.entity.getComponent(Renderable);
    if (value !== renderable.attrs[name]) {
      renderable.attrs[name] = value;
      this.shapeRendererFactory(renderable.type)?.onAttributeChanged(this.entity, name, value);
    }
  }
}
