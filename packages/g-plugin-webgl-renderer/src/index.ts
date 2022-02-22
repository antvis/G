import 'regenerator-runtime/runtime';
import { RendererPlugin, SHAPE } from '@antv/g';
import { Module, Syringe } from 'mana-syringe';
import { Renderable3D } from './components/Renderable3D';
import { PickingIdGenerator } from './PickingIdGenerator';
import { PickingPlugin } from './PickingPlugin';
import { RenderGraphPlugin } from './RenderGraphPlugin';
import { WebGLRendererPluginOptions } from './interfaces';
import { RenderHelper } from './render/RenderHelper';
import {
  Batch,
  CircleRenderer,
  PathRenderer,
  ImageRenderer,
  MeshRenderer,
  BatchManager,
  LineRenderer,
  TextRenderer,
} from './renderer';
import { TexturePool } from './TexturePool';
import { GlyphManager } from './meshes/symbol/GlyphManager';
import { MeshFactory, RendererFactory, ShapeRenderer } from './tokens';
import { Mesh } from './Mesh';
import { LightPool } from './LightPool';
import { TextureDescriptor } from './platform';
import {
  FillMesh,
  ImageMesh,
  InstancedLineMesh,
  LineMesh,
  SDFMesh,
  TextMesh,
  MeshMesh,
} from './meshes';

let bindFunc: Syringe.Register;

export function registerModelBuilder(builderClazz: new (...args: any[]) => Batch, named: string) {
  bindFunc({ token: { token: ShapeRenderer, named }, useClass: builderClazz });
}

export { Renderable3D, Batch, TexturePool, RenderGraphPlugin, Mesh };

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

  register(SDFMesh);
  register(InstancedLineMesh);
  register(LineMesh);
  register(FillMesh);
  register(ImageMesh);
  register(TextMesh);
  register(MeshMesh);
  register({
    token: MeshFactory,
    useFactory: (context) => {
      return (tagName: SHAPE) => {
        if (context.container.isBound(tagName)) {
          return context.container.get(tagName) || null;
        }
        return null;
      };
    },
  });

  /**
   * bind model builder for each kind of Shape
   */
  register(CircleRenderer);
  register(PathRenderer);
  register(ImageRenderer);
  register(LineRenderer);
  register(TextRenderer);
  register(MeshRenderer);
  // register(GroupRenderer);
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

  private container: Syringe.Container;

  init(container: Syringe.Container): void {
    this.container = container;
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
    container.remove(PathRenderer);
    container.remove(LineRenderer);
    container.remove(ImageRenderer);

    container.remove(TextRenderer);
    container.remove(MeshRenderer);
    // container.remove(GroupRenderer);
    container.remove(ShapeRenderer);
    container.remove(RendererFactory);

    container.remove(SDFMesh);
    container.remove(InstancedLineMesh);
    container.remove(LineMesh);
    container.remove(FillMesh);
    container.remove(ImageMesh);
    container.remove(TextMesh);
    container.remove(MeshMesh);
    container.remove(MeshFactory);

    container.remove(RenderGraphPlugin);
    container.remove(PickingPlugin);
    container.remove(WebGLRendererPluginOptions);
    // @ts-ignore
    // container.container.unload(containerModule);
    // container.unload(containerModule);
  }

  getDevice() {
    return this.container.get(RenderGraphPlugin).getDevice();
  }

  loadTexture(
    src: string | TexImageSource,
    descriptor?: TextureDescriptor,
    successCallback?: Function,
  ) {
    return this.container.get(RenderGraphPlugin).loadTexture(src, descriptor, successCallback);
  }
}

export * from './platform';
