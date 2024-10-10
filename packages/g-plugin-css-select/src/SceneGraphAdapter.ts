import type { IElement } from '@antv/g-lite';
import type { Adapter, Predicate } from 'css-select/lib/types';

/**
 * implements interface Adapter
 * @see https://github.com/fb55/css-select/blob/1aa44bdd64aaf2ebdfd7f338e2e76bed36521957/src/types.ts#L6-L96
 */
export class SceneGraphAdapter implements Adapter<IElement, IElement> {
  isTag(node: IElement): node is IElement {
    return true;
  }

  existsOne(test: Predicate<IElement>, nodes: IElement[]): boolean {
    return nodes.some((checked) => {
      const groups = this.getChildren(checked);
      return (
        this.isTag(checked) &&
        (test(checked) || (groups.length > 0 && this.existsOne(test, groups)))
      );
    });
  }

  getAttributeValue(node: IElement, name: string): string | undefined {
    if (name === 'id') {
      return node.id;
    }
    if (name === 'class') {
      return node.className;
    }
    return (node.getAttribute && `${node.getAttribute(name)}`) || '';
  }

  getChildren(node: IElement): IElement[] {
    return node.children;
  }

  getName(node: IElement): string {
    // the name of the tag
    return node.nodeName;
  }

  getParent(node: IElement): IElement | null {
    return node.parentElement;
  }

  /**
   * Get the siblings of the node. Note that unlike jQuery's `siblings` method,
   * this is expected to include the current node as well
   */
  getSiblings(node: IElement): IElement[] {
    return (node.parentElement && node.parentElement.children) || [];
  }

  getText(node: IElement): string {
    return node.textContent;
  }

  hasAttrib(node: IElement, name: string) {
    return !!(node.hasAttribute && node.hasAttribute(name));
  }

  removeSubsets(nodes: IElement[]): IElement[] {
    let idx = nodes.length;
    let node;
    let ancestor;
    let replace;

    // Check if each node (or one of its ancestors) is already contained in the
    // array.
    while (--idx > -1) {
      node = ancestor = nodes[idx];

      // Temporarily remove the node under consideration
      // FIXME
      // @ts-ignore
      nodes[idx] = null;
      replace = true;

      while (ancestor) {
        if (nodes.indexOf(ancestor) > -1) {
          replace = false;
          nodes.splice(idx, 1);
          break;
        }
        ancestor = this.getParent(ancestor);
      }

      // If the node has been found to be unique, re-insert it.
      if (replace) {
        nodes[idx] = node;
      }
    }

    return nodes;
  }

  findAll(test: Predicate<IElement>, nodes: IElement[]): IElement[] {
    let result: IElement[] = [];
    for (let i = 0, j = nodes.length; i < j; i++) {
      if (!this.isTag(nodes[i])) {
        continue;
      }
      if (test(nodes[i])) {
        result.push(nodes[i]);
      }
      const children = this.getChildren(nodes[i]);
      if (children) {
        result = result.concat(this.findAll(test, children));
      }
    }
    return result;
  }

  findOne(test: Predicate<IElement>, nodes: IElement[]): IElement | null {
    let node = null;
    for (let i = 0, l = nodes.length; i < l && !node; i++) {
      if (test(nodes[i])) {
        node = nodes[i];
        break;
      } else {
        const children = this.getChildren(nodes[i]);
        if (children.length) {
          node = this.findOne(test, children);
        }
      }
    }

    return node;
  }
  // /**
  // * The adapter can also optionally include an equals method, if your DOM
  // * structure needs a custom equality test to compare two objects which refer
  // * to the same underlying node. If not provided, `css-select` will fall back to
  // * `a === b`.
  // */
  // equals?: (a: Node, b: Node) => boolean;
  // /**
  // * Is the nodeent in hovered state?
  // */
  // isHovered?: (node: IElementNode) => boolean;
  // /**
  // * Is the nodeent in visited state?
  // */
  // isVisited?: (node: IElementNode) => boolean;
  // /**
  // * Is the nodeent in active state?
  // */
  // isActive?: (node: IElementNode) => boolean;
}
