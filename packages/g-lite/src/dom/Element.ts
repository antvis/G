import type {
  Cullable,
  Geometry,
  RBushNode,
  Renderable,
  Sortable,
  Transform,
} from '../components';
import { Strategy } from '../components';
import { runtime } from '../global-runtime';
import type { AABB, Rectangle } from '../shapes';
import {
  Shape,
  type BaseStyleProps,
  type ParsedBaseStyleProps,
} from '../types';
import { isInFragment } from '../utils';
import {
  ERROR_MSG_APPEND_DESTROYED_ELEMENT,
  ERROR_MSG_METHOD_NOT_IMPLEMENTED,
} from '../utils/error';
import { CustomEvent } from './CustomEvent';
import { MutationEvent } from './MutationEvent';
import { Node } from './Node';
import type {
  ICSSStyleDeclaration,
  IChildNode,
  IElement,
  INode,
} from './interfaces';
import { ElementEvent } from './interfaces';

let entityCounter = 0;
export function resetEntityCounter() {
  entityCounter = 0;
}

export const insertedEvent = new MutationEvent(
  ElementEvent.INSERTED,
  null,
  '',
  '',
  '',
  0,
  '',
  '',
);
export const removedEvent = new MutationEvent(
  ElementEvent.REMOVED,
  null,
  '',
  '',
  '',
  0,
  '',
  '',
);
export const destroyEvent = new CustomEvent(ElementEvent.DESTROY);

/**
 * Has following capabilities:
 * * Node insert/remove, eg. appendChild, removeChild, remove...
 * * Query eg. querySelector getElementById...
 * * Animation
 */
