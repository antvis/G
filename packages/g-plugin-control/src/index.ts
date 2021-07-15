import { RenderingPluginContribution } from '@antv/g';
import { ContainerModule } from 'inversify';
import { ControlPlugin } from './ControlPlugin';

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bind(ControlPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(ControlPlugin);
});
