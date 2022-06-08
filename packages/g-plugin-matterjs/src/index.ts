import type { DisplayObject, RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
import { MatterJSPlugin } from './MatterJSPlugin';
import { MatterJSPluginOptions } from './tokens';

const containerModule = Module((register) => {
  register(MatterJSPlugin);
});

export class Plugin implements RendererPlugin {
  name = 'matterjs';
  private container: Syringe.Container;

  constructor(private options: Partial<MatterJSPluginOptions>) {}

  init(container: Syringe.Container): void {
    this.container = container;
    container.register(MatterJSPluginOptions, {
      useValue: {
        gravity: [0, 1],
        gravityScale: 0.001,
        timeStep: 1 / 60,
        velocityIterations: 4,
        positionIterations: 6,
        ...this.options,
      },
    });
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.remove(MatterJSPluginOptions);
    container.unload(containerModule);
  }

  applyForce(object: DisplayObject, force: [number, number], point: [number, number]) {
    this.container.get(MatterJSPlugin).applyForce(object, force, point);
  }
}
