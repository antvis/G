import { inject, injectable } from 'inversify';
import { SceneGraphSelector, Element } from '@antv/g';
import { selectOne, selectAll, is } from 'css-select';
import { SceneGraphAdapter } from './SceneGraphAdapter';

@injectable()
export class CSSSceneGraphSelector implements SceneGraphSelector {
  @inject(SceneGraphAdapter)
  private sceneGraphAdapter: SceneGraphAdapter;

  is<T extends Element>(query: string, group: T) {
    return is(group, query, { adapter: this.sceneGraphAdapter });
  }

  selectOne<T extends Element>(query: string, group: T): T | null {
    return selectOne(query, group, { adapter: this.sceneGraphAdapter }) as T | null;
  }

  selectAll<T extends Element>(query: string, group: T): T[] {
    return selectAll(query, group, { adapter: this.sceneGraphAdapter }) as T[];
  }
}
