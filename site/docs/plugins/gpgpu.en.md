---
title: g-plugin-gpgpu
order: -1
---

Provides GPGPU capabilities based on WebGPU. Writing Compute Shaders directly in WGSL is ideal for porting existing CUDA algorithms.

For example, there are very many layout and analysis algorithms suitable for parallelism in graph scenarios.

-   [Fruchterman layout algorithm](/en/examples/gpgpu#fruchterman)
-   [Pagerank](/en/examples/gpgpu#pagerank)
-   [SSSP](/en/examples/gpgpu#bellman-ford)

The performance improvement is very impressive when the number of nodes/edges in the graph reaches a certain size. In the case of pagerank, for example, the GPU version has more than 100 times better performance than the CPU version (300ms vs. 30s) for 1k nodes and 50w edges.

## Usage

Can only be used with the `g-webgpu` renderer.

```js
import { Renderer } from '@antv/g-webgpu';
import { Plugin } from '@antv/g-plugin-gpgpu';

const webgpuRenderer = new Renderer();
webgpuRenderer.registerPlugin(new Plugin());
```

## Get Device

When creating a compute task, we need to get the GPU device (Device) and use it to create the underlying objects such as Buffer. In the [READY](/en/api/canvas#canvas-specific events) event handler of the canvas, we can get the Device through the renderer.

```js
import { CanvasEvent } from '@antv/g';

// Waiting for the canvas to be ready
canvas.addEventListener(CanvasEvent.READY, () => {
    // Get Device by Renderer
    const plugin = renderer.getPlugin('device-renderer');
    const device = plugin.getDevice();

    // Use Device to create GPU-related objects, see the following section
});
```

## Create Kernel

Therefore, the g-plugin-gpgpu plugin provides the Kernel to describe the computational task, which, in addition to passing in the device obtained in the previous section, needs to be described by the computeShader using the string.

```ts
import { Kernel } from '@antv/g-plugin-gpgpu';

const kernel = new Kernel(device, {
    computeShader: `...`,
});
```

## setBinding

Once the Kernel is defined, we need to pass it the input and get the output when we are done. The allocation of memory is performed on the Host side, creating a Buffer from the Device, where `usage` needs to correspond to the memory usage defined in the Compute Shader, and writing the initial memory data.

```js
const firstMatrixBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE,
    viewOrSize: firstMatrix, // new Float32Array([2 /* rows */, 4 /* columns */, 1, 2, 3, 4, 5, 6, 7, 8])
});
```

After creating the Buffer, it needs to be bound to the specified location in the Kernel (corresponding to the binding in the Compute Shader).

```js
kernel.setBinding(0, firstMatrixBuffer);
```

## dispatch

Using [dispatch](https://www.w3.org/TR/WGSL/#dispatch-command) you can allocate the thread grid size and execute the computation pipeline. In the matrix multiplication example, if the size of the thread group is `1 * 1`, the grid size is `M * N`.

```js
const x = Math.ceil(firstMatrix[0] / WORKGROUP_SIZE_X);
const y = Math.ceil(secondMatrix[1] / WORKGROUP_SIZE_Y);
kernel.dispatch(x, y);
```

After the computation is complete, we need to read the data in the result matrix, which is an asynchronous GPU-to-CPU read operation.

```js
const readback = device.createReadback();
const result = await readback.readBuffer(resultBuffer); // Float32Array([...])
```
