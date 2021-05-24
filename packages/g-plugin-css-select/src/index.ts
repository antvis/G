import { SceneGraphSelector } from '@antv/g';
import { ContainerModule } from 'inversify';
import { CSSSceneGraphSelector } from './CSSSceneGraphSelector';
import { SceneGraphAdapter } from './SceneGraphAdapter';

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bind(SceneGraphAdapter).toSelf().inSingletonScope();
  bind(CSSSceneGraphSelector).toSelf().inSingletonScope();
  bind(SceneGraphSelector).to(CSSSceneGraphSelector);
});
