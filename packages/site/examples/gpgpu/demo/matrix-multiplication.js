import { Canvas, CanvasEvent } from '@antv/g';
import { Kernel, Plugin } from '@antv/g-plugin-gpgpu';
import { DeviceRenderer, Renderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';

const { BufferUsage } = DeviceRenderer;

/**
 * ported from https://web.dev/gpu-compute/
 *
 * should run under WebGPU-supported browsers such as Chrome 94+
 */

const WORKGROUP_SIZE_X = 8;
const WORKGROUP_SIZE_Y = 8;

// use WebGPU
const renderer = new Renderer();
renderer.registerPlugin(new Plugin());

// create a canvas
const $wrapper = document.getElementById('container');
const canvas = new Canvas({
  container: $wrapper,
  width: 1,
  height: 1,
  renderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  const plugin = renderer.getPlugin('device-renderer');
  const device = plugin.getDevice();

  const kernel = new Kernel(device, {
    computeShader: `
  struct Matrix {
    size : vec2<f32>,
    numbers: array<f32>,
  };
  
  @group(0) @binding(0) var<storage, read> firstMatrix : Matrix;
  @group(0) @binding(1) var<storage, read> secondMatrix : Matrix;
  @group(0) @binding(2) var<storage, write> resultMatrix : Matrix;
  
  @stage(compute) @workgroup_size(${WORKGROUP_SIZE_X}, ${WORKGROUP_SIZE_Y})
  fn main(
    @builtin(global_invocation_id) global_id : vec3<u32>
  ) {
    // Guard against out-of-bounds work group sizes
    if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >= u32(secondMatrix.size.y)) {
      return;
    }
  
    resultMatrix.size = vec2<f32>(firstMatrix.size.x, secondMatrix.size.y);
  
    let resultCell = vec2<u32>(global_id.x, global_id.y);
    var result = 0.0;
    for (var i = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
      let a = i + resultCell.x * u32(firstMatrix.size.y);
      let b = resultCell.y + i * u32(secondMatrix.size.y);
      result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
    }
  
    let index = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
    resultMatrix.numbers[index] = result;
  }`,
  });

  calc(
    kernel,
    device,
    new Float32Array([2 /* rows */, 4 /* columns */, 1, 2, 3, 4, 5, 6, 7, 8]),
    new Float32Array([4 /* rows */, 2 /* columns */, 1, 2, 3, 4, 5, 6, 7, 8]),
  );

  // GUI
  const gui = new lil.GUI({ autoPlace: false });
  $wrapper.appendChild(gui.domElement);
  const folder = gui.addFolder('matrix size');
  const config = {
    size: 32,
  };
  folder.add(config, 'size', [32, 64, 128, 256, 512, 1024]).onChange((size) => {
    const first = new Float32Array([size, size].concat(new Array(size * size).fill(Math.random())));
    const second = new Float32Array(
      [size, size].concat(new Array(size * size).fill(Math.random())),
    );
    calc(kernel, device, first, second);
  });
  folder.open();
});

const cpuMultiplication = (firstMatrix, secondMatrix, $div) => {
  const startTime = window.performance.now();

  const x = firstMatrix[0];
  const z = firstMatrix[1];
  const y = secondMatrix[1];

  const resultMatrix = new Float32Array(firstMatrix[0] * secondMatrix[1]);

  let productRow = Array.apply(null, new Array(y)).map(Number.prototype.valueOf, 0);
  let product = new Array(x);
  for (let p = 0; p < x; p++) {
    product[p] = productRow.slice();
  }
  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      for (let k = 0; k < z; k++) {
        product[i][j] += firstMatrix[i * x + k] * secondMatrix[k * y + j];
      }
    }
  }

  const elapsed = window.performance.now() - startTime;
  setCPUTimeElapsed(elapsed, $div);

  return elapsed;
};

const gpuMultiplication = async (kernel, device, firstMatrix, secondMatrix, $div) => {
  let startTime = window.performance.now();
  const x = Math.ceil(firstMatrix[0] / WORKGROUP_SIZE_X); // X dimension of the grid of workgroups to dispatch.
  const y = Math.ceil(secondMatrix[1] / WORKGROUP_SIZE_Y); // Y dimension of the grid of workgroups to dispatch.
  const resultMatrixBufferSize = 2 + firstMatrix[0] * secondMatrix[1];
  const resultMatrix = new Float32Array(resultMatrixBufferSize);

  const firstMatrixBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE,
    viewOrSize: firstMatrix,
  });
  const secondMatrixBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE,
    viewOrSize: secondMatrix,
  });
  const resultBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE | BufferUsage.COPY_SRC,
    viewOrSize: resultMatrix,
  });
  const readback = device.createReadback();

  kernel.setBinding(0, firstMatrixBuffer);
  kernel.setBinding(1, secondMatrixBuffer);
  kernel.setBinding(2, resultBuffer);
  kernel.dispatch(x, y);

  await readback.readBuffer(resultBuffer);
  const elapsed = window.performance.now() - startTime;

  setGPUTimeElapsed(elapsed, $div);

  // output
  console.log(resultMatrix);
  return elapsed;
};

const calc = async (kernel, device, firstMatrix, secondMatrix) => {
  const $div = document.createElement('div');
  $div.textContent = `Matrix size: ${firstMatrix[0]} * ${firstMatrix[1]}`;
  $wrapper.appendChild($div);

  const cpuTimeElapsed = cpuMultiplication(firstMatrix, secondMatrix, $div);
  const gpuTimeElapsed = await gpuMultiplication(kernel, device, firstMatrix, secondMatrix, $div);
  const speedUp = Number.parseFloat(cpuTimeElapsed / gpuTimeElapsed).toFixed(1);

  const $speedUp = document.createElement('div');
  $speedUp.textContent = `SpeedUp: ${speedUp}x`;
  $speedUp.style = 'font-weight: bold; margin-bottom: 16px;';
  $wrapper.appendChild($speedUp);
};

const setCPUTimeElapsed = (time, $div) => {
  const $cpu = document.createElement('div');
  $cpu.textContent = `CPU Time Elapsed: ${Number.parseFloat(time).toFixed(2)}ms`;
  $div.appendChild($cpu);
};
const setGPUTimeElapsed = (time, $div) => {
  const $gpu = document.createElement('div');
  $gpu.textContent = `GPU Time Elapsed: ${Number.parseFloat(time).toFixed(2)}ms`;
  $div.appendChild($gpu);
};
