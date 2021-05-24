import { inject, injectable } from 'inversify';
import { SceneGraphSelector, DisplayObject } from '@antv/g';
import { selectOne, selectAll } from 'css-select';
import { SceneGraphAdapter } from './SceneGraphAdapter';

@injectable()
export class CSSSceneGraphSelector implements SceneGraphSelector {
  @inject(SceneGraphAdapter)
  private sceneGraphAdapter: SceneGraphAdapter;

  selectOne(query: string, group: DisplayObject) {
    return selectOne(query, group, { adapter: this.sceneGraphAdapter });
  }

  selectAll(query: string, group: DisplayObject) {
    return selectAll(query, group, { adapter: this.sceneGraphAdapter });
  }
}
