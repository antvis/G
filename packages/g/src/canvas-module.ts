import { ContainerModule } from 'inversify';
import { bindContributionProvider } from './contribution-provider';
import { DirtyCheckPlugin } from './plugins/DirtyCheckPlugin';
import { CullingPlugin, CullingStrategy } from './plugins/CullingPlugin';
import { PrepareRendererPlugin } from './plugins/PrepareRendererPlugin';
import { FrustumCullingStrategy } from './plugins/FrustumCullingStrategy';
import { RenderingPluginContribution, RenderingService } from './services';
import { EventPlugin } from './plugins/EventPlugin';
import { EventService } from './services';

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bind(RenderingService).toSelf().inSingletonScope();

  bindContributionProvider(bind, RenderingPluginContribution);

  bind(EventService).toSelf().inSingletonScope();

  // event plugin
  bind(EventPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(EventPlugin);

  // prerender plugin
  bind(PrepareRendererPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(PrepareRendererPlugin);

  // dirty rectangle plugin
  bind(DirtyCheckPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(DirtyCheckPlugin);

  // culling plugin
  bindContributionProvider(bind, CullingStrategy);
  bind(FrustumCullingStrategy).toSelf().inSingletonScope();
  bind(CullingStrategy).toService(FrustumCullingStrategy);
  bind(CullingPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(CullingPlugin);
});
