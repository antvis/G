import type {
  DisplayObject,
  RenderingPluginContext,
  Shape,
} from '@antv/g-lite';
import type { Device } from '@antv/g-device-api';
import type { Renderable3D } from '../components/Renderable3D';
import type { LightPool } from '../LightPool';
import type { Instanced } from '../drawcalls/Instanced';
import type { RenderInstList, RenderHelper } from '../render';
import type { TexturePool } from '../TexturePool';
import type { Batch } from './Batch';

let stencilRefCounter = 1;

export type BatchContext = { device: Device } & RenderingPluginContext;

export class BatchManager {
  constructor(
    protected renderHelper: RenderHelper,
    private rendererFactory: Record<Shape, Batch>,
    protected texturePool: TexturePool,
    protected lightPool: LightPool,
  ) {}

  /**
   * attached when Device created
   */
  private context: BatchContext;

  /**
   * draw calls
   */
  private drawcalls: Instanced[] = [];

  /**
   * update patches which can be merged before rendering
   */
  private pendingUpdatePatches: Record<
    string,
    {
      instance: Instanced;
      objectIndices: number[];
      name: string;
      value: any;
      // names: string[];
    }
  > = {};

  private stencilRefCache: Record<number, number> = {};

  destroy() {
    this.drawcalls.forEach((drawcall) => {
      drawcall.destroy();
    });
    this.drawcalls = [];
    this.pendingUpdatePatches = {};
  }

  render(list: RenderInstList, isPicking = false) {
    if (!isPicking) {
      this.updatePendingPatches();
    }

    this.drawcalls.forEach((mesh) => {
      // init rendering service, create geometry & material
      mesh.init();

      let { objects } = mesh;
      if (mesh.clipPathTarget) {
        objects = [mesh.clipPath];
      }

      // new render instance
      const renderInst = this.renderHelper.renderInstManager.newRenderInst();
      renderInst.setAllowSkippingIfPipelineNotReady(false);
      mesh.applyRenderInst(renderInst, objects);

      this.renderHelper.renderInstManager.submitRenderInst(renderInst, list);

      // console.log('submit: ', mesh);

      if (!isPicking) {
        // finish rendering...
        mesh.objects.forEach((object) => {
          object.renderable.dirty = false;
        });
      }
    });
  }

  /**
   * get called in RenderGraphPlugin
   */
  attach(context: BatchContext) {
    this.context = context;
  }

  add(object: DisplayObject) {
    const renderable3D = (object as any).renderable3D as Renderable3D;
    if (renderable3D && !renderable3D.drawcalls.length) {
      const renderer = this.rendererFactory[object.nodeName] as Batch;
      if (renderer) {
        // A complex Path can be splitted into multple sub paths.
        renderer
          .getDrawcallCtors(object)
          .forEach(
            (
              DrawCallCtor: new (..._: any) => Instanced,
              i: number,
              drawcallCtors: (new (..._: any) => Instanced)[],
            ) => {
              let existedDrawcall = this.drawcalls.find(
                (mesh) =>
                  DrawCallCtor === mesh.constructor &&
                  mesh.index === i &&
                  mesh.objects.length < mesh.maxInstances &&
                  mesh.shouldMerge(object, i),
              );
              if (
                !existedDrawcall ||
                existedDrawcall.key !== object.parsedStyle.batchKey
              ) {
                existedDrawcall = new DrawCallCtor(
                  this.renderHelper,
                  this.texturePool,
                  this.lightPool,
                  object,
                  drawcallCtors,
                  i,
                  this.context,
                );
                existedDrawcall.renderer = renderer;
                this.drawcalls.push(existedDrawcall);

                if (object.parsedStyle.batchKey) {
                  existedDrawcall.key = object.parsedStyle.batchKey;
                }
              }

              if (existedDrawcall) {
                existedDrawcall.objects.push(object);
                renderable3D.drawcalls[i] = existedDrawcall;
                existedDrawcall.geometryDirty = true;
              }
            },
          );
      }
    }
  }

  remove(object: DisplayObject) {
    // @ts-ignore
    const renderable3D = object.renderable3D as Renderable3D;
    if (renderable3D) {
      renderable3D.drawcalls.forEach((mesh) => {
        if (mesh) {
          // remove from mesh
          const index = mesh.objects.indexOf(object);
          if (index > -1) {
            mesh.objects.splice(index, 1);
            mesh.geometryDirty = true;
          }

          if (mesh.objects.length === 0) {
            const deletedDrawcalls = this.drawcalls.splice(
              this.drawcalls.indexOf(mesh),
              1,
            );
            deletedDrawcalls.forEach((deletedDrawcall) => {
              deletedDrawcall.destroy();
            });
          }
        }
      });
      renderable3D.drawcalls = [];
    }
  }

