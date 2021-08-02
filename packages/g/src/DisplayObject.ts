import { isObject, isNil, isBoolean, isFunction } from '@antv/util';
/* eslint-disable no-plusplus */
import type { Entity } from '@antv/g-ecs';
import { System } from '@antv/g-ecs';
import { vec3, mat3, mat4, quat } from 'gl-matrix';
import { EventEmitter } from 'eventemitter3';
import { Cullable, Geometry, Renderable, SceneGraphNode, Transform } from './components';
import { createVec3, rad2deg, getEuler, fromRotationTranslationScale } from './utils/math';
import { Sortable } from './components/Sortable';
import type { BaseStyleProps } from './types';
import type { GroupFilter } from './types';
import { SHAPE } from './types';
import { DisplayObjectPool } from './DisplayObjectPool';
import { world, container } from './inversify.config';
import { SceneGraphService } from './services';
// import { Timeline } from './systems';
import { AABB, Rectangle } from './shapes';
import { GeometryAABBUpdater, GeometryUpdaterFactory } from './services/aabb';
import { FederatedEvent } from './FederatedEvent';
import { KeyframeEffect } from './KeyframeEffect';
import { Canvas } from './Canvas';
import { Animation } from './Animation';
import { parseTransform } from './property-handlers/transform';

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

export interface DisplayObjectEventType<StyleProps extends BaseStyleProps = BaseStyleProps> {
  [DISPLAY_OBJECT_EVENT.Init]: () => void;
  [DISPLAY_OBJECT_EVENT.Destroy]: () => void;
  [DISPLAY_OBJECT_EVENT.AttributeChanged]: <Key extends keyof StyleProps>(
    name: Key,
    oldValue: StyleProps[Key],
    newValue: StyleProps[Key],
    object: DisplayObject<StyleProps>,
  ) => void;
  [DISPLAY_OBJECT_EVENT.Inserted]: (object: DisplayObject<any>) => void;
  [DISPLAY_OBJECT_EVENT.ChildInserted]: (object: DisplayObject<any>) => void;
  [DISPLAY_OBJECT_EVENT.Removed]: (object: DisplayObject<any>) => void;
  [DISPLAY_OBJECT_EVENT.ChildRemoved]: (object: DisplayObject<any>) => void;
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
export class DisplayObject<StyleProps extends BaseStyleProps = BaseStyleProps> {
  protected entity: Entity;
  protected config: DisplayObjectConfig<StyleProps>;

  private displayObjectPool: DisplayObjectPool = container.get(DisplayObjectPool);

  private sceneGraphService = container.get(SceneGraphService);

  private geometryUpdaterFactory =
    container.get<(tagName: SHAPE) => GeometryAABBUpdater<any>>(GeometryUpdaterFactory);

  /**
   * event emitter
   */
  emitter = new EventEmitter();

  /**
   * push to active animations after calling `animate()`
   */
  activeAnimations: Animation[] = [];

  constructor(config: DisplayObjectConfig<StyleProps>) {
    // assign name, id to config
    // eg. group.get('name')
    this.config = config;

    // create entity with shape's name, unique ID
    const entity = world.createEntity();
    this.entity = entity;
    // insert this group into pool
    this.displayObjectPool.add(entity.getName(), this);

    // TODO: capture
    this.config.capture = true;

    // init scene graph node
    const sceneGraphNode = entity.addComponent(SceneGraphNode);
    sceneGraphNode.id = this.config.id || '';
    sceneGraphNode.name = this.config.name || '';
    sceneGraphNode.class = this.config.className || '';
    sceneGraphNode.tagName = this.config.type || SHAPE.Group;

    // compatible with G 3.0
    // @ts-ignore
    this.config.style = {
      zIndex: this.config.zIndex ?? 0,
      visibility: this.config.visible === false ? 'hidden' : 'visible',
      ...this.config.style,
      ...this.config.attrs,
    };
    sceneGraphNode.attributes = this.config.style || {};

    const renderable = entity.addComponent(Renderable);
    entity.addComponent(Cullable);
    entity.addComponent(Transform);
    entity.addComponent(Sortable);

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

    this.emitter.emit(DISPLAY_OBJECT_EVENT.Init);
  }

