import { Container, ContainerModule } from 'inversify';
import { RendererPlugin, RenderingPluginContribution } from '@antv/g';
import { HTMLRenderingPlugin } from './HTMLRenderingPlugin';

const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bind(HTMLRenderingPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(HTMLRenderingPlugin);
});

export class Plugin implements RendererPlugin {
  init(container: Container): void {
    container.load(containerModule);
  }
  destroy(container: Container): void {
    container.unload(containerModule);
  }
}
