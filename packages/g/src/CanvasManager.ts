// import { ContainerModule, inject, injectable, interfaces } from 'inversify';
// import { Camera } from './Camera';
// import { bindContributionProvider } from './contribution-provider';
// import { CullingPlugin, CullingStrategy } from './plugins';
// import { DirtyCheckPlugin } from './plugins/renderer/DirtyCheckPlugin';
// import { FrustumCullingStrategy } from './plugins/renderer/FrustumCullingStrategy';
// import { PrepareRendererPlugin } from './plugins/renderer/PrepareRendererPlugin';
// import { SortPlugin } from './plugins/renderer/SortPlugin';
// import { ContextService, RenderingContext, RenderingPluginContribution, RenderingService } from './services';
// import { CanvasConfig, RendererConfig } from './types';

// export const CanvasContainerModule = Symbol('CanvasContainerModule');

// @injectable()
// export class CanvasManager {
//   @inject(ContextService)
//   private contextService: ContextService<unknown>;

//   @inject(RenderingContext)
//   private renderingContext: RenderingContext;

//   @inject(RenderingService)
//   private renderingService: RenderingService;

//   @inject(CanvasConfig)
//   private canvasConfig: CanvasConfig;

//   @inject(Camera)
//   private camera: Camera;

//   constructor(
//     private container: interfaces.Container,
//   ) {}

//   // private container: interfaces.Container;

//   setContainer(container: interfaces.Container) {
//     this.container = container;
//   }

//   getCanvasConfig() {
//     return this.canvasConfig;
//   }

//   getRenderingContext() {
//     return this.renderingContext;
//   }

//   getContextService() {
//     return this.contextService;
//   }

//   getRenderingService() {
//     return this.renderingService;
//   }

//   async init() {
//     this.container.snapshot();

//     this.bindRenderingPlugins();
//     this.bindCanvasContainerModule((this.canvasConfig.renderer as RendererConfig).type);

//     const { width, height } = this.container.get<CanvasConfig>(CanvasConfig);

//     await this.contextService.init();
//     await this.renderingService.init();

//     // init context
//     const contextService = this.container.get<ContextService<unknown>>(ContextService);
//     // default camera
//     const dpr = contextService.getDPR();
//     this.camera
//       .setPosition(0, 0, 1)
//       .setOrthographic((width / -2) * dpr, (width / 2) * dpr, (height / 2) * dpr, (height / -2) * dpr, 0.5, 2);
//   }

//   private bindRenderingPlugins() {
//     // bind global DisplayObject plugins

//     this.container.bind(RenderingService).toSelf().inSingletonScope();

//     bindContributionProvider(this.container, RenderingPluginContribution);

//     this.container.bind(PrepareRendererPlugin).toSelf().inSingletonScope();
//     this.container.bind(RenderingPluginContribution).toService(PrepareRendererPlugin);

//     this.container.bind(DirtyCheckPlugin).toSelf().inSingletonScope();
//     this.container.bind(RenderingPluginContribution).toService(DirtyCheckPlugin);

//     // culling strategies
//     bindContributionProvider(this.container, CullingStrategy);
//     this.container.bind(FrustumCullingStrategy).toSelf().inSingletonScope();
//     this.container.bind(CullingStrategy).toService(FrustumCullingStrategy);
//     this.container.bind(CullingPlugin).toSelf().inSingletonScope();
//     this.container.bind(RenderingPluginContribution).toService(CullingPlugin);
//     this.container.bind(SortPlugin).toSelf().inSingletonScope();
//     this.container.bind(RenderingPluginContribution).toService(SortPlugin);
//   }

//   private bindCanvasContainerModule(renderer: string) {
//     // bind other container modules provided by g-canvas/g-svg/g-webgl
//     const canvasContainerModule = this.container.getNamed<ContainerModule>(CanvasContainerModule, renderer);
//     this.container.load(canvasContainerModule);
//   }
// }
