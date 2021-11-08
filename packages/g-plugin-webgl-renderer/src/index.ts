// tslint:disable-next-line:no-reference
/// <reference path="./glsl.d.ts" />
/// <reference path="../../../node_modules/@webgpu/types/dist/index.d.ts" />
import { Camera, world, RendererPlugin, SHAPE } from '@antv/g';
import { Module, Syringe } from 'mana-syringe';
import { Renderable3D } from './components/Renderable3D';
import { PickingIdGenerator } from './PickingIdGenerator';
import { PickingPlugin } from './PickingPlugin';
// import { DefaultShaderModuleService, ShaderModuleService } from './services/shader-module';
import { rgb2arr } from './utils/color';
import { RenderGraphPlugin } from './RenderGraphPlugin';
import { WebGLRendererPluginOptions } from './interfaces';
import { RenderHelper } from './render/RenderHelper';
import {
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
import { RendererFactory, ShapeRenderer } from './tokens';

world.registerComponent(Renderable3D);

let bindFunc: Syringe.Register;

export function registerModelBuilder(builderClazz: new (...args: any[]) => Batch, named: string) {
  bindFunc({ token: { token: ShapeRenderer, named }, useClass: builderClazz });
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

export const containerModule = Module((register) => {
  bindFunc = register;
  register(RenderHelper);
  register(TexturePool);
  register(GlyphManager);
  register(PickingIdGenerator);

  register(RenderGraphPlugin);
  register(PickingPlugin);

  /**
   * bind model builder for each kind of Shape
   */
  register(CircleRenderer);
  register(ImageRenderer);
  register(InstancedLineRenderer);
  register(LineRenderer);
  register(TextRenderer);
  register({
    token: RendererFactory,
    useFactory: (context) => {
      return (tagName: SHAPE) => {
        if (context.container.isBoundNamed(ShapeRenderer, tagName)) {
          return context.container.getNamed(ShapeRenderer, tagName) || null;
        }
        return null;
      };
    },
  });
});

export class Plugin implements RendererPlugin {
  constructor(private options?: Partial<WebGLRendererPluginOptions>) {}

  init(container: Syringe.Container): void {
    container.register({
      token: WebGLRendererPluginOptions,
      useValue: {
        targets: [
          // 'webgpu',
          'webgl2',
          'webgl1',
        ],
        ...this.options,
      },
    });
    container.load(containerModule);
  }
  destroy(container: Syringe.Container): void {
    // @ts-ignore
    // container.container.unload(containerModule);
    // container.unload(containerModule);
  }
}

export * from './platform';
