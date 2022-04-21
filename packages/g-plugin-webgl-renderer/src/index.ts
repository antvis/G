import 'regenerator-runtime/runtime';
import type { RendererPlugin, Shape } from '@antv/g';
import type { Syringe } from 'mana-syringe';
import { Module, GlobalContainer } from 'mana-syringe';
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
import type { TextureDescriptor } from './platform';
import {
  FillMesh,
  ImageMesh,
  InstancedLineMesh,
  LineMesh,
  SDFMesh,
  TextMesh,
  MeshMesh,
} from './meshes';
import { MeshUpdater } from './MeshUpdater';

export { Renderable3D, Batch, TexturePool, RenderGraphPlugin, Mesh };

export * from './interfaces';
export * from './platform';
export * from './render';
export * from './geometries';
export * from './materials';
export * from './meshes';
export * from './lights';

export const containerModule = Module((register) => {
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
      return (tagName: Shape) => {
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
      const cache = {};
      return (tagName: Shape) => {
        if (!cache[tagName]) {
          if (context.container.isBoundNamed(ShapeRenderer, tagName)) {
            cache[tagName] = context.container.getNamed(ShapeRenderer, tagName);
          }
        }
        return cache[tagName] || null;
      };
    },
  });
});

export class Plugin implements RendererPlugin {
  constructor(private options?: Partial<WebGLRendererPluginOptions>) {}

  private container: Syringe.Container;

  init(container: Syringe.Container): void {
    if (!GlobalContainer.isBound(MeshUpdater)) {
      GlobalContainer.register(MeshUpdater);
    }
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
    if (GlobalContainer.isBound(MeshUpdater)) {
      GlobalContainer.remove(MeshUpdater);
    }
    container.remove(WebGLRendererPluginOptions);
    container.unload(containerModule);
  }

  getDevice() {
    return this.container.get(RenderGraphPlugin).getDevice();
  }

  loadTexture(
    src: string | TexImageSource,
    descriptor?: TextureDescriptor,
    successCallback?: () => void,
  ) {
    return this.container.get(RenderGraphPlugin).loadTexture(src, descriptor, successCallback);
  }
}
