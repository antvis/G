import { singleton } from 'mana-syringe';
import { IElement } from '../dom/interfaces';

export const SceneGraphSelectorFactory = 'SceneGraphSelectorFactory';
export const SceneGraphSelector = 'SceneGraphSelector';
export interface SceneGraphSelector {
  selectOne<R extends IElement, T extends IElement>(query: string, root: R): T | null;
  selectAll<R extends IElement, T extends IElement>(query: string, root: R): T[];
  is<T extends IElement>(query: string, element: T): boolean;
}

/**
 * support following DOM API
 * * getElementById
 * * getElementsByClassName
 * * getElementsByName
 * * getElementsByTag
 */
@singleton()
export class DefaultSceneGraphSelector implements SceneGraphSelector {
  selectOne<R extends IElement, T extends IElement>(query: string, root: R): T | null {
    if (query.startsWith('#')) {
      // getElementById('id')
      return root.find((node) => {
        // return !node.shadow && node.id === query.substring(1);
        return node.id === query.substring(1);
      });
    }
    return null;
  }

  selectAll<R extends IElement, T extends IElement>(query: string, root: R): T[] {
    // TODO: only support `[name="${name}"]` `.className`
    if (query.startsWith('.')) {
      // getElementsByClassName('className');
      // TODO: should include itself?
      return root.findAll((node) => node.className === query.substring(1));
    } else if (query.startsWith('#')) {
      return root.findAll((node) => node.id === query.substring(1));
    } else if (query.startsWith('[name=')) {
      // getElementsByName();
      return root.findAll((node) => node.name === query.substring(7, query.length - 2));
    } else {
      // getElementsByTag('circle');
      return root.findAll((node) => node.nodeName === query);
    }
  }

  is<T extends IElement>(query: string, group: T): boolean {
    // TODO: need a simple `matches` implementation
    return true;
  }
}
