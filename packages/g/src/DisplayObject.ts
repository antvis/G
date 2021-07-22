import { Entity, System } from '@antv/g-ecs';
import { isObject, isNil, isBoolean, isFunction } from '@antv/util';
import { vec3 } from 'gl-matrix';
import { EventEmitter } from 'eventemitter3';
import { Cullable, Geometry, Renderable, SceneGraphNode, Transform } from './components';
import { Animator, STATUS } from './components/Animator';
import { createVec3, rad2deg, getEuler } from './utils/math';
import { Sortable } from './components/Sortable';
import { GroupFilter, SHAPE, AnimateCfg, OnFrame, BaseStyleProps } from './types';
import { DisplayObjectPool } from './DisplayObjectPool';
import { world, container } from './inversify.config';
import { SceneGraphService } from './services';
import { Timeline } from './systems';
import { AABB, Rectangle } from './shapes';
import { GeometryAABBUpdater, GeometryUpdaterFactory } from './services/aabb';
import { FederatedEvent } from './FederatedEvent';
import { Canvas } from './Canvas';

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

export interface DisplayObjectConfig<StyleProps> {
  /**
   * element's identifier, must be unique in a document.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/id
   */
  id?: string;

  /**
   * all styles properties, not read-only
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
   */
  style?: StyleProps;
  /**
   * compatible with G 3.0
   * @alias style
   * @deprecated
   */
  attrs?: StyleProps;

  /**
   * used in `getElementsByName`
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByName
   */
  name?: string;

  type?: SHAPE;

  /**
   * used in `getElementsByClassName`
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
   */
  className?: string;

  /**
   * @deprecated use `style.zIndex` instead
   */
  zIndex?: number;
  /**
   * @deprecated use `style.visibility = 'visible'` instead
   */
  visible?: boolean;
  /**
   * 是否可以拾取
   * @type {Boolean}
   */
  capture?: boolean;
};

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
export class DisplayObject<StyleProps extends BaseStyleProps> extends EventEmitter {
  protected entity: Entity;
  protected config: DisplayObjectConfig<StyleProps> = {};

  private displayObjectPool = container.get(DisplayObjectPool);

  private timeline = container.getNamed<Timeline>(System, Timeline.tag);

  private sceneGraphService = container.get(SceneGraphService);

  private geometryUpdaterFactory = container.get<(tagName: SHAPE) => GeometryAABBUpdater<any>>(
    GeometryUpdaterFactory,
  );

  /**
   * whether already mounted in canvas
   */
  mounted = false;

  constructor(config?: DisplayObjectConfig<StyleProps>) {
    super();

    // assign name, id to config
    // eg. group.get('name')
    this.config = config || {};

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
    sceneGraphNode.name = this.config.name || '';
    sceneGraphNode.class = this.config.className || '';
    sceneGraphNode.tagName = this.config.type || SHAPE.Group;

    // compatible with G 3.0
    if (this.config.attrs) {
      this.config.style = {
        ...this.config.style,
        ...this.config.attrs,
      };
    }
    sceneGraphNode.attributes = this.config.style || {};

    const renderable = entity.addComponent(Renderable);
    entity.addComponent(Cullable);
    entity.addComponent(Transform);

    // calculate AABB for current geometry
    const geometry = entity.addComponent(Geometry);
    const updater = this.geometryUpdaterFactory(sceneGraphNode.tagName);
    if (updater) {
      geometry.aabb = new AABB();
      updater.update(sceneGraphNode.attributes, geometry.aabb);
      renderable.aabbDirty = true;
      renderable.dirty = true;
    }

    // set position in local space
    const { x = 0, y = 0 } = sceneGraphNode.attributes;
    this.sceneGraphService.setLocalPosition(this, x, y);

    // set origin
    const { origin = [0, 0] } = sceneGraphNode.attributes;
    this.sceneGraphService.setOrigin(this, [...origin, 0]);

    // visible: true -> visibility: visible
    // visible: false -> visibility: hidden
    if (this.config.visible === false) {
      sceneGraphNode.attributes.visibility = 'hidden';
    } else {
      sceneGraphNode.attributes.visibility = 'visible';
    }

    this.emit(DISPLAY_OBJECT_EVENT.Init);
  }

