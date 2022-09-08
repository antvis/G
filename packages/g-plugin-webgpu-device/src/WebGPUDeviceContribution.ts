import { inject, singleton } from '@antv/g-lite';
import { DeviceContribution } from '@antv/g-plugin-device-renderer';
import init, { glsl_compile } from '../../../rust/pkg/glsl_wgsl_compiler';
import { WebGPUDeviceOptions } from './interfaces';
import { Device_WebGPU } from './platform/Device';

@singleton({
  token: DeviceContribution,
})
export class WebGPUDeviceContribution implements DeviceContribution {
  constructor(
    @inject(WebGPUDeviceOptions)
    private pluginOptions: WebGPUDeviceOptions,
  ) {}

  async createSwapChain($canvas: HTMLCanvasElement) {
    if (navigator.gpu === undefined) return null;

    let adapter = null;
    try {
      adapter = await navigator.gpu.requestAdapter();
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
    const requiredFeatures = optionalFeatures.filter((feature) => adapter.features.has(feature));
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
