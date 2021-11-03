import { RenderPipeline, RenderPipelineDescriptor, ResourceType } from '../interfaces';
import { IDevice_WebGPU } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';

export class RenderPipeline_WebGPU extends ResourceBase_WebGPU implements RenderPipeline {
  type: ResourceType.RenderPipeline = ResourceType.RenderPipeline;

  descriptor: RenderPipelineDescriptor;
  isCreating: boolean = false;
  gpuRenderPipeline: GPURenderPipeline | null = null;

  constructor({
    id,
    device,
    descriptor,
  }: {
    id: number;
    device: IDevice_WebGPU;
    descriptor: RenderPipelineDescriptor;
  }) {
    super({ id, device });

    this.descriptor = descriptor;
    this.device.ensureRenderPipeline(this);
  }

  getBindGroupLayout(index: number) {
    return this.gpuRenderPipeline.getBindGroupLayout(index);
  }
}
