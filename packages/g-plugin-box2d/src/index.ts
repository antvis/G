import type { DisplayObject, RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
import { Box2DPlugin } from './Box2DPlugin';
import { Box2DPluginOptions } from './tokens';

const containerModule = Module((register) => {
  register(Box2DPlugin);
});

export class Plugin implements RendererPlugin {
  name = 'box2d';
  private container: Syringe.Container;

  constructor(private options: Partial<Box2DPluginOptions>) {}

  init(container: Syringe.Container): void {
    this.container = container;
    container.register(Box2DPluginOptions, {
      useValue: {
        gravity: [0, 100],
        timeStep: 1 / 60,
        velocityIterations: 8,
        positionIterations: 3,
        ...this.options,
      },
    });
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.remove(Box2DPluginOptions);
    container.unload(containerModule);
  }

  applyForce(object: DisplayObject, force: [number, number], point: [number, number]) {
    this.container.get(Box2DPlugin).applyForce(object, force, point);
  }
}
