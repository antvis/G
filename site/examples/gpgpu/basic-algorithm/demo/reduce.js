import * as lil from 'lil-gui';
import { WebGPUDeviceContribution, BufferUsage } from '@antv/g-device-api';

/**
 * ported from https://github.com/9ballsyndrome/WebGL_Compute_shader/blob/master/webgl-compute-bitonicSort/js/script.js
 */

const $canvas = document.createElement('canvas');

(async () => {
  const deviceContributionWebGPU = new WebGPUDeviceContribution({
    shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
  });

  const swapChain = await deviceContributionWebGPU.createSwapChain($canvas);
  const device = swapChain.getDevice();

  // create a canvas
  const $wrapper = document.getElementById('container');

  const workgroupSize = 128;

  const program = device.createProgram({
    compute: {
      wgsl: `
  struct Array {
    size: u32,
    data: array<f32>,
  };
  
  @group(0) @binding(0) var<storage, read_write> input : Array;
  
  var<workgroup> sharedData : array<f32, ${workgroupSize}>;
  
  @compute @workgroup_size(${workgroupSize}, 1)
  fn main(
    @builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(local_invocation_id) local_id : vec3<u32>,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
  ) {
    var tid = local_id.x;
    // var i = global_id.x;
  
    // version 4
    var i = workgroup_id.x * ${workgroupSize}u * 2u + local_id.x;
    sharedData[tid] = input.data[i] + input.data[i + ${workgroupSize}u];
    // sharedData[tid] = input.data[i];
    workgroupBarrier();
  
    // version 5
    // for (var s = ${workgroupSize}u / 2u; s > 32u; s = s >> 1u) {
    // version 3
    for (var s = ${workgroupSize}u / 2u; s > 0u; s = s >> 1u) {
      if (tid < s) {
        sharedData[tid] = sharedData[tid] + sharedData[tid + s];
      }
  
    // for (var s = 1u; s < ${workgroupSize}u; s = s * 2u) {
      // version 1
      // if (tid % (s * 2u) == 0u) {
      //   sharedData[tid] = sharedData[tid] + sharedData[tid + s];
      // }
  
      // version 2
      // var index = 2u * s * tid;
      // if (index < ${workgroupSize}u) {
      //   sharedData[index] = sharedData[index] + sharedData[index + s];
      // }
      
      workgroupBarrier();
    }
  
    // if (tid < 32u) {
    //   sharedData[tid] =
    //     sharedData[tid + 32u]
    //     + sharedData[tid + 16u]
    //     + sharedData[tid + 8u]
    //     + sharedData[tid + 4u]
    //     + sharedData[tid + 2u]
    //     + sharedData[tid + 1u];
    // }
  
    if (tid == 0u) {
      input.data[workgroup_id.x] = sharedData[0u];
    }
  }
`,
    },
  });

  const pipeline = device.createComputePipeline({
    inputLayout: null,
    program,
  });

  // GUI
  const gui = new lil.GUI({ autoPlace: false });
  $wrapper.appendChild(gui.domElement);
  const folder = gui.addFolder('array size');
  const config = {
    size: 32,
  };
  folder
    .add(config, 'size', [32, 1000, 10000, 100000, 1000000])
    .onChange((size) => {
      calc(new Array(Number(size)).fill(undefined).map(() => Math.random()));
    });
  folder.open();

  const cpuReduceSum = (array) => {
    const startTime = window.performance.now();
    console.log(array.reduce((prev, cur) => prev + cur, 0));
    console.log(`CPU Time Elapsed: ${window.performance.now() - startTime}ms`);
  };

  const gpuReduceSum = async (array) => {
    const padding = array.concat(
      new Array(workgroupSize - (array.length % workgroupSize)).fill(0),
    );

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
    const bindings = device.createBindings({
      pipeline,
      storageBufferBindings: [
        {
          binding: 0,
          buffer: result,
        },
      ],
    });

    const computePass = device.createComputePass();
    computePass.setPipeline(pipeline);
    computePass.setBindings(bindings);
    computePass.dispatchWorkgroups(Math.ceil(array.length / workgroupSize), 1);
    device.submitPass(computePass);

    // result
    await readback.readBuffer(result);

    console.log(
      input
        .slice(1, padding.length / workgroupSize + 1)
        .reduce((prev, cur) => prev + cur, 0),
    );
    console.log(`GPU Time Elapsed: ${window.performance.now() - startTime}ms`);
  };

  const calc = async (array) => {
    cpuReduceSum(array);
    gpuReduceSum(array);
  };

  const $text = document.createElement('div');
  $text.textContent =
    'Please open the devtools, the CPU & CPU time will be printed in console.';
  $wrapper.appendChild($text);

  calc(new Array(200).fill(1));
})();
