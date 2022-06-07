import type { RendererPlugin, Syringe } from '@antv/g';
import { DefaultSceneGraphSelector, GlobalContainer } from '@antv/g';
import { CSSSceneGraphSelector } from './CSSSceneGraphSelector';
import { SceneGraphAdapter } from './SceneGraphAdapter';

export class Plugin implements RendererPlugin {
  name = 'css-select';
  init(container: Syringe.Container): void {
    if (GlobalContainer.isBound(DefaultSceneGraphSelector)) {
      GlobalContainer.remove(DefaultSceneGraphSelector);
    }
    GlobalContainer.register(SceneGraphAdapter);
    GlobalContainer.register(CSSSceneGraphSelector);
  }
  destroy(container: Syringe.Container): void {
    GlobalContainer.remove(CSSSceneGraphSelector);
    GlobalContainer.remove(SceneGraphAdapter);
    if (!GlobalContainer.isBound(DefaultSceneGraphSelector)) {
      GlobalContainer.register(DefaultSceneGraphSelector);
    }
  }
}
