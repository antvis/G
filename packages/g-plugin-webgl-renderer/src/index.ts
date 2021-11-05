// tslint:disable-next-line:no-reference
/// <reference path="./glsl.d.ts" />
/// <reference path="../../../node_modules/@webgpu/types/dist/index.d.ts" />
import { Camera, container, RenderingPluginContribution, RendererPlugin, SHAPE } from '@antv/g';
import { World } from '@antv/g-ecs';
import { ContainerModule, Container, interfaces } from 'inversify';
import { Renderable3D } from './components/Renderable3D';
import { PickingIdGenerator } from './PickingIdGenerator';
import { PickingPlugin } from './PickingPlugin';
// import { DefaultShaderModuleService, ShaderModuleService } from './services/shader-module';
import { rgb2arr } from './utils/color';
// import TAAPass from './passes/TAAPass';
import { RenderGraphPlugin } from './RenderGraphPlugin';
import { WebGLRendererPluginOptions } from './interfaces';
import { RenderHelper } from './render/RenderHelper';
import {
  RendererFactory,
  ShapeRenderer,
  Batch,
  AttributeLocation,
  CircleRenderer,
  ImageRenderer,
  TextRenderer,
  LineRenderer,
  InstancedLineRenderer,
} from './drawcall';
import { TexturePool } from './TexturePool';
import { GlyphManager } from './drawcall/symbol/GlyphManager';

const world = container.get(World);
world.registerComponent(Renderable3D);

let bindFunc: interfaces.Bind;

// export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
//   bindFunc = bind;
//   /**
//    * texture pool should be clean when renderer destroyed
//    */
//   bind(ResourcePool).toSelf().inSingletonScope();
//   bind(PickingIdGenerator).toSelf().inSingletonScope();
//   bind(TexturePool).toSelf().inSingletonScope();
//   bind(GlyphManager).toSelf().inSingletonScope();

//   bind(DefaultShaderModuleService).toSelf().inSingletonScope();
//   bind(ShaderModuleService).toService(DefaultShaderModuleService);

//   /**
//    * bind model builder for each kind of Shape
//    */
//   bind(ModelBuilder).to(CircleModelBuilder).inSingletonScope().whenTargetNamed(SHAPE.Circle);
//   bind(ModelBuilder).to(CircleModelBuilder).inSingletonScope().whenTargetNamed(SHAPE.Ellipse);
//   bind(ModelBuilder).to(CircleModelBuilder).inSingletonScope().whenTargetNamed(SHAPE.Rect);
//   bind(ModelBuilder).to(ImageModelBuilder).inSingletonScope().whenTargetNamed(SHAPE.Image);
//   bind(ModelBuilder).to(LineModelBuilder).inSingletonScope().whenTargetNamed(SHAPE.Line);
//   bind(ModelBuilder).to(LineModelBuilder).inSingletonScope().whenTargetNamed(SHAPE.Polyline);
//   bind(ModelBuilder).to(TextModelBuilder).inSingletonScope().whenTargetNamed(SHAPE.Text);
//   bind<interfaces.Factory<ModelBuilder | null>>(ModelBuilderFactory).toFactory<ModelBuilder | null>(
//     (context: interfaces.Context) => {
//       return (tagName: SHAPE) => {
//         if (context.container.isBoundNamed(ModelBuilder, tagName)) {
//           return context.container.getNamed(ModelBuilder, tagName);
//         }
//         return null;
//       };
//     },
//   );

//   /**
//    * bind rendering engine
//    */
//   bind(WebGLEngine).toSelf().inSingletonScope();
//   bind(RenderingEngine).toService(WebGLEngine);

