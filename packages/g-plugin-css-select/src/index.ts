import { SceneGraphSelector, container } from '@antv/g';
import { ContainerModule } from 'inversify';
import { CSSSceneGraphSelector } from './CSSSceneGraphSelector';
import { SceneGraphAdapter } from './SceneGraphAdapter';

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bind(SceneGraphAdapter).toSelf().inSingletonScope();
  bind(CSSSceneGraphSelector).toSelf().inSingletonScope();

  // rebind default SceneGraphSelector to our implementation
  container.rebind(SceneGraphSelector).to(CSSSceneGraphSelector);
});
