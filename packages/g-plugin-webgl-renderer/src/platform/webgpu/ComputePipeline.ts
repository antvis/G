import { ComputePipeline, ComputePipelineDescriptor, ResourceType } from '../interfaces';
import { IDevice_WebGPU } from './interfaces';
import { Program_WebGPU } from './Program';
import { ResourceBase_WebGPU } from './ResourceBase';

export class ComputePipeline_WebGPU extends ResourceBase_WebGPU implements ComputePipeline {
  type: ResourceType.ComputePipeline = ResourceType.ComputePipeline;

  descriptor: ComputePipelineDescriptor;
  gpuComputePipeline: GPUComputePipeline | null = null;

  constructor({
    id,
    device,
    descriptor,
  }: {
    id: number;
    device: IDevice_WebGPU;
    descriptor: ComputePipelineDescriptor;
  }) {
    super({ id, device });

    this.descriptor = descriptor;

    const program = descriptor.program as Program_WebGPU;
    const computeStage = program.computeStage;
    if (computeStage === null) return;

    const gpuComputePipeline: GPUComputePipelineDescriptor = {
      compute: {
        ...computeStage,
      },
    };

    // @see https://www.w3.org/TR/webgpu/#dom-gpudevice-createrenderpipeline
    this.gpuComputePipeline = this.device.device.createComputePipeline(gpuComputePipeline);

    if (this.name !== undefined) {
      this.gpuComputePipeline.label = this.name;
    }
  }

  getBindGroupLayout(index: number) {
    return this.gpuComputePipeline.getBindGroupLayout(index);
  }
}
