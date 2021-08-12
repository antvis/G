/* eslint-disable max-classes-per-file */
/**
 * a subset of DOM for G
 */

export class GNode {
  private isConnectedToCanvas: boolean;
  private children: GNode[] = [];
  private parent?: GNode;
  private root?: GNode;

  get childNodes() {
    return this.children;
  }

  get firstChild(): GNode | undefined {
    if (this.children.length > 0) {
      return this.children[0];
    }
    return undefined;
  }

  get isConnected() {
    return this.isConnectedToCanvas;
  }

  get lastChild(): GNode | undefined {
    if (this.children.length > 0) {
      return this.children[this.children.length - 1];
    }
    return undefined;
  }

  get nextSibling(): GNode | undefined {
    const length = this.parent?.childNodes.length ?? 0;
    if (length <= 0) {
      return undefined;
    }
    const index = this.parent?.childNodes.indexOf(this) ?? -1;
    if (index < 0) {
      throw new Error('node do not exist on parent child list');
    }
    if (index + 1 === length) {
      return undefined;
    }
    return this.parent?.childNodes[index + 1];
  }

  get parentNode() {
    return this.parent;
  }

  get previousSibling(): GNode | undefined {
    const length = this.parent?.childNodes.length ?? 0;
    if (length <= 0) {
      return undefined;
    }
    const index = this.parent?.childNodes.indexOf(this) ?? -1;
    if (index < 0) {
      throw new Error('node do not exist on parent child list');
    }
    if (index === 0) {
      return undefined;
    }
    return this.parent?.childNodes[index - 1];
  }

  appendChild(node: GNode) {
    this.children.push(node);
  }

  contains(node: GNode) {
    return this.children.includes(node);
  }

  getRootNode() {
    return this.root;
  }

  hasChildNodes() {
    return this.childNodes.length > 0;
  }

  insertBefore(node: GNode, refNode: GNode) {
    const refIndex = this.childNodes.indexOf(refNode);
    if (refIndex < 0) {
      throw new Error('ref not exist');
    }
    this.childNodes.splice(refIndex - 1, 0, node);
  }

  removeChild(node: GNode) {
    const index = this.childNodes.indexOf(node);
    if (index < 0) {
      throw new Error('node is not child');
    }
    this.childNodes.splice(index, 1);
  }

  replaceChild(node: GNode, newNode: GNode) {
    const index = this.childNodes.indexOf(node);
    if (index < 0) {
      throw new Error('node is not child');
    }
    this.childNodes.splice(index, 1, newNode);
  }
}

export class GElement extends GNode {
  private eleAttributes: Map<string, unknown>;
  get attributes() {
    return this.eleAttributes;
  }

  id: string;
  className: string;
  classList: string[];

  hasAttributes(): boolean {
    return this.eleAttributes.size > 0;
  }

  getAttributeNames() {
    return this.eleAttributes.keys();
  }

  getAttribute<T = void>(name: string) {
    return this.eleAttributes.get(name) as T;
  }

  setAttribute(name: string, value: string) {
    this.eleAttributes.set(name, value);
  }

  removeAttribute(name: string) {
    this.eleAttributes.delete(name);
  }

  hasAttribute(name: string) {
    return this.eleAttributes.has(name);
  }

  getElementsByTagName(name: string): GElement[] {}
}
