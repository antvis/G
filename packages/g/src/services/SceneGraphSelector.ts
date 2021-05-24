import { injectable } from 'inversify';
import { SceneGraphNode } from '../components';
import { DisplayObject } from '../DisplayObject';

export const SceneGraphSelector = Symbol('SceneGraphSelector');
export interface SceneGraphSelector {
  selectOne(query: string, object: DisplayObject): DisplayObject | null;
  selectAll(query: string, object: DisplayObject): DisplayObject[];
}

@injectable()
export class DefaultSceneGraphSelector implements SceneGraphSelector {
  selectOne(query: string, object: DisplayObject) {
    if (query.startsWith('#')) {
      // getElementById('#id')
      // TODO: should include itself?
      return object.find((node) => node.getEntity().getComponent(SceneGraphNode).id === query.substring(1));
    }
    return null;
  }

  selectAll(query: string, object: DisplayObject) {
    // TODO: only support `[name="${name}"]` `.className`
    if (query.startsWith('.')) {
      // getElementsByClassName('.className');
      // TODO: should include itself?
      return object.findAll((node) => node.getEntity().getComponent(SceneGraphNode).class === query.substring(1));
      // } else if () {
    } else {
      // getElementsByTag('circle');
      return object.findAll((node) => node.nodeType === query);
    }
  }
}
