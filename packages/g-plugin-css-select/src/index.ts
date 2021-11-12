import { RendererPlugin, SceneGraphSelector } from '@antv/g';
import { Module, Syringe } from 'mana-syringe';
import { CSSSceneGraphSelector } from './CSSSceneGraphSelector';
import { SceneGraphAdapter } from './SceneGraphAdapter';

const containerModule = Module((register) => {
  register(SceneGraphAdapter);
  register({ token: SceneGraphSelector, useClass: CSSSceneGraphSelector });
  // if (!container.isBound(SceneGraphAdapter)) {
  //   container.bind(SceneGraphAdapter).toSelf().inSingletonScope();
  //   container.bind(CSSSceneGraphSelector).toSelf().inSingletonScope();
  //   // rebind default SceneGraphSelector to our implementation
  //   container.rebind(SceneGraphSelector).toService(CSSSceneGraphSelector);
  // }
});

export class Plugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.remove(SceneGraphAdapter);
    container.remove(CSSSceneGraphSelector);
  }
}
