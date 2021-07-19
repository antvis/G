import { injectable } from 'inversify';
import { SceneGraphNode } from '../components';
import { DisplayObject } from '../DisplayObject';

export const SceneGraphSelectorFactory = Symbol('SceneGraphSelectorFactory');
export const SceneGraphSelector = Symbol('SceneGraphSelector');
export interface SceneGraphSelector {
  selectOne(query: string, object: DisplayObject<any>): DisplayObject<any> | null;
  selectAll(query: string, object: DisplayObject<any>): DisplayObject<any>[];
  is(query: string, group: DisplayObject<any>): boolean;
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
  selectOne(query: string, object: DisplayObject<any>) {
    if (query.startsWith('#')) {
      // getElementById('id')
      // TODO: should include itself?
      return object.find(
        (node) => node.getEntity().getComponent(SceneGraphNode).id === query.substring(1),
      );
    }
    return null;
  }

  selectAll(query: string, object: DisplayObject<any>) {
    // TODO: only support `[name="${name}"]` `.className`
    if (query.startsWith('.')) {
      // getElementsByClassName('className');
      // TODO: should include itself?
      return object.findAll(
        (node: DisplayObject<any>) => node.getEntity().getComponent(SceneGraphNode).class === query.substring(1),
      );
    } else if (query.startsWith('[name=')) {
      // getElementsByName();
      return object.findAll(
        (node: DisplayObject<any>) => node.name === query.substring(7, query.length - 2),
      );
    } else {
      // getElementsByTag('circle');
      return object.findAll((node) => node.nodeType === query);
    }
  }

  is(query: string, group: DisplayObject<any>) {
    // TODO: need a simple `matches` implementation
    return true;
  }
}
