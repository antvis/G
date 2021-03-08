import { Canvas as BaseCanvas, ContextService } from '@antv/g-core';
import { ContainerModule } from 'inversify';
import { MockContext } from './MockContext';

const module = new ContainerModule((bind) => {
  bind(MockContext).toSelf().inSingletonScope();
  bind(ContextService).toService(MockContext);
});

export class MockCanvas extends BaseCanvas {
  loadModule() {
    this.container.load(module);
  }
}