  updateAttribute(
    object: DisplayObject,
    attributeName: string,
    newValue: any,
    immediately = false,
  ) {
    const renderable3D = (object as any).renderable3D as Renderable3D;
    const renderer = this.rendererFactory[object.nodeName] as Batch;
    if (renderer) {
      const drawcallCtors = renderer.getDrawcallCtors(object);
      drawcallCtors.forEach((DrawCallCtor, i, drawcallCtors) => {
        let existedDrawcall = renderable3D.drawcalls.find(
          (mesh) =>
            mesh && mesh.index === i && mesh.constructor === DrawCallCtor,
        );

        if (!existedDrawcall) {
          // Clear invalid drawcall.
          existedDrawcall = renderable3D.drawcalls[i];

          if (existedDrawcall) {
            // remove from mesh
            existedDrawcall.objects.splice(
              existedDrawcall.objects.indexOf(object),
              1,
            );
            existedDrawcall.geometryDirty = true;

            if (existedDrawcall.objects.length === 0) {
              this.drawcalls.splice(this.drawcalls.indexOf(existedDrawcall), 1);
            }
            renderable3D.drawcalls[
              renderable3D.drawcalls.indexOf(existedDrawcall)
            ] = undefined;
          }

          // We should create a new drawcall from scratch.
          existedDrawcall = this.drawcalls.find(
            (mesh) =>
              DrawCallCtor === mesh.constructor &&
              mesh.index === i &&
              mesh.objects.length < mesh.maxInstances &&
              mesh.shouldMerge(object, i),
          );

          if (!existedDrawcall) {
            // @ts-ignore
            existedDrawcall = new DrawCallCtor(
              this.renderHelper,
              this.texturePool,
              this.lightPool,
              object,
              drawcallCtors,
              i,
              this.context,
            );
            existedDrawcall.renderer = renderer;
            existedDrawcall.init();
            this.drawcalls.push(existedDrawcall);
          } else {
            existedDrawcall.geometryDirty = true;
          }

          existedDrawcall.objects.push(object);
          renderable3D.drawcalls[i] = existedDrawcall;
        }

        if (existedDrawcall.inited && !existedDrawcall.geometryDirty) {
          const shouldMerge = existedDrawcall.shouldMerge(object, i);
          if (shouldMerge) {
            const objectIdx = existedDrawcall.objects.indexOf(object);
            if (immediately) {
              object.parsedStyle[attributeName] = newValue;
              existedDrawcall.updateAttribute(
                [object],
                objectIdx,
                attributeName,
                newValue,
              );
            } else {
              const patchKey = existedDrawcall.id + attributeName;
              if (!this.pendingUpdatePatches[patchKey]) {
                this.pendingUpdatePatches[patchKey] = {
                  instance: existedDrawcall,
                  objectIndices: [],
                  name: attributeName,
                  value: newValue,
                };
              }
              if (
                this.pendingUpdatePatches[patchKey].objectIndices.indexOf(
                  objectIdx,
                ) === -1
              ) {
                this.pendingUpdatePatches[patchKey].objectIndices.push(
                  objectIdx,
                );
              }
            }
          } else {
            this.remove(object);
            this.add(object);
          }
        } else {
          this.remove(object);
          this.add(object);
        }
      });

      // Clear redundant drawcalls.
      if (renderable3D.drawcalls.length > drawcallCtors.length) {
        const drawcallNum = renderable3D.drawcalls.length;
        for (let i = drawcallNum - 1; i >= drawcallCtors.length; i--) {
          const existedDrawcall = renderable3D.drawcalls[i];

          // remove from mesh
          existedDrawcall.objects.splice(
            existedDrawcall.objects.indexOf(object),
            1,
          );
          existedDrawcall.geometryDirty = true;

          if (existedDrawcall.objects.length === 0) {
            this.drawcalls.splice(this.drawcalls.indexOf(existedDrawcall), 1);
          }
          renderable3D.drawcalls.pop();
        }
      }
    }
  }

  changeRenderOrder(object: DisplayObject, renderOrder: number) {
    // @ts-ignore
    const renderable3D = object.renderable3D as Renderable3D;
    if (renderable3D && renderable3D.drawcalls.length) {
      renderable3D.drawcalls.forEach((mesh) => {
        if (mesh && mesh.inited && !mesh.geometryDirty) {
          if (mesh.inited) {
            mesh.changeRenderOrder(object, renderOrder);
          }
        }
      });
    }
  }

  getStencilRef(object: DisplayObject) {
    if (!this.stencilRefCache[object.entity]) {
      this.stencilRefCache[object.entity] = stencilRefCounter++;
    }
    return this.stencilRefCache[object.entity];
  }

  private updatePendingPatches() {
    // merge update patches to reduce `setSubData` calls
    Object.keys(this.pendingUpdatePatches).forEach((patchKey) => {
      const { instance, objectIndices, name, value } =
        this.pendingUpdatePatches[patchKey];
      objectIndices.sort((a, b) => a - b);

      const updatePatches: number[][] = [];
      objectIndices.forEach((i) => {
        const lastUpdateBatch = updatePatches[updatePatches.length - 1];

        if (
          !lastUpdateBatch ||
          i !== lastUpdateBatch[lastUpdateBatch.length - 1] + 1
        ) {
          updatePatches.push([i]);
        } else {
          lastUpdateBatch.push(i);
        }
      });

      updatePatches.forEach((indices) => {
        instance.updateAttribute(
          instance.objects.slice(indices[0], indices[0] + indices.length),
          indices[0],
          name,
          value,
        );
      });
    });
    this.pendingUpdatePatches = {};
  }

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

  //       // if (!mesh.material) {
  //       //   mesh.material = new ShaderMaterial(this.device);
  //       // }
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
