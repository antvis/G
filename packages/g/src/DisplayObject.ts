import { Entity, System } from '@antv/g-ecs';
import { isObject, isNil } from '@antv/util';
import { vec3 } from 'gl-matrix';
import EventEmitter from 'eventemitter3';
import { Cullable, Geometry, Renderable, SceneGraphNode, Transform } from './components';
import { Animator, STATUS } from './components/Animator';
import { createVec3, rad2deg, getEuler } from './utils/math';
import { Sortable } from './components/Sortable';
import { GroupFilter, SHAPE, ShapeCfg, AnimateCfg, ElementAttrs, OnFrame } from './types';
import { DisplayObjectPool } from './DisplayObjectPool';
import { world, container } from './inversify.config';
import { SceneGraphService } from './services';
import { Timeline } from './systems';
import { AABB } from './shapes';
import { GeometryAABBUpdater, GeometryUpdaterFactory } from './services/aabb';

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
 * events for display object
 */
export const enum DISPLAY_OBJECT_EVENT {
  Init = 'init',
  Destroy = 'destroy',
  AttributeChanged = 'attributeChanged',
  /**
   * it has been inserted
   */
  Inserted = 'inserted',
  /**
   * it has had a child inserted
   */
  ChildInserted = 'child-inserted',
  /**
   * it has been removed
   */
  Removed = 'removed',
  /**
   * it has had a child removed
   */
  ChildRemoved = 'child-removed',
}

/**
 * Provide abilities in scene graph, such as:
 * * transform `translate/rotate/scale`
 * * add/remove child
 * * visibility and z-index
 *
 * Those abilities are implemented with those components: `Transform/SceneGraphNode/Sortable/Visible`.
 *
 * Emit following events:
 * * init
 * * destroy
 * * attributeChanged
 */
export class DisplayObject extends EventEmitter implements INode, IGroup {
  protected entity: Entity;
  protected config: ShapeCfg = { attrs: {} };

  private displayObjectPool = container.get(DisplayObjectPool);

  private timeline = container.getNamed<Timeline>(System, Timeline.tag);

  private sceneGraphService = container.get(SceneGraphService);

  private geometryUpdaterFactory = container.get<(tagName: SHAPE) => GeometryAABBUpdater>(
    GeometryUpdaterFactory,
  );

  /**
   * whether already mounted in canvas
   */
  public mounted = false;

  constructor(config?: ShapeCfg) {
    super();

    // assign name, id to config
    // eg. group.get('name')
    this.config = config || { attrs: {} };

    // create entity with shape's name
    const entity = world.createEntity(this.config.id || '');
    this.entity = entity;
    // insert this group into pool
    this.displayObjectPool.add(entity.getName(), this);

    // TODO: capture
    this.config.capture = true;

    entity.addComponent(Sortable);
    if (this.config.zIndex) {
      this.setZIndex(this.config.zIndex);
    }

    // init scene graph node
    const sceneGraphNode = entity.addComponent(SceneGraphNode);
    sceneGraphNode.id = entity.getName();
    sceneGraphNode.class = this.config.className || '';
    sceneGraphNode.tagName = this.config.type || SHAPE.Group;
    sceneGraphNode.attributes = this.config.attrs || {};
    if (this.config.name) {
      sceneGraphNode.attributes.name = this.config.name;
    }

    // init transform
    entity.addComponent(Transform);

    // calculate AABB for current geometry
    const geometry = entity.addComponent(Geometry);
    const updater = this.geometryUpdaterFactory(sceneGraphNode.tagName);
    if (updater) {
      updater.update(sceneGraphNode.attributes, geometry.aabb);
    }

    // set position in local space
    const { x = 0, y = 0 } = sceneGraphNode.attributes;
    this.sceneGraphService.setLocalPosition(entity, x, y);

    // set origin
    const { origin = [0, 0] } = sceneGraphNode.attributes;
    this.sceneGraphService.setOrigin(entity, [...origin, 0]);

    // visible: true -> visibility: visible
    // visible: false -> visibility: hidden
    if (this.config.visible === false) {
      sceneGraphNode.attributes.visibility = 'hidden';
    } else {
      sceneGraphNode.attributes.visibility = 'visible';
    }

    // only shape can be rendered
    entity.addComponent(Renderable);
    entity.addComponent(Cullable);

    if (updater) {
      this.sceneGraphService.updateRenderableAABB(entity);
    }

    this.emit(DISPLAY_OBJECT_EVENT.Init);
  }

