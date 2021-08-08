import { Container, ContainerModule } from 'inversify';
import { ContextService, RendererPlugin } from '@antv/g';
import { WebGLContextService } from './WebGLContextService';

const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  /**
   * implements ContextService
   */
  bind(WebGLContextService).toSelf().inSingletonScope();
  bind(ContextService).toService(WebGLContextService);
})

export class ContextRegisterPlugin implements RendererPlugin {
  init(container: Container): void {
    container.load(containerModule);
  }
  destroy(container: Container): void {
    container.unload(containerModule);
  }
}