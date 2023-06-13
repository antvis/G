import type {
  Program,
  ProgramDescriptorSimple,
} from '@antv/g-plugin-device-renderer';
import { ResourceType } from '@antv/g-plugin-device-renderer';
import type { Device_WebGPU } from './Device';
import type { IDevice_WebGPU } from './interfaces';
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
      this.vertexStage = this.createShaderStage(
        descriptor.preprocessedVert,
        'vertex',
      );
    }
    if (descriptor.preprocessedFrag) {
      this.fragmentStage = this.createShaderStage(
        descriptor.preprocessedFrag,
        'fragment',
      );
    }
    if (descriptor.preprocessedCompute) {
      // FIXME: Only support WGSL now
      this.computeStage = this.createShaderStage(
        descriptor.preprocessedCompute,
        'compute',
      );
    }
  }

  private createShaderStage(
    sourceText: string,
    shaderStage: 'vertex' | 'fragment' | 'compute',
  ): GPUProgrammableStage {
    const validationEnabled = false;

    let code = sourceText;
    if (shaderStage !== 'compute') {
      try {
        code = (this.device as Device_WebGPU).glsl_compile(
          sourceText,
          shaderStage,
          validationEnabled,
        );
      } catch (e) {
        console.error(e, sourceText);
        throw new Error('whoops');
      }
    }

    // Workaround for https://github.com/gfx-rs/naga/issues/1355
    for (const depthTextureName of ['u_TextureFramebufferDepth']) {
      if (!code.includes(depthTextureName)) continue;

      code = code.replace(
        `var T_${depthTextureName}: texture_2d<f32>;`,
        `var T_${depthTextureName}: texture_depth_2d;`,
      );
      code = code.replace(
        new RegExp(`textureSample\\\(T_${depthTextureName}(.*)\\\);$`, 'gm'),
        (sub, cap) => {
          return `vec4<f32>(textureSample(T_${depthTextureName}${cap}), 0.0, 0.0, 0.0);`;
        },
      );
    }
    // @see https://www.w3.org/TR/webgpu/#dom-gpudevice-createshadermodule
    const shaderModule = this.device.device.createShaderModule({ code });
    return { module: shaderModule, entryPoint: 'main' };
  }
}
