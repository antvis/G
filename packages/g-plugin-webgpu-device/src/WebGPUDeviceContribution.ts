import type { DeviceContribution } from '@antv/g-plugin-device-renderer';
import init, { glsl_compile } from '../../../rust/pkg/glsl_wgsl_compiler';
import type { WebGPUDeviceOptions } from './interfaces';
import { Device_WebGPU } from './platform/Device';

export class WebGPUDeviceContribution implements DeviceContribution {
  constructor(private pluginOptions: Partial<WebGPUDeviceOptions>) {}

  async createSwapChain($canvas: HTMLCanvasElement) {
    if ((globalThis.navigator as any).gpu === undefined) return null;

    let adapter = null;
    try {
      adapter = await (globalThis.navigator as any).gpu.requestAdapter();
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

    if (device === null) return null;

    const context = $canvas.getContext('webgpu');

    if (!context) return null;

    try {
      await init('/glsl_wgsl_compiler_bg.wasm');
    } catch (e) {}
    return new Device_WebGPU(adapter, device, $canvas, context, glsl_compile);
  }
}
