import { singleton, Syringe } from 'mana-syringe';
import type { IElement } from '../dom/interfaces';

export const SceneGraphSelectorFactory = Syringe.defineToken('SceneGraphSelectorFactory');
export const SceneGraphSelector = Syringe.defineToken('SceneGraphSelector', { multiple: false });
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface SceneGraphSelector {
  selectOne: <R extends IElement, T extends IElement>(query: string, root: R) => T | null;
  selectAll: <R extends IElement, T extends IElement>(query: string, root: R) => T[];
  is: <T extends IElement>(query: string, element: T) => boolean;
}

/**
 * support the following DOM API:
 * * getElementById
 * * getElementsByClassName
 * * getElementsByName
 * * getElementsByTag
 * * querySelector
 * * querySelectorAll
 */
@singleton({ token: SceneGraphSelector })
export class DefaultSceneGraphSelector implements SceneGraphSelector {
  selectOne<R extends IElement, T extends IElement>(query: string, root: R): T | null {
    if (query.startsWith('.')) {
      return root.find((node) => {
        // return !node.shadow && node.id === query.substring(1);
        return node.className === query.substring(1);
      });
    } else if (query.startsWith('#')) {
      // getElementById('id')
      return root.find((node) => {
        // return !node.shadow && node.id === query.substring(1);
        return node.id === query.substring(1);
      });
    } else if (query.startsWith('[name=')) {
      // getElementsByName();
      return root.find(
        (node) =>
          (root as unknown as T) !== node && node.name === query.substring(7, query.length - 2),
      );
    } else {
      // getElementsByTag('circle');
      return root.find((node) => (root as unknown as T) !== node && node.nodeName === query);
    }
  }

  selectAll<R extends IElement, T extends IElement>(query: string, root: R): T[] {
    // only support `[name="${name}"]` `.className` `#id`
    if (query.startsWith('.')) {
      // getElementsByClassName('className');
      // should not include itself
      return root.findAll(
        (node) => (root as unknown as T) !== node && node.className === query.substring(1),
      );
    } else if (query.startsWith('#')) {
      return root.findAll(
        (node) => (root as unknown as T) !== node && node.id === query.substring(1),
      );
    } else if (query.startsWith('[name=')) {
      // getElementsByName();
      return root.findAll(
        (node) =>
          (root as unknown as T) !== node && node.name === query.substring(7, query.length - 2),
      );
    } else {
      // getElementsByTag('circle');
      return root.findAll((node) => (root as unknown as T) !== node && node.nodeName === query);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  is<T extends IElement>(): boolean {
    // TODO: need a simple `matches` implementation
    return true;
  }
}
