import { WebGPUDeviceContribution, BufferUsage } from '@antv/g-device-api';

/**
 * ported from Tint
 * @see https://dawn.googlesource.com/tint/+/f9d19719fd500668e1f74d98e881073baeaf03ff/test/intrinsics/gen/atomicSub/051100.wgsl
 */

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
      
struct Buffer {
  data: array<i32>,
};
struct AtomicBuffer {
  data: array<atomic<i32>>,
};
struct Params {
  k: i32,
  center: vec2<i32>,
};

@binding(0) @group(0) var<storage, read_write> input : Buffer;
@binding(1) @group(0) var<storage, read_write> output : AtomicBuffer;
@binding(2) @group(0) var<uniform> params : Params;

@compute @workgroup_size(8, 8)
fn main(
  @builtin(global_invocation_id) global_id : vec3<u32>
) {
  var index = global_id.x;
  if (index >= u32(4)) {
    return;
  }

  input.data[index] = input.data[index] + params.k;

  atomicSub(&output.data[index], 1);
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
    viewOrSize: new Int32Array([0, 0, 0, 0]),
  });
  const uniformBuffer = device.createBuffer({
    usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
    viewOrSize: new Int32Array([1, 0, 0, 0]),
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
    uniformBufferBindings: [
      {
        binding: 2,
        buffer: uniformBuffer,
        size: 4 * 4,
      },
    ],
  });

  const computePass = device.createComputePass();
  computePass.setPipeline(pipeline);
  computePass.setBindings(bindings);

  for (let i = 0; i < 100; i++) {
    uniformBuffer.setSubData(
      0,
      new Uint8Array(new Int32Array([2, 0, 0, 0]).buffer),
    );
    computePass.dispatchWorkgroups(1);

    uniformBuffer.setSubData(
      0,
      new Uint8Array(new Int32Array([-2, 0, 0, 0]).buffer),
    );
    computePass.dispatchWorkgroups(1);
  }

  device.submitPass(computePass);

  const readback = device.createReadback();
  const input = await readback.readBuffer(inputBuffer);
  const output = await readback.readBuffer(outputBuffer);
  console.log(input, output);
})();