  /**
   * compatible with G 3.0
   */
  set(name: string, value: any) {
    this.config[name] = value;
  }
  get(name: string) {
    return this.config[name];
  }
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
    if (!name) {
      return this.attributes;
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
    return this.attributes[name];
  }

  destroy() {
    this.emit(DISPLAY_OBJECT_EVENT.Destroy);
    this.entity.destroy();
  }

  /** scene graph operations */

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node
   */
  get nodeType(): SHAPE {
    return this.entity.getComponent(SceneGraphNode).tagName;
  }
  get nodeName(): SHAPE {
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
    // TODO
    return new DisplayObject({
      ...this.config,
      id: '',
    });
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
  contain(group: DisplayObject) {
    return this.contains(group);
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
  getAncestor(n: number) {
    let temp: DisplayObject | null = this;
    while (n > 0 && temp) {
      temp = temp.parentNode;
      n--;
    }
    return temp;
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
    return this.sceneGraphService.querySelector(`#${id}`, this);
  }
  getElementsByName(name: string) {
    return this.sceneGraphService.querySelectorAll(`[name="${name}"]`, this);
  }
  getElementsByClassName(className: string) {
    return this.sceneGraphService.querySelectorAll(`.${className}`, this);
  }
  getElementsByTagName(tagName: string) {
    return this.sceneGraphService.querySelectorAll(tagName, this);
  }
  querySelector(selector: string) {
    return this.sceneGraphService.querySelector(selector, this);
  }
  querySelectorAll(selector: string) {
    return this.sceneGraphService.querySelectorAll(selector, this);
  }

  addEventListener(event: string, handler: (...args: any[]) => void) {
    this.on(event, handler);
  }
  removeEventListener(event: string, handler: (...args: any[]) => void) {
    this.off(event, handler);
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes
   */
  get attributes() {
    return this.entity.getComponent(SceneGraphNode).attributes;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute
   */
  getAttribute(attributeName: string) {
    const value = this.attributes[attributeName];
    // if the given attribute does not exist, the value returned will either be null or ""
    return isNil(value) ? null : value;
  }
  /**
   * should use removeAttribute() instead of setting the attribute value to null either directly or using setAttribute(). Many attributes will not behave as expected if you set them to null.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute
   */
  removeAttribute(attributeName: string) {
    delete this.attributes[attributeName];
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
   */
  setAttribute(attributeName: string, value: any) {
    if (
      value !== this.attributes[attributeName] ||
      attributeName === 'visibility' // will affect children
    ) {
      if (attributeName === 'visibility') {
        // set value cascade
        this.forEach((object) => {
          object.changeAttribute(attributeName, value);
        });
      } else {
        this.changeAttribute(attributeName, value);
      }
    }
  }

  /**
   * compatible with G 3.0
   *
   * return children num
   */
  getCount() {
    return this.children.length;
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
    return sceneGraphNode.children.map((entity) =>
      this.displayObjectPool.getByName(entity.getName()),
    );
  }

  /**
   * compatible with G 3.0
   *
   * get first child group/shape
   */
  getFirst(): DisplayObject | null {
    return this.children.length > 0 ? this.children[0] : null;
  }

  /**
   * compatible with G 3.0
   *
   * get last child group/shape
   */
  getLast(): DisplayObject | null {
    return this.children.length > 0 ? this.children[this.children.length - 1] : null;
  }

  /**
   * compatible with G 3.0
   *
   * get child group/shape by index
   */
  getChildByIndex(index: number): DisplayObject | null {
    return this.children[index] || null;
  }

  /**
   * search in scene group, but should not include itself
   */
  find(filter: GroupFilter): DisplayObject | null {
    let target: DisplayObject | null = null;
    this.forEach((object) => {
      if (object !== this && filter(object)) {
        target = object;
        return true;
      }
    });
    return target;
  }
  findAll(filter: GroupFilter): DisplayObject[] {
    const objects: DisplayObject[] = [];
    this.forEach((object) => {
      if (object !== this && filter(object)) {
        objects.push(object);
      }
    });
    return objects;
  }

  /**
   * compatible with G 3.0
   *
   * add child group or shape
   */
  add(child: DisplayObject, index?: number) {
    this.sceneGraphService.attach(child.getEntity(), this.entity, index);

    this.emit(DISPLAY_OBJECT_EVENT.ChildInserted, child);
    child.emit(DISPLAY_OBJECT_EVENT.Inserted, child);
  }

  /**
   * compatible with G 3.0
   *
   * remove child and destroy it by default
   */
  remove(child: DisplayObject, destroy = true) {
    const entity = child.getEntity();
    this.sceneGraphService.detach(entity);

    this.emit(DISPLAY_OBJECT_EVENT.ChildRemoved, child);
    child.emit(DISPLAY_OBJECT_EVENT.Removed, child);

    if (destroy) {
      this.forEach((object) => {
        object.destroy();
      });
    }

    return child;
  }
  removeChild(shape: DisplayObject, destroy = true) {
    return this.remove(shape, destroy);
  }
  removeChildren(destroy = true) {
    this.children.forEach((child) => {
      this.removeChild(child, destroy);
    });
  }

  /**
   * traverse in descendants
   */
  forEach(callback: (o: DisplayObject) => void | boolean) {
    if (!callback(this)) {
      this.children.forEach((child) => {
        child.forEach(callback);
      });
    }
  }

  /** transform operations */

  setOrigin(position: vec3 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.setOrigin(this.entity, createVec3(position, y, z));
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
    this.sceneGraphService.setPosition(this.entity, createVec3(position, y, z));
    return this;
  }

  /**
   * set position in local space
   */
  setLocalPosition(position: vec3 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.setLocalPosition(this.entity, createVec3(position, y, z));
    return this;
  }

  /**
   * translate in world space
   */
  translate(position: vec3 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.translate(this.entity, createVec3(position, y, z));
    return this;
  }

  /**
   * translate in local space
   */
  translateLocal(position: vec3 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.translateLocal(this.entity, createVec3(position, y, z));
    return this;
  }

  getPosition() {
    return this.sceneGraphService.getPosition(this.entity);
  }

  getLocalPosition() {
    return this.sceneGraphService.getLocalPosition(this.entity);
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
    this.sceneGraphService.scaleLocal(this.entity, scaling);
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

    this.sceneGraphService.setLocalScale(this.entity, scaling);
    return this;
  }

  /**
   * get scaling in local space
   */
  getLocalScale() {
    return this.sceneGraphService.getLocalScale(this.entity);
  }

  /**
   * get scaling in world space
   */
  getScale() {
    return this.sceneGraphService.getScale(this.entity);
  }

  /**
   * only return degrees of Z axis in world space
   */
  getEulerAngles() {
    const transform = this.entity.getComponent(Transform);
    const [ex, ey, ez] = getEuler(
      vec3.create(),
      this.sceneGraphService.getWorldTransform(this.entity, transform),
    );
    return rad2deg(ez);
  }

  /**
   * only return degrees of Z axis in local space
   */
  getLocalEulerAngles() {
    const [ex, ey, ez] = getEuler(
      vec3.create(),
      this.sceneGraphService.getLocalRotation(this.entity),
    );
    return rad2deg(ez);
  }

  /**
   * set euler angles(degrees) in world space
   */
  setEulerAngles(z: number) {
    this.sceneGraphService.setEulerAngles(this.entity, 0, 0, z);
    return this;
  }

  /**
   * set euler angles(degrees) in local space
   */
  setLocalEulerAngles(z: number) {
    this.sceneGraphService.setLocalEulerAngles(this.entity, 0, 0, z);
    return this;
  }

  rotateLocal(x: number, y?: number, z?: number) {
    if (isNil(y) && isNil(z)) {
      return this.sceneGraphService.rotateLocal(this.entity, 0, 0, x);
    }

    return this.sceneGraphService.rotateLocal(this.entity, x, y, z);
  }

  rotate(x: number, y?: number, z?: number) {
    if (isNil(y) && isNil(z)) {
      return this.sceneGraphService.rotate(this.entity, 0, 0, x);
    }

    return this.sceneGraphService.rotate(this.entity, x, y, z);
  }

  getRotation() {
    return this.sceneGraphService.getRotation(this.entity);
  }
  getLocalRotation() {
    return this.sceneGraphService.getLocalRotation(this.entity);
  }

  getLocalTransform() {
    return this.sceneGraphService.getLocalTransform(
      this.entity,
    );
  }
  getWorldTransform() {
    return this.sceneGraphService.getWorldTransform(
      this.entity,
      this.entity.getComponent(Transform),
    );
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
      sortable.zIndex =
        Math.max(...parent.children.map((e) => e.getComponent(Sortable).zIndex)) + 1;
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
      sortable.zIndex =
        Math.min(...parent.children.map((e) => e.getComponent(Sortable).zIndex)) - 1;
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

  animate(
    toAttrs: ElementAttrs,
    duration: number,
    easing?: string,
    callback?: Function,
    delay?: number,
  ): void;
  animate(
    onFrame: OnFrame,
    duration: number,
    easing?: string,
    callback?: Function,
    delay?: number,
  ): void;
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

  /**
   * get bounds in local space, account for children
   */
  getLocalBounds(): AABB | null {
    // TODO: remove its parent temporarily
    // @see https://medium.com/swlh/inside-pixijs-display-objects-and-their-hierarchy-2deef1c01b6e#6d5d
    return null;
  }

  /**
   * get called when attributes changed
   */
  private changeAttribute(name: string, value: any) {
    const entity = this.getEntity();
    const renderable = entity.getComponent(Renderable);
    const geometry = entity.getComponent(Geometry);

    // update value
    this.attributes[name] = value;

    // update geometry if some attributes changed such as `width/height/...`
    const geometryUpdater = this.geometryUpdaterFactory(this.nodeType);
    const needUpdateGeometry = geometryUpdater && geometryUpdater.dependencies.indexOf(name) > -1;
    if (needUpdateGeometry) {
      geometryUpdater!.update(this.attributes, geometry.aabb);
    }

    if (
      name === 'x' ||
      name === 'y' || // circle rect...
      name === 'x1' ||
      name === 'x2' ||
      name === 'y1' ||
      name === 'y2' || // line
      name === 'points' || // polyline
      name === 'path' // path
    ) {
      // in parent's local space
      const { x = 0, y = 0 } = this.attributes;
      // update transform
      this.sceneGraphService.setLocalPosition(entity, x, y);
    } else if (name === 'z-index') {
      const sortable = entity.getComponent(Sortable);
      sortable.zIndex = value;

      const parentEntity = this.parentNode?.getEntity();
      const parentRenderable = parentEntity?.getComponent(Renderable);
      const parentSortable = parentEntity?.getComponent(Sortable);
      if (parentRenderable) {
        parentRenderable.dirty = true;
      }

      // need re-sort on parent
      if (parentSortable) {
        parentSortable.dirty = true;
      }
    }

    // update renderable's aabb, account for world transform
    if (needUpdateGeometry) {
      this.sceneGraphService.updateRenderableAABB(entity);
    }

    // redraw at next frame
    renderable.dirty = true;

    this.emit(DISPLAY_OBJECT_EVENT.AttributeChanged, this, name, value);
  }
}
