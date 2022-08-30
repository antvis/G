import {
  AbstractRendererPlugin,
  DataURLOptions,
  RenderingPluginContribution,
  Shape,
} from '@antv/g-lite';
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
import { MeshFactory, RendererFactory } from './tokens';

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

// export const containerModule = Module((register) => {
//   register(RenderHelper);
//   register(TexturePool);
//   register(LightPool);
//   register(GlyphManager);
//   register(PickingIdGenerator);
//   register(BatchManager);

//   register(RenderGraphPlugin);
//   register(PickingPlugin);

//   register(SDFMesh);
//   register(InstancedLineMesh);
//   register(LineMesh);
//   register(FillMesh);
//   register(ImageMesh);
//   register(TextMesh);
//   register(MeshMesh);
//   register({
//     token: MeshFactory,
//     useFactory: (context) => {
//       return (tagName: Shape) => {
//         if (context.container.isBound(tagName)) {
//           return context.container.get(tagName) || null;
//         }
//         return null;
//       };
//     },
//   });

//   /**
//    * bind model builder for each kind of Shape
//    */
//   register(CircleRenderer);
//   register(PathRenderer);
//   register(ImageRenderer);
//   register(LineRenderer);
//   register(TextRenderer);
//   register(MeshRenderer);
//   // register(GroupRenderer);
//   register({
//     token: RendererFactory,
//     useFactory: (context) => {
//       const cache = {};
//       return (tagName: Shape) => {
//         if (!cache[tagName]) {
//           if (context.container.isBoundNamed(ShapeRenderer, tagName)) {
//             cache[tagName] = context.container.getNamed(ShapeRenderer, tagName);
//           }
//         }
//         return cache[tagName] || null;
//       };
//     },
//   });
// });

export class Plugin extends AbstractRendererPlugin {
  name = 'device-renderer';

  init(): void {
    // container.register(MeshUpdater);

    this.container.registerSingleton(RenderHelper);
    this.container.registerSingleton(TexturePool);
    this.container.registerSingleton(LightPool);
    this.container.register(GlyphManager, { useClass: GlyphManager });
    this.container.registerSingleton(PickingIdGenerator);
    this.container.registerSingleton(BatchManager);

    this.container.registerSingleton(RenderingPluginContribution, RenderGraphPlugin);
    this.container.registerSingleton(RenderingPluginContribution, PickingPlugin);

    this.container.register(SDFMesh, { useClass: SDFMesh });
    this.container.register(InstancedLineMesh, { useClass: InstancedLineMesh });
    this.container.register(LineMesh, { useClass: LineMesh });
    this.container.register(FillMesh, { useClass: FillMesh });
    this.container.register(ImageMesh, { useClass: ImageMesh });
    this.container.register(TextMesh, { useClass: TextMesh });
    this.container.register(MeshMesh, { useClass: MeshMesh });
    this.container.register(MeshFactory, {
      useValue: (shape: any) => {
        // @ts-ignore
        return this.container.resolve(shape);
      },
    });

    const map = {
      [Shape.CIRCLE]: CircleRenderer,
      [Shape.ELLIPSE]: CircleRenderer,
      [Shape.POLYLINE]: PathRenderer,
      [Shape.PATH]: PathRenderer,
      [Shape.POLYGON]: PathRenderer,
      [Shape.RECT]: PathRenderer,
      [Shape.IMAGE]: ImageRenderer,
      [Shape.LINE]: LineRenderer,
      [Shape.TEXT]: TextRenderer,
      [Shape.MESH]: MeshRenderer,
    };
    this.container.register(CircleRenderer, { useClass: CircleRenderer });
    this.container.register(PathRenderer, { useClass: PathRenderer });
    this.container.register(ImageRenderer, { useClass: ImageRenderer });
    this.container.register(LineRenderer, { useClass: LineRenderer });
    this.container.register(TextRenderer, { useClass: TextRenderer });
    this.container.register(MeshRenderer, { useClass: MeshRenderer });
    this.container.register(RendererFactory, {
      useValue: (tagName: Shape) => {
        return this.container.resolve(map[tagName]);
      },
    });

    // if (!GlobalContainer.isBound(MeshUpdater)) {
    //   GlobalContainer.register(MeshUpdater);
    // }
    // this.container.load(containerModule, true);
  }
  destroy(): void {
    // if (GlobalContainer.isBound(MeshUpdater)) {
    //   GlobalContainer.remove(MeshUpdater);
    // }
    // this.container.unload(containerModule);
  }

  getDevice() {
    return this.container.resolve(RenderGraphPlugin).getDevice();
  }

  loadTexture(
    src: string | TexImageSource,
    descriptor?: TextureDescriptor,
    successCallback?: (t: Texture) => void,
  ) {
    return this.container.resolve(RenderGraphPlugin).loadTexture(src, descriptor, successCallback);
  }

  toDataURL(options: Partial<DataURLOptions>) {
    return this.container.resolve(RenderGraphPlugin).toDataURL(options);
  }
}
