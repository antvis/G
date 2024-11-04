import { Shape } from '../types';
import { ERROR_MSG_METHOD_NOT_IMPLEMENTED } from '../utils';
// import { Text } from '../display-objects/Text';
import { EventTarget } from './EventTarget';
import type {
  IChildNode,
  IDocument,
  IElement,
  IEventTarget,
  INode,
  IParentNode,
} from './interfaces';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Node
 */
export abstract class Node extends EventTarget implements INode {
  /**
   * Both nodes are in different documents or different trees in the same document.
   */
  static DOCUMENT_POSITION_DISCONNECTED = 1;

  /**
   * otherNode precedes the node in either a pre-order depth-first traversal
   * of a tree containing both (e.g., as an ancestor or previous sibling or a descendant of a previous sibling or previous sibling of an ancestor) or (if they are disconnected) in an arbitrary but consistent ordering.
   */
  static DOCUMENT_POSITION_PRECEDING = 2;

  /**
   * otherNode follows the node in either a pre-order depth-first traversal of a tree containing both (e.g., as a descendant or following sibling or a descendant of a following sibling or following sibling of an ancestor) or (if they are disconnected) in an arbitrary but consistent ordering.
   */
  static DOCUMENT_POSITION_FOLLOWING = 4;

  /**
   * otherNode is an ancestor of the node.
   */
  static DOCUMENT_POSITION_CONTAINS = 8;

  /**
   * otherNode is a descendant of the node.
   */
  static DOCUMENT_POSITION_CONTAINED_BY = 16;

  /**
   * The result relies upon arbitrary and/or implementation-specific behavior and is not guaranteed to be portable.
   */
  static DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 32;

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
  childNodes: IChildNode[] = [];

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
   */
  nodeType = 0;

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeName
   */
  nodeName = '';

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeValue
   */
  nodeValue: string | null = null;

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/textContent
   */
  get textContent(): string {
    let out = '';

    if (this.nodeName === Shape.TEXT) {
      // @ts-ignore
      out += this.style.text;
    }

    for (const child of this.childNodes) {
      if (child.nodeName === Shape.TEXT) {
        out += child.nodeValue;
      } else {
        out += child.textContent;
      }
    }

    return out;
  }

  set textContent(content: string) {
    // remove all children
    this.childNodes.slice().forEach((child) => {
      this.removeChild(child);
    });

    if (this.nodeName === Shape.TEXT) {
      // @ts-ignore
      this.style.text = `${content}`;
    } else {
      // this.appendChild(
      //   new Text({
      //     style: {
      //       text: content,
      //     },
      //   }),
      // );
    }
  }

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/getRootNode
   */
  getRootNode(opts: { composed?: boolean } = {}): INode {
    if (this.parentNode) {
      return this.parentNode.getRootNode(opts);
    }
    if (opts.composed && (this as any).host) {
      return (this as any).host.getRootNode(opts);
    }
    return this;
  }
  hasChildNodes(): boolean {
    return this.childNodes.length > 0;
  }

  isDefaultNamespace(namespace: string | null): boolean {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }

  lookupNamespaceURI(prefix: string | null): string | null {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }

