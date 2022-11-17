---
title: Kernel API
order: 2
---

## 安装 GPGPU 插件

创建画布，使用渲染器的方式和之前渲染相关的教程并无差别，只是在创建渲染器时，需要确认在支持 WebGPU 的浏览器环境下运行。另外由于不涉及渲染，画布大小我们选择长宽为 1 即可。

```js
import { Canvas, CanvasEvent } from '@antv/g';
import { DeviceRenderer, Renderer } from '@antv/g-webgpu';
import { Plugin, Kernel } from '@antv/g-plugin-gpgpu';

const { BufferUsage } = DeviceRenderer;

const renderer = new Renderer();
// 注册 GPGPU 插件
renderer.registerPlugin(new Plugin());

// 创建画布
const $wrapper = document.getElementById('container');
const canvas = new Canvas({
    container: $wrapper,
    width: 1,
    height: 1,
    renderer,
});
```

## 获取 Device

在创建一个计算任务时，我们需要获取 GPU 设备（Device），用它创建 Buffer 等底层对象。在画布的 [READY](/zh/api/canvas#画布特有事件) 事件处理器中或者等待 `canvas.ready` Promise 完成后，我们都可以通过渲染器获取 Device，[完整 Device API](/zh/plugins/device-renderer#device)：

```js
import { CanvasEvent } from '@antv/g';

// 等待画布准备就绪
canvas.addEventListener(CanvasEvent.READY, () => {
    // 通过渲染器获取 Device
    const plugin = renderer.getPlugin('device-renderer');
    const device = plugin.getDevice();

    // 使用 Device 创建 GPU 相关对象，见下节
});

// 或者
await canvas.ready;
const plugin = renderer.getPlugin('device-renderer');
const device = plugin.getDevice();
```

## 创建 Kernel

因此 g-plugin-gpgpu 插件提供了 Kernel 用于描述计算任务，除了传入上一节获取的 device，还需要通过 computeShader 使用字符串描述：

```ts
import { Kernel } from '@antv/g-plugin-gpgpu';

const kernel = new Kernel(device, {
    computeShader: `...`,
});
```

## setBinding

定义好了 Kernel，我们需要向它传递输入，结束后获取输出结果。分配内存的工作在 Host 侧执行，通过 Device 创建 Buffer，其中 `usage` 需要与 Compute Shader 中定义的内存用途对应，同时进行内存初始数据的写入。

```js
const firstMatrixBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE,
    viewOrSize: firstMatrix, // new Float32Array([2 /* rows */, 4 /* columns */, 1, 2, 3, 4, 5, 6, 7, 8])
});
```

创建完 Buffer 之后，需要绑定到 Kernel 的指定位置（与 Compute Shader 中的 binding 对应）：

```js
kernel.setBinding(0, firstMatrixBuffer);
```

下面列出 usage 与 Compute Shader 中 Buffer 对应的常用配置：

-   `var<storage, read>` 对应 `BufferUsage.STORAGE`
-   `var<storage, read_write>` 对应 `BufferUsage.STORAGE | BufferUsage.COPY_SRC`
-   `var<uniform>` 对应 `BufferUsage.UNIFORM | BufferUsage.COPY_DST | BufferUsage.COPY_SRC`

## dispatch

使用 [dispatch](https://www.w3.org/TR/WGSL/#dispatch-command) 可以分配线程网格大小，执行计算管线。在矩阵乘法的例子中，如果线程组的大小为 `1 * 1`，网格大小就是 `M * N`：

```js
const x = Math.ceil(firstMatrix[0] / WORKGROUP_SIZE_X);
const y = Math.ceil(secondMatrix[1] / WORKGROUP_SIZE_Y);
kernel.dispatch(x, y);
```

在计算完成后，我们需要读取结果矩阵中的数据，这是一次 GPU 到 CPU 的异步读取操作：

```js
const readback = device.createReadback();
const result = await readback.readBuffer(resultBuffer); // Float32Array([...])
```
