import { Program, ProgramDescriptorSimple, ResourceType } from '../interfaces';
import { IDevice_WebGPU } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';

export class Program_WebGPU extends ResourceBase_WebGPU implements Program {
  type: ResourceType.Program = ResourceType.Program;
  descriptor: ProgramDescriptorSimple;
  vertexStage: GPUProgrammableStage | null = null;
  fragmentStage: GPUProgrammableStage | null = null;
  computeStage: GPUProgrammableStage | null = null;

  constructor({
    id,
    device,
    descriptor,
  }: {
    id: number;
    device: IDevice_WebGPU;
    descriptor: ProgramDescriptorSimple;
  }) {
    super({ id, device });

    this.descriptor = descriptor;
    if (descriptor.preprocessedVert) {
      this.vertexStage = this.createShaderStage(descriptor.preprocessedVert);
    }
    if (descriptor.preprocessedFrag) {
      this.fragmentStage = this.createShaderStage(descriptor.preprocessedFrag);
    }
    if (descriptor.preprocessedCompute) {
      this.computeStage = this.createShaderStage(descriptor.preprocessedCompute);
    }
  }

  private createShaderStage(sourceText: string): GPUProgrammableStage {
    // @see https://www.w3.org/TR/webgpu/#dom-gpudevice-createshadermodule
    const shaderModule = this.device.device.createShaderModule({ code: sourceText });
    return { module: shaderModule, entryPoint: 'main' };
  }
}
