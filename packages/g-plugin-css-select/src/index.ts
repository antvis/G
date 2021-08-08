import { RendererPlugin, SceneGraphSelector, container } from '@antv/g';
import { ContainerModule, Container } from 'inversify';
import { CSSSceneGraphSelector } from './CSSSceneGraphSelector';
import { SceneGraphAdapter } from './SceneGraphAdapter';

const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (!container.isBound(SceneGraphAdapter)) {
    container.bind(SceneGraphAdapter).toSelf().inSingletonScope();
    container.bind(CSSSceneGraphSelector).toSelf().inSingletonScope();
    // rebind default SceneGraphSelector to our implementation
    container.rebind(SceneGraphSelector).toService(CSSSceneGraphSelector);
  }
});

export class Plugin implements RendererPlugin {
  init(container: Container): void {
    container.load(containerModule);
  }
  destroy(container: Container): void {
    container.unload(containerModule);
  }
}
