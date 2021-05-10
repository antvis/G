import { Entity, System } from '@antv/g-ecs';
import { isObject, isNil } from '@antv/util';
import { vec3 } from 'gl-matrix';
import EventEmitter from 'eventemitter3';
import { Cullable, Renderable, SceneGraphNode, Transform } from './components';
import { Animator, STATUS } from './components/Animator';
import { createVec3, rad2deg, getEuler } from './utils/math';
import { Sortable } from './components/Sortable';
import { GroupFilter, SHAPE, ShapeCfg, AnimateCfg, ElementAttrs, OnFrame } from './types';
import { DisplayObjectPool } from './DisplayObjectPool';
import { world, lazyInject, lazyInjectNamed } from './inversify.config';
import { SceneGraphService } from './services';
import { Timeline } from './systems';
import { AABB } from './shapes';
import { DisplayObjectHooks } from './hooks';

export interface INode {
  nodeType: string;
  nodeName: string;
  parentNode: INode | null;
}

export interface IGroup {
  getEntity(): Entity;
  add(shape: DisplayObject): void;
  remove(shape: DisplayObject): void;
}

/**
 * Provide abilities in scene graph, such as:
 * * transform `translate/rotate/scale`
 * * add/remove child
 * * visibility and z-index
 *
 * Those abilities are implemented with those components: `Transform/SceneGraphNode/Sortable/Visible`.
 */
export class DisplayObject extends EventEmitter implements INode, IGroup {
  protected entity: Entity;
  protected config: ShapeCfg = { attrs: {} };

  @lazyInject(DisplayObjectPool)
  protected displayObjectPool: DisplayObjectPool;

  @lazyInjectNamed(System, Timeline.tag)
  private timeline: Timeline;

  @lazyInject(SceneGraphService)
  protected sceneGraph: SceneGraphService;

  constructor(config?: ShapeCfg) {
    super();

    // assign name, id to config
    // eg. group.get('name')
    this.config = config || { attrs: {} };

    // create entity with shape's name
    const entity = world.createEntity(this.config.id || '');
    this.entity = entity;

    // TODO: capture
    this.config.capture = true;

    entity.addComponent(Sortable);
    if (this.config.zIndex) {
      this.setZIndex(this.config.zIndex);
    }

    // insert this group into pool
    this.displayObjectPool.add(entity.getName(), this);

    // trigger init hook
    DisplayObjectHooks.init.call(this.entity, this.config);
  }

  set() {}
  setConfig() {}

  get() {}
  getConfig() {
    return this.config;
  }

  getEntity() {
    return this.entity;
  }

  attr(): any;
  attr(name: string): any;
  attr(name: string, value: any): void;
  attr(name: Record<string, any>): any;
  attr(...args: any) {
    const [name, value] = args;

    const sceneGraphNode = this.entity.getComponent(SceneGraphNode);
    if (!name) {
      return sceneGraphNode.attributes;
    }
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
    return sceneGraphNode.attributes[name];
  }

  destroy() {
    DisplayObjectHooks.destroy.call(this.entity);
    this.entity.destroy();
  }

