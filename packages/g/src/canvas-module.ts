import { Contribution, Module } from 'mana-syringe';
import { CullingPlugin, CullingStrategyContribution } from './plugins/CullingPlugin';
import { DirtyCheckPlugin } from './plugins/DirtyCheckPlugin';
import { EventPlugin } from './plugins/EventPlugin';
import { FrustumCullingStrategy } from './plugins/FrustumCullingStrategy';
import { PrepareRendererPlugin } from './plugins/PrepareRendererPlugin';
import { EventService, RenderingPluginContribution, RenderingService } from './services';

export const containerModule = Module((register) => {
  Contribution.register(register, RenderingPluginContribution, { cache: false });
  // culling plugin
  Contribution.register(register, CullingStrategyContribution, { cache: false });

  // register built-in rendering plugins
  register(RenderingService);
  register(EventService);
  register(EventPlugin);
  register(PrepareRendererPlugin);
  register(DirtyCheckPlugin);
  register(CullingPlugin);
  register(FrustumCullingStrategy);
});
