import { AbstractRendererPlugin, GlobalRuntime } from '@antv/g-lite';
import type { WebGPUDeviceOptions } from './interfaces';
import { WebGPUDeviceContribution } from './WebGPUDeviceContribution';
export class Plugin extends AbstractRendererPlugin {
  name = 'webgpu-device';
  constructor(private options: Partial<WebGPUDeviceOptions> = {}) {
    super();
  }

  init(runtime: GlobalRuntime): void {
    this.context.deviceContribution = new WebGPUDeviceContribution(
      {
        shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
        ...this.options,
      },
      runtime,
    );
  }
  destroy(): void {
    delete this.context.deviceContribution;
  }
}
