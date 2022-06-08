import { Contribution, Module } from 'mana-syringe';
import RBush from 'rbush';
import type { RBushNodeAABB } from './components';
import { RBushRoot } from './components';
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

  register({ token: RBushRoot, useValue: new RBush<RBushNodeAABB>() });

  // register built-in rendering plugins
  register(RenderingService);
  register(EventService);
  register(EventPlugin);
  register(PrepareRendererPlugin);
  register(DirtyCheckPlugin);
  register(CullingPlugin);
  register(FrustumCullingStrategy);
});
