import { isNil } from '@antv/util';
import type { IElement } from '../dom/interfaces';

export interface SceneGraphSelector {
  selectOne: <R extends IElement, T extends IElement>(
    query: string,
    root: R,
  ) => T | null;
  selectAll: <R extends IElement, T extends IElement>(
    query: string,
    root: R,
  ) => T[];
  is: <T extends IElement>(query: string, element: T) => boolean;
}

const ATTRIBUTE_REGEXP = /\[\s*(.*)=(.*)\s*\]/;

/**
 * support the following DOM API:
 * * getElementById
 * * getElementsByClassName
 * * getElementsByName
 * * getElementsByTag
 * * querySelector
 * * querySelectorAll
 */
export class DefaultSceneGraphSelector implements SceneGraphSelector {
  selectOne<R extends IElement, T extends IElement>(
    query: string,
    root: R,
  ): T | null {
    if (query.startsWith('.')) {
      return root.find((node) => {
        // return !node.shadow && node.id === query.substring(1);
        return (
          (node?.classList || []).indexOf(this.getIdOrClassname(query)) > -1
        );
      });
    }
    if (query.startsWith('#')) {
      // getElementById('id')
      return root.find((node) => {
        // return !node.shadow && node.id === query.substring(1);
        return node.id === this.getIdOrClassname(query);
      });
    }
    if (query.startsWith('[')) {
      const { name, value } = this.getAttribute(query);
      if (name) {
        // getElementByName();
        return root.find(
          (node) =>
            (root as unknown as T) !== node &&
            (name === 'name'
              ? node.name === value
              : this.attributeToString(node, name) === value),
        );
      }
      return null;
    }
    // getElementsByTag('circle');
    return root.find(
      (node) => (root as unknown as T) !== node && node.nodeName === query,
    );
  }

  selectAll<R extends IElement, T extends IElement>(
    query: string,
    root: R,
  ): T[] {
    // only support `[name="${name}"]` `.className` `#id`
    if (query.startsWith('.')) {
      // getElementsByClassName('className');
      // should not include itself
      return root.findAll(
        (node) =>
          (root as unknown as T) !== node &&
          (node?.classList || []).indexOf(this.getIdOrClassname(query)) > -1,
      );
    }
    if (query.startsWith('#')) {
      return root.findAll(
        (node) =>
          (root as unknown as T) !== node &&
          node.id === this.getIdOrClassname(query),
      );
    }
    if (query.startsWith('[')) {
      const { name, value } = this.getAttribute(query);
      if (name) {
        // getElementsByName();
        return root.findAll(
          (node) =>
            (root as unknown as T) !== node &&
            (name === 'name'
              ? node.name === value
              : this.attributeToString(node, name) === value),
        );
      }
      return [];
    }
    // getElementsByTag('circle');
    return root.findAll(
      (node) => (root as unknown as T) !== node && node.nodeName === query,
    );
  }

  is<T extends IElement>(query: string, node: T): boolean {
    // a simple `matches` implementation
    if (query.startsWith('.')) {
      return node.className === this.getIdOrClassname(query);
    }
    if (query.startsWith('#')) {
      return node.id === this.getIdOrClassname(query);
    }
    if (query.startsWith('[')) {
      const { name, value } = this.getAttribute(query);
      return name === 'name'
        ? node.name === value
        : this.attributeToString(node, name) === value;
    }
    return node.nodeName === query;
  }

  private getIdOrClassname(query: string): string {
    return query.substring(1);
  }

  private getAttribute(query: string): Record<string, string> {
    const matches = query.match(ATTRIBUTE_REGEXP);
    let name = '';
    let value = '';
    if (matches && matches.length > 2) {
      name = matches[1].replace(/"/g, '');
      value = matches[2].replace(/"/g, '');
    }
    return { name, value };
  }

  private attributeToString(node: IElement, name: string): string {
    if (!node.getAttribute) {
      return '';
    }

    const value = node.getAttribute(name);

    if (isNil(value)) {
      return '';
    }

    if (value.toString) {
      return value.toString();
    }

    return '';
  }
}
