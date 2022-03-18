import { Module, Contribution } from 'mana-syringe';
import { DirtyCheckPlugin } from './plugins/DirtyCheckPlugin';
import { CullingPlugin, CullingStrategyContribution } from './plugins/CullingPlugin';
import { PrepareRendererPlugin } from './plugins/PrepareRendererPlugin';
// import { CSSCalculatorPlugin } from './plugins/CSSStyleCalculator';
import { FrustumCullingStrategy } from './plugins/FrustumCullingStrategy';
import { RenderingPluginContribution, RenderingService } from './services';
import { EventPlugin } from './plugins/EventPlugin';
import { EventService } from './services';

export const containerModule = Module((register) => {
  Contribution.register(register, RenderingPluginContribution, { cache: false });
  // culling plugin
  Contribution.register(register, CullingStrategyContribution, { cache: false });

  // register built-in rendering plugins
  register(RenderingService);
  register(EventService);
  register(EventPlugin);
  register(PrepareRendererPlugin);
  // register(CSSCalculatorPlugin);
  register(DirtyCheckPlugin);
  register(CullingPlugin);
  register(FrustumCullingStrategy);
});
