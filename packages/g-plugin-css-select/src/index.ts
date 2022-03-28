import type { RendererPlugin } from '@antv/g';
import { DefaultSceneGraphSelector, globalContainer } from '@antv/g';
import type { Syringe } from 'mana-syringe';
import { CSSSceneGraphSelector } from './CSSSceneGraphSelector';
import { SceneGraphAdapter } from './SceneGraphAdapter';

export class Plugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    if (globalContainer.isBound(DefaultSceneGraphSelector)) {
      globalContainer.remove(DefaultSceneGraphSelector);
    }
    globalContainer.register(SceneGraphAdapter);
    globalContainer.register(CSSSceneGraphSelector);
  }
  destroy(container: Syringe.Container): void {
    globalContainer.remove(CSSSceneGraphSelector);
    globalContainer.remove(SceneGraphAdapter);
    if (!globalContainer.isBound(DefaultSceneGraphSelector)) {
      globalContainer.register(DefaultSceneGraphSelector);
    }
  }
}
