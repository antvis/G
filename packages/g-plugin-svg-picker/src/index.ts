import { RenderingPluginContribution, RendererPlugin } from '@antv/g';
import { ContainerModule, Container } from 'inversify';
import { SVGPickerPlugin } from './SVGPickerPlugin';

const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bind(SVGPickerPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(SVGPickerPlugin);
});

export class Plugin implements RendererPlugin {
  init(container: Container): void {
    container.load(containerModule);
  }
  destroy(container: Container): void {
    container.unload(containerModule);
  }
}