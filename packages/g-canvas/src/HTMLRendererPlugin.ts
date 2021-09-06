import { Container, ContainerModule } from 'inversify';
import { ContextService, RendererPlugin, SHAPE } from '@antv/g';
import { registerStyleRenderer } from '@antv/g-plugin-canvas-renderer';
import { Canvas2DContextService } from './Canvas2DContextService';
import { HTMLRenderer } from './HTMLRenderer';

const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  registerStyleRenderer(SHAPE.HTML, HTMLRenderer);
});

export class HTMLRendererPlugin implements RendererPlugin {
  init(container: Container): void {
    container.load(containerModule);
  }
  destroy(container: Container): void {
    container.unload(containerModule);
  }
}
