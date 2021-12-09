import { isNil } from '@antv/util';
import { SceneGraphService } from '../services/SceneGraphService';
import { Cullable, Geometry, Renderable, Transform, Sortable } from '../components';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Node } from './Node';
import type { AABB, Rectangle } from '../shapes';
import type { IEventTarget, IChildNode, IElement, INode } from './interfaces';
import { ElementEvent } from './interfaces';
import { globalContainer } from '../global-module';

let entityCounter = 0;

/**
 * Has following capabilities:
 * * Node insert/remove, eg. appendChild, removeChild, remove...
 * * Query eg. querySelector getElementById...
 * * Animation
 */
export class Element<
    StyleProps extends BaseStyleProps = any,
    ParsedStyleProps extends ParsedBaseStyleProps = any,
  >
  extends Node
  implements IElement<StyleProps, ParsedStyleProps>
{
  static isElement(target: IEventTarget | INode | IElement): target is IElement {
    return !!(target as IElement).getAttribute;
  }

  sceneGraphService = globalContainer.get<SceneGraphService>(SceneGraphService);

  entity = entityCounter++;

  renderable = new Renderable();
  cullable = new Cullable();
  transformable = new Transform();
  sortable = new Sortable();
  geometry = new Geometry();

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

  scrollLeft = 0;
  scrollTop = 0;

  get tagName(): string {
    return this.nodeName;
  }

  get children(): IElement[] {
    return this.childNodes as IElement[];
  }

  get childElementCount(): number {
    return this.childNodes.length;
  }
  get firstElementChild(): IElement | null {
    return this.firstChild as IElement;
  }
  get lastElementChild(): IElement | null {
    return this.lastChild as IElement;
  }

  get parentElement(): IElement | null {
    return this.parentNode as IElement;
  }

  get nextSibling(): IElement | null {
    if (this.parentNode) {
      const index = this.parentNode.childNodes.indexOf(this);
      return (this.parentNode.childNodes[index + 1] as IElement) || null;
    }

    return null;
  }

  get previousSibling(): IElement | null {
    if (this.parentNode) {
      const index = this.parentNode.childNodes.indexOf(this);
      return (this.parentNode.childNodes[index - 1] as IElement) || null;
    }

    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cloneNode(deep?: boolean): this {
    throw new Error('Method not implemented.');
  }

  appendChild<T extends INode>(child: T, index?: number): T {
    this.sceneGraphService.attach(child, this, index);

    this.emit(ElementEvent.CHILD_INSERTED, {
      child,
    });
    child.emit(ElementEvent.INSERTED, {
      parent: this,
    });

    return child;
  }

  insertBefore<T extends INode>(newChild: T, refChild: INode | null): T {
    if (!refChild) {
      this.appendChild(newChild);
    } else {
      const index = this.childNodes.indexOf(refChild as IChildNode);
      this.appendChild(newChild, index - 1);
    }
    return newChild;
  }

  replaceChild<T extends INode>(newChild: INode, oldChild: T, destroy?: boolean): T {
    const index = this.childNodes.indexOf(oldChild as unknown as IChildNode);
    this.removeChild(oldChild, destroy);
    this.appendChild(newChild, index);
    return oldChild;
  }

  removeChild<T extends INode>(child: T, destroy = true): T {
    // should emit on itself before detach
    child.emit(ElementEvent.REMOVED, {
      parent: this,
    });

    // emit destroy event
    if (destroy) {
      child.emit(ElementEvent.DESTROY, {});
      (child as unknown as Element).destroyed = true;
    }

    // emit on parent
    this.emit(ElementEvent.CHILD_REMOVED, {
      child,
    });

    // remove from scene graph
    this.sceneGraphService.detach(child);

    // cannot emit Destroy event now
    if (destroy) {
      // this.removeChildren();
      // remove event listeners
      child.emitter.removeAllListeners();
    }
    return child;
  }

  removeChildren(destroy = true) {
    this.childNodes.slice().forEach((child) => {
      this.removeChild(child, destroy);
    });
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
   */
  matches(selector: string): boolean {
    return this.sceneGraphService.matches(selector, this as IElement);
  }
  getElementById<E extends IElement = IElement>(id: string): E | null {
    return this.sceneGraphService.querySelector<IElement, E>(`#${id}`, this as IElement);
  }
  getElementsByName<E extends IElement = IElement>(name: string): E[] {
    return this.sceneGraphService.querySelectorAll<IElement, E>(
      `[name="${name}"]`,
      this as IElement,
    );
  }
  getElementsByClassName<E extends IElement = IElement>(className: string): E[] {
    return this.sceneGraphService.querySelectorAll<IElement, E>(`.${className}`, this as IElement);
  }
  getElementsByTagName<E extends IElement = IElement>(tagName: string): E[] {
    return this.sceneGraphService.querySelectorAll<IElement, E>(tagName, this as IElement);
  }
  querySelector<E extends IElement = IElement>(selectors: string): E | null {
    return this.sceneGraphService.querySelector<IElement, E>(selectors, this as IElement);
  }
  querySelectorAll<E extends IElement = IElement>(selectors: string): E[] {
    return this.sceneGraphService.querySelectorAll<IElement, E>(selectors, this as IElement);
  }

  /**
   * search in scene group, but should not include itself
   */
  find<E extends IElement = IElement>(filter: (node: E) => boolean): E | null {
    let target: E | null = null;
    this.forEach((object) => {
      if (object !== this && filter(object as E)) {
        target = object as E;
        return true;
      }
      return false;
    });
    return target;
  }
  findAll<E extends IElement = IElement>(filter: (node: E) => boolean): E[] {
    const objects: E[] = [];
    this.forEach((object) => {
      if (object !== this && filter(object as E)) {
        objects.push(object as E);
      }
    });
    return objects;
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/after
   */
  after(...nodes: INode[]) {
    if (this.parentNode) {
      const index = this.parentNode.childNodes.indexOf(this);
      nodes.forEach((node, i) => this.parentNode?.appendChild(node!, index + i + 1));
    }
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/before
   */
  before(...nodes: INode[]) {
    if (this.parentNode) {
      const index = this.parentNode.childNodes.indexOf(this);
      const [first, ...rest] = nodes;
      this.parentNode.appendChild(first!, index);
      (first as IChildNode).after(...rest);
    }
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/replaceWith
   */
  replaceWith(...nodes: INode[]) {
    this.after(...nodes);
    this.remove();
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/append
   */
  append(...nodes: INode[]) {
    nodes.forEach((node) => this.appendChild(node));
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/prepend
   */
  prepend(...nodes: INode[]) {
    nodes.forEach((node, i) => this.appendChild(node, i));
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/replaceChildren
   */
  replaceChildren(...nodes: INode[]) {
    while (this.childNodes.length && this.firstChild) {
      this.removeChild(this.firstChild);
    }
    this.append(...nodes);
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/remove
   */
  remove(destroy = true): this {
    if (this.parentNode) {
      return this.parentNode.removeChild(this, destroy);
    }
    return this;
  }

  /**
   * is destroyed or not
   */
  destroyed = false;
  destroy() {
    // destroy itself before remove
    this.emit(ElementEvent.DESTROY, {});

    // remove from scenegraph first
    this.remove(false);

    // remove event listeners
    this.emitter.removeAllListeners();

    this.destroyed = true;
  }

  getGeometryBounds(): AABB | null {
    return this.sceneGraphService.getGeometryBounds(this);
  }

  getRenderBounds(): AABB | null {
    return this.sceneGraphService.getBounds(this, true);
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
    return this.sceneGraphService.getBoundingClientRect(this);
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getClientRects
   */
  getClientRects() {
    return [this.getBoundingClientRect()];
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    force = false,
  ) {
    this.attributes[attributeName] = value;
  }
}
