---
title: g-plugin-gpgpu
order: -1
---

基于 WebGPU 提供 GPGPU 能力。直接使用 WGSL 编写 Compute Shader，非常适合移植已有的 CUDA 算法。

例如在图场景中有非常多适合并行的布局和分析算法：

-   [Fruchterman 布局算法](/zh/examples/gpgpu#fruchterman)
-   [Pagerank](/zh/examples/gpgpu#pagerank)
-   [SSSP 单源最短路径](/zh/examples/gpgpu#bellman-ford)

在图中节点/边数目达到一定规模时会带来非常可观的性能提升效果。以 pagerank 为例，在 1k 节点和 50w 条边的测试数据中，GPU 版本相较 CPU 版本有 100 倍以上的提升（300ms vs 30s）。

## 安装方式

只能配合 `g-webgpu` 渲染器使用：

```js
import { Renderer } from '@antv/g-webgpu';
import { Plugin } from '@antv/g-plugin-gpgpu';

const webgpuRenderer = new Renderer();
webgpuRenderer.registerPlugin(new Plugin());
```

## 获取 Device

在创建一个计算任务时，我们需要获取 GPU 设备（Device），用它创建 Buffer 等底层对象。在画布的 [READY](/zh/api/canvas#画布特有事件) 事件处理器中，我们可以通过渲染器获取 Device：

```js
import { CanvasEvent } from '@antv/g';

// 等待画布准备就绪
canvas.addEventListener(CanvasEvent.READY, () => {
    // 通过渲染器获取 Device
    const plugin = renderer.getPlugin('device-renderer');
    const device = plugin.getDevice();

    // 使用 Device 创建 GPU 相关对象，见下节
});
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
