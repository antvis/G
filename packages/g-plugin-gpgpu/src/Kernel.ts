import { Buffer, BufferFrequencyHint, BufferUsage } from '@antv/g-plugin-webgl-renderer';
import type { Device, ComputePipeline } from '@antv/g-plugin-webgl-renderer';
import { AST_TOKEN_TYPES, KernelBundle, STORAGE_CLASS, Target } from './interface';

export interface KernelOptions {
  device: Device;
  computeShader?: string;
  bundle?: KernelBundle;
}

export interface KernelBufferDescriptor {
  name?: string;
  binding?: number;
  data: ArrayBufferView;
}

const platformString2Target: Record<string, Target> = {
  WebGL1: Target.GLSL100,
  WebGL2: Target.GLSL450,
  WebGPU: Target.WGSL,
};

export class Kernel {
  /**
   * WGSL code, won't be transpiled by compiler
   */
  private computeShader: string;

  /**
   * bundle contains GLSL/WGSL
   */
  private bundle: KernelBundle;

  /**
   * underlying GPU device
   */
  private device: Device;

  private computePipeline: ComputePipeline;

  private buffers: {
    name: string;
    buffer: Buffer;
    wordCount: number;
    group: number;
    binding: number;
    bindingType: 'uniform' | 'storage' | 'read-only-storage';
  }[] = [];

  constructor({ device, computeShader, bundle }: KernelOptions) {
    this.device = device;
    this.computeShader = computeShader;
    this.bundle = bundle;

    this.init();
  }

  private init() {
    const target = platformString2Target[this.device.queryVendorInfo().platformString];

    if (this.computeShader) {
      this.bundle = {
        shaders: {
          WGSL: this.computeShader,
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
          uniforms: this.extractStorages(this.computeShader),
          defines: [],
          globalDeclarations: [],
        },
      };
    }

    const program = this.device.createProgramSimple({
      preprocessedCompute: this.bundle.shaders[target],
    });

    this.computePipeline = this.device.createComputePipeline({
      program,
      bindingLayouts: [],
      inputLayout: null,
    });
  }

  /**
   * set or update buffer by binding number,
   * it should match binding declared in compute shader
   */
  setBinding(binding: number, buffer: Buffer) {
    // search by binding
    const existed = this.buffers.find((buffer) => buffer.binding === binding);
    if (existed) {
      existed.buffer.destroy();
      this.buffers.splice(this.buffers.indexOf(existed), 1);
    }

    const storages = this.bundle.context.uniforms;
    const existedIndex = storages.findIndex((u) => u.binding === binding);

    if (existedIndex > -1) {
      const { storageClass, readonly, writeonly, group, binding, name } = storages[existedIndex];
      const isUniform = storageClass === STORAGE_CLASS.Uniform;
      // const buffer = this.device.createBuffer({
      //   usage: isUniform ? BufferUsage.Uniform : BufferUsage.Storage,
      //   hint: BufferFrequencyHint.Dynamic,
      //   flags: !readonly ? BufferUsage.COPY_SRC : 0,
      //   viewOrSize: data,
      // });

      this.buffers.push({
        name,
        buffer,
        // @ts-ignore
        wordCount: buffer.size / 4,
        binding: binding,
        bindingType: isUniform ? 'uniform' : readonly ? 'read-only-storage' : 'storage',
        group: group || 0, // fixed group 0
      });

      return buffer;
    }

    return null;
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

    const uniforms = this.buffers.filter(({ bindingType }) => bindingType === 'uniform');
    const storages = this.buffers.filter(({ bindingType }) => bindingType !== 'uniform');

    const bindings = this.device.createBindings({
      pipeline: this.computePipeline,
      bindingLayout: {
        numUniformBuffers: uniforms.length,
        storageEntries: storages.map(({ bindingType }) => ({ type: bindingType })),
      },
      uniformBufferBindings: uniforms.map(({ buffer, wordCount }) => ({
        buffer,
        wordCount,
      })),
      storageBufferBindings: storages.map(({ buffer, wordCount }) => ({
        buffer,
        wordCount,
      })),
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
    this.buffers.forEach(({ buffer }) => {
      buffer.destroy();
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
          group: Number(group),
          binding: Number(binding),
        });
        return '';
      },
    );

    wgslCode.replace(
      /\[\[\s*group\((\d+)\)\s*,\s*binding\((\d+)\)\]\]\s+var<uniform>\s*(\S*)\s*\:/g,
      (_, group, binding, name) => {
        storages.push({
          name,
          storageClass: STORAGE_CLASS.Uniform,
          readonly: true,
          writeonly: false,
          type: AST_TOKEN_TYPES.Void, // FIXME: Struct
          group: Number(group),
          binding: Number(binding),
        });
        return '';
      },
    );

    return storages;
  }
}
