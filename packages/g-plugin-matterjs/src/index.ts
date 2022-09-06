import type { DisplayObject } from '@antv/g-lite';
import { AbstractRendererPlugin, Module } from '@antv/g-lite';
import { MatterJSPlugin } from './MatterJSPlugin';
import { MatterJSPluginOptions } from './tokens';

const containerModule = Module((register) => {
  register(MatterJSPlugin);
});

export class Plugin extends AbstractRendererPlugin {
  name = 'matterjs';

  constructor(private options: Partial<MatterJSPluginOptions>) {
    super();
  }

  init(): void {
    this.container.register(MatterJSPluginOptions, {
      useValue: {
        gravity: [0, 1],
        gravityScale: 0.001,
        timeStep: 1 / 60,
        velocityIterations: 4,
        positionIterations: 6,
        ...this.options,
      },
    });
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.remove(MatterJSPluginOptions);
    this.container.unload(containerModule);
  }

  applyForce(object: DisplayObject, force: [number, number], point: [number, number]) {
    this.container.get(MatterJSPlugin).applyForce(object, force, point);
  }
}
