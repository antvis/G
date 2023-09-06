import { DeviceRenderer } from '@antv/g-webgpu';
import type { KernelBundle } from './interface';
import { Target } from './interface';

export interface KernelOptions {
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
  private device: DeviceRenderer.Device;

  private computePipeline: DeviceRenderer.ComputePipeline;

  private buffers: {
    name: string;
    buffer: DeviceRenderer.Buffer;
    wordCount: number;
    group: number;
    binding: number;
    bindingType: 'uniform' | 'storage' | 'read-only-storage';
  }[] = [];

  constructor(
    device: DeviceRenderer.Device,
    { computeShader, bundle }: KernelOptions,
  ) {
    this.device = device;
    this.computeShader = computeShader;
    this.bundle = bundle;

    this.init();
  }

  private init() {
    const target =
      platformString2Target[this.device.queryVendorInfo().platformString];

    if (this.computeShader) {
      if (!this.bundle) {
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
            uniforms: [],
            defines: [],
            globalDeclarations: [],
          },
        };
      } else {
        this.bundle.shaders.WGSL = this.computeShader;
      }
    }

    const program = this.device.createProgram({
      compute: {
        wgsl: this.bundle.shaders[target],
      },
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
  setBinding(binding: number, buffer: DeviceRenderer.Buffer) {
    // @ts-ignore
    const { usage } = buffer;

    const isUniform = usage & DeviceRenderer.BufferUsage.UNIFORM;
    const isWritable = usage & DeviceRenderer.BufferUsage.COPY_SRC;

    // search by binding
    const existed = this.buffers.find((buffer) => buffer.binding === binding);
    if (existed) {
      existed.buffer.destroy();
      this.buffers.splice(this.buffers.indexOf(existed), 1);
    }

    this.buffers.push({
      name: '',
      buffer,
      // @ts-ignore
      wordCount: buffer.size / 4,
      binding,
      bindingType: isUniform
        ? 'uniform'
        : isWritable
        ? 'storage'
        : 'read-only-storage',
      group: 0, // fixed group 0
    });

    return null;
  }

  dispatch(x: [number, number, number] | number, y = 1, z = 1) {
    let dispatchParams: [number, number, number];
    if (Array.isArray(x)) {
      dispatchParams = x;
    } else {
      dispatchParams = [x, y, z];
    }

    const computePass = this.device.createComputePass();
    computePass.setPipeline(this.computePipeline);

    const uniforms = this.buffers.filter(
      ({ bindingType }) => bindingType === 'uniform',
    );
    const storages = this.buffers.filter(
      ({ bindingType }) => bindingType !== 'uniform',
    );

    const bindings = this.device.createBindings({
      pipeline: this.computePipeline,
      bindingLayout: {
        numUniformBuffers: uniforms.length,
        storageEntries: storages.map(({ bindingType }) => ({
          type: bindingType,
        })),
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
    computePass.setBindings(0, bindings, []);
    computePass.dispatch(...dispatchParams);
    this.device.submitPass(computePass);
  }

  /**
   * readback buffer async
   */
  async readBuffer(buffer: DeviceRenderer.Buffer): Promise<ArrayBufferView> {
    const readback = this.device.createReadback();
    return readback.readBuffer(buffer);
  }

  destroy() {
    this.buffers.forEach(({ buffer }) => {
      buffer.destroy();
    });
  }
}
