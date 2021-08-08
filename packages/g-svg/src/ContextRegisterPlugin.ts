import { Container, ContainerModule } from 'inversify';
import { ContextService, RendererPlugin } from '@antv/g';
import { SVGContextService } from './SVGContextService';

const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  /**
   * implements ContextService
   */
  bind(SVGContextService).toSelf().inSingletonScope();
  bind(ContextService).toService(SVGContextService);
})

export class ContextRegisterPlugin implements RendererPlugin {
  init(container: Container): void {
    container.load(containerModule);
  }
  destroy(container: Container): void {
    container.unload(containerModule);
  }
}