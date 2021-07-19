import { inject, injectable } from 'inversify';
import { SceneGraphSelector, DisplayObject } from '@antv/g';
import { selectOne, selectAll, is } from 'css-select';
import { SceneGraphAdapter } from './SceneGraphAdapter';

@injectable()
export class CSSSceneGraphSelector implements SceneGraphSelector {
  @inject(SceneGraphAdapter)
  private sceneGraphAdapter: SceneGraphAdapter;

  is(query: string, group: DisplayObject<any>) {
    return is(group, query, { adapter: this.sceneGraphAdapter });
  }

  selectOne(query: string, group: DisplayObject<any>) {
    return selectOne(query, group, { adapter: this.sceneGraphAdapter });
  }

  selectAll(query: string, group: DisplayObject<any>) {
    return selectAll(query, group, { adapter: this.sceneGraphAdapter });
  }
}
