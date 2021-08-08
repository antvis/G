import { Container, ContainerModule } from 'inversify';
import { ContextService, RendererPlugin } from '@antv/g';
import { Canvas2DContextService } from './Canvas2DContextService';

const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  /**
   * implements ContextService
   */
  bind(Canvas2DContextService).toSelf().inSingletonScope();
  bind(ContextService).toService(Canvas2DContextService);
})

export class ContextRegisterPlugin implements RendererPlugin {
  init(container: Container): void {
    container.load(containerModule);
  }
  destroy(container: Container): void {
    container.unload(containerModule);
  }
}