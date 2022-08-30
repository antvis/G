import RBush from 'rbush';
import { DependencyContainer } from 'tsyringe';
import type { RBushNodeAABB } from './components';
import { RBushRoot } from './components';
import { CullingPlugin, CullingStrategyContribution } from './plugins/CullingPlugin';
import { DirtyCheckPlugin } from './plugins/DirtyCheckPlugin';
import { EventPlugin } from './plugins/EventPlugin';
import { FrustumCullingStrategy } from './plugins/FrustumCullingStrategy';
import { PrepareRendererPlugin } from './plugins/PrepareRendererPlugin';
import { EventService, RenderingPluginContribution, RenderingService } from './services';

export const loadCanvasContainerModule = (container: DependencyContainer) => {
  // Contribution.register(register, RenderingPluginContribution, { cache: false });
  // culling plugin
  // Contribution.register(register, CullingStrategyContribution, { cache: false });

  container.register(RBushRoot, { useValue: new RBush<RBushNodeAABB>() });

  // register built-in rendering plugins
  container.registerSingleton(RenderingService);
  container.registerSingleton(EventService);

  container.registerSingleton(RenderingPluginContribution, EventPlugin);
  container.registerSingleton(RenderingPluginContribution, PrepareRendererPlugin);
  container.registerSingleton(RenderingPluginContribution, DirtyCheckPlugin);
  container.registerSingleton(RenderingPluginContribution, CullingPlugin);
  container.registerSingleton(CullingStrategyContribution, FrustumCullingStrategy);
};
