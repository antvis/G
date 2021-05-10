import { ContainerModule } from 'inversify';
import { CanvasServiceContribution } from './Canvas';
import { bindContributionProvider } from './contribution-provider';
import { DirtyCheckPlugin } from './plugins/renderer/DirtyCheckPlugin';
import { CullingPlugin, CullingStrategy } from './plugins/renderer/CullingPlugin';
import { SortPlugin } from './plugins/renderer/SortPlugin';
import { PrepareRendererPlugin } from './plugins/renderer/PrepareRendererPlugin';
import { FrustumCullingStrategy } from './plugins/renderer/FrustumCullingStrategy';
import { RenderingPluginContribution, RenderingService } from './services';
import { InteractionPlugin } from './plugins/renderer/InteractionPlugin';

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  // bind global DisplayObject plugins
  // bindContributionProvider(bind, CanvasServiceContribution);

  bind(RenderingService).toSelf().inSingletonScope();
  // bind(CanvasServiceContribution).toService(RenderingService);

  bindContributionProvider(bind, RenderingPluginContribution);

  bind(InteractionPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(InteractionPlugin);

  bind(PrepareRendererPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(PrepareRendererPlugin);

  bind(DirtyCheckPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(DirtyCheckPlugin);

  // culling strategies
  bindContributionProvider(bind, CullingStrategy);
  bind(FrustumCullingStrategy).toSelf().inSingletonScope();
  bind(CullingStrategy).toService(FrustumCullingStrategy);
  bind(CullingPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(CullingPlugin);
  bind(SortPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(SortPlugin);
});
