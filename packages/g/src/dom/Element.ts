import { isEqual, isNil } from '@antv/util';
import { container } from '../inversify.config';
import { SceneGraphService } from '../services';
import { Cullable, Geometry, Renderable, Transform, Sortable } from '../components';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Node } from './Node';
import type { Animation } from '../Animation';
import { KeyframeEffect } from '../KeyframeEffect';
import type { DisplayObject } from '../DisplayObject';
import { AABB, Rectangle } from '../shapes';

/**
 * events for display object
 */
export enum DISPLAY_OBJECT_EVENT {
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

export interface ElementConfig<StyleProps> {
  /**
   * element's identifier, must be unique in a document.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/id
   */
  id?: string;

  name?: string;

  className?: string;

  attributes?: StyleProps;

  type?: string;
}

/**
 * Has following capabilities:
 * * Node insert/remove, eg. appendChild, removeChild, remove...
 * * Query eg. querySelector getElementById...
 * * Animation
 */
export class Element<
  StyleProps extends BaseStyleProps = any,
  ParsedStyleProps extends ParsedBaseStyleProps = any,
> extends Node {
  /**
   * push to active animations after calling `animate()`
   */
  activeAnimations: Animation[] = [];

  protected sceneGraphService = container.get<SceneGraphService>(SceneGraphService);

  constructor() {
    super();

    // create entity with shape's name, unique ID
    const entity = this.entity;

    entity.addComponent(Renderable);
    entity.addComponent(Cullable);
    entity.addComponent(Transform);
    entity.addComponent(Sortable);
    entity.addComponent(Geometry);
  }

  /**
   * used with `getElementById()`
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/id
   */
  id: string;

  /**
   * used in `getElementsByClassName`
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
   */
  className: string;

  /**
   * used in `getElementsByName`
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByName
   */
  name: string;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
   */
  get classList() {
    return this.className.split(' ');
  }

  interactive: boolean;

  appendChild(child: this, index?: number): this {
    this.sceneGraphService.attach(child, this, index);

    this.emitter.emit(DISPLAY_OBJECT_EVENT.ChildInserted, child);
    child.emitter.emit(DISPLAY_OBJECT_EVENT.Inserted, this);

    return child;
  }

  insertBefore(group: this, reference?: this): this {
    if (!reference) {
      this.appendChild(group);
    } else {
      const index = this.childNodes.indexOf(reference);
      this.appendChild(group, index - 1);
    }
    return group;
  }

  removeChild(child: this, destroy = true) {
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
    [...this.childNodes].forEach((child) => {
      this.removeChild(child, destroy);
    });
  }

  get children(): this[] {
    return this.childNodes;
  }

  get childElementCount(): number {
    return this.childNodes.length;
  }
  get firstElementChild(): this | null {
    // To avoid the issue with node.firstChild returning #text or #comment nodes,
    // ParentNode.firstElementChild can be used to return only the first element node.
    return this.firstChild;
  }
  get lastElementChild(): this | null {
    return this.lastChild;
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
   */
  matches(selector: string): boolean {
    return this.sceneGraphService.matches(selector, this);
  }
  getElementById(id: string): this | null {
    return this.sceneGraphService.querySelector(`#${id}`, this);
  }
  getElementsByName(name: string): this[] {
    return this.sceneGraphService.querySelectorAll(`[name="${name}"]`, this);
  }
  getElementsByClassName(className: string): this[] {
    return this.sceneGraphService.querySelectorAll(`.${className}`, this);
  }
  getElementsByTagName(tagName: string): this[] {
    return this.sceneGraphService.querySelectorAll(tagName, this);
  }
  querySelector(selector: string): this | null {
    return this.sceneGraphService.querySelector(selector, this);
  }
  querySelectorAll(selector: string): this[] {
    return this.sceneGraphService.querySelectorAll(selector, this);
  }
  /**
   * traverse in descendants
   */
  forEach(callback: (o: this) => void | boolean) {
    if (!callback(this)) {
      this.childNodes.forEach((child) => {
        child.forEach(callback);
      });
    }
  }
  /**
   * search in scene group, but should not include itself
   */
  find(filter: (node: this) => boolean): this | null {
    let target: this | null = null;
    this.forEach((object) => {
      if (object !== this && filter(object)) {
        target = object;
        return true;
      }
      return false;
    });
    return target;
  }
  findAll(filter: (node: this) => boolean): this[] {
    const objects: this[] = [];
    this.forEach((object) => {
      if (object !== this && filter(object)) {
        objects.push(object);
      }
    });
    return objects;
  }

  /**
   * compatible with `style`
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
   */
  style: StyleProps = {} as StyleProps;
  parsedStyle: ParsedStyleProps = {} as ParsedStyleProps;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes
   */
  attributes: StyleProps = {} as StyleProps;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute
   */
  getAttribute(attributeName: keyof StyleProps) {
    const value = this.attributes[attributeName];
    // if the given attribute does not exist, the value returned will either be null or ""
    return isNil(value) ? undefined : value;
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
  setAttribute<Key extends keyof StyleProps>(
    attributeName: Key,
    value: StyleProps[Key],
    force = false,
  ) {
    if (
      force ||
      !isEqual(value, this.attributes[attributeName]) ||
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
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/after
   */
  after(...nodes: this[]) {
    if (this.parentNode) {
      const index = this.parentNode.childNodes.indexOf(this);
      nodes.forEach((node, i) => this.parentNode?.appendChild(node!, index + i + 1));
    }
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/before
   */
  before(...nodes: this[]) {
    if (this.parentNode) {
      const index = this.parentNode.childNodes.indexOf(this);
      const [first, ...rest] = nodes;
      this.parentNode.appendChild(first!, index);
      first.after(...rest);
    }
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/replaceWith
   */
  replaceWith(...nodes: this[]) {
    this.after(...nodes);
    this.remove();
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/append
   */
  append(...nodes: this[]) {
    nodes.forEach((node) => this.appendChild(node));
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/prepend
   */
  prepend(...nodes: this[]) {
    nodes.forEach((node, i) => this.appendChild(node, i));
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/replaceChildren
   */
  replaceChildren(...nodes: this[]) {
    while (this.childNodes.length && this.firstChild) {
      this.removeChild(this.firstChild);
    }
    this.append(...nodes);
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/remove
   */
  remove(destroy = true): Node {
    if (this.parentNode) {
      return this.parentNode.removeChild(this, destroy);
    }
    return this;
  }

  /**
   * @override
   */
  protected changeAttribute<Key extends keyof StyleProps>(name: Key, value: StyleProps[Key]) {
    throw new Error('Method not implemented.');
  }

  /**
   * is destroyed or not
   */
  destroyed = false;
  destroy() {
    // remove from scenegraph first
    this.remove(false);

    // then destroy itself
    this.emitter.emit(DISPLAY_OBJECT_EVENT.Destroy);
    this.entity.destroy();

    // remove event listeners
    this.emitter.removeAllListeners();

    // stop all active animations
    this.getAnimations().forEach((animation) => {
      animation.cancel();
    });

    this.destroyed = true;
  }

  /**
   * returns an array of all Animation objects affecting this element
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations
   */
  getAnimations(): Animation[] {
    return this.activeAnimations;
  }
  /**
   * create an animation with WAAPI
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/animate
   */
  animate(
    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
    options?: number | KeyframeAnimationOptions | undefined,
  ): Animation | null {
    let timeline = this.ownerDocument?.timeline;

    // accounte for clip path, use target's timeline
    if (this.attributes.clipPathTargets && this.attributes.clipPathTargets.length) {
      const target = this.attributes.clipPathTargets[0];
      timeline = target.ownerDocument?.timeline;
    }

    // clear old parsed transform
    this.parsedStyle.transform = undefined;

    if (timeline) {
      return timeline.play(
        new KeyframeEffect(this as unknown as DisplayObject, keyframes, options),
      );
    }
    return null;
  }

  getGeometryBounds(): AABB | null {
    return this.sceneGraphService.getGeometryBounds(this);
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
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
   */
  getBoundingClientRect(): Rectangle {
    const bounds = this.sceneGraphService.getGeometryBounds(this);
    if (!bounds) {
      return new Rectangle(0, 0, 0, 0);
    }

    const [left, top] = bounds.getMin();
    const [right, bottom] = bounds.getMax();

    // calc context's offset
    const bbox = this.ownerDocument?.defaultView?.getContextService().getBoundingClientRect();

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
}
