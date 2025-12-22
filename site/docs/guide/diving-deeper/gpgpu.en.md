---
title: GPGPU First Look
order: 10
---

⚠️ GPGPU-related capabilities require a browser environment that supports WebGPU (e.g., Chrome 94+).

In this tutorial, we will try to use the parallel computing power of the GPU to implement the multiplication of two matrices, achieving a performance improvement of more than 10 times compared to the CPU. For the final effect, you can refer to this [example](/examples/gpgpu/basic-algorithm/#matrix-multiplication). The larger the matrix size, the more obvious the performance improvement.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*4332Qb6F9McAAAAAAAAAAAAAARQnAQ" width="400"/>

It is easy to write an algorithm that can run on the CPU side and calculate the value of each element in the result matrix serially. But if you think about it, the calculation of the second element does not depend on the calculation result of the first element, right? Now let's consider this problem from the perspective of thread parallelism. We let each thread be responsible for processing one element. If you are not familiar with concepts such as grids and thread groups, you can refer to [Threads, Shared Memory, and Synchronization](/api/gpgpu/programing-model#workgroup).

Below we will complete the creation of this computing task in two steps:

1. Create a canvas, use the WebGPU renderer, and register the GPGPU plugin.
2. Get the Device.
3. Create a Kernel and write a Compute Shader.
4. Pass in the input data and get the calculation result.

## Creating the Canvas, Renderer, and GPGPU Plugin

The way to create a canvas and use a renderer is no different from the previous rendering-related tutorials, except that when creating the renderer, you need to make sure that it is running in a browser environment that supports WebGPU. In addition, since no rendering is involved, we can choose a canvas size of 1x1.

```js
import { Canvas, CanvasEvent } from '@antv/g';
import { DeviceRenderer, Renderer } from '@antv/g-webgpu';
import { Plugin, Kernel } from '@antv/g-plugin-gpgpu';

const { BufferUsage } = DeviceRenderer;

// Select the target platform as WebGPU
const renderer = new Renderer();
// Register the GPGPU plugin
renderer.registerPlugin(new Plugin());

// Create a canvas
const $wrapper = document.getElementById('container');
const canvas = new Canvas({
    container: $wrapper,
    width: 1,
    height: 1,
    renderer,
});
```

## Getting the Device

When creating a computing task, we need to get the GPU device (Device) and use it to create underlying objects such as Buffers. Before performing these operations, you need to make sure that the initialization work of the canvas (especially the rendering service) is ready. There are two ways:

- Listen for the canvas's [READY](/api/canvas/event#canvas-specific-events) event.
- Wait for the `canvas.ready` Promise.

Then you can get the Device through the renderer:

```js
import { CanvasEvent } from '@antv/g';

// Wait for the canvas to be ready
canvas.addEventListener(CanvasEvent.READY, () => {
    // Get the Device through the renderer
    const plugin = renderer.getPlugin('device-renderer');
    const device = plugin.getDevice();

    // Use the Device to create GPU-related objects, see the next section
});

// or
await canvas.ready;
const plugin = renderer.getPlugin('device-renderer');
const device = plugin.getDevice();
```

## Creating a Kernel

Unlike the "single source" (both Host and Device code are written in C++) in CUDA, the Device code of WebGPU needs to be written in the [WGSL](https://www.w3.org/TR/WGSL) language through a Compute Shader.

Therefore, the `g-plugin-gpgpu` plugin provides a Kernel to describe the computing task. In addition to passing in the `device` obtained in the previous section, it also needs to be described as a string through `computeShader`:

```js
import { Kernel } from '@antv/g-plugin-gpgpu';

const kernel = new Kernel(device, {
    computeShader: `...`,
});
```

Back to our computing task: multiplying two matrices. We let each thread be responsible for the calculation of one element in the final result matrix, so that multiple threads can be completely parallel.

First, we need to use a linear structure (an array) to describe a matrix. The first two elements represent the matrix size (rows and columns), followed by the specific elements. We use WGSL's [struct](https://www.w3.org/TR/WGSL/#struct-types) to define the data type of the matrix (similar to an interface in TS), where [f32](https://www.w3.org/TR/WGSL/#floating-point-types) is a basic data type in WGSL (a strongly typed language). When we later try to allocate memory from the Host side, we also need to use a matching typed array (Float32Array):

```wgsl
// WGSL
struct Matrix {
  size : vec2<f32>; // matrix size (a vector of length 2)
  numbers: array<f32>; // matrix elements (an array of indefinite length)
};

// If described in TS
interface Matrix {
  size : [number, number];
  numbers: number[];
}
```

Then we need to define the input and output data structures. We declare two input matrices and one matrix to store the calculation results. Looking from back to front, we declare their types through `Matrix` (similar to TS). `<storage, read>` defines the memory usage and access mode, where [storage](https://www.w3.org/TR/WGSL/#address-spaces-storage) describes the memory usage, and different usages have corresponding access modes (read/write). For example, here, all three matrices are used to store data (which can be allocated from the Host side), of which the two input matrices are read-only, and the result matrix is writable:

```wgsl
// first matrix
@group(0) @binding(0) var<storage, read> firstMatrix : Matrix;
// second matrix
@group(0) @binding(1) var<storage, read> secondMatrix : Matrix;
// result matrix
@group(0) @binding(2) var<storage, read_write> resultMatrix : Matrix;
```

Next, we need to define the specific algorithm. Each thread will execute the same Compute Shader to process different data (SIMD), which requires each thread to know its own ID in order to get the part of the global data that it is interested in. In WGSL, this is obtained through the input parameters of the main function. Here we use the built-in variable [`global_invocation_id`](https://www.w3.org/TR/WGSL/#builtin-values), whose type is `vec3<u32>`. The `x`, `y`, and `z` components all start from 0, and the product of the three cannot exceed 256.

```wgsl
@compute @workgroup_size(${WORKGROUP_SIZE_X}, ${WORKGROUP_SIZE_Y})
fn main(
  @builtin(global_invocation_id) global_id : vec3<u32> // current thread's global ID
) {
  // Threads that exceed the result matrix should return directly
  if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >= u32(secondMatrix.size.y)) {
    return;
  }

  // Write back the size of the result matrix
  resultMatrix.size = vec2<f32>(firstMatrix.size.x, secondMatrix.size.y);

  let resultCell = vec2<u32>(global_id.x, global_id.y);
  var result = 0.0;
  for (var i = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
    let a = i + resultCell.x * u32(firstMatrix.size.y);
    let b = resultCell.y + i * u32(secondMatrix.size.y);
    result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
  }

  // Position of the element in the result matrix
  let index = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
  // Write the calculation result back to the result matrix
  resultMatrix.numbers[index] = result;
}
```

## Input and Output

After defining the Kernel, we need to pass input to it and get the output after it is finished. The work of allocating memory is performed on the Host side. We create a Buffer through the Device ([createBuffer](/plugins/device-renderer#createbuffer)), where the `usage` needs to correspond to the memory usage defined in the Compute Shader, and the initial data of the memory is written at the same time.

```js
const firstMatrixBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE,
    viewOrSize: firstMatrix, // new Float32Array([2 /* rows */, 4 /* columns */, 1, 2, 3, 4, 5, 6, 7, 8])
});
const secondMatrixBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE,
    viewOrSize: secondMatrix,
});
const resultBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE | BufferUsage.COPY_SRC,
    viewOrSize: resultMatrix,
});
```

After creating the Buffers, you need to bind them to the specified positions of the Kernel (corresponding to the `binding` in the Compute Shader):

```js
kernel.setBinding(0, firstMatrixBuffer);
kernel.setBinding(1, secondMatrixBuffer);
kernel.setBinding(2, resultBuffer);
```

You can use [dispatch](https://www.w3.org/TR/WGSL/#dispatch-command) to allocate the size of the thread grid and execute the compute pipeline. In the example of matrix multiplication, if the size of the thread group is `1 * 1`, the size of the grid is `M * N`:

```js
const x = Math.ceil(firstMatrix[0] / WORKGROUP_SIZE_X);
const y = Math.ceil(secondMatrix[1] / WORKGROUP_SIZE_Y);
kernel.dispatch(x, y);
```

After the calculation is complete, we need to read the data in the result matrix. This is an asynchronous read operation from the GPU to the CPU:

```js
const readback = device.createReadback();
const result = await readback.readBuffer(resultBuffer); // Float32Array([...])
```

## More Algorithm Implementations

The above matrix multiplication is more for demonstration purposes. There are many parallel layout and analysis algorithms suitable for graph scenes, which we can port from CUDA implementations, such as:

- [Fruchterman layout algorithm](/examples/gpgpu/graph-analysis-algorithm/#fruchterman)
- [Pagerank](/examples/gpgpu/graph-analysis-algorithm/#pagerank)
- [SSSP single-source shortest path](/examples/gpgpu/graph-analysis-algorithm/#bellman-ford)

When the number of nodes/edges in the graph reaches a certain scale, it will bring very considerable performance improvement. Taking pagerank as an example, in the test data of 1k nodes and 50w edges, the GPU version is more than 100 times faster than the CPU version (300ms vs 30s).