//   /**
//    * bind render passes
//    */
//   bind<IRenderPass<any>>(IRenderPass)
//     .to(RenderPass)
//     .inSingletonScope()
//     .whenTargetNamed(RenderPass.IDENTIFIER);
//   bind<IRenderPass<any>>(IRenderPass)
//     .to(CopyPass)
//     .inSingletonScope()
//     .whenTargetNamed(CopyPass.IDENTIFIER);
//   bind<IRenderPass<any>>(IRenderPass)
//     // @ts-ignore
//     .to(TAAPass)
//     .inSingletonScope()
//     .whenTargetNamed(TAAPass.IDENTIFIER);
//   bind<interfaces.Factory<IRenderPass<any>>>(RenderPassFactory).toFactory<IRenderPass<any>>(
//     (context: interfaces.Context) => {
//       return (name: string) => {
//         return context.container.getNamed(IRenderPass, name);
//       };
//     },
//   );

//   bind(View).toSelf().inSingletonScope();

//   /**
//    * bind handlers when frame began
//    */
//   // bind(FrameGraphEngine).toSelf().inSingletonScope();

//   // bind(FrameGraphPlugin).toSelf().inSingletonScope();
//   // bind(RenderingPluginContribution).toService(FrameGraphPlugin);
// });

// export interface WebGLRenderingContext {
//   engine: RenderingEngine;
//   camera: Camera;
//   view: IView;
// }

export function registerModelBuilder(builderClazz: new (...args: any[]) => Batch, name: string) {
  bindFunc(ShapeRenderer).to(builderClazz).inSingletonScope().whenTargetNamed(name);
}

export {
  Renderable3D,
  Batch,
  AttributeLocation,
  // ShaderModuleService,
  // ModelBuilder,
  TexturePool,
  rgb2arr,
  RenderGraphPlugin,
};

export * from './platform';
export * from './render';

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  bindFunc = bind;
  bind(RenderHelper).toSelf().inSingletonScope();

  bind(TexturePool).toSelf().inSingletonScope();
  bind(GlyphManager).toSelf();
  bind(PickingIdGenerator).toSelf().inSingletonScope();

  bind(RenderGraphPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(RenderGraphPlugin);

  bind(PickingPlugin).toSelf().inSingletonScope();
  bind(RenderingPluginContribution).toService(PickingPlugin);

  /**
   * bind model builder for each kind of Shape
   */
  bind(ShapeRenderer).to(CircleRenderer).whenTargetNamed(SHAPE.Circle);
  bind(ShapeRenderer).to(CircleRenderer).whenTargetNamed(SHAPE.Ellipse);
  bind(ShapeRenderer).to(CircleRenderer).whenTargetNamed(SHAPE.Rect);
  bind(ShapeRenderer).to(ImageRenderer).whenTargetNamed(SHAPE.Image);
  bind(ShapeRenderer).to(InstancedLineRenderer).whenTargetNamed(SHAPE.Line);
  bind(ShapeRenderer).to(InstancedLineRenderer).whenTargetNamed(SHAPE.Polyline);
  bind(ShapeRenderer).to(LineRenderer).whenTargetNamed(SHAPE.Path);
  bind(ShapeRenderer).to(LineRenderer).whenTargetNamed(SHAPE.Polygon);
  bind(ShapeRenderer).to(TextRenderer).whenTargetNamed(SHAPE.Text);
  bind<interfaces.Factory<Batch | null>>(RendererFactory).toFactory<Batch | null>(
    (context: interfaces.Context) => {
      return (tagName: SHAPE) => {
        if (context.container.isBoundNamed(ShapeRenderer, tagName)) {
          return context.container.getNamed(ShapeRenderer, tagName);
        }
        return null;
      };
    },
  );
});

export class Plugin implements RendererPlugin {
  constructor(private options?: Partial<WebGLRendererPluginOptions>) {}

  init(container: Container): void {
    container
      .bind<Partial<WebGLRendererPluginOptions>>(WebGLRendererPluginOptions)
      .toConstantValue({
        targets: [
          // 'webgpu',
          'webgl2',
          'webgl1',
        ],
        ...this.options,
      });
    container.load(containerModule);
  }
  destroy(container: Container): void {
    container.unload(containerModule);
  }
}

export * from './platform';
