import { injectable, inject } from 'mana-syringe';
import { DisplayObject, RenderingService, DefaultCamera, Camera } from '@antv/g';
import { Device } from '../platform';
import { RenderHelper } from '../render/RenderHelper';
import { RenderInstList } from '../render/RenderInstList';
import { TexturePool } from '../TexturePool';
import { BatchMesh } from './BatchMesh';
import { LightPool } from '../LightPool';
import { MeshFactory } from '../tokens';
import { BatchManager } from './BatchManager';
import { ShaderMaterial } from '../materials';
import { BufferGeometry } from '../geometries';

/**
 * render order start from 0, our default camera's Z is 500
 */
export const RENDER_ORDER_SCALE = 1 / 200;

let counter = 1;
export interface Batch {
  beforeRender?(list: RenderInstList): void;
  afterRender?(list: RenderInstList): void;
}

/**
 * A container for multiple display objects with the same `style`,
 * eg. 1000 Circles with the same stroke color, but their position, radius can be different
 */
@injectable()
export abstract class Batch {
  static tag = 'batch';

  static CommonBufferIndex = 0;

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

  @inject(MeshFactory)
  protected meshFactory: (shape: string) => BatchMesh;

  device: Device;

  renderingService: RenderingService;

  id = counter++;

  type: string;

  objects: DisplayObject[] = [];

  /**
   * describe render insts used in this draw call
   * eg. a Polygon with stroke will use 2 renderInsts
   */
  protected batchMeshList: BatchMesh[] = [];
  private clipPathMeshCreated = false;

  get instance() {
    return this.objects[0];
  }

  protected abstract createBatchMeshList(): void;
  init(device: Device, renderingService: RenderingService) {
    this.device = device;
    this.renderingService = renderingService;
    this.createBatchMeshList();
    this.batchMeshList.forEach((mesh) => {
      mesh.renderingService = renderingService;
    });
  }

  /**
   * provide validator for current shape
   */
  protected abstract validate(object: DisplayObject): boolean;
  checkBatchable(object: DisplayObject): boolean {
    if (this.objects.length === 0) {
      return true;
    }

    if (this.instance.nodeName !== object.nodeName) {
      return false;
    }

    // can't be merged when using clipPath
    if (object.parsedStyle.clipPath) {
      return false;
    }

    return this.validate(object);
  }

  merge(object: DisplayObject) {
    this.type = object.nodeName;

    if (this.objects.indexOf(object) === -1) {
      this.objects.push(object);
      this.batchMeshList.forEach((mesh) => {
        mesh.geometryDirty = true;
      });
    }
  }

  purge(object: DisplayObject) {
    const index = this.objects.indexOf(object);
    this.objects.splice(index, 1);
    this.batchMeshList.forEach((mesh) => {
      mesh.geometryDirty = true;
    });
  }

  destroy() {
    this.batchMeshList.forEach((mesh) => {
      mesh.destroy();
    });
  }

  render(list: RenderInstList) {
    if (this.beforeRender) {
      this.beforeRender(list);
    }

    this.applyClipPath();

    this.batchMeshList.forEach((mesh, i) => {
      // new render instance
      const renderInst = this.renderHelper.renderInstManager.newRenderInst();

      mesh.device = this.device;

      let objects = this.objects;
      if (mesh.clipPathTarget) {
        objects = [mesh.clipPath];
      }

      if (mesh.shouldSubmitRenderInst(renderInst, objects, i)) {
        mesh.applyRenderInst(renderInst, objects, i);
        this.renderHelper.renderInstManager.submitRenderInst(renderInst, list);
      }
    });

    if (this.afterRender) {
      this.afterRender(list);
    }

    // finish rendering...
    this.objects.forEach((object) => {
      object.renderable.dirty = false;
    });
  }

  changeRenderOrder(object: DisplayObject, renderOrder: number) {
    const index = this.objects.indexOf(object);
    this.batchMeshList.forEach((mesh) => {
      if (!mesh.material) {
        mesh.material = new ShaderMaterial(this.device);
      }
      if (!mesh.geometry) {
        mesh.geometry = new BufferGeometry(this.device);
      }
      mesh.changeRenderOrder(object, index, renderOrder);
    });
  }

  updateAttribute(object: DisplayObject, name: string, value: any): void {
    const index = this.objects.indexOf(object);
    this.batchMeshList.forEach((mesh) => {
      if (!mesh.material) {
        mesh.material = new ShaderMaterial(this.device);
      }
      if (!mesh.geometry) {
        mesh.geometry = new BufferGeometry(this.device);
      }
      mesh.updateAttribute(object, index, name, value);
    });
  }

  private findClipPath(): DisplayObject | null {
    let node = this.instance;
    while (node && node.style) {
      if (node.style.clipPath) {
        return node.style.clipPath;
      }
      node = node.parentNode as DisplayObject;
    }
    return null;
  }

  private applyClipPath() {
    // find clipPath
    const clipPathShape = this.findClipPath();
    if (clipPathShape && !this.clipPathMeshCreated) {
      if (this.batchMeshList.length === 0) {
        return;
      }

      const clipPathMesh = this.meshFactory(clipPathShape.nodeName);
      clipPathMesh.clipPathTarget = this.instance;

      // draw clipPath first
      this.batchMeshList.unshift(clipPathMesh);
      this.clipPathMeshCreated = true;

      this.batchMeshList.forEach((mesh, i) => {
        mesh.clipPath = clipPathShape;

        if (!mesh.material) {
          mesh.material = new ShaderMaterial(this.device);
        }
        mesh.material.stencilRef = this.batchManager.getStencilRef(clipPathShape);
      });
    }

    // remove clipPath from render queue
    if (!clipPathShape) {
      if (this.batchMeshList.length && this.batchMeshList[0].clipPathTarget) {
        this.batchMeshList.shift();
      }
    }
  }
}
