// tslint:disable-next-line:no-reference
/// <reference path="./glsl.d.ts" />
import 'regenerator-runtime/runtime';
import { RendererPlugin, SHAPE } from '@antv/g';
import { Module, Syringe } from 'mana-syringe';
import { Renderable3D } from './components/Renderable3D';
import { PickingIdGenerator } from './PickingIdGenerator';
import { PickingPlugin } from './PickingPlugin';
// import { DefaultShaderModuleService, ShaderModuleService } from './services/shader-module';
import { RenderGraphPlugin } from './RenderGraphPlugin';
import { WebGLRendererPluginOptions } from './interfaces';
import { RenderHelper } from './render/RenderHelper';
import {
  Batch,
  CircleRenderer,
  ImageRenderer,
  TextRenderer,
  LineRenderer,
  InstancedLineRenderer,
  MeshRenderer,
  BatchManager,
  CircleBatchMesh,
  ImageBatchMesh,
  TextBatchMesh,
  LineBatchMesh,
  InstancedLineBatchMesh,
  MeshBatchMesh,
  FillBatchMesh,
  GroupRenderer,
  GroupBatchMesh,
} from './drawcall';
import { TexturePool } from './TexturePool';
import { GlyphManager } from './drawcall/symbol/GlyphManager';
import { MeshFactory, RendererFactory, ShapeMesh, ShapeRenderer } from './tokens';
import { Mesh } from './Mesh';
import { Texture2D } from './Texture2D';
import { Sampler } from './Sampler';
import { LightPool } from './LightPool';

let bindFunc: Syringe.Register;

export function registerModelBuilder(builderClazz: new (...args: any[]) => Batch, named: string) {
  bindFunc({ token: { token: ShapeRenderer, named }, useClass: builderClazz });
}

export {
  Renderable3D,
  Batch,
  // ShaderModuleService,
  // ModelBuilder,
  TexturePool,
  RenderGraphPlugin,
  Mesh,
  Texture2D,
  Sampler,
};

export * from './interfaces';
export * from './platform';
export * from './render';
export * from './geometries';
export * from './materials';
export * from './lights';

export const containerModule = Module((register) => {
  bindFunc = register;
  register(RenderHelper);
  register(TexturePool);
  register(LightPool);
  register(GlyphManager);
  register(PickingIdGenerator);
  register(BatchManager);

  register(RenderGraphPlugin);
  register(PickingPlugin);

  register(CircleBatchMesh);
  register(ImageBatchMesh);
  register(InstancedLineBatchMesh);
  register(LineBatchMesh);
  register(TextBatchMesh);
  register(MeshBatchMesh);
  register(FillBatchMesh);
  register(GroupBatchMesh);
  register({
    token: MeshFactory,
    useFactory: (context) => {
      return (tagName: SHAPE) => {
        if (context.container.isBoundNamed(ShapeMesh, tagName)) {
          return context.container.getNamed(ShapeMesh, tagName) || null;
        }
        return null;
      };
    },
  });

  /**
   * bind model builder for each kind of Shape
   */
  register(CircleRenderer);
  register(ImageRenderer);
  register(InstancedLineRenderer);
  register(LineRenderer);
  register(TextRenderer);
  register(MeshRenderer);
  register(GroupRenderer);
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
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.remove(RenderHelper);
    container.remove(TexturePool);
    container.remove(GlyphManager);
    container.remove(PickingIdGenerator);
    container.remove(CircleRenderer);
    container.remove(ImageRenderer);
    container.remove(InstancedLineRenderer);
    container.remove(LineRenderer);
    container.remove(TextRenderer);
    container.remove(MeshRenderer);
    container.remove(GroupRenderer);
    container.remove(ShapeRenderer);
    container.remove(RendererFactory);

    container.remove(CircleBatchMesh);
    container.remove(ImageBatchMesh);
    container.remove(InstancedLineBatchMesh);
    container.remove(LineBatchMesh);
    container.remove(TextBatchMesh);
    container.remove(FillBatchMesh);
    container.remove(MeshBatchMesh);
    container.remove(GroupBatchMesh);
    container.remove(ShapeMesh);
    container.remove(MeshFactory);

    container.remove(RenderGraphPlugin);
    container.remove(PickingPlugin);
    container.remove(WebGLRendererPluginOptions);
    // @ts-ignore
    // container.container.unload(containerModule);
    // container.unload(containerModule);
  }
}

export * from './platform';
