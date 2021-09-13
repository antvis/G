import { EventTarget } from './EventTarget';

import { Document } from './Document';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Node
 */
export abstract class Node extends EventTarget {
  /**
   * points to canvas.document
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/ownerDocument
   */
  ownerDocument: Document | null = null;

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/isConnected
   * @example
      circle.isConnected; // false
      canvas.appendChild(circle);
      circle.isConnected; // true
   */
  isConnected = false;

  /**
   * implements Node API
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node
   */
  readonly baseURI: string = '';

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes
   */
  childNodes: this[] = [];

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
  getRootNode(options?: GetRootNodeOptions): this {
    let temp: this | null = this;
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

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/isEqualNode
   */
  isEqualNode(otherNode: this | null): boolean {
    return this === otherNode;
  }
  isSameNode(otherNode: this | null): boolean {
    return this.isEqualNode(otherNode);
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode
   */
  parentNode: this | null = null;

  /**
   * @deprecated
   * @alias parentNode
   */
  get parent(): this | null {
    return this.parentNode;
  }
  get parentElement(): this | null {
    return this.parentNode;
  }
  get nextSibling(): this | null {
    if (this.parentNode) {
      const index = this.parentNode.childNodes.indexOf(this);
      return this.parentNode.childNodes[index + 1] || null;
    }

    return null;
  }
  get previousSibling(): this | null {
    if (this.parentNode) {
      const index = this.parentNode.childNodes.indexOf(this);
      return this.parentNode.childNodes[index - 1] || null;
    }

    return null;
  }
  get firstChild(): this | null {
    return this.childNodes.length > 0 ? this.childNodes[0] : null;
  }
  get lastChild(): this | null {
    return this.childNodes.length > 0 ? this.childNodes[this.childNodes.length - 1] : null;
  }
  cloneNode() {
    throw new Error('Method not implemented.');
  }

  abstract appendChild(child: this, index?: number): this;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
   */
  abstract insertBefore(child: this, reference?: this): this;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
   */
  abstract removeChild(child: this, destroy?: boolean): this;

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/replaceChild
   */
  replaceChild(newChild: this, oldChild: this, destroy?: boolean): this {
    const index = this.childNodes.indexOf(oldChild);
    this.removeChild(oldChild, destroy);
    this.appendChild(newChild, index);
    return newChild;
  }

  /**
   * @deprecated
   * @alias contains
   */
  contain(group: this) {
    return this.contains(group);
  }
  contains(group: this | null): boolean {
    // the node itself, one of its direct children
    let tmp: this | null = group;
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
    while (tmp && this !== tmp) {
      tmp = tmp.parentNode;
    }
    return !!tmp;
  }
  getAncestor(n: number): this | null {
    let temp: this | null = this;
    while (n > 0 && temp) {
      temp = temp.parentNode;
      n--;
    }
    return temp;
  }
}
