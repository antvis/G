import type { DisplayObject } from '@antv/g-lite';
import { AbstractRendererPlugin } from '@antv/g-lite';
import { Box2DPlugin } from './Box2DPlugin';
import type { Box2DPluginOptions } from './interfaces';

export class Plugin extends AbstractRendererPlugin {
  name = 'box2d';

  constructor(private options: Partial<Box2DPluginOptions>) {
    super();
  }

  init(): void {
    const box2DPluginOptions: Partial<Box2DPluginOptions> = {
      gravity: [0, 100],
      timeStep: 1 / 60,
      velocityIterations: 8,
      positionIterations: 3,
      ...this.options,
    };

    this.addRenderingPlugin(new Box2DPlugin(box2DPluginOptions));
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
