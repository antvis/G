import { AbstractRendererPlugin, DefaultSceneGraphSelector, runtime } from '@antv/g-lite';
import { CSSSceneGraphSelector } from './CSSSceneGraphSelector';
import { SceneGraphAdapter } from './SceneGraphAdapter';

export class Plugin extends AbstractRendererPlugin {
  name = 'css-select';
  init(): void {
    runtime.sceneGraphSelector = new CSSSceneGraphSelector(new SceneGraphAdapter());
  }
  destroy(): void {
    runtime.sceneGraphSelector = new DefaultSceneGraphSelector();
  }
}
