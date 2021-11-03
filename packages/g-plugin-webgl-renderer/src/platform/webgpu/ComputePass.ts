import { Bindings, ComputePass, ComputePassDescriptor, ComputePipeline } from '../interfaces';
import { assert, assertExists } from '../utils';
import { Bindings_WebGPU } from './Bindings';
import { ComputePipeline_WebGPU } from './ComputePipeline';

export class ComputePass_WebGPU implements ComputePass {
  commandEncoder: GPUCommandEncoder | null = null;
  descriptor: ComputePassDescriptor;
  private gpuComputePassDescriptor: GPUComputePassDescriptor;
  private gpuComputePassEncoder: GPUComputePassEncoder | null = null;

  /**
   * @see https://www.w3.org/TR/webgpu/#dom-gpucomputepassencoder-dispatch
   */
  dispatch(x: number, y?: number, z?: number): void {
    this.gpuComputePassEncoder.dispatch(x, y, z);
    // TODO: dispatchIndirect read from GPUBuffer
  }

  finish() {
    this.gpuComputePassEncoder.endPass();
    this.gpuComputePassEncoder = null;

    return this.commandEncoder.finish();
  }

  /**
   * @see https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-begincomputepass
   */
  beginComputePass(computePassDescriptor: ComputePassDescriptor): void {
    assert(this.gpuComputePassEncoder === null);
    this.setComputePassDescriptor(computePassDescriptor);
    this.gpuComputePassEncoder = this.commandEncoder.beginComputePass(
      this.gpuComputePassDescriptor,
    );
  }

  setPipeline(pipeline_: ComputePipeline): void {
    const pipeline = pipeline_ as ComputePipeline_WebGPU;
    const gpuComputePipeline = assertExists(pipeline.gpuComputePipeline);
    this.gpuComputePassEncoder.setPipeline(gpuComputePipeline);
  }

  setBindings(bindingLayoutIndex: number, bindings_: Bindings): void {
    const bindings = bindings_ as Bindings_WebGPU;
    this.gpuComputePassEncoder.setBindGroup(bindingLayoutIndex, bindings.gpuBindGroup[0]);
  }

  private setComputePassDescriptor(descriptor: ComputePassDescriptor): void {
    this.descriptor = descriptor;
  }
}
