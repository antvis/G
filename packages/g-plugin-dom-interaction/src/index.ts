import { RenderingPluginContribution } from '@antv/g';
import { ContainerModule } from 'inversify';
import { DOMInteractionPlugin } from './DOMInteractionPlugin';

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bind(DOMInteractionPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(DOMInteractionPlugin);
});
