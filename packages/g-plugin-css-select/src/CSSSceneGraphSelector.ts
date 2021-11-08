import { inject, singleton } from 'mana-syringe';
import { SceneGraphSelector, IElement } from '@antv/g';
import { selectOne, selectAll, is } from 'css-select';
import { SceneGraphAdapter } from './SceneGraphAdapter';

@singleton()
export class CSSSceneGraphSelector implements SceneGraphSelector {
  @inject(SceneGraphAdapter)
  private sceneGraphAdapter: SceneGraphAdapter;

  is<T extends IElement>(query: string, element: T) {
    return is(element, query, { adapter: this.sceneGraphAdapter });
  }

  selectOne<R extends IElement, T extends IElement>(query: string, root: R): T | null {
    return selectOne(query, root, { adapter: this.sceneGraphAdapter }) as T | null;
  }

  selectAll<R extends IElement, T extends IElement>(query: string, root: R): T[] {
    return selectAll(query, root, { adapter: this.sceneGraphAdapter }) as T[];
  }
}
