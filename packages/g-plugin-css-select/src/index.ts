import { SceneGraphSelector, container } from '@antv/g';
import { ContainerModule } from 'inversify';
import { CSSSceneGraphSelector } from './CSSSceneGraphSelector';
import { SceneGraphAdapter } from './SceneGraphAdapter';

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (!container.isBound(SceneGraphAdapter)) {
    container.bind(SceneGraphAdapter).toSelf().inSingletonScope();
    container.bind(CSSSceneGraphSelector).toSelf().inSingletonScope();
    // rebind default SceneGraphSelector to our implementation
    container.rebind(SceneGraphSelector).toService(CSSSceneGraphSelector);
  }
});
