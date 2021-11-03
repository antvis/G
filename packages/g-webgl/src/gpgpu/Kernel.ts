import type { Canvas } from '@antv/g';
import { CanvasEvent } from '@antv/g';
import {
  Buffer,
  BufferFrequencyHint,
  BufferUsage,
  Format,
  RenderGraphPlugin,
} from '@antv/g-plugin-webgl-renderer';
import type { Device, ComputePipeline } from '@antv/g-plugin-webgl-renderer';
import { GPUBufferUsage } from '@antv/g-plugin-webgl-renderer/src/platform/webgpu/constants';

export interface KernelOptions {
  canvas: Canvas;
  code: string;
}

export interface KernelBufferDescriptor {
  group: number;
  binding: number;
  usage: 'storage' | 'uniform';
  // @see https://www.w3.org/TR/WGSL/#access-mode
  accessMode: 'read' | 'write' | 'read_write';
  view: ArrayBufferView;
}

export class Kernel {
  private canvas: Canvas;
  private code: string;

  private device: Device;

  private compiled = false;

  private computePipeline: ComputePipeline;

  private buffers: Buffer[] = [];

  private bufferGroupLayout: {
    group: number;
    binding: number;
  }[] = [];

  constructor({ canvas, code }: KernelOptions) {
    this.canvas = canvas;
    this.code = code;

    this.init();
  }

  private init() {
    const renderPlugin = this.canvas.container.get<RenderGraphPlugin>(RenderGraphPlugin);
    this.device = renderPlugin.getDevice();

    const program = this.device.createProgram({
      preprocessedCompute: this.code,
    });

    this.computePipeline = this.device.createComputePipeline({
      program,
      bindingLayouts: [],
      inputLayout: null,
    });
  }

  createBuffer(descriptor: KernelBufferDescriptor): Buffer {
    let index = this.bufferGroupLayout.findIndex(
      ({ binding, group }) => binding === descriptor.binding && group === descriptor.group,
    );
    if (index > -1) {
      // destroy existed buffer
      this.buffers[index].destroy();
      // re-create buffer
      this.buffers[index] = this.createUnderlyingBuffer(descriptor);
    } else {
      index = this.buffers.length;
      const buffer = this.createUnderlyingBuffer(descriptor);
      this.buffers.push(buffer);
      this.bufferGroupLayout.push({
        binding: descriptor.binding,
        group: descriptor.group,
      });
    }

    return this.buffers[index];
  }

  private createUnderlyingBuffer(descriptor: KernelBufferDescriptor) {
    const isUniform = descriptor.usage === 'uniform';
    return this.device.createBuffer({
      usage: isUniform ? BufferUsage.Uniform : BufferUsage.Storage,
      hint: BufferFrequencyHint.Dynamic,
      flags: isUniform
        ? GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        : GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
      viewOrSize: descriptor.view,
    });
  }

  // setBuffer(kernelBuffer: KernelBuffer) {
  //   kernelBuffer.dirty = true;

  //   const existed = this.buffers.find(
  //     (b) =>
  //       b.descriptor.group === kernelBuffer.descriptor.group &&
  //       b.descriptor.binding === kernelBuffer.descriptor.binding,
  //   );
  //   if (existed) {
  //     // update view
  //     existed.descriptor.view = kernelBuffer.descriptor.view;
  //   } else {
  //     this.buffers.push(kernelBuffer);
  //   }
  //   return this;
  // }

  dispatch(x: [number, number, number] | number, y: number = 1, z: number = 1) {
    let dispatchParams: [number, number, number];
    if (Array.isArray(x)) {
      dispatchParams = x;
    } else {
      dispatchParams = [x, y, z];
    }

    const computePass = this.device.createComputePass({});
    computePass.setPipeline(this.computePipeline);

    const bindings = this.device.createBindings({
      pipeline: this.computePipeline,
      bindingLayout: {
        numUniformBuffers: this.buffers.length,
      },
      uniformBufferBindings: this.buffers.map((buffer) => {
        return {
          buffer,
          wordCount: 0,
        };
      }),
    });

    // fixed bind group 0
    computePass.setBindings(0, bindings);
    computePass.dispatch(...dispatchParams);
    this.device.submitPass(computePass);
  }

  async readBuffer(buffer: Buffer): Promise<ArrayBufferView> {
    const readback = this.device.createReadback();
    return readback.readBuffer(buffer);
  }
}
