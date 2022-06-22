import type { DataURLOptions, RendererPlugin, Shape, Syringe } from '@antv/g';
import { GlobalContainer, Module } from '@antv/g';
import 'regenerator-runtime/runtime';
import { Renderable3D } from './components/Renderable3D';
import { LightPool } from './LightPool';
import { Mesh } from './Mesh';
import {
  FillMesh,
  ImageMesh,
  InstancedLineMesh,
  LineMesh,
  MeshMesh,
  SDFMesh,
  TextMesh,
} from './meshes';
import { GlyphManager } from './meshes/symbol/GlyphManager';
import { MeshUpdater } from './MeshUpdater';
import { PickingIdGenerator } from './PickingIdGenerator';
import { PickingPlugin } from './PickingPlugin';
import type { Texture, TextureDescriptor } from './platform';
import { RenderHelper } from './render/RenderHelper';
import {
  Batch,
  BatchManager,
  CircleRenderer,
  ImageRenderer,
  LineRenderer,
  MeshRenderer,
  PathRenderer,
  TextRenderer,
} from './renderer';
import { RenderGraphPlugin } from './RenderGraphPlugin';
import { TexturePool } from './TexturePool';
import { MeshFactory, RendererFactory, ShapeRenderer } from './tokens';

export * from './geometries';
export * from './interfaces';
export * from './lights';
export * from './materials';
export * from './meshes';
export * from './passes';
export * from './platform';
export * from './render';
export * from './shader/compiler';
export * from './utils';
export { Renderable3D, Batch, TexturePool, RenderGraphPlugin, Mesh };

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
  name = 'device-renderer';
  private container: Syringe.Container;

  init(container: Syringe.Container): void {
    if (!GlobalContainer.isBound(MeshUpdater)) {
      GlobalContainer.register(MeshUpdater);
    }
    this.container = container;
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    if (GlobalContainer.isBound(MeshUpdater)) {
      GlobalContainer.remove(MeshUpdater);
    }
    container.unload(containerModule);
  }

  getDevice() {
    return this.container.get(RenderGraphPlugin).getDevice();
  }

  loadTexture(
    src: string | TexImageSource,
    descriptor?: TextureDescriptor,
    successCallback?: (t: Texture) => void,
  ) {
    return this.container.get(RenderGraphPlugin).loadTexture(src, descriptor, successCallback);
  }

  toDataURL(options: Partial<DataURLOptions>) {
    return this.container.get(RenderGraphPlugin).toDataURL(options);
  }
}
