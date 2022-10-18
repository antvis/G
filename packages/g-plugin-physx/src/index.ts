import { AbstractRendererPlugin } from '@antv/g-lite';
import { PhysXPlugin } from './PhysXPlugin';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PhysXPluginOptions {}

export class Plugin extends AbstractRendererPlugin {
  name = 'physx';
  constructor(private options: Partial<PhysXPluginOptions>) {
    super();
  }

  init(): void {
    this.addRenderingPlugin(new PhysXPlugin());
  }
  destroy(): void {
    this.removeAllRenderingPlugins();
  }
}
