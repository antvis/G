import { DefaultSceneGraphSelector, RendererPlugin, globalContainer } from '@antv/g';
import { Module, Syringe } from 'mana-syringe';
import { CSSSceneGraphSelector } from './CSSSceneGraphSelector';
import { SceneGraphAdapter } from './SceneGraphAdapter';

// const containerModule = Module((register) => {
//   register(SceneGraphAdapter);
//   register(CSSSceneGraphSelector);
// });

export class Plugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    globalContainer.remove(DefaultSceneGraphSelector);
    // container.load(containerModule, true);
    globalContainer.register(SceneGraphAdapter);
    globalContainer.register(CSSSceneGraphSelector);
  }
  destroy(container: Syringe.Container): void {
    globalContainer.remove(CSSSceneGraphSelector);
    globalContainer.remove(SceneGraphAdapter);
    globalContainer.register(DefaultSceneGraphSelector);
    // container.unload(containerModule);
  }
}
