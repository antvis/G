import type { IElement, SceneGraphSelector } from '@antv/g-lite';
import { is, selectAll, selectOne } from 'css-select';
import type { SceneGraphAdapter } from './SceneGraphAdapter';

export class CSSSceneGraphSelector implements SceneGraphSelector {
  constructor(private sceneGraphAdapter: SceneGraphAdapter) {}

  is<T extends IElement>(query: string, element: T) {
    return is(element, query, { adapter: this.sceneGraphAdapter });
  }

  selectOne<R extends IElement, T extends IElement>(
    query: string,
    root: R,
  ): T | null {
    return selectOne(query, root, {
      adapter: this.sceneGraphAdapter,
    }) as T | null;
  }

  selectAll<R extends IElement, T extends IElement>(
    query: string,
    root: R,
  ): T[] {
    return selectAll(query, root, { adapter: this.sceneGraphAdapter }) as T[];
  }
}
