import type {
  Buffer,
  Bindings,
  ComputePass,
  ComputePipeline,
} from '@antv/g-plugin-device-renderer';
// import { assert, assertExists } from '@antv/g-plugin-device-renderer';
// import type { ComputePipeline_GL } from './ComputePipeline';

export class ComputePass_GL implements ComputePass {
  /**
   * @see https://www.w3.org/TR/webgpu/#dom-gpucomputepassencoder-dispatch
   */
  dispatchWorkgroups(
    workgroupCountX: number,
    workgroupCountY?: number,
    workgroupCountZ?: number,
  ) {}

  dispatchWorkgroupsIndirect(indirectBuffer: Buffer, indirectOffset: number) {}

  finish() {
    // this.gpuComputePassEncoder.end();
    // this.gpuComputePassEncoder = null;
    // return this.commandEncoder.finish();
  }

  /**
   * @see https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-begincomputepass
   */
  beginComputePass(): void {
    // assert(this.gpuComputePassEncoder === null);
    // this.setComputePassDescriptor(computePassDescriptor);
    // this.gpuComputePassEncoder = this.commandEncoder.beginComputePass(
    //   this.gpuComputePassDescriptor,
    // );
  }

  setPipeline(pipeline_: ComputePipeline): void {
    // const pipeline = pipeline_ as ComputePipeline_WebGPU;
    // const gpuComputePipeline = assertExists(pipeline.gpuComputePipeline);
    // this.gpuComputePassEncoder.setPipeline(gpuComputePipeline);
  }

  setBindings(bindingLayoutIndex: number, bindings_: Bindings): void {
    // const bindings = bindings_ as Bindings_WebGPU;
    // this.gpuComputePassEncoder.setBindGroup(bindingLayoutIndex, bindings.gpuBindGroup[0]);
  }

  pushDebugGroup(name: string) {}
  popDebugGroup() {}
  insertDebugMarker(markerLabel: string) {}
}
