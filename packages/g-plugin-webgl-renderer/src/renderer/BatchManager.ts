import type { DisplayObject, RenderingService } from '@antv/g';
import { inject, singleton } from 'mana-syringe';
import type { Device } from '../platform';
import { MeshFactory, RendererFactory } from '../tokens';
import type { Batch } from './Batch';
import type { Instanced } from '../meshes/Instanced';
import type { RenderInstList } from '../render';
import { RenderHelper } from '../render';
import type { Renderable3D } from '../components/Renderable3D';
// import { BufferGeometry } from '../geometries';
// import { ShaderMaterial } from '../materials';

let stencilRefCounter = 1;

@singleton()
export class BatchManager {
  @inject(RenderHelper)
  protected renderHelper: RenderHelper;

  @inject(RendererFactory)
  private rendererFactory: (shape: string) => Batch;

  @inject(MeshFactory)
  protected meshFactory: (shape: typeof Instanced) => Instanced;

  /**
   * attached when Device created
   */
  private device: Device;
  private renderingService: RenderingService;

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
    }
  > = {};

  private stencilRefCache: Record<number, number> = {};

  render(list: RenderInstList) {
    this.meshes.forEach((mesh) => {
      // init rendering service, create geometry & material
      mesh.init(this.device, this.renderingService);

      let objects = mesh.objects;
      if (mesh.clipPathTarget) {
        objects = [mesh.clipPath];
      }

      // new render instance
      const renderInst = this.renderHelper.renderInstManager.newRenderInst();
      mesh.applyRenderInst(renderInst, objects);
      this.renderHelper.renderInstManager.submitRenderInst(renderInst, list);

      // console.log('submit: ', mesh);

      // finish rendering...
      mesh.objects.forEach((object) => {
        object.renderable.dirty = false;
      });
    });

    // merge update patches to reduce `setSubData` calls
    Object.keys(this.pendingUpdatePatches).forEach((patchKey) => {
      const { instance, objectIndices, name, value } = this.pendingUpdatePatches[patchKey];
      objectIndices.sort((a, b) => a - b);

      const updateBatches: number[][] = [];
      objectIndices.forEach((i) => {
        const lastUpdateBatch = updateBatches[updateBatches.length - 1];

        if (!lastUpdateBatch || i !== lastUpdateBatch[lastUpdateBatch.length - 1] + 1) {
          updateBatches.push([i]);
        } else {
          lastUpdateBatch.push(i);
        }
      });

      updateBatches.forEach((indices) => {
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

  /**
   * get called in RenderGraphPlugin
   */
  attach(device: Device, renderingService: RenderingService) {
    this.device = device;
    this.renderingService = renderingService;
  }

  add(object: DisplayObject) {
    // @ts-ignore
    const renderable3D = object.renderable3D as Renderable3D;
    if (renderable3D && !renderable3D.meshes.length) {
      const renderer = this.rendererFactory(object.nodeName);
      if (renderer) {
        renderer.meshes.forEach((meshTag, i) => {
          renderable3D.meshes[i] = undefined;
          const shouldSubmit = renderer.shouldSubmitRenderInst(object, i);
          if (shouldSubmit) {
            let existedMesh = this.meshes.find(
              (mesh) =>
                meshTag === mesh.constructor && mesh.index === i && mesh.shouldMerge(object, i),
            );
            if (!existedMesh) {
              existedMesh = this.meshFactory(meshTag);
              existedMesh.renderer = renderer;
              existedMesh.index = i;
              this.meshes.push(existedMesh);
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

  updateAttribute(object: DisplayObject, attributeName: string, newValue: any) {
    // @ts-ignore
    const renderable3D = object.renderable3D as Renderable3D;
    const renderer = this.rendererFactory(object.nodeName);
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
            renderable3D.meshes[renderable3D.meshes.indexOf(existedMesh)] = undefined;
          }

          if (shouldSubmit) {
            // clear first
            existedMesh = this.meshes.find(
              (mesh) =>
                meshCtor === mesh.constructor && mesh.index === i && mesh.shouldMerge(object, i),
            );

            if (!existedMesh) {
              existedMesh = this.meshFactory(meshCtor);
              existedMesh.renderer = renderer;
              existedMesh.index = i;
              existedMesh.init(this.device, this.renderingService);
              this.meshes.push(existedMesh);
            }

            if (existedMesh) {
              existedMesh.objects.push(object);
              renderable3D.meshes[i] = existedMesh;
            }
          }
        }

        if (shouldSubmit && existedMesh && existedMesh.inited && !existedMesh.geometryDirty) {
          const patchKey = existedMesh.id + attributeName;
          if (!this.pendingUpdatePatches[patchKey]) {
            this.pendingUpdatePatches[patchKey] = {
              instance: existedMesh,
              objectIndices: [],
              name: attributeName,
              value: newValue,
            };
          }

          const objectIdx = existedMesh.objects.indexOf(object);
          if (this.pendingUpdatePatches[patchKey].objectIndices.indexOf(objectIdx) === -1) {
            this.pendingUpdatePatches[patchKey].objectIndices.push(objectIdx);
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
          const shouldSubmit = mesh.renderer.shouldSubmitRenderInst(object, mesh.index);
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
