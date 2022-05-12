import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgpu';
import { Plugin, Kernel, BufferUsage } from '@antv/g-plugin-gpgpu';

/**
 * ported from Tint
 * @see https://dawn.googlesource.com/tint/+/f9d19719fd500668e1f74d98e881073baeaf03ff/test/intrinsics/gen/atomicSub/051100.wgsl
 */

const CANVAS_SIZE = 1;
const $canvas = document.createElement('canvas');

// use WebGPU
const renderer = new Renderer();
renderer.registerPlugin(new Plugin());

// create a canvas
const canvas = new Canvas({
  canvas: $canvas,
  width: CANVAS_SIZE,
  height: CANVAS_SIZE,
  renderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  const plugin = renderer.getPlugin('device-renderer');
  const device = plugin.getDevice();

  const kernel = new Kernel(device, {
    computeShader: `
struct Buffer {
  data: array<i32>;
};
struct AtomicBuffer {
  data: array<atomic<i32>>;
};
struct Params {
  k: i32;
  center: vec2<i32>;
};

@binding(0) @group(0) var<storage, read_write> input : Buffer;
@binding(1) @group(0) var<storage, read_write> output : AtomicBuffer;
@binding(2) @group(0) var<uniform> params : Params;

@stage(compute) @workgroup_size(8, 8)
fn main(
  @builtin(global_invocation_id) global_id : vec3<u32>
) {
  var index = global_id.x;
  if (index >= u32(4)) {
    return;
  }

  input.data[index] = input.data[index] + params.k;

  atomicSub(&output.data[index], 1);
}`,
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
  const readback = device.createReadback();

  kernel.setBinding(0, inputBuffer);
  kernel.setBinding(1, outputBuffer);
  kernel.setBinding(2, uniformBuffer);

  for (let i = 0; i < 100; i++) {
    uniformBuffer.setSubData(0, new Int32Array([2, 0, 0, 0]));
    kernel.dispatch(1, 1);

    uniformBuffer.setSubData(0, new Int32Array([-2, 0, 0, 0]));
    kernel.dispatch(1, 1);
  }

  (async () => {
    const input = await readback.readBuffer(inputBuffer);
    const output = await readback.readBuffer(outputBuffer);

    console.log(input, output);
  })();
});
