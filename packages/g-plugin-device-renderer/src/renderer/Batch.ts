import type { DisplayObject } from '@antv/g-lite';
import type { Instanced } from '../drawcalls/Instanced';
import type { RenderInst } from '../render/RenderInst';

/**
 * render order start from 0, our default camera's Z is 500
 */
export const RENDER_ORDER_SCALE = 500 / 1000000;

/**
 * A container for multiple display objects with the same `style`,
 * eg. 1000 Circles with the same stroke color, but their position, radius can be different
 */
export abstract class Batch {
  /**
   * describe render insts used in this draw call
   * eg. a Polygon with stroke will use 2 renderInsts
   */
  abstract getDrawcallCtors(object: DisplayObject): (typeof Instanced)[];

  private clipPathMeshCreated = false;

  beforeUploadUBO(renderInst: RenderInst, mesh: Instanced) {}

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
