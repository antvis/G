import { injectable } from 'inversify';
import { Element } from '../dom/Element';

export const SceneGraphSelectorFactory = 'SceneGraphSelectorFactory';
export const SceneGraphSelector = 'SceneGraphSelector';
export interface SceneGraphSelector {
  selectOne<T extends Element>(query: string, element: T): T | null;
  selectAll<T extends Element>(query: string, element: T): T[];
  is<T extends Element>(query: string, element: T): boolean;
}

/**
 * support following DOM API
 * * getElementById
 * * getElementsByClassName
 * * getElementsByName
 * * getElementsByTag
 */
@injectable()
export class DefaultSceneGraphSelector implements SceneGraphSelector {
  selectOne<T extends Element>(query: string, object: T) {
    if (query.startsWith('#')) {
      // getElementById('id')
      return object.find((node) => {
        // return !node.shadow && node.id === query.substring(1);
        return node.id === query.substring(1);
      });
    }
    return null;
  }

  selectAll<T extends Element>(query: string, object: T) {
    // TODO: only support `[name="${name}"]` `.className`
    if (query.startsWith('.')) {
      // getElementsByClassName('className');
      // TODO: should include itself?
      return object.findAll((node) => node.className === query.substring(1));
    } else if (query.startsWith('[name=')) {
      // getElementsByName();
      return object.findAll((node) => node.name === query.substring(7, query.length - 2));
    } else {
      // getElementsByTag('circle');
      return object.findAll((node) => node.nodeName === query);
    }
  }

  is<T extends Element>(query: string, group: T) {
    // TODO: need a simple `matches` implementation
    return true;
  }
}