  /**
   * implements Node API
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node
   */
  readonly baseURI: string = '';
  childNodes: NodeListOf<ChildNode & Node>;

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/isConnected
   * @example
      circle.isConnected; // false
      canvas.appendChild(circle);
      circle.isConnected; // true
   */
  isConnected: boolean;

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
   */
  get nodeType(): number {
    return 0;
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeName
   */
  get nodeName(): SHAPE {
    return this.entity.getComponent(SceneGraphNode).tagName;
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeValue
   */
  nodeValue: string | null = null;

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/textContent
   */
  textContent: string | null = null;

  getRootNode(options?: GetRootNodeOptions): DisplayObject {
    return this.getAncestor(Infinity)!;
  }
  hasChildNodes(): boolean {
    throw new Error('Method not implemented.');
  }
  isDefaultNamespace(namespace: string | null): boolean {
    throw new Error('Method not implemented.');
  }
  isEqualNode(otherNode: Node | null): boolean {
    throw new Error('Method not implemented.');
  }
  isSameNode(otherNode: Node | null): boolean {
    throw new Error('Method not implemented.');
  }

  /**
   * ChildNode API
   */
  after(...nodes: (Node | string)[]) {

  }

  before(...nodes: (Node | string)[]) {

  }

  replaceWith(...nodes: (Node | string)[]) {

  }

  replaceChild<T extends Node>(node: Node, child: T): T {
    throw new Error('Method not implemented.');
  }

  remove(destroy = true) {
    if (this.parentNode) {
      return this.parentNode.removeChild(this, destroy);
    }
    return this;
  }

  /**
   * compatible with G 3.0
   * @deprecated
   */
  set<Key extends keyof DisplayObjectConfig<StyleProps>>(
    name: Key,
    value: DisplayObjectConfig<StyleProps>[Key],
  ) {
    this.config[name] = value;
  }
  get(name: keyof DisplayObjectConfig<StyleProps>) {
    return this.config[name];
  }
  getConfig() {
    return this.config;
  }

  getEntity() {
    return this.entity;
  }

  attr(): StyleProps;
  attr(name: Partial<StyleProps>): DisplayObject<StyleProps>;
  attr<Key extends keyof StyleProps>(name: Key): StyleProps[Key];
  attr<Key extends keyof StyleProps>(name: Key, value: StyleProps[Key]): DisplayObject<StyleProps>;
  attr(...args: any): any {
    const [name, value] = args;
    if (!name) {
      return this.attributes;
    }
    if (isObject(name)) {
      Object.keys(name).forEach((key) => {
        this.setAttribute(key as keyof StyleProps, (name as StyleProps)[key as keyof StyleProps]);
      });
      return this;
    }
    if (args.length === 2) {
      this.setAttribute(name, value);
      return this;
    }
    return this.attributes[name as keyof StyleProps];
  }

  destroy() {
    this.emitter.emit(DISPLAY_OBJECT_EVENT.Destroy);
    this.entity.destroy();
    this.emitter.removeAllListeners();
  }

  /** scene graph operations */

  scrollLeft = 0;
  scrollTop = 0;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
   */
  dataset: Record<string, any> = {};

  get parentNode(): DisplayObject | null {
    return this.parent;
  }
  get parentElement(): DisplayObject | null {
    // TODO: The Node.parentElement read-only property returns the DOM node's parent Element, or null if the node either has no parent, or its parent isn't a DOM Element.
    return this.parent;
  }
  get nextSibling(): DisplayObject | null {
    const parentGroup = this.parentNode;
    if (parentGroup) {
      const children = parentGroup.children;
      const index = children.indexOf(this);
      return children[index + 1] || null;
    }

    return null;
  }
  get previousSibling(): DisplayObject | null {
    const parentGroup = this.parentNode;
    if (parentGroup) {
      const children = parentGroup.children;
      const index = children.indexOf(this);
      return children[index - 1] || null;
    }

    return null;
  }
  get firstChild(): DisplayObject | null {
    return this.children.length > 0 ? this.children[0] : null;
  }
  get lastChild(): DisplayObject | null {
    return this.children.length > 0 ? this.children[this.children.length - 1] : null;
  }
  cloneNode() {
    // TODO
    return new DisplayObject({
      ...this.config,
      id: '',
    });
  }
  appendChild(child: DisplayObject, index?: number) {
    this.sceneGraphService.attach(child, this, index);

    this.emitter.emit(DISPLAY_OBJECT_EVENT.ChildInserted, child);
    child.emitter.emit(DISPLAY_OBJECT_EVENT.Inserted, this);

    return child;
  }
  insertBefore(group: DisplayObject, reference?: DisplayObject): DisplayObject {
    if (!reference) {
      this.appendChild(group);
    } else {
      const index = this.children.indexOf(reference);
      this.appendChild(group, index - 1);
    }
    return group;
  }
  removeChild(child: DisplayObject, destroy = true) {
    this.sceneGraphService.detach(child);

    this.emitter.emit(DISPLAY_OBJECT_EVENT.ChildRemoved, child);
    child.emitter.emit(DISPLAY_OBJECT_EVENT.Removed, this);

    if (destroy) {
      child.forEach((object) => {
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
  contain(group: DisplayObject) {
    return this.contains(group);
  }
  contains(group: DisplayObject | null): boolean {
    // the node itself, one of its direct children
    let tmp: DisplayObject | null = group;
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
    while (tmp && this !== tmp) {
      tmp = tmp.parentNode;
    }
    return !!tmp;
  }
  getAncestor(n: number): DisplayObject | null {
    let temp: DisplayObject | null = this;
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
  ownerDocument: DisplayObject | null;
  /**
   * only root has defaultView, points to Canvas
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/defaultView
   */
  defaultView: Canvas;
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement
   */
  documentElement: DisplayObject;

  get id() {
    return this.entity.getComponent(SceneGraphNode).id;
  }
  get className() {
    return this.entity.getComponent(SceneGraphNode).class;
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
  parent: DisplayObject | null = null;

  // HTMLCollection
  children: DisplayObject[] = [];

  get childElementCount(): number {
    return this.children.length;
  }
  get firstElementChild(): DisplayObject | null {
    // To avoid the issue with node.firstChild returning #text or #comment nodes,
    // ParentNode.firstElementChild can be used to return only the first element node.
    return this.firstChild;
  }
  get lastElementChild(): DisplayObject | null {
    return this.lastChild;
  }

  append(...nodes: (Node | string)[]) { }
  prepend(...nodes: (Node | string)[]) { }
  replaceChildren(...nodes: (Node | string)[]) { }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
   */
  matches(selector: string): boolean {
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
   * @alias addEventListener
   */
  on(
    type: string,
    listener: EventListenerOrEventListenerObject | ((...args: any[]) => void),
    options?: boolean | AddEventListenerOptions,
  ) {
    this.addEventListener(type, listener, options);
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
    const capture = (isBoolean(options) && options) || (isObject(options) && options.capture);
    const once = isObject(options) && options.once;
    const context = isFunction(listener) ? undefined : listener;

    type = capture ? `${type}capture` : type;
    listener = isFunction(listener) ? listener : listener.handleEvent;

    if (once) {
      this.emitter.once(type, listener, context);
    } else {
      this.emitter.on(type, listener, context);
    }
  }
  /**
   * @alias removeEventListener
   */
  off(
    type: string,
    listener: EventListenerOrEventListenerObject | ((...args: any[]) => void),
    options?: boolean | AddEventListenerOptions,
  ) {
    this.removeEventListener(type, listener, options);
  }
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    const capture = (isBoolean(options) && options) || (isObject(options) && options.capture);
    const context = isFunction(listener) ? undefined : listener;

    type = capture ? `${type}capture` : type;
    listener = isFunction(listener) ? listener : listener.handleEvent;

    this.emitter.off(type, listener, context);
  }
  emit(event: string | symbol, ...args: any[]) {
    this.emitter.emit(event, ...args);
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
  get attributes() {
    return this.entity.getComponent<SceneGraphNode<StyleProps>>(SceneGraphNode).attributes;
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
  setAttribute<Key extends keyof StyleProps>(attributeName: Key, value: StyleProps[Key]) {
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
   * @deprecated
   * compatible with G 3.0
   * @deprecated
   */
  getCount() {
    return this.childElementCount;
  }

  /**
   * @deprecated
   * compatible with G 3.0
   * @deprecated
   */
  getParent(): DisplayObject | null {
    return this.parentNode;
  }

  /**
   * @deprecated
   * compatible with G 3.0
   * @deprecated
   */
  getChildren() {
    return this.children;
  }

  /**
   * @deprecated
   * compatible with G 3.0
   * @deprecated
   */
  getFirst(): DisplayObject | null {
    return this.firstChild;
  }

  /**
   * @deprecated
   * compatible with G 3.0
   * @deprecated
   * get last child group/shape
   */
  getLast(): DisplayObject | null {
    return this.lastChild;
  }

  /**
   * @deprecated
   * compatible with G 3.0
   * @deprecated
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
      return false;
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
   * @deprecated
   */
  add(child: DisplayObject, index?: number) {
    this.appendChild(child, index);
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

  getPosition(): vec3 {
    return this.sceneGraphService.getPosition(this);
  }

  getLocalPosition(): vec3 {
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
  getLocalScale(): vec3 {
    return this.sceneGraphService.getLocalScale(this);
  }

  /**
   * get scaling in world space
   */
  getScale(): vec3 {
    return this.sceneGraphService.getScale(this);
  }

  /**
   * only return degrees of Z axis in world space
   */
  getEulerAngles() {
    const transform = this.entity.getComponent(Transform);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [ex, ey, ez] = getEuler(vec3.create(), this.sceneGraphService.getLocalRotation(this));
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
      this.sceneGraphService.rotateLocal(this, 0, 0, x);
    } else {
      this.sceneGraphService.rotateLocal(this, x, y, z);
    }

    return this;
  }

  rotate(x: number, y?: number, z?: number) {
    if (isNil(y) && isNil(z)) {
      this.sceneGraphService.rotate(this, 0, 0, x);
    } else {
      this.sceneGraphService.rotate(this, x, y, z);
    }

    return this;
  }

  getRotation(): quat {
    return this.sceneGraphService.getRotation(this);
  }

  getLocalRotation(): quat {
    return this.sceneGraphService.getLocalRotation(this);
  }

  getLocalTransform(): mat4 {
    return this.sceneGraphService.getLocalTransform(this);
  }

  getWorldTransform(): mat4 {
    return this.sceneGraphService.getWorldTransform(this);
  }

  /**
   * return 3x3 matrix in world space
   * @deprecated
   */
  getMatrix(): mat3 {
    const transform = this.getWorldTransform();
    const [tx, ty] = mat4.getTranslation(vec3.create(), transform);
    const [sx, sy] = mat4.getScaling(vec3.create(), transform);
    const rotation = mat4.getRotation(quat.create(), transform);
    const [eux, euy, euz] = getEuler(vec3.create(), rotation);
    // gimbal lock at 90 degrees
    return fromRotationTranslationScale(eux || euz, tx, ty, sx, sy);
  }
  /**
   * set 3x3 matrix in world space
   * @deprecated
   */
  setMatrix(mat: mat3) {
    let row0x = mat[0];
    let row0y = mat[3];
    let row1x = mat[1];
    let row1y = mat[4];
    // decompose 3x3 matrix
    // @see https://www.w3.org/TR/css-transforms-1/#decomposing-a-2d-matrix
    let scalingX = Math.sqrt(row0x * row0x + row0y * row0y);
    let scalingY = Math.sqrt(row1x * row1x + row1y * row1y);

    // If determinant is negative, one axis was flipped.
    const determinant = row0x * row1y - row0y * row1x;
    if (determinant < 0) {
      // Flip axis with minimum unit vector dot product.
      if (row0x < row1y) {
        scalingX = -scalingX;
      } else {
        scalingY = -scalingY;
      }
    }

    // Renormalize matrix to remove scale.
    if (scalingX) {
      row0x *= 1 / scalingX;
      row0y *= 1 / scalingX;
    }
    if (scalingY) {
      row1x *= 1 / scalingY;
      row1y *= 1 / scalingY;
    }

    // Compute rotation and renormalize matrix.
    const angle = Math.atan2(row0y, row0x);

    this
      .setEulerAngles(angle)
      .setPosition(mat[6], mat[7])
      .setLocalScale(scalingX, scalingY);
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
      const zIndex = Math.max(
        ...this.parent.children.map((child) => Number(child.style.zIndex))
      ) + 1;
      this.setZIndex(zIndex);
    }
  }

  /**
   * send to back in current group
   */
  toBack() {
    if (this.parent) {
      const zIndex = Math.min(
        ...this.parent.children.map((child) => Number(child.style.zIndex))
      ) - 1;
      this.setZIndex(zIndex);
    }
  }

  /**
   * show group, which will also change visibility of its children in sceneGraphNode
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/visibility
   */
  show() {
    this.style.visibility = 'visible';
  }

  /**
   * hide group, which will also change visibility of its children in sceneGraphNode
   */
  hide() {
    this.style.visibility = 'hidden';
  }

  isVisible() {
    return this.style.visibility === 'visible';
  }

  animate(
    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
    options?: number | KeyframeAnimationOptions | undefined
  ): Animation | null {
    const timeline = this.ownerDocument?.defaultView.timeline;
    if (timeline) {
      return timeline.play(
        new KeyframeEffect(
          this as unknown as Element,
          keyframes,
          options,
        )
      );
    }
    return null;
  }

  getAnimations(): Animation[] {
    return this.activeAnimations;
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
   * account for context's bounds in client space,
   * but not accounting for children
   */
  getBoundingClientRect(): Rectangle {
    const bounds = this.sceneGraphService.getGeometryBounds(this);
    if (!bounds) {
      return new Rectangle(0, 0, 0, 0);
    }

    const [left, top] = bounds.getMin();
    const [right, bottom] = bounds.getMax();

    // calc context's offset
    const bbox = this.ownerDocument?.defaultView
      .getContextService().getBoundingClientRect();

    return new Rectangle(
      left + (bbox?.left || 0),
      top + (bbox?.top || 0),
      right - left,
      bottom - top,
    );
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getClientRects
   */
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
    },
  });

  /**
   * get called when attributes changed
   */
  private changeAttribute<Key extends keyof StyleProps>(name: Key, value: StyleProps[Key]) {
    const entity = this.getEntity();
    const renderable = entity.getComponent(Renderable);
    const geometry = entity.getComponent(Geometry);

    const oldValue = this.attributes[name];

    // update value
    this.attributes[name] = value;

    // update geometry if some attributes changed such as `width/height/...`
    const geometryUpdater = this.geometryUpdaterFactory(this.nodeName);
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
    } else if (name === 'transform') {
      const result = parseTransform(value);
      // console.log(result);
      result?.forEach(({ d, t }) => {
        if (t === 'scale') { // scale(1) scale(1, 1)
          // @ts-ignore
          this.setLocalScale(d[0], d[1], 1);
        } else if (t === 'scalex') {
          this.setLocalScale(d as unknown as number, 1, 1);
        } else if (t === 'scaley') {
          this.setLocalScale(1, d as unknown as number, 1);
        } else if (t === 'scalez') {
          this.setLocalScale(1, 1, d as unknown as number);
        } else if (t === 'scale3d') {
          // @ts-ignore
          this.setLocalScale(d[0], d[1], d[2]);
        } else if (t === 'translate') {
          this.setLocalPosition(d[0].px, d[1].px, 0);
        } else if (t === 'translatex') {
          this.setLocalPosition(d[0].px, 0, 0);
        } else if (t === 'translatey') {
          this.setLocalPosition(0, d[0].px, 0);
        } else if (t === 'translatez') {
          this.setLocalPosition(0, 0, d[0].px);
        } else if (t === 'translate3d') {
          this.setLocalPosition(d[0].px, d[1].px, d[2].px);
        } else if (t === 'rotate') {
          let deg = 0;
          if ('deg' in d[0]) {
            deg = d[0].deg;
          } else if ('rad' in d[0]) {
            deg = rad2deg(d[0].rad);
          } else if ('turn' in d[0]) {
            deg = 360 * d[0].turn;
          }
          this.setLocalEulerAngles(deg);
        } else if (t === 'rotatex') {

        } else if (t === 'rotatey') {

        } else if (t === 'rotatez') {

        }
      });
      delete this.attributes[name];
    }

    // update renderable's aabb, account for world transform
    if (needUpdateGeometry) {
      renderable.aabbDirty = true;
    }

    // redraw at next frame
    renderable.dirty = true;

    this.emitter.emit(DISPLAY_OBJECT_EVENT.AttributeChanged, name, oldValue, value, this);
  }
}