  /**
   * compatible with G 3.0
   * @deprecated
   */
  set(name: string, value: any) {
    // @ts-ignore
    this.config[name] = value;
  }
  /**
   * compatible with G 3.0
   * @deprecated
   */
  get(name: string) {
    // @ts-ignore
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
  attr(name: StyleProps): any;
  attr(...args: any) {
    const [name, value] = args;
    if (!name) {
      return this.attributes;
    }
    if (isObject(name)) {
      for (const k in name as StyleProps) {
        this.setAttribute(k, (name as Record<string, any>)[k]);
      }
      return this;
    }
    if (args.length === 2) {
      this.setAttribute(name, value);
      return this;
    }

    // @ts-ignore
    return this.attributes[name];
  }

  destroy() {
    this.emit(DISPLAY_OBJECT_EVENT.Destroy);
    this.entity.destroy();
    this.removeAllListeners();
  }

  /** scene graph operations */

  scrollLeft = 0;
  scrollTop = 0;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
   */
  dataset: Record<string, any> = {};

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node
   */
  get nodeType(): SHAPE {
    return this.entity.getComponent(SceneGraphNode).tagName;
  }
  get nodeName(): SHAPE {
    return this.entity.getComponent(SceneGraphNode).tagName;
  }
  get parentNode(): DisplayObject<any> | null {
    return this.parent;
  }
  get parentElement(): DisplayObject<any> | null {
    // TODO: The Node.parentElement read-only property returns the DOM node's parent Element, or null if the node either has no parent, or its parent isn't a DOM Element.
    return this.parent;
  }
  get nextSibling(): DisplayObject<any> | null {
    const parentGroup = this.getParent();
    if (parentGroup) {
      const children = parentGroup.getChildren();
      const index = children.indexOf(this);
      return children[index + 1] || null;
    }

    return null;
  }
  get previousSibling(): DisplayObject<any> | null {
    const parentGroup = this.getParent();
    if (parentGroup) {
      const children = parentGroup.getChildren();
      const index = children.indexOf(this);
      return children[index - 1] || null;
    }

    return null;
  }
  get firstChild(): DisplayObject<any> | null {
    return this.children.length > 0 ? this.children[0] : null;
  }
  get lastChild(): DisplayObject<any> | null {
    return this.children.length > 0 ? this.children[this.children.length - 1] : null;
  }
  cloneNode() {
    // TODO
    return new DisplayObject({
      ...this.config,
      id: '',
    });
  }
  appendChild(child: DisplayObject<any>, index?: number) {
    this.sceneGraphService.attach(child, this, index);

    this.emit(DISPLAY_OBJECT_EVENT.ChildInserted, child);
    child.emit(DISPLAY_OBJECT_EVENT.Inserted, this);

    return child;
  }
  insertBefore(group: DisplayObject<any>, reference?: DisplayObject<any>): DisplayObject<any> {
    if (!reference) {
      this.appendChild(group);
    } else {
      const children = this.getChildren();
      const index = children.indexOf(reference);
      this.appendChild(group, index - 1);
    }
    return group;
  }
  remove(destroy = true) {
    if (this.parentNode) {
      return this.parentNode.removeChild(this, destroy);
    }
    return this;
  }
  removeChild(child: DisplayObject<any>, destroy = true) {
    this.sceneGraphService.detach(child);

    this.emit(DISPLAY_OBJECT_EVENT.ChildRemoved, child);
    child.emit(DISPLAY_OBJECT_EVENT.Removed, this);

    if (destroy) {
      this.forEach((object) => {
        object.destroy();
      });
    }
    return child;
  }
  removeChildren(destroy = true) {
    this.children.forEach((child) => {
      this.removeChild(child, destroy);
    });
  }
  contain(group: DisplayObject<any>) {
    return this.contains(group);
  }
  contains(group: DisplayObject<any>): boolean {
    // the node itself, one of its direct children
    let tmp: DisplayObject<any> | null = group;
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
    while (tmp && this !== tmp) {
      tmp = tmp.parentNode;
    }
    return !!tmp;
  }
  getAncestor(n: number): DisplayObject<any> | null {
    let temp: DisplayObject<any> | null = this;
    while (n > 0 && temp) {
      temp = temp.parentNode;
      n--;
    }
    return temp;
  }
  /**
   * points to root in Canvas
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/ownerDocument
   */
  ownerDocument: DisplayObject<any>;
  /**
   * only root has defaultView, points to Canvas
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/defaultView
   */
  defaultView: Canvas;
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement
   */
  documentElement: DisplayObject<any>;

  get id() {
    return this.entity.getComponent(SceneGraphNode).id;
  }
  get name() {
    return this.entity.getComponent(SceneGraphNode).name;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
   */
  get classList() {
    return [this.entity.getComponent(SceneGraphNode).class];
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode
   */
  parent: DisplayObject<any> | null = null;
  children: DisplayObject<any>[] = [];

  get childElementCount(): number {
    return this.children.length;
  }
  get firstElementChild(): DisplayObject<any> | null {
    // To avoid the issue with node.firstChild returning #text or #comment nodes,
    // ParentNode.firstElementChild can be used to return only the first element node.
    return this.firstChild;
  }
  get lastElementChild(): DisplayObject<any> | null {
    return this.lastChild;
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
   */
  matches(selector: string) {
    return this.sceneGraphService.matches(selector, this);
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

  /**
   * support `capture` & `once` in options
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener
   */
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    const capture =
      (isBoolean(options) && options)
      || (isObject(options) && options.capture);
    const once = isObject(options) && options.once;
    const context = isFunction(listener) ? undefined : listener;

    type = capture ? `${type}capture` : type;
    listener = isFunction(listener) ? listener : listener.handleEvent;

    if (once) {
      this.once(type, listener, context);
    } else {
      this.on(type, listener, context);
    }
  }
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    const capture =
      (isBoolean(options) && options)
      || (isObject(options) && options.capture);
    const context = isFunction(listener) ? undefined : listener;

    type = capture ? `${type}capture` : type;
    listener = isFunction(listener) ? listener : listener.handleEvent;

    this.off(type, listener, context);
  }
  dispatchEvent(e: Event): boolean {
    if (!(e instanceof FederatedEvent)) {
      throw new Error('DisplayObject cannot propagate events outside of the Federated Events API');
    }

    e.defaultPrevented = false;
    e.path = [];
    e.target = this;
    e.manager?.dispatchEvent(e);

    return !e.defaultPrevented;
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes
   */
  get attributes(): StyleProps {
    return this.entity.getComponent(SceneGraphNode).attributes as StyleProps;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute
   */
  getAttribute(attributeName: keyof StyleProps) {
    const value = this.attributes[attributeName];
    // if the given attribute does not exist, the value returned will either be null or ""
    return isNil(value) ? null : value;
  }
  /**
   * should use removeAttribute() instead of setting the attribute value to null either directly or using setAttribute(). Many attributes will not behave as expected if you set them to null.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute
   */
  removeAttribute(attributeName: keyof StyleProps) {
    delete this.attributes[attributeName];
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
   */
  setAttribute(attributeName: keyof StyleProps, value: any) {
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
   * @deprecated
   */
  getCount() {
    return this.childElementCount;
  }

  /**
   * compatible with G 3.0
   * @deprecated
   */
  getParent(): DisplayObject<any> | null {
    return this.parentNode;
  }

  /**
   * compatible with G 3.0
   * @deprecated
   */
  getChildren() {
    return this.children;
  }

  /**
   * compatible with G 3.0
   * @deprecated
   */
  getFirst(): DisplayObject<any> | null {
    return this.firstChild;
  }

  /**
   * compatible with G 3.0
   * @deprecated
   * get last child group/shape
   */
  getLast(): DisplayObject<any> | null {
    return this.lastChild;
  }

  /**
   * compatible with G 3.0
   * @deprecated
   * get child group/shape by index
   */
  getChildByIndex(index: number): DisplayObject<any> | null {
    return this.children[index] || null;
  }

  /**
   * search in scene group, but should not include itself
   */
  find(filter: GroupFilter): DisplayObject<any> | null {
    let target: DisplayObject<any> | null = null;
    this.forEach((object) => {
      if (object !== this && filter(object)) {
        target = object;
        return true;
      }
    });
    return target;
  }
  findAll(filter: GroupFilter): DisplayObject<any>[] {
    const objects: DisplayObject<any>[] = [];
    this.forEach((object) => {
      if (object !== this && filter(object)) {
        objects.push(object);
      }
    });
    return objects;
  }

  /**
   * compatible with G 3.0
   * @deprecated
   */
  add(child: DisplayObject<any>, index?: number) {
    this.appendChild(child, index);
  }

  /**
   * traverse in descendants
   */
  forEach(callback: (o: DisplayObject<any>) => void | boolean) {
    if (!callback(this)) {
      this.children.forEach((child) => {
        child.forEach(callback);
      });
    }
  }

  /** transform operations */

  setOrigin(position: vec3 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.setOrigin(this, createVec3(position, y, z));
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
    this.sceneGraphService.setPosition(this, createVec3(position, y, z));
    return this;
  }

  /**
   * set position in local space
   */
  setLocalPosition(position: vec3 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.setLocalPosition(this, createVec3(position, y, z));
    return this;
  }

  /**
   * translate in world space
   */
  translate(position: vec3 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.translate(this, createVec3(position, y, z));
    return this;
  }

  /**
   * translate in local space
   */
  translateLocal(position: vec3 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.translateLocal(this, createVec3(position, y, z));
    return this;
  }

  getPosition() {
    return this.sceneGraphService.getPosition(this);
  }

  getLocalPosition() {
    return this.sceneGraphService.getLocalPosition(this);
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
    this.sceneGraphService.scaleLocal(this, scaling);
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

    this.sceneGraphService.setLocalScale(this, scaling);
    return this;
  }

  /**
   * get scaling in local space
   */
  getLocalScale() {
    return this.sceneGraphService.getLocalScale(this);
  }

  /**
   * get scaling in world space
   */
  getScale() {
    return this.sceneGraphService.getScale(this);
  }

  /**
   * only return degrees of Z axis in world space
   */
  getEulerAngles() {
    const transform = this.entity.getComponent(Transform);
    const [ex, ey, ez] = getEuler(
      vec3.create(),
      this.sceneGraphService.getWorldTransform(this, transform),
    );
    return rad2deg(ez);
  }

  /**
   * only return degrees of Z axis in local space
   */
  getLocalEulerAngles() {
    const [ex, ey, ez] = getEuler(
      vec3.create(),
      this.sceneGraphService.getLocalRotation(this),
    );
    return rad2deg(ez);
  }

  /**
   * set euler angles(degrees) in world space
   */
  setEulerAngles(z: number) {
    this.sceneGraphService.setEulerAngles(this, 0, 0, z);
    return this;
  }

  /**
   * set euler angles(degrees) in local space
   */
  setLocalEulerAngles(z: number) {
    this.sceneGraphService.setLocalEulerAngles(this, 0, 0, z);
    return this;
  }

  rotateLocal(x: number, y?: number, z?: number) {
    if (isNil(y) && isNil(z)) {
      return this.sceneGraphService.rotateLocal(this, 0, 0, x);
    }

    return this.sceneGraphService.rotateLocal(this, x, y, z);
  }

  rotate(x: number, y?: number, z?: number) {
    if (isNil(y) && isNil(z)) {
      return this.sceneGraphService.rotate(this, 0, 0, x);
    }

    return this.sceneGraphService.rotate(this, x, y, z);
  }

  getRotation() {
    return this.sceneGraphService.getRotation(this);
  }
  getLocalRotation() {
    return this.sceneGraphService.getLocalRotation(this);
  }

  getLocalTransform() {
    return this.sceneGraphService.getLocalTransform(this);
  }
  getWorldTransform() {
    return this.sceneGraphService.getWorldTransform(this);
  }

  /* z-index & visibility */

  setZIndex(zIndex: number) {
    this.style.zIndex = zIndex;
  }

  /**
   * bring to front in current group
   */
  toFront() {
    if (this.parent) {
      const zIndex = Math.max(...this.parent.children.map((child) => child.getEntity().getComponent(Sortable).zIndex)) + 1;
      this.setZIndex(zIndex);
    }
  }

  /**
   * send to back in current group
   */
  toBack() {
    if (this.parent) {
      const zIndex = Math.min(...this.parent.children.map((child) => child.getEntity().getComponent(Sortable).zIndex)) - 1;
      this.setZIndex(zIndex);
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
    toAttrs: StyleProps,
    duration: number,
    easing?: string,
    callback?: Function,
    delay?: number,
  ): void;
  animate(
    onFrame: OnFrame<StyleProps>,
    duration: number,
    easing?: string,
    callback?: Function,
    delay?: number,
  ): void;
  animate(toAttrs: StyleProps, cfg: AnimateCfg): void;
  animate(onFrame: OnFrame<StyleProps>, cfg: AnimateCfg): void;
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
    return this.sceneGraphService.getBounds(this);
  }

  /**
   * get bounds in local space, account for children
   */
  getLocalBounds(): AABB | null {
    return this.sceneGraphService.getLocalBounds(this);
  }

  /**
   * account for context's bounds in client space
   */
  getBoundingClientRect(): Rectangle | null {
    const bounds = this.getBounds();
    if (!bounds) {
      return null;
    }

    const [left, top] = bounds.getMin();
    const [right, bottom] = bounds.getMax();

    // calc context's offset
    const bbox = this.ownerDocument.defaultView
      .getContextService().getBoundingClientRect();

    return new Rectangle(
      left + (bbox?.left || 0),
      top + (bbox?.top || 0),
      right - left,
      bottom - top,
    );
  }

  getClientRects() {
    return [this.getBoundingClientRect()];
  }

  /**
   * compitable with `style`
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
   */
  style = new Proxy<StyleProps>({} as StyleProps, {
    get: (_, prop) => {
      return this.getAttribute(prop as keyof StyleProps);
    },
    set: (_, prop, value) => {
      this.setAttribute(prop as keyof StyleProps, value);
      return true;
    }
  });

  /**
   * get called when attributes changed
   */
  private changeAttribute(name: keyof StyleProps, value: any) {
    const entity = this.getEntity();
    const renderable = entity.getComponent(Renderable);
    const geometry = entity.getComponent(Geometry);

    // update value
    this.attributes[name] = value;

    // update geometry if some attributes changed such as `width/height/...`
    const geometryUpdater = this.geometryUpdaterFactory(this.nodeType);
    const needUpdateGeometry = geometryUpdater && geometryUpdater.dependencies.indexOf(name as string) > -1;
    if (needUpdateGeometry && geometry.aabb) {
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
      this.sceneGraphService.setLocalPosition(this, x, y);
    } else if (name === 'zIndex') {
      const sortable = entity.getComponent(Sortable);
      sortable.zIndex = value;

      if (this.parentNode) {
        const parentEntity = this.parentNode.getEntity();
        const parentRenderable = parentEntity.getComponent(Renderable);
        const parentSortable = parentEntity.getComponent(Sortable);
        if (parentRenderable) {
          parentRenderable.dirty = true;
        }

        // need re-sort on parent
        if (parentSortable) {
          parentSortable.dirty = true;
        }
      }
    }

    // update renderable's aabb, account for world transform
    if (needUpdateGeometry) {
      renderable.aabbDirty = true;
    }

    // redraw at next frame
    renderable.dirty = true;

    this.emit(DISPLAY_OBJECT_EVENT.AttributeChanged, name, value, this);
  }
}
