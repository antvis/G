import { RenderingPluginContribution, RendererPlugin } from '@antv/g';
import { ContainerModule, Container } from 'inversify';
import { ControlPlugin } from './ControlPlugin';

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bind(ControlPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(ControlPlugin);
});

export class Plugin implements RendererPlugin {
  init(container: Container): void {
    container.load(containerModule);
  }
  destroy(container: Container): void {
    container.unload(containerModule);
  }
}