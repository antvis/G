import { RendererPlugin, RenderingPluginContribution } from '@antv/g';
import { Container, ContainerModule } from 'inversify';
import { DOMInteractionPlugin } from './DOMInteractionPlugin';

const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bind(DOMInteractionPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(DOMInteractionPlugin);
});

export class Plugin implements RendererPlugin {
  init(container: Container): void {
    container.load(containerModule);
  }
  destroy(container: Container): void {
    container.unload(containerModule);
  }
}
