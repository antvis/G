import type { Canvas } from '@antv/g';
import {
  Buffer,
  BufferFrequencyHint,
  BufferUsage,
  RenderGraphPlugin,
  GPUBufferUsage,
} from '@antv/g-plugin-webgl-renderer';
import type { Device, ComputePipeline } from '@antv/g-plugin-webgl-renderer';
import { AST_TOKEN_TYPES, KernelBundle, STORAGE_CLASS, Target } from './interface';

export interface KernelOptions {
  canvas: Canvas;
  code?: string;
  bundle?: KernelBundle;
}

export interface KernelBufferDescriptor {
  name: string;
  data: ArrayBufferView;
}

const platformString2Target: Record<string, Target> = {
  WebGL1: Target.GLSL100,
  WebGL2: Target.GLSL450,
  WebGPU: Target.WGSL,
};

export class Kernel {
  /**
   * Canvas from `@antv/g`
   */
  private canvas: Canvas;

  /**
   * WGSL code, won't be transpiled by compiler
   */
  private code: string;

  /**
   * bundle contains GLSL/WGSL
   */
  private bundle: KernelBundle;

  /**
   * underlying GPU device
   */
  private device: Device;

  private computePipeline: ComputePipeline;

  private bufferCache: Record<
    string,
    {
      buffer: Buffer;
      group: number;
      binding: number;
    }
  > = {};

  constructor({ canvas, code, bundle }: KernelOptions) {
    this.canvas = canvas;
    this.code = code;
    this.bundle = bundle;

    this.init();
  }

  private init() {
    const renderPlugin = this.canvas.container.get<RenderGraphPlugin>(RenderGraphPlugin);
    this.device = renderPlugin.getDevice();
    const target = platformString2Target[this.device.queryVendorInfo().platformString];

    if (this.code) {
      this.bundle = {
        shaders: {
          WGSL: this.code,
          GLSL450: '',
          GLSL100: '',
        },
        context: {
          name: '',
          dispatch: [0, 0, 0],
          threadGroupSize: [0, 0, 0],
          maxIteration: 1,
          needPingpong: false,
          output: {
            name: '',
          },
          uniforms: this.extractStorages(this.code),
          defines: [],
          globalDeclarations: [],
        },
      };
    }

    const program = this.device.createProgram({
      preprocessedCompute: this.bundle.shaders[target],
    });

    this.computePipeline = this.device.createComputePipeline({
      program,
      bindingLayouts: [],
      inputLayout: null,
    });
  }

  createBuffer(descriptor: KernelBufferDescriptor): Buffer {
    const { name, data } = descriptor;

    const existed = this.bufferCache[name];
    if (existed) {
      existed.buffer.destroy();
    }

    const storages = this.bundle.context.uniforms;
    const existedIndex = storages.findIndex((u) => u.name === name);
    if (existedIndex > -1) {
      const { storageClass, writeonly, readonly, group, binding } = storages[existedIndex];
      const isUniform = storageClass === STORAGE_CLASS.Uniform;
      const buffer = this.device.createBuffer({
        usage: isUniform ? BufferUsage.Uniform : BufferUsage.Storage,
        hint: BufferFrequencyHint.Dynamic,
        flags: isUniform
          ? GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
          : GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        viewOrSize: data,
      });

      this.bufferCache[name] = {
        buffer,
        binding: binding || existedIndex,
        group: group || 0, // fixed group 0
      };
    }

    return this.bufferCache[name].buffer;
  }

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
        numUniformBuffers: Object.keys(this.bufferCache).length,
      },
      uniformBufferBindings: Object.keys(this.bufferCache).map((name) => {
        return {
          buffer: this.bufferCache[name].buffer,
          wordCount: 0,
        };
      }),
    });

    // fixed bind group 0
    computePass.setBindings(0, bindings);
    computePass.dispatch(...dispatchParams);
    this.device.submitPass(computePass);
  }

  /**
   * readback buffer async
   */
  async readBuffer(buffer: Buffer): Promise<ArrayBufferView> {
    const readback = this.device.createReadback();
    return readback.readBuffer(buffer);
  }

  destroy() {
    Object.keys(this.bufferCache).forEach((name) => {
      this.bufferCache[name].buffer.destroy();
    });
  }

  private extractStorages(wgslCode: string): KernelBundle['context']['uniforms'] {
    // [[group(0), binding(0)]] var<storage, read> firstMatrix : Matrix;
    const storages: KernelBundle['context']['uniforms'] = [];
    wgslCode.replace(
      /\[\[\s*group\((\d+)\)\s*,\s*binding\((\d+)\)\]\]\s+var<(.*),\s*(.*)>\s*(\S*)\s*\:/g,
      (_, group, binding, storage, accessMode, name) => {
        storages.push({
          name,
          storageClass: storage === 'storage' ? STORAGE_CLASS.StorageBuffer : STORAGE_CLASS.Uniform,
          readonly: accessMode === 'read',
          writeonly: accessMode === 'write',
          type: AST_TOKEN_TYPES.Void, // FIXME: Struct
          group,
          binding,
        });
        return '';
      },
    );

    return storages;
  }
}
