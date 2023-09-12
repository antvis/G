import type {
  Program,
  ProgramDescriptor,
} from '@antv/g-plugin-device-renderer';
import { ResourceType } from '@antv/g-plugin-device-renderer';
import type { Device_WebGPU } from './Device';
import type { IDevice_WebGPU } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';

export class Program_WebGPU extends ResourceBase_WebGPU implements Program {
  type: ResourceType.Program = ResourceType.Program;
  descriptor: ProgramDescriptor;
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
    descriptor: ProgramDescriptor;
  }) {
    super({ id, device });

    this.descriptor = descriptor;
    if (descriptor.vertex) {
      this.vertexStage = this.createShaderStage(descriptor.vertex, 'vertex');
    }
    if (descriptor.fragment) {
      this.fragmentStage = this.createShaderStage(
        descriptor.fragment,
        'fragment',
      );
    }
    if (descriptor.compute) {
      // Only support WGSL now
      this.computeStage = this.createShaderStage(descriptor.compute, 'compute');
    }
  }

  /** @hidden */
  setUniformsLegacy(uniforms: Record<string, any> = {}) {}

  private createShaderStage(
    {
      glsl,
      wgsl,
      entryPoint,
    }: {
      glsl?: string;
      wgsl?: string;
      entryPoint?: string;
    },
    shaderStage: 'vertex' | 'fragment' | 'compute',
  ): GPUProgrammableStage {
    const validationEnabled = false;

    // Use user-defined WGSL first.
    let code = wgsl;
    if (!code) {
      try {
        code = (this.device as Device_WebGPU)['glsl_compile'](
          glsl,
          shaderStage,
          validationEnabled,
        );
      } catch (e) {
        console.error(e, glsl);
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
    return { module: shaderModule, entryPoint: entryPoint || 'main' };
  }
}