  lookupPrefix(namespace: string | null): string | null {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }
  normalize(): void {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
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
  get nextSibling(): IChildNode | null {
    return null;
  }
  get previousSibling(): IChildNode | null {
    return null;
  }
  get firstChild(): IChildNode | null {
    return this.childNodes.length > 0 ? this.childNodes[0] : null;
  }
  get lastChild(): IChildNode | null {
    return this.childNodes.length > 0
      ? this.childNodes[this.childNodes.length - 1]
      : null;
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
   * @see https://github.com/b-fuze/deno-dom/blob/master/src/dom/node.ts#L338
   */
  compareDocumentPosition(other: INode): number {
    if (other === this) {
      // same node
      return 0;
    }

    // if (!(other instanceof Node)) {
    //   throw new TypeError(
    //     'Node.compareDocumentPosition: Argument 1 does not implement interface Node.',
    //   );
    // }

    let node1Root: INode = other;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node2Root: INode = this;
    const node1Hierarchy: INode[] = [node1Root];
    const node2Hierarchy: INode[] = [node2Root];
    while (node1Root.parentNode ?? node2Root.parentNode) {
      node1Root = node1Root.parentNode
        ? (node1Hierarchy.push(node1Root.parentNode), node1Root.parentNode)
        : node1Root;
      node2Root = node2Root.parentNode
        ? (node2Hierarchy.push(node2Root.parentNode), node2Root.parentNode)
        : node2Root;
    }

    // Check if they don't share the same root node
    if (node1Root !== node2Root) {
      return (
        Node.DOCUMENT_POSITION_DISCONNECTED |
        Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC |
        Node.DOCUMENT_POSITION_PRECEDING
      );
    }

    const longerHierarchy =
      node1Hierarchy.length > node2Hierarchy.length
        ? node1Hierarchy
        : node2Hierarchy;
    const shorterHierarchy =
      longerHierarchy === node1Hierarchy ? node2Hierarchy : node1Hierarchy;

    // Check if either is a container of the other
    if (
      longerHierarchy[longerHierarchy.length - shorterHierarchy.length] ===
      shorterHierarchy[0]
    ) {
      return longerHierarchy === node1Hierarchy
        ? // other is a child of this
          Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING
        : // this is a child of other
          Node.DOCUMENT_POSITION_CONTAINS | Node.DOCUMENT_POSITION_PRECEDING;
    }

    // Find their first common ancestor and see whether they
    // are preceding or following
    const longerStart = longerHierarchy.length - shorterHierarchy.length;
    for (let i = shorterHierarchy.length - 1; i >= 0; i--) {
      const shorterHierarchyNode = shorterHierarchy[i];
      const longerHierarchyNode = longerHierarchy[longerStart + i];

      // We found the first common ancestor
      if (longerHierarchyNode !== shorterHierarchyNode) {
        const siblings = shorterHierarchyNode.parentNode.childNodes as INode[];

        if (
          siblings.indexOf(shorterHierarchyNode) <
          siblings.indexOf(longerHierarchyNode)
        ) {
          // Shorter is before longer
          if (shorterHierarchy === node1Hierarchy) {
            // Other is before this
            return Node.DOCUMENT_POSITION_PRECEDING;
          }
          // This is before other
          return Node.DOCUMENT_POSITION_FOLLOWING;
        }
        // Longer is before shorter
        if (longerHierarchy === node1Hierarchy) {
          // Other is before this
          return Node.DOCUMENT_POSITION_PRECEDING;
        }
        // Other is after this
        return Node.DOCUMENT_POSITION_FOLLOWING;
      }
    }

    return Node.DOCUMENT_POSITION_FOLLOWING;
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode
   */
  abstract cloneNode(deep?: boolean): this;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
   */
  abstract appendChild<T extends INode>(newChild: T, index?: number): T;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
   */
  abstract insertBefore<T extends INode>(
    newChild: T,
    refChild: INode | null,
  ): T;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
   */
  abstract removeChild<T extends INode>(child: T): T;

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Node/replaceChild
   */
  abstract replaceChild<T extends INode>(newChild: INode, oldChild: T): T;

  abstract destroy(): void;

  /**
   * @deprecated
   * @alias contains
   */
  contain<T extends INode>(other: T | null) {
    return this.contains(other);
  }
  contains<T extends INode>(other: T | null): boolean {
    // the node itself, one of its direct children
    let tmp: INode | null = other;
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
    while (tmp && this !== tmp) {
      tmp = tmp.parentNode;
    }
    return !!tmp;
  }

  getAncestor(n: number): INode | null {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let temp: INode | null = this;
    while (n > 0 && temp) {
      temp = temp.parentNode;
      n--;
    }
    return temp;
  }

  /**
   * iterate current node and its descendants
   * @param callback - callback to execute for each node, return false to break
   */
  forEach(callback: (o: INode) => void | boolean) {
    const stack: INode[] = [this];

    while (stack.length > 0) {
      const node = stack.pop();
      const result = callback(node);
      if (result === false) {
        break;
      }

      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        stack.push(node.childNodes[i]);
      }
    }
  }
}
