import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import { Plugin, Kernel, BufferUsage } from '@antv/g-plugin-gpgpu';
import * as lil from 'lil-gui';

/**
 * ported from https://github.com/9ballsyndrome/WebGL_Compute_shader/blob/master/webgl-compute-bitonicSort/js/script.js
 */

const CANVAS_SIZE = 1;

// use WebGPU
const renderer = new Renderer({ targets: ['webgpu'] });
renderer.registerPlugin(new Plugin());

// create a canvas
const $wrapper = document.getElementById('container');
const canvas = new Canvas({
  container: $wrapper,
  width: CANVAS_SIZE,
  height: CANVAS_SIZE,
  renderer,
});

const workgroupSize = 128;

canvas.addEventListener(CanvasEvent.READY, () => {
  const device = renderer.getDevice();
  const kernel = new Kernel(device, {
    computeShader: `
struct Array {
  size: u32;
  data: array<f32>;
};

@group(0) @binding(0) var<storage, read_write> input : Array;

var<workgroup> shared : array<f32, ${workgroupSize}>;

@stage(compute) @workgroup_size(${workgroupSize}, 1)
fn main(
  @builtin(global_invocation_id) global_id : vec3<u32>,
  @builtin(local_invocation_id) local_id : vec3<u32>,
  @builtin(workgroup_id) workgroup_id : vec3<u32>,
) {
  var tid = local_id.x;
  // var i = global_id.x;

  // version 4
  var i = workgroup_id.x * ${workgroupSize}u * 2u + local_id.x;
  shared[tid] = input.data[i] + input.data[i + ${workgroupSize}u];
  // shared[tid] = input.data[i];
  workgroupBarrier();

  // version 5
  // for (var s = ${workgroupSize}u / 2u; s > 32u; s = s >> 1u) {
  // version 3
  for (var s = ${workgroupSize}u / 2u; s > 0u; s = s >> 1u) {
    if (tid < s) {
      shared[tid] = shared[tid] + shared[tid + s];
    }

  // for (var s = 1u; s < ${workgroupSize}u; s = s * 2u) {
    // version 1
    // if (tid % (s * 2u) == 0u) {
    //   shared[tid] = shared[tid] + shared[tid + s];
    // }

    // version 2
    // var index = 2u * s * tid;
    // if (index < ${workgroupSize}u) {
    //   shared[index] = shared[index] + shared[index + s];
    // }
    
    workgroupBarrier();
  }

  // if (tid < 32u) {
  //   shared[tid] =
  //     shared[tid + 32u]
  //     + shared[tid + 16u]
  //     + shared[tid + 8u]
  //     + shared[tid + 4u]
  //     + shared[tid + 2u]
  //     + shared[tid + 1u];
  // }

  if (tid == 0u) {
    input.data[workgroup_id.x] = shared[0u];
  }
}`,
  });

  calc(kernel, device, new Array(200).fill(1));

  // GUI
  const gui = new lil.GUI({ autoPlace: false });
  $wrapper.appendChild(gui.domElement);
  const folder = gui.addFolder('array size');
  const config = {
    size: 32,
  };
  folder.add(config, 'size', [32, 1000, 10000, 100000, 1000000]).onChange((size) => {
    calc(
      kernel,
      device,
      new Array(Number(size)).fill(undefined).map(() => Math.random()),
    );
  });
  folder.open();
});

const cpuReduceSum = (array) => {
  const startTime = window.performance.now();
  console.log(array.reduce((prev, cur) => prev + cur, 0));
  console.log(`CPU Time Elapsed: ${window.performance.now() - startTime}ms`);
};

const gpuReduceSum = async (kernel, device, array) => {
  const padding = array.concat(new Array(workgroupSize - (array.length % workgroupSize)).fill(0));

  const input = new Float32Array(
    [padding.length] // size
      .concat(padding), // origin data
  );

  let startTime = window.performance.now();

  const result = device.createBuffer({
    usage: BufferUsage.STORAGE | BufferUsage.COPY_SRC,
    viewOrSize: input,
  });
  const readback = device.createReadback();
  kernel.setBinding(0, result);
  kernel.dispatch(Math.ceil(array.length / workgroupSize), 1);

  // result
  await readback.readBuffer(result);

  console.log(
    input.slice(1, padding.length / workgroupSize + 1).reduce((prev, cur) => prev + cur, 0),
  );
  console.log(`GPU Time Elapsed: ${window.performance.now() - startTime}ms`);
};

const calc = async (kernel, device, array) => {
  cpuReduceSum(array);
  gpuReduceSum(kernel, device, array);
};

const $text = document.createElement('div');
$text.textContent = 'Please open the devtools, the CPU & CPU time will be printed in console.';
$wrapper.appendChild($text);
