import type { DisplayObject } from '@antv/g-lite';
import { AbstractRendererPlugin, Module } from '@antv/g-lite';
import { Box2DPlugin } from './Box2DPlugin';
import { Box2DPluginOptions } from './tokens';

const containerModule = Module((register) => {
  register(Box2DPlugin);
});

export class Plugin extends AbstractRendererPlugin {
  name = 'box2d';

  constructor(private options: Partial<Box2DPluginOptions>) {
    super();
  }

  init(): void {
    this.container.register(Box2DPluginOptions, {
      useValue: {
        gravity: [0, 100],
        timeStep: 1 / 60,
        velocityIterations: 8,
        positionIterations: 3,
        ...this.options,
      },
    });
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.remove(Box2DPluginOptions);
    this.container.unload(containerModule);
  }

  applyForce(object: DisplayObject, force: [number, number], point: [number, number]) {
    this.container.get(Box2DPlugin).applyForce(object, force, point);
  }
}
