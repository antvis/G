import {
  AbstractRendererPlugin,
  DefaultSceneGraphSelector,
  GlobalRuntime,
} from '@antv/g-lite';
import { CSSSceneGraphSelector } from './CSSSceneGraphSelector';
import { SceneGraphAdapter } from './SceneGraphAdapter';

export class Plugin extends AbstractRendererPlugin {
  name = 'css-select';
  init(runtime: GlobalRuntime): void {
    runtime.sceneGraphSelector = new CSSSceneGraphSelector(
      new SceneGraphAdapter(),
    );
  }
  destroy(runtime: GlobalRuntime): void {
    runtime.sceneGraphSelector = new DefaultSceneGraphSelector();
  }
}
