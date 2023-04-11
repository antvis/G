import type { DisplayObject } from '@antv/g-lite';
import { AbstractRendererPlugin } from '@antv/g-lite';
import { MatterJSPlugin } from './MatterJSPlugin';
import type { MatterJSPluginOptions } from './interfaces';

export class Plugin extends AbstractRendererPlugin {
  name = 'matterjs';

  constructor(private options: Partial<MatterJSPluginOptions>) {
    super();
  }

  init(): void {
    this.addRenderingPlugin(
      new MatterJSPlugin({
        gravity: [0, 1],
        gravityScale: 0.001,
        timeStep: 1 / 60,
        velocityIterations: 4,
        positionIterations: 6,
        ...this.options,
      } as MatterJSPluginOptions),
    );
  }
  destroy(): void {
    this.removeAllRenderingPlugins();
  }

  applyForce(
    object: DisplayObject,
    force: [number, number],
    point: [number, number],
  ) {
    this.plugins[0].applyForce(object, force, point);
  }
}
