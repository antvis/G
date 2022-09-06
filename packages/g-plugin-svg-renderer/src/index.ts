import { AbstractRendererPlugin, Module } from '@antv/g-lite';
import { ElementSVG } from './components/ElementSVG';
import { DefaultElementLifeCycleContribution } from './DefaultElementLifeCycleContribution';
import { DefElementManager } from './shapes/defs';
import { SVGRendererPlugin } from './SVGRendererPlugin';

export * from './DefaultElementLifeCycleContribution';
export * from './shapes/paths';
export * from './SVGRendererPlugin';
export * from './tokens';
export * from './utils/dom';
export { ElementSVG };

export const containerModule = Module((register) => {
  register(DefElementManager);
  register(DefaultElementLifeCycleContribution);
  register(SVGRendererPlugin);
});

export class Plugin extends AbstractRendererPlugin {
  name = 'svg-renderer';
  init(): void {
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.unload(containerModule);
  }
}
