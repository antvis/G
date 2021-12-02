import { EventTarget } from './EventTarget';
import type {
  IEventTarget,
  IElement,
  INode,
  IChildNode,
  IParentNode,
  IDocument,
} from './interfaces';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Node
 */
export abstract class Node extends EventTarget implements INode {
  static isNode(target: IEventTarget | INode): target is INode {
    return !!(target as INode).childNodes;
  }

  shadow = false;
  /**
   * points to canvas.document
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/ownerDocument
   */
  ownerDocument: IDocument | null = null;

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/isConnected
   * @example
      circle.isConnected; // false
      canvas.appendChild(circle);
      circle.isConnected; // true
   */
  isConnected = false;

  /**
   * Returns node's node document's document base URL.
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node
   */
  readonly baseURI: string = '';

  /**
   * Returns the children.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes
   */
  childNodes: (IChildNode & INode)[] = [];

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
   */
  nodeType: number = 0;

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeName
   */
  nodeName: string = '';

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeValue
   */
  nodeValue: string | null = null;

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/textContent
   */
  textContent: string | null = null;

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/getRootNode
   */
  getRootNode(options?: GetRootNodeOptions): INode {
    let temp: INode | null = this;
    while (temp.parentNode) {
      temp = temp.parentNode;
    }
    return temp;
  }
  hasChildNodes(): boolean {
    return this.childNodes.length > 0;
  }
  isDefaultNamespace(namespace: string | null): boolean {
    throw new Error('Method not implemented.');
  }
  compareDocumentPosition(other: INode): number {
    throw new Error('Method not implemented.');
  }
  lookupNamespaceURI(prefix: string | null): string | null {
    throw new Error('Method not implemented.');
  }
  lookupPrefix(namespace: string | null): string | null {
    throw new Error('Method not implemented.');
  }
  normalize(): void {
    throw new Error('Method not implemented.');
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/isEqualNode
   */
  isEqualNode(otherNode: INode | null): boolean {
    // TODO: compare 2 nodes, not sameness
    return this === otherNode;
  }
  isSameNode(otherNode: INode | null): boolean {
    return this.isEqualNode(otherNode);
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode
   */
  parentNode: (INode & IParentNode) | null = null;

  /**
   * @deprecated
   * @alias parentNode
   */
  get parent(): INode | null {
    return this.parentNode;
  }
  get parentElement(): IElement | null {
    return null;
  }
  get nextSibling(): (IChildNode & INode) | null {
    return null;
  }
  get previousSibling(): (IChildNode & INode) | null {
    return null;
  }
  get firstChild(): (IChildNode & INode) | null {
    return this.childNodes.length > 0 ? this.childNodes[0] : null;
  }
  get lastChild(): (IChildNode & INode) | null {
    return this.childNodes.length > 0 ? this.childNodes[this.childNodes.length - 1] : null;
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode
   */
  abstract cloneNode(deep?: boolean): INode;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
   */
  abstract appendChild<T extends INode>(newChild: T, index?: number): T;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
   */
  abstract insertBefore<T extends INode>(newChild: T, refChild: INode | null): T;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
   */
  abstract removeChild<T extends INode>(child: T, destroy?: boolean): T;

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/replaceChild
   */
  abstract replaceChild<T extends INode & IChildNode>(
    newChild: INode,
    oldChild: T,
    destroy?: boolean,
  ): T;

  abstract destroy(): void;

  /**
   * @deprecated
   * @alias contains
   */
  contain(other: INode | null) {
    return this.contains(other);
  }
  contains(other: INode | null): boolean {
    // the node itself, one of its direct children
    let tmp: INode | null = other;
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
    while (tmp && this !== tmp) {
      tmp = tmp.parentNode;
    }
    return !!tmp;
  }

  getAncestor(n: number): INode | null {
    let temp: INode | null = this;
    while (n > 0 && temp) {
      temp = temp.parentNode;
      n--;
    }
    return temp;
  }

  forEach(callback: (o: INode) => void | boolean) {
    if (!callback(this)) {
      this.childNodes.forEach((child) => {
        child.forEach(callback);
      });
    }
  }
}
