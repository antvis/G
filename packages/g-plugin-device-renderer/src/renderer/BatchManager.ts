import type {
  DisplayObject,
  RenderingPluginContext,
  Shape,
} from '@antv/g-lite';
import type { Renderable3D } from '../components/Renderable3D';
import type { LightPool } from '../LightPool';
import type { Instanced } from '../meshes/Instanced';
import type { Device } from '../platform';
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
  private meshes: Instanced[] = [];

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

  render(list: RenderInstList, isPicking = false) {
    if (!isPicking) {
      this.updatePendingPatches();
    }

    this.meshes.forEach((mesh) => {
      // init rendering service, create geometry & material
      mesh.init(this.context);

      let objects = mesh.objects;
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
    // @ts-ignore
    const renderable3D = object.renderable3D as Renderable3D;
    if (renderable3D && !renderable3D.meshes.length) {
      const renderer = this.rendererFactory[object.nodeName];
      if (renderer) {
        renderer.meshes.forEach((meshTag, i) => {
          renderable3D.meshes[i] = undefined;
          const shouldSubmit = renderer.shouldSubmitRenderInst(object, i);
          if (shouldSubmit) {
            let existedMesh = this.meshes.find(
              (mesh) =>
                meshTag === mesh.constructor &&
                mesh.index === i &&
                mesh.objects.length < mesh.maxInstances &&
                mesh.shouldMerge(object, i),
            );
            if (
              !existedMesh ||
              existedMesh.key !== object.parsedStyle.batchKey
            ) {
              existedMesh = new meshTag(
                this.renderHelper,
                this.texturePool,
                this.lightPool,
                object,
              );
              existedMesh.renderer = renderer;
              existedMesh.index = i;
              this.meshes.push(existedMesh);

              if (object.parsedStyle.batchKey) {
                existedMesh.key = object.parsedStyle.batchKey;
              }
            }

            if (existedMesh) {
              existedMesh.objects.push(object);
              renderable3D.meshes[i] = existedMesh;
              existedMesh.geometryDirty = true;
            }
          }
        });
      }
    }
  }

  remove(object: DisplayObject) {
    // @ts-ignore
    const renderable3D = object.renderable3D as Renderable3D;
    if (renderable3D) {
      renderable3D.meshes.forEach((mesh) => {
        if (mesh) {
          // remove from mesh
          const index = mesh.objects.indexOf(object);
          if (index > -1) {
            mesh.objects.splice(index, 1);
            mesh.geometryDirty = true;
          }

          if (mesh.objects.length === 0) {
            this.meshes.splice(this.meshes.indexOf(mesh), 1);
          }
        }
      });
      renderable3D.meshes = [];
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
      renderer.meshes.forEach((meshCtor, i) => {
        const shouldSubmit = renderer.shouldSubmitRenderInst(object, i);
        let existedMesh = renderable3D.meshes.find(
          (mesh) => mesh && mesh.index === i && mesh.constructor === meshCtor,
        );
        // is this mesh already rendered in current displayobject?
        if (shouldSubmit !== !!existedMesh) {
          if (existedMesh) {
            // remove from mesh
            existedMesh.objects.splice(existedMesh.objects.indexOf(object), 1);
            existedMesh.geometryDirty = true;

            if (existedMesh.objects.length === 0) {
              this.meshes.splice(this.meshes.indexOf(existedMesh), 1);
            }
            renderable3D.meshes[renderable3D.meshes.indexOf(existedMesh)] =
              undefined;
          }

          if (shouldSubmit) {
            // clear first
            existedMesh = this.meshes.find(
              (mesh) =>
                meshCtor === mesh.constructor &&
                mesh.index === i &&
                mesh.objects.length < mesh.maxInstances &&
                mesh.shouldMerge(object, i),
            );

            if (!existedMesh) {
              // @ts-ignore
              existedMesh = new meshCtor(
                this.renderHelper,
                this.texturePool,
                this.lightPool,
                object,
              );
              existedMesh.renderer = renderer;
              existedMesh.index = i;
              existedMesh.init(this.context);
              this.meshes.push(existedMesh);
            } else {
              existedMesh.geometryDirty = true;
            }

            if (existedMesh) {
              existedMesh.objects.push(object);
              renderable3D.meshes[i] = existedMesh;
            }
          }
        }

        if (shouldSubmit && existedMesh) {
          if (existedMesh.inited && !existedMesh.geometryDirty) {
            const shouldMerge = existedMesh.shouldMerge(object, i);
            if (shouldMerge) {
              const objectIdx = existedMesh.objects.indexOf(object);
              if (immediately) {
                object.parsedStyle[attributeName] = newValue;
                existedMesh.updateAttribute(
                  [object],
                  objectIdx,
                  attributeName,
                  newValue,
                );
              } else {
                const patchKey = existedMesh.id + attributeName;
                if (!this.pendingUpdatePatches[patchKey]) {
                  this.pendingUpdatePatches[patchKey] = {
                    instance: existedMesh,
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
        }
      });
    }
  }

  changeRenderOrder(object: DisplayObject, renderOrder: number) {
    // @ts-ignore
    const renderable3D = object.renderable3D as Renderable3D;
    if (renderable3D && renderable3D.meshes.length) {
      renderable3D.meshes.forEach((mesh) => {
        if (mesh && mesh.inited && !mesh.geometryDirty) {
          const shouldSubmit = mesh.renderer.shouldSubmitRenderInst(
            object,
            mesh.index,
          );
          if (shouldSubmit && mesh.inited) {
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
