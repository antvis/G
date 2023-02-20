import { Canvas, CanvasEvent } from '@antv/g';
import { Kernel, Plugin } from '@antv/g-plugin-gpgpu';
import { DeviceRenderer, Renderer } from '@antv/g-webgpu';

const { BufferUsage } = DeviceRenderer;

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
@binding(0) @group(0) var<storage, read_write> input : array<i32>;
@binding(1) @group(0) var<storage, read_write> output : array<i32>;

@compute @workgroup_size(8, 8)
fn main(
  @builtin(global_invocation_id) global_id : vec3<u32>
) {
  var index = global_id.x;
  output[index] = input[index] + output[index];
}`,
  });

  const inputBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE | BufferUsage.COPY_SRC,
    viewOrSize: new Int32Array([1, 2, 3, 4]),
  });
  const outputBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE | BufferUsage.COPY_SRC,
    viewOrSize: new Int32Array([1, 2, 3, 4]),
  });
  const readback = device.createReadback();

  kernel.setBinding(0, inputBuffer);
  kernel.setBinding(1, outputBuffer);

  kernel.dispatch(1, 1);

  (async () => {
    const output = await readback.readBuffer(outputBuffer);

    console.log(output);
  })();
});
