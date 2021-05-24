import { AbstractRenderer, RendererConfig, ContextService } from '@antv/g';
import { ContainerModule } from 'inversify';
import { containerModule as domInteractionModule } from '@antv/g-plugin-dom-interaction';
import { containerModule as webglRendererModule } from '@antv/g-plugin-webgl-renderer';
import { WebGLContextService } from './WebGLContextService';

export class Renderer extends AbstractRenderer {
  constructor(config: RendererConfig) {
    super(config);

    this.registerPlugin(
      new ContainerModule((bind, unbind, isBound, rebind) => {
        /**
         * implements ContextService
         */
        bind(WebGLContextService).toSelf().inSingletonScope();
        bind(ContextService).toService(WebGLContextService);
      })
    );
    this.registerPlugin(webglRendererModule);
    this.registerPlugin(domInteractionModule);
  }
}
