import { Module, Contribution, Syringe } from 'mana-syringe';
import { DirtyCheckPlugin } from './plugins/DirtyCheckPlugin';
import { CullingPlugin, CullingStrategyContribution } from './plugins/CullingPlugin';
import { PrepareRendererPlugin } from './plugins/PrepareRendererPlugin';
import { FrustumCullingStrategy } from './plugins/FrustumCullingStrategy';
import { RenderingPluginContribution, RenderingService } from './services';
import { EventPlugin } from './plugins/EventPlugin';
import { EventService } from './services';

export const containerModule = Module((register) => {
  Contribution.register(register, RenderingPluginContribution);
  // culling plugin
  Contribution.register(register, CullingStrategyContribution);

  register(RenderingService);
  register(EventService);

  register(EventPlugin);
  register(PrepareRendererPlugin);
  register(DirtyCheckPlugin);
  register(CullingPlugin);

  register(FrustumCullingStrategy);
});

export function unload(container: Syringe.Container) {
  container.remove(RenderingPluginContribution);
  container.remove(CullingStrategyContribution);

  container.remove(RenderingService);
  container.remove(EventService);

  container.remove(EventPlugin);
  container.remove(PrepareRendererPlugin);
  container.remove(DirtyCheckPlugin);
  container.remove(CullingPlugin);
  container.remove(FrustumCullingStrategy);
}