export class Element<
    StyleProps extends BaseStyleProps = BaseStyleProps,
    ParsedStyleProps extends ParsedBaseStyleProps = ParsedBaseStyleProps,
  >
  extends Node
  implements IElement<StyleProps, ParsedStyleProps>
{
  /**
   * Unique id.
   */
  entity = entityCounter++;

  renderable: Renderable = {
    bounds: undefined,
    boundsDirty: true,
    renderBounds: undefined,
    renderBoundsDirty: true,
    dirtyRenderBounds: undefined,
    dirty: false,
  };

  cullable: Cullable = {
    strategy: Strategy.Standard,
    visibilityPlaneMask: -1,
    visible: true,
    enable: true,
  };

  transformable: Transform = {
    dirtyFlag: false,
    localDirtyFlag: false,
    frozen: false,
    localPosition: [0, 0, 0],
    localRotation: [0, 0, 0, 1],
    localScale: [1, 1, 1],
    localTransform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    localSkew: [0, 0],
    position: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    scaling: [1, 1, 1],
    worldTransform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    origin: [0, 0, 0],
  };

  sortable: Sortable = {
    dirty: false,
    sorted: undefined,
    renderOrder: 0,
    dirtyChildren: [],
    dirtyReason: undefined,
  };

  geometry: Geometry = {
    contentBounds: undefined,
    renderBounds: undefined,
    dirty: true,
  };

  rBushNode: RBushNode = {
    aabb: undefined,
  };

  /**
   * used with `getElementById()`
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/id
   */
  id: string;

  /**
   * used in `getElementsByClassName`
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
   */
  get className() {
    // @ts-ignore
    return this.getAttribute('class') || '';
  }

  set className(className: string) {
    this.setAttribute('class', className);
  }

  /**
   * used in `getElementsByName`
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByName
   */
  name: string;

  /**
   * https://developer.mozilla.org/zh-CN/docs/Web/API/Element/namespaceURI
   */
  namespaceURI = 'g';

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
   */
  get classList() {
    return this.className.split(' ').filter((c) => c !== '');
  }

  scrollLeft = 0;
  scrollTop = 0;

  /**
   * We don't support border now
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/clientTop
   */
  clientTop = 0;
  clientLeft = 0;

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

  cloneNode(deep?: boolean): this {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }

  appendChild<T extends INode>(child: T, index?: number): T {
    if ((child as unknown as Element).destroyed) {
      throw new Error(ERROR_MSG_APPEND_DESTROYED_ELEMENT);
    }

    runtime.sceneGraphService.attach(child, this, index);

    if (this.ownerDocument?.defaultView) {
      if (!isInFragment(this) && child.nodeName === Shape.FRAGMENT) {
        this.ownerDocument.defaultView.mountFragment(child);
      } else {
        this.ownerDocument.defaultView.mountChildren(child);
      }
    }

    // @ts-ignore
    if (this.isMutationObserved) {
      insertedEvent.relatedNode = this as IElement;
      child.dispatchEvent(insertedEvent);
    }

    return child;
  }

  insertBefore<T extends INode>(newChild: T, refChild: INode | null): T {
    if (!refChild) {
      this.appendChild(newChild);
    } else {
      if (newChild.parentElement) {
        newChild.parentElement.removeChild(newChild);
      }

      const index = this.childNodes.indexOf(refChild as IChildNode);
      if (index === -1) {
        this.appendChild(newChild);
      } else {
        this.appendChild(newChild, index);
      }
    }
    return newChild;
  }

  replaceChild<T extends INode>(newChild: INode, oldChild: T): T {
    const index = this.childNodes.indexOf(oldChild as unknown as IChildNode);
    this.removeChild(oldChild);
    this.appendChild(newChild, index);
    return oldChild;
  }

  removeChild<T extends INode>(child: T): T {
    // should emit on itself before detach
    removedEvent.relatedNode = this as IElement;
    child.dispatchEvent(removedEvent);

    if (child.ownerDocument?.defaultView) {
      child.ownerDocument.defaultView.unmountChildren(child);
    }

    // remove from scene graph
    runtime.sceneGraphService.detach(child);
    return child;
  }

  /**
   * Remove all children which can be appended to its original parent later again.
   */
  removeChildren() {
    for (let i = this.childNodes.length - 1; i >= 0; i--) {
      const child = this.childNodes[i] as this;
      this.removeChild(child);
    }
  }

  /**
   * Recursively destroy all children which can not be appended to its original parent later again.
   */
  destroyChildren() {
    for (let i = this.childNodes.length - 1; i >= 0; i--) {
      const child = this.childNodes[i] as this;
      if (child.childNodes.length > 0) {
        child.destroyChildren();
      }
      child.destroy();
    }
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
   */
  matches(selector: string): boolean {
    return runtime.sceneGraphService.matches(selector, this as IElement);
  }
  getElementById<E extends IElement = IElement>(id: string): E | null {
    return runtime.sceneGraphService.querySelector<IElement, E>(
      `#${id}`,
      this as IElement,
    );
  }
  getElementsByName<E extends IElement = IElement>(name: string): E[] {
    return runtime.sceneGraphService.querySelectorAll<IElement, E>(
      `[name="${name}"]`,
      this as IElement,
    );
  }
  getElementsByClassName<E extends IElement = IElement>(
    className: string,
  ): E[] {
    return runtime.sceneGraphService.querySelectorAll<IElement, E>(
      `.${className}`,
      this as IElement,
    );
  }
  getElementsByTagName<E extends IElement = IElement>(tagName: string): E[] {
    return runtime.sceneGraphService.querySelectorAll<IElement, E>(
      tagName,
      this as IElement,
    );
  }
  querySelector<E extends IElement = IElement>(selectors: string): E | null {
    return runtime.sceneGraphService.querySelector<IElement, E>(
      selectors,
      this as IElement,
    );
  }
  querySelectorAll<E extends IElement = IElement>(selectors: string): E[] {
    return runtime.sceneGraphService.querySelectorAll<IElement, E>(
      selectors,
      this as IElement,
    );
  }

  /**
   * should traverses the element and its parents (heading toward the document root)
   * until it finds a node that matches the specified CSS selector.
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/closest
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#polyfill
   */
  closest<E extends IElement = IElement>(selectors: string): E | null {
    let el = this as unknown as E;
    do {
      if (runtime.sceneGraphService.matches(selectors, el)) return el;
      el = el.parentElement as E;
    } while (el !== null);
    return null;
  }

  /**
   * search in scene group, but should not include itself
   */
  find<E extends IElement = IElement>(filter: (node: E) => boolean): E | null {
    let target: E | null = null;
    this.forEach((object) => {
      if (object !== this && filter(object as E)) {
        target = object as E;
        return false;
      }
      return true;
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
      nodes.forEach((node, i) =>
        this.parentNode?.appendChild(node, index + i + 1),
      );
    }
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/before
   */
  before(...nodes: INode[]) {
    if (this.parentNode) {
      const index = this.parentNode.childNodes.indexOf(this);
      const [first, ...rest] = nodes;
      this.parentNode.appendChild(first, index);
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
  remove(): this {
    if (this.parentNode) {
      return this.parentNode.removeChild(this);
    }
    return this;
  }

  /**
   * is destroyed or not
   */
  destroyed = false;
  destroy() {
    // fix https://github.com/antvis/G/issues/1813
    this.destroyChildren();

    // destroy itself before remove
    this.dispatchEvent(destroyEvent);

    // remove from scenegraph first
    this.remove();

    // remove event listeners
    this.emitter.removeAllListeners();

    this.destroyed = true;
  }

  getGeometryBounds(): AABB {
    return runtime.sceneGraphService.getGeometryBounds(this);
  }

  getRenderBounds(): AABB {
    return runtime.sceneGraphService.getBounds(this, true);
  }

  /**
   * get bounds in world space, account for children
   */
  getBounds(): AABB {
    return runtime.sceneGraphService.getBounds(this);
  }

  /**
   * get bounds in local space, account for children
   */
  getLocalBounds(): AABB {
    return runtime.sceneGraphService.getLocalBounds(this);
  }

  /**
   * account for context's bounds in client space,
   * but not accounting for children
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
   */
  getBoundingClientRect(): Rectangle {
    return runtime.sceneGraphService.getBoundingClientRect(this);
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
  style: StyleProps & ICSSStyleDeclaration<StyleProps> = {} as StyleProps &
    ICSSStyleDeclaration<StyleProps>;
  computedStyle = {};

  /**
   * Renderers will use these used values.
   */
  parsedStyle: ParsedStyleProps = {
    // opacity: '',
    // fillOpacity: '',
    // strokeOpacity: '',
    // transformOrigin: '',
    // visibility: '',
    // pointerEvents: '',
    // lineWidth: '',
    // lineCap: '',
    // lineJoin: '',
    // increasedLineWidthForHitTesting: '',
    // fontSize: '',
    // fontFamily: '',
    // fontStyle: '',
    // fontWeight: '',
    // fontVariant: '',
    // textAlign: '',
    // textBaseline: '',
    // textTransform: '',
  } as ParsedStyleProps;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/computedStyleMap
   * eg. circle.computedStyleMap().get('fill');
   */
  computedStyleMap() {
    return new Map(Object.entries(this.computedStyle));
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes
   */
  readonly attributes: StyleProps = {} as StyleProps;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNames
   */
  getAttributeNames(): string[] {
    return Object.keys(this.attributes);
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute
   */
  getAttribute(name: keyof StyleProps) {
    // @see https://github.com/antvis/G/issues/1267
    if (typeof name === 'symbol') {
      return undefined;
    }

    const value = this.attributes[name];
    if (value === undefined) {
      // if the given attribute does not exist, the value returned will either be null or ""
      return value;
    }

    return value;
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttribute
   */
  hasAttribute(qualifiedName: string): boolean {
    return this.getAttributeNames().includes(qualifiedName);
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttributes
   */
  hasAttributes(): boolean {
    return !!this.getAttributeNames().length;
  }

  /**
   * should use removeAttribute() instead of setting the attribute value to null either directly or using setAttribute(). Many attributes will not behave as expected if you set them to null.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute
   */
  removeAttribute(attributeName: keyof StyleProps) {
    this.setAttribute(attributeName, null);
    delete this.attributes[attributeName];
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
   */
  setAttribute<Key extends keyof StyleProps>(
    attributeName: Key,
    value: StyleProps[Key],
    force?: boolean,
    memoize?: boolean,
  ) {
    this.attributes[attributeName] = value;
  }

  getAttributeNS(namespace: string, localName: string): string {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }

  getAttributeNode(qualifiedName: string): Attr {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }
  getAttributeNodeNS(namespace: string, localName: string): Attr {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }

  hasAttributeNS(namespace: string, localName: string): boolean {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }

  removeAttributeNS(namespace: string, localName: string): void {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }
  removeAttributeNode(attr: Attr): Attr {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }

  setAttributeNS(
    namespace: string,
    qualifiedName: string,
    value: string,
  ): void {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }
  setAttributeNode(attr: Attr): Attr {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }
  setAttributeNodeNS(attr: Attr): Attr {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }

  toggleAttribute(qualifiedName: string, force?: boolean): boolean {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }
}
