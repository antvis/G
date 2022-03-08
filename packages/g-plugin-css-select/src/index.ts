import { RendererPlugin } from '@antv/g';
import { Module, Syringe } from 'mana-syringe';
import { CSSSceneGraphSelector } from './CSSSceneGraphSelector';
import { SceneGraphAdapter } from './SceneGraphAdapter';

const containerModule = Module((register) => {
  register(SceneGraphAdapter);
  register(CSSSceneGraphSelector);
});

export class Plugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
