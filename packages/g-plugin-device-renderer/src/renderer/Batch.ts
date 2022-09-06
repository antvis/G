import type { DisplayObject, RenderingService } from '@antv/g-lite';
import { Camera, DefaultCamera, inject, injectable } from '@antv/g-lite';
import { LightPool } from '../LightPool';
import type { Instanced } from '../meshes/Instanced';
import type { Device } from '../platform';
import { RenderHelper } from '../render/RenderHelper';
import type { RenderInst } from '../render/RenderInst';
import { TexturePool } from '../TexturePool';
// import { MeshFactory } from '../tokens';
import { BatchManager } from './BatchManager';

/**
 * render order start from 0, our default camera's Z is 500
 */
export const RENDER_ORDER_SCALE = 1 / 200;

let counter = 1;

/**
 * A container for multiple display objects with the same `style`,
 * eg. 1000 Circles with the same stroke color, but their position, radius can be different
 */
@injectable()
export abstract class Batch {
  @inject(RenderHelper)
  protected renderHelper: RenderHelper;

  @inject(TexturePool)
  protected texturePool: TexturePool;

  @inject(DefaultCamera)
  protected camera: Camera;

  @inject(LightPool)
  protected lightPool: LightPool;

  @inject(BatchManager)
  protected batchManager: BatchManager;

  // @inject(MeshFactory)
  // protected meshFactory: (shape: string) => Instanced;

  device: Device;

  renderingService: RenderingService;

  id = counter++;

  /**
   * describe render insts used in this draw call
   * eg. a Polygon with stroke will use 2 renderInsts
   */
  meshes: typeof Instanced[] = [];
  private clipPathMeshCreated = false;

  shouldSubmitRenderInst(object: DisplayObject, index: number): boolean {
    return true;
  }

  beforeUploadUBO(renderInst: RenderInst, mesh: Instanced, index: number) {}

  beforeInitMesh(mesh: Instanced) {}
  afterInitMesh(mesh: Instanced) {}

  // private findClipPath(): DisplayObject | null {
  //   let node = this.instance;
  //   while (node && node.style) {
  //     if (node.style.clipPath) {
  //       return node.style.clipPath;
  //     }
  //     node = node.parentNode as DisplayObject;
  //   }
  //   return null;
  // }

  // private applyClipPath() {
  //   // find clipPath
  //   const clipPathShape = this.findClipPath();
  //   if (clipPathShape && !this.clipPathMeshCreated) {
  //     if (this.batchMeshList.length === 0) {
  //       return;
  //     }

  //     const clipPathMesh = this.meshFactory(clipPathShape.nodeName);
  //     clipPathMesh.clipPathTarget = this.instance;

  //     // draw clipPath first
  //     this.batchMeshList.unshift(clipPathMesh);
  //     this.clipPathMeshCreated = true;

  //     this.batchMeshList.forEach((mesh, i) => {
  //       mesh.clipPath = clipPathShape;

  //       if (!mesh.material) {
  //         mesh.material = new ShaderMaterial(this.device);
  //       }
  //       mesh.material.stencilRef = this.batchManager.getStencilRef(clipPathShape);
  //     });
  //   }

  //   // remove clipPath from render queue
  //   if (!clipPathShape) {
  //     if (this.batchMeshList.length && this.batchMeshList[0].clipPathTarget) {
  //       this.batchMeshList.shift();
  //     }
  //   }
  // }
}
