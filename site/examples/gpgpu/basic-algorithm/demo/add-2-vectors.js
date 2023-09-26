import { WebGPUDeviceContribution, BufferUsage } from '@antv/g-device-api';

const $canvas = document.createElement('canvas');

(async () => {
  const deviceContributionWebGPU = new WebGPUDeviceContribution({
    shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
  });

  const swapChain = await deviceContributionWebGPU.createSwapChain($canvas);
  const device = swapChain.getDevice();

  const program = device.createProgram({
    compute: {
      wgsl: `
      @binding(0) @group(0) var<storage, read_write> input : array<i32>;
      @binding(1) @group(0) var<storage, read_write> output : array<i32>;
      
      @compute @workgroup_size(8, 8)
      fn main(
        @builtin(global_invocation_id) global_id : vec3<u32>
      ) {
        var index = global_id.x;
        output[index] = input[index] + output[index];
      }
      `,
    },
  });

  const inputBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE | BufferUsage.COPY_SRC,
    viewOrSize: new Int32Array([1, 2, 3, 4]),
  });
  const outputBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE | BufferUsage.COPY_SRC,
    viewOrSize: new Int32Array([1, 2, 3, 4]),
  });

  const pipeline = device.createComputePipeline({
    inputLayout: null,
    program,
  });
  const bindings = device.createBindings({
    pipeline,
    storageBufferBindings: [
      {
        binding: 0,
        buffer: inputBuffer,
      },
      {
        binding: 1,
        buffer: outputBuffer,
      },
    ],
  });

  const computePass = device.createComputePass();
  computePass.setPipeline(pipeline);
  computePass.setBindings(bindings);
  computePass.dispatchWorkgroups(1);
  device.submitPass(computePass);

  const readback = device.createReadback();
  const output = await readback.readBuffer(outputBuffer);
  console.log(output);
})();
