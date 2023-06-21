import { runtime } from '@antv/g-lite';
import type { DeviceContribution } from '@antv/g-plugin-device-renderer';
import init, { glsl_compile } from '../../../rust/pkg/glsl_wgsl_compiler';
import type { WebGPUDeviceOptions } from './interfaces';
import { Device_WebGPU } from './platform/Device';

export class WebGPUDeviceContribution implements DeviceContribution {
  constructor(private pluginOptions: Partial<WebGPUDeviceOptions>) {}

  async createSwapChain($canvas: HTMLCanvasElement) {
    if ((runtime.globalThis.navigator as any).gpu === undefined) return null;

    let adapter = null;
    try {
      adapter = await (
        runtime.globalThis.navigator as any
      ).gpu.requestAdapter();
    } catch (e) {
      console.log(e);
    }

    if (adapter === null) return null;

    // @see https://www.w3.org/TR/webgpu/#dom-gpudevicedescriptor-requiredfeatures
    const optionalFeatures: GPUFeatureName[] = [
      // 'depth24unorm-stencil8',
      'depth32float-stencil8',
      'texture-compression-bc',
    ];
    const requiredFeatures = optionalFeatures.filter((feature) =>
      adapter.features.has(feature),
    );
    const device = await adapter.requestDevice({ requiredFeatures });

    if (device) {
      // @see https://github.com/gpuweb/gpuweb/blob/main/design/ErrorHandling.md#fatal-errors-requestadapter-requestdevice-and-devicelost
      const { onContextLost } = this.pluginOptions;
      device.lost.then(() => {
        if (onContextLost) {
          onContextLost();
        }
      });
    }

    if (device === null) return null;

    const context = $canvas.getContext('webgpu');

    if (!context) return null;

    try {
      await init(this.pluginOptions.shaderCompilerPath);
    } catch (e) {}

    // @ts-ignore
    return new Device_WebGPU(adapter, device, $canvas, context, glsl_compile);
  }
}
