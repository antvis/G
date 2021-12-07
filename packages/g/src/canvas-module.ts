import { Module, Contribution } from 'mana-syringe';
import { DirtyCheckPlugin } from './plugins/DirtyCheckPlugin';
import { CullingPlugin, CullingStrategyContribution } from './plugins/CullingPlugin';
import { PrepareRendererPlugin } from './plugins/PrepareRendererPlugin';
import { FrustumCullingStrategy } from './plugins/FrustumCullingStrategy';
import { RenderingPluginContribution, RenderingService } from './services';
import { EventPlugin } from './plugins/EventPlugin';
import { EventService } from './services';

export const containerModule = Module((register, context) => {
  if (context.container.isBound(RenderingService)) {
    // remove rendering plugins
    context.container.remove(RenderingPluginContribution);
    context.container.remove(RenderingService);
    context.container.remove(FrustumCullingStrategy);
  } else {
    Contribution.register(register, RenderingPluginContribution, { cache: false });
    // culling plugin
    Contribution.register(register, CullingStrategyContribution, { cache: false });
  }

  // register built-in rendering plugins
  register(RenderingService);
  register(EventService);
  register(EventPlugin);
  register(PrepareRendererPlugin);
  register(DirtyCheckPlugin);
  register(CullingPlugin);
  register(FrustumCullingStrategy);
});