  /** scene graph operations */

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node
   */
  get nodeType(): string {
    return this.entity.getComponent(SceneGraphNode).tagName;
  }
  get nodeName(): string {
    return this.entity.getComponent(SceneGraphNode).tagName;
  }
  get parentNode(): DisplayObject | null {
    return this.getParent();
  }
  get parentElement(): DisplayObject | null {
    // TODO: The Node.parentElement read-only property returns the DOM node's parent Element, or null if the node either has no parent, or its parent isn't a DOM Element.
    return this.getParent();
  }
  get nextSibling(): DisplayObject | null {
    const parentGroup = this.getParent();
    if (parentGroup) {
      const children = parentGroup.getChildren();
      const index = children.indexOf(this);
      return children[index + 1] || null;
    }

    return null;
  }
  get previousSibling(): DisplayObject | null {
    const parentGroup = this.getParent();
    if (parentGroup) {
      const children = parentGroup.getChildren();
      const index = children.indexOf(this);
      return children[index - 1] || null;
    }

    return null;
  }
  get firstChild(): DisplayObject | null {
    return this.getFirst();
  }
  get lastChild(): DisplayObject | null {
    return this.getLast();
  }
  cloneNode() {
    return new DisplayObject(this.config);
  }
  appendChild(group: DisplayObject) {
    this.add(group);
    return group;
  }
  insertBefore(group: DisplayObject, reference?: DisplayObject): DisplayObject {
    if (!reference) {
      this.add(group);
    } else {
      const children = this.getChildren();
      const index = children.indexOf(reference);
      this.add(group, index - 1);
    }
    return group;
  }
  contains(group: DisplayObject) {
    // the node itself, one of its direct children
    let tmp: DisplayObject | null = group;
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
    while (tmp && this !== tmp) {
      tmp = tmp.parentNode;
    }
    return !!tmp;
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode
   */
  get children(): DisplayObject[] {
    return this.getChildren();
  }
  get childElementCount(): number {
    return this.getCount();
  }
  get firstElementChild(): DisplayObject | null {
    // TODO: To avoid the issue with node.firstChild returning #text or #comment nodes, ParentNode.firstElementChild can be used to return only the first element node.
    return this.firstChild;
  }
  get lastElementChild(): DisplayObject | null {
    return this.lastChild;
  }

  getElementById(id: string) {
    return this.sceneGraph.querySelector(`#${id}`, this);
  }
  getElementsByName(name: string) {
    return this.sceneGraph.querySelectorAll(`[name="${name}"]`, this);
  }
  getElementsByClassName(className: string) {
    return this.sceneGraph.querySelectorAll(`.${className}`, this);
  }
  getElementsByTagName(tagName: string) {
    return this.sceneGraph.querySelectorAll(tagName, this);
  }
  querySelector(selector: string) {
    return this.sceneGraph.querySelector(selector, this);
  }
  querySelectorAll(selector: string) {
    return this.sceneGraph.querySelectorAll(selector, this);
  }

  addEventListener(event: string, handler: (...args: any[]) => void) {
    this.on(event, handler);
  }
  removeEventListener(event: string, handler: (...args: any[]) => void) {
    this.off(event, handler);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute
   */
  getAttribute(attributeName: string) {
    const value = this.entity.getComponent(SceneGraphNode).attributes[attributeName];
    // if the given attribute does not exist, the value returned will either be null or ""
    return isNil(value) ? null : value;
  }
  /**
   * should use removeAttribute() instead of setting the attribute value to null either directly or using setAttribute(). Many attributes will not behave as expected if you set them to null.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute
   */
  removeAttribute(attributeName: string) {
    delete this.entity.getComponent(SceneGraphNode).attributes[attributeName];
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
   */
  setAttribute(attributeName: string, value: any) {
    const attributes = this.entity.getComponent(SceneGraphNode).attributes;
    if (
      value !== attributes[attributeName] ||
      attributeName === 'visibility' // will affect children
    ) {
      if (attributeName === 'visibility') {
        // set value cascade
        this.sceneGraph.visit(this.entity, (e) => {
          DisplayObjectHooks.changeAttribute.promise(e, attributeName, value);
        });
      } else {
        DisplayObjectHooks.changeAttribute.promise(this.entity, attributeName, value);
      }
    }
  }

  /**
   * compatible with G 3.0
   *
   * return children num
   */
  getCount() {
    return this.getChildren().length;
  }

  /**
   * compatible with G 3.0
   *
   * return parent group
   */
  getParent(): DisplayObject | null {
    const sceneGraphNode = this.entity.getComponent(SceneGraphNode);
    if (sceneGraphNode.parent) {
      return this.displayObjectPool.getByName(sceneGraphNode.parent.getName());
    }

    return null;
  }

  /**
   * compatible with G 3.0
   *
   * return children groups
   */
  getChildren() {
    const sceneGraphNode = this.entity.getComponent(SceneGraphNode);
    return sceneGraphNode.children.map((entity) => this.displayObjectPool.getByName(entity.getName()));
  }

  /**
   * compatible with G 3.0
   *
   * get first child group/shape
   */
  getFirst(): DisplayObject | null {
    const children = this.getChildren();
    return children.length > 0 ? children[0] : null;
  }

  /**
   * compatible with G 3.0
   *
   * get last child group/shape
   */
  getLast(): DisplayObject | null {
    const children = this.getChildren();
    return children.length > 0 ? children[children.length - 1] : null;
  }

  /**
   * compatible with G 3.0
   *
   * get child group/shape by index
   */
  getChildByIndex(index: number): DisplayObject | null {
    const children = this.getChildren();
    return children[index] || null;
  }

  /**
   * search in scene group, but
   */
  find(filter: GroupFilter): DisplayObject | null {
    let target: DisplayObject | null = null;
    this.sceneGraph.visit(this.entity, (entity) => {
      // shouldn't include itself
      if (entity !== this.getEntity()) {
        const group = this.displayObjectPool.getByName(entity.getName());
        if (filter(group)) {
          target = group;
          return true;
        }
      }
    });
    return target;
  }
  findAll(filter: GroupFilter): DisplayObject[] {
    const groups: DisplayObject[] = [];
    this.sceneGraph.visit(this.entity, (entity) => {
      // shouldn't include itself
      if (entity !== this.getEntity()) {
        const group = this.displayObjectPool.getByName(entity.getName());
        if (filter(group)) {
          groups.push(group);
        }
      }
    });
    return groups;
  }

  /**
   * compatible with G 3.0
   *
   * add child group or shape
   */
  add(shape: DisplayObject, index?: number) {
    this.sceneGraph.attach(shape.getEntity(), this.entity, index);

    // this.emit(GROUP_EVENT.ChildAppended, shape);
  }

  /**
   * compatible with G 3.0
   *
   * remove child and destroy it by default
   */
  remove(shape: DisplayObject, destroy = true) {
    const entity = shape.getEntity();
    this.sceneGraph.detach(entity);

    // this.emit(GROUP_EVENT.ChildRemoved, shape);

    if (destroy) {
      this.sceneGraph.visit(this.entity, (e) => {
        e.destroy();
      });
    }

    return shape;
  }
  removeChild(shape: DisplayObject, destroy = true) {
    return this.remove(shape, destroy);
  }

  removeChildren(destroy = true) {
    const sceneGraphNode = this.entity.getComponent(SceneGraphNode);
    this.sceneGraph.detachChildren(this.entity);
    if (destroy) {
      sceneGraphNode.children.forEach((entity) => {
        this.sceneGraph.visit(entity, (e) => {
          e.destroy();
        });
      });
    }
  }

  /** transform operations */

  setOrigin(position: vec3 | number, y: number = 0, z: number = 0) {
    this.sceneGraph.setOrigin(this.entity, createVec3(position, y, z));
    return this;
  }

  /**
   * alias setPosition
   */
  moveTo(position: vec3 | number, y: number = 0, z: number = 0) {
    this.setPosition(createVec3(position, y, z));
    return this;
  }
  /**
   * alias setPosition
   */
  move(position: vec3 | number, y: number = 0, z: number = 0) {
    this.setPosition(createVec3(position, y, z));
    return this;
  }
  /**
   * compatible with G 3.0
   *
   * set position in world space
   */
  setPosition(position: vec3 | number, y: number = 0, z: number = 0) {
    this.sceneGraph.setPosition(this.entity, createVec3(position, y, z));
    return this;
  }

  /**
   * set position in local space
   */
  setLocalPosition(position: vec3 | number, y: number = 0, z: number = 0) {
    this.sceneGraph.setLocalPosition(this.entity, createVec3(position, y, z));
    return this;
  }

  /**
   * translate in world space
   */
  translate(position: vec3 | number, y: number = 0, z: number = 0) {
    this.sceneGraph.translate(this.entity, createVec3(position, y, z));
    return this;
  }

  /**
   * translate in local space
   */
  translateLocal(position: vec3 | number, y: number = 0, z: number = 0) {
    this.sceneGraph.translateLocal(this.entity, createVec3(position, y, z));
    return this;
  }

  getPosition() {
    return this.sceneGraph.getPosition(this.entity);
  }

  getLocalPosition() {
    return this.sceneGraph.getLocalPosition(this.entity);
  }

  /**
   * compatible with G 3.0
   *
   * scaling in local space
   * scale(10) = scale(10, 10, 10)
   *
   * we can't set scale in world space
   */
  scale(scaling: vec3 | number, y?: number, z?: number) {
    return this.scaleLocal(scaling, y, z);
  }
  scaleLocal(scaling: vec3 | number, y?: number, z?: number) {
    if (typeof scaling === 'number') {
      y = y || scaling;
      z = z || scaling;
      scaling = createVec3(scaling, y, z);
    }
    this.sceneGraph.scaleLocal(this.entity, scaling);
    return this;
  }

  /**
   * set scaling in local space
   */
  setLocalScale(scaling: vec3 | number, y?: number, z?: number) {
    if (typeof scaling === 'number') {
      y = y || scaling;
      z = z || scaling;
      scaling = createVec3(scaling, y, z);
    }

    this.sceneGraph.setLocalScale(this.entity, scaling);
    return this;
  }

  /**
   * get scaling in local space
   */
  getLocalScale() {
    return this.sceneGraph.getLocalScale(this.entity);
  }

  /**
   * get scaling in world space
   */
  getScale() {
    return this.sceneGraph.getScale(this.entity);
  }

  /**
   * only return degrees of Z axis in world space
   */
  getEulerAngles() {
    const transform = this.entity.getComponent(Transform);
    const [ex, ey, ez] = getEuler(vec3.create(), this.sceneGraph.getWorldTransform(this.entity, transform));
    return rad2deg(ez);
  }

  /**
   * only return degrees of Z axis in local space
   */
  getLocalEulerAngles() {
    const [ex, ey, ez] = getEuler(vec3.create(), this.sceneGraph.getLocalRotation(this.entity));
    return rad2deg(ez);
  }

  /**
   * set euler angles(degrees) in world space
   */
  setEulerAngles(z: number) {
    this.sceneGraph.setEulerAngles(this.entity, 0, 0, z);
    return this;
  }

  /**
   * set euler angles(degrees) in local space
   */
  setLocalEulerAngles(z: number) {
    this.sceneGraph.setLocalEulerAngles(this.entity, 0, 0, z);
    return this;
  }

  rotateLocal(z: number) {
    return this.sceneGraph.rotateLocal(this.entity, 0, 0, z);
  }

  rotate(z: number) {
    return this.sceneGraph.rotate(this.entity, 0, 0, z);
  }

  /* z-index & visibility */

  setZIndex(zIndex: number) {
    this.attr('z-index', zIndex);
  }

  /**
   * bring to front in current group
   */
  toFront() {
    const sceneGraphNode = this.entity.getComponent(SceneGraphNode);
    const sortable = this.entity.getComponent(Sortable);
    const parentEntity = sceneGraphNode.parent;
    if (parentEntity) {
      const parent = parentEntity.getComponent(SceneGraphNode);
      sortable.zIndex = Math.max(...parent.children.map((e) => e.getComponent(Sortable).zIndex)) + 1;
      // need re-sort
      sortable.dirty = true;
    }
  }

  /**
   * send to back in current group
   */
  toBack() {
    const sceneGraphNode = this.entity.getComponent(SceneGraphNode);
    const sortable = this.entity.getComponent(Sortable);
    const parentEntity = sceneGraphNode.parent;
    if (parentEntity) {
      const parent = parentEntity.getComponent(SceneGraphNode);
      sortable.zIndex = Math.min(...parent.children.map((e) => e.getComponent(Sortable).zIndex)) - 1;
      // need re-sort
      sortable.dirty = true;
    }
  }

  /**
   * show group, which will also change visibility of its children in sceneGraphNode
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/visibility
   */
  show() {
    this.attr('visibility', 'visible');
  }

  /**
   * hide group, which will also change visibility of its children in sceneGraphNode
   */
  hide() {
    this.attr('visibility', 'hidden');
  }

  isVisible() {
    return this.attr('visibility') === 'visible';
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

  /** animation */

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

  /**
   * get bounds in world space, account for children
   */
  getBounds(): AABB | null {
    let aabb = this.entity.getComponent(Renderable)?.aabb || null;

    this.children.forEach((child) => {
      const childBounds = child.getBounds();
      if (childBounds) {
        if (!aabb) {
          aabb = childBounds;
        } else {
          aabb.add(childBounds);
        }
      }
    });

    return aabb;
  }
}
