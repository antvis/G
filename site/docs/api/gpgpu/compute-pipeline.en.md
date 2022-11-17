---
title: Kernel API
order: 2
---

## Installing the GPGPU Plugin

Create the canvas and use the renderer in the same way as in the previous tutorial on rendering, but make sure it runs in a WebGPU-enabled browser environment. Also, since there is no rendering involved, we choose a canvas size of 1 for the length and width.

```js
import { Canvas, CanvasEvent } from '@antv/g';
import { DeviceRenderer, Renderer } from '@antv/g-webgpu';
import { Plugin, Kernel } from '@antv/g-plugin-gpgpu';

const { BufferUsage } = DeviceRenderer;

const renderer = new Renderer();
renderer.registerPlugin(new Plugin());

const $wrapper = document.getElementById('container');
const canvas = new Canvas({
    container: $wrapper,
    width: 1,
    height: 1,
    renderer,
});
```

## Getting Device

When creating a compute task, we need to get the GPU device (Device) and use it to create the underlying objects such as Buffer. We can get the Device through the renderer either in the [READY](/en/api/canvas#canvas-specific events) event handler of the canvas or after waiting for the `canvas.ready` Promise to complete, [full Device API](/en/plugins/device -renderer#device).

```js
import { CanvasEvent } from '@antv/g';

// Waiting for the canvas to be ready
canvas.addEventListener(CanvasEvent.READY, () => {
    // Get Device by Renderer
    const plugin = renderer.getPlugin('device-renderer');
    const device = plugin.getDevice();

    // Use Device to create GPU-related objects, see the following section
});

// Or
await canvas.ready;
const plugin = renderer.getPlugin('device-renderer');
const device = plugin.getDevice();
```

## Creating Kernel

Therefore, the [g-plugin-gpgpu](/en/plugins/gpgpu) plugin provides the Kernel to describe the computational task, which, in addition to passing in the device obtained in the previous section, needs to be described by the computeShader using the string.

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

The following is a list of common configurations for usage and Buffer in Compute Shader.

-   `var<storage, read>` -> `BufferUsage.STORAGE`
-   `var<storage, read_write>` -> `BufferUsage.STORAGE | BufferUsage.COPY_SRC`
-   `var<uniform>` -> `BufferUsage.UNIFORM | BufferUsage.COPY_DST | BufferUsage.COPY_SRC`

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
