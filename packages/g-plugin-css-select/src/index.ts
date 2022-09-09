import { AbstractRendererPlugin, DefaultSceneGraphSelector, GlobalContainer } from '@antv/g-lite';
import { CSSSceneGraphSelector } from './CSSSceneGraphSelector';
import { SceneGraphAdapter } from './SceneGraphAdapter';

export class Plugin extends AbstractRendererPlugin {
  name = 'css-select';
  init(): void {
    if (GlobalContainer.isBound(DefaultSceneGraphSelector)) {
      GlobalContainer.remove(DefaultSceneGraphSelector);
    }
    GlobalContainer.register(SceneGraphAdapter);
    GlobalContainer.register(CSSSceneGraphSelector);
  }
  destroy(): void {
    GlobalContainer.remove(CSSSceneGraphSelector);
    GlobalContainer.remove(SceneGraphAdapter);
    if (!GlobalContainer.isBound(DefaultSceneGraphSelector)) {
      GlobalContainer.register(DefaultSceneGraphSelector);
    }
  }
}
