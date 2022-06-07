import type { RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
import { ElementSVG } from './components/ElementSVG';
import { DefaultCreateElementContribution } from './DefaultCreateElementContribution';
import { SVGRendererPlugin } from './SVGRendererPlugin';

export * from './DefaultCreateElementContribution';
export * from './shapes/paths';
export * from './SVGRendererPlugin';
export * from './tokens';
export * from './utils/dom';
export { ElementSVG };

export const containerModule = Module((register) => {
  register(DefaultCreateElementContribution);
  register(SVGRendererPlugin);
});

export class Plugin implements RendererPlugin {
  name = 'svg-renderer';
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
