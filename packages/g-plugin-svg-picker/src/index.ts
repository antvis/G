import { RenderingPluginContribution } from '@antv/g';
import { ContainerModule } from 'inversify';
import { SVGPickerPlugin } from './SVGPickerPlugin';

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bind(SVGPickerPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(SVGPickerPlugin);
});
