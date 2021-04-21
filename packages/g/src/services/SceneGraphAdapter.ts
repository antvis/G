import { Entity } from '@antv/g-ecs';
import { Adapter, Predicate } from 'css-select/lib/types';
import { inject, injectable } from 'inversify';
import { SceneGraphNode } from '../components';
import { DisplayObject } from '../DisplayObject';
import { DisplayObjectPool } from '../DisplayObjectPool';

/**
 * implements interface Adapter
 * @see https://github.com/fb55/css-select/blob/1aa44bdd64aaf2ebdfd7f338e2e76bed36521957/src/types.ts#L6-L96
 */
@injectable()
export class SceneGraphAdapter implements Adapter<DisplayObject, DisplayObject> {
  @inject(DisplayObjectPool)
  protected groupPool: DisplayObjectPool;

  isTag(node: DisplayObject): node is DisplayObject {
    return true;
  }

  existsOne(test: Predicate<DisplayObject>, nodes: DisplayObject[]): boolean {
    return nodes.some((checked) => {
      const groups = this.getChildren(checked);
      return this.isTag(checked) && (test(checked) || (groups.length > 0 && this.existsOne(test, groups)));
    });
  }

  getAttributeValue(node: DisplayObject, name: string): string | undefined {
    const sceneGraphNode = node.getEntity().getComponent(SceneGraphNode);
    if (name === 'id') {
      return sceneGraphNode.id;
    } else if (name === 'class') {
      return sceneGraphNode.class;
    }
    return `${sceneGraphNode.attributes[name]}`;
  }

  getChildren(node: DisplayObject): DisplayObject[] {
    const entities = this.getChildrenEntities(node.getEntity());
    return entities.map((entity) => this.getGroupByEntity(entity));
  }

  getName(node: DisplayObject): string {
    // the name of the tag
    return node.getEntity().getComponent(SceneGraphNode).tagName;
  }

  getParent(node: DisplayObject): DisplayObject | null {
    const name = node.getEntity().getComponent(SceneGraphNode).parent?.getName();
    if (name) {
      return this.groupPool.getByName(name);
    }
    return null;
  }

  /**
   * Get the siblings of the node. Note that unlike jQuery's `siblings` method,
   * this is expected to include the current node as well
   */
  getSiblings(node: DisplayObject): DisplayObject[] {
    const parentEntity = node.getEntity().getComponent(SceneGraphNode).parent;

    if (parentEntity) {
      return this.getChildren(this.getGroupByEntity(parentEntity));
    }

    return [];
  }

  getText(node: DisplayObject): string {
    return '';
  }

  hasAttrib(node: DisplayObject, name: string) {
    return !!node.getEntity().getComponent(SceneGraphNode).attributes[name];
  }

  removeSubsets(nodes: DisplayObject[]): DisplayObject[] {
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

  findAll(test: Predicate<DisplayObject>, nodes: DisplayObject[]): DisplayObject[] {
    let result: DisplayObject[] = [];
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

  findOne(test: Predicate<DisplayObject>, nodes: DisplayObject[]): DisplayObject | null {
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
  // isHovered?: (node: ElementNode) => boolean;
  // /**
  // * Is the nodeent in visited state?
  // */
  // isVisited?: (node: ElementNode) => boolean;
  // /**
  // * Is the nodeent in active state?
  // */
  // isActive?: (node: ElementNode) => boolean;

  private getChildrenEntities(parent: Entity): Entity[] {
    return parent.getComponent(SceneGraphNode).children;
  }

  private getGroupByEntity(entity: Entity) {
    return this.groupPool.getByName(entity.getName());
  }
}
