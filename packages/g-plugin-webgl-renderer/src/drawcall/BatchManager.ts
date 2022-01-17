import { DisplayObject, RenderingService } from '@antv/g';
import { inject, singleton } from 'mana-syringe';
import { Device } from '../platform';
import { RendererFactory } from '../tokens';
import { Batch } from './Batch';

let stencilRefCounter = 1;

@singleton()
export class BatchManager {
  @inject(RendererFactory)
  private rendererFactory: (shape: string) => Batch;

  private device: Device;
  private renderingService: RenderingService;

  private batches: Batch[] = [];

  private stencilRefCache: Record<number, number> = {};

  getBatches() {
    return this.batches;
  }

  attach(device: Device, renderingService: RenderingService) {
    this.device = device;
    this.renderingService = renderingService;
  }

  add(object: DisplayObject) {
    // @ts-ignore
    const renderable3d = object.renderable3D;
    if (renderable3d && !renderable3d.batchId) {
      let existed = this.batches.find((batch) => batch.checkBatchable(object));
      if (!existed) {
        existed = this.rendererFactory(object.nodeName);

        if (existed) {
          existed.init(this.device, this.renderingService);
          this.batches.push(existed);
        }
      }

      if (existed) {
        existed.merge(object);
        renderable3d.batchId = existed.id;
      }
    }
  }

  remove(object: DisplayObject) {
    // @ts-ignore
    const renderable3D = object.renderable3D;
    if (renderable3D && renderable3D.batchId) {
      const existedIndex = this.batches.findIndex((batch) => batch.id === renderable3D.batchId);
      const existed = this.batches[existedIndex];
      if (existed) {
        existed.purge(object);

        // remove batch
        if (existed.objects.length === 0) {
          this.batches.splice(existedIndex, 1);
        }
      }
    }
  }

  updateAttribute(object: DisplayObject, attributeName: string, newValue: any) {
    // @ts-ignore
    const renderable3D = object.renderable3D;
    if (renderable3D) {
      const batch = this.batches.find((batch) => renderable3D.batchId === batch.id);
      if (batch) {
        batch.updateAttribute(object, attributeName, newValue);
      }
    }
  }

  changeRenderOrder(object: DisplayObject, renderOrder: number) {
    // @ts-ignore
    const renderable3D = object.renderable3D;
    if (renderable3D) {
      const batch = this.batches.find((batch) => renderable3D.batchId === batch.id);
      if (batch) {
        batch.changeRenderOrder(object, renderOrder);
      }
    }
  }

  getStencilRef(object: DisplayObject) {
    if (!this.stencilRefCache[object.entity]) {
      this.stencilRefCache[object.entity] = stencilRefCounter++;
    }
    return this.stencilRefCache[object.entity];
  }
}
