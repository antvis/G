---
title: GPGPU 初体验
order: 10
---

⚠️ GPGPU 相关能力需要支持 WebGPU 的浏览器环境（例如 Chrome 94+）。

在本教程中，我们将尝试使用 GPU 的并行计算能力，实现两个矩阵相乘，相较 CPU 获得 10 倍以上的性能提升。最终效果可以参考这个[示例](/zh/examples/gpgpu#matrix-multiplication)，矩阵尺寸越大性能提升效果越明显。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*4332Qb6F9McAAAAAAAAAAAAAARQnAQ" width="400"/>

我们很容易写出一个能在 CPU 侧运行的算法，串行计算结果矩阵中每一个元素的值。但仔细想想第二个元素的计算并不依赖第一个元素的计算结果对吗？现在让我们从线程并行的角度来考虑这个问题，我们让每一个线程负责处理一个元素。如果对网格、线程组这些概念还不熟悉，可以参考[线程、共享内存与同步](/zh/api/workgroup)。

下面我们通过两步完成该计算任务的创建：

1. 创建画布，使用 WebGPU 渲染器，注册 GPGPU 插件
2. 获取 Device
3. 创建 Kernel，编写 Compute Shader
4. 传入输入数据，获取计算结果

## 创建画布、渲染器与 GPGPU 插件

创建画布，使用渲染器的方式和之前渲染相关的教程并无差别，只是在创建渲染器时，需要确认在支持 WebGPU 的浏览器环境下运行。另外由于不涉及渲染，画布大小我们选择长宽为 1 即可。

```js
import { Canvas, CanvasEvent } from '@antv/g';
import { DeviceRenderer, Renderer } from '@antv/g-webgpu';
import { Plugin, Kernel } from '@antv/g-plugin-gpgpu';

const { BufferUsage } = DeviceRenderer;

// 选择目标平台为 WebGPU
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

在创建一个计算任务时，我们需要获取 GPU 设备（Device），用它创建 Buffer 等底层对象。在执行这些操作前，需要确保画布的初始化工作（特别是渲染服务）准备就绪，有两种方式：

-   监听画布的 [READY](/zh/api/canvas#画布特有事件) 事件
-   等待 `canvas.ready` 这个 Promise

随后就可以通过渲染器获取 Device：

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

不同于 CUDA 中的 "single source"（Host 和 Device 代码都用 C++）编写，WebGPU 的 Device 代码需要通过 Compute Shader 使用 [WGSL](https://www.w3.org/TR/WGSL) 语言编写。

因此 `g-plugin-gpgpu` 插件提供了 Kernel 用于描述计算任务，除了传入上一节获取的 `device`，还需要通过 `computeShader` 使用字符串描述：

```js
import { Kernel } from '@antv/g-plugin-gpgpu';

const kernel = new Kernel(device, {
    computeShader: `...`,
});
```

回到我们的计算任务：两个矩阵相乘，我们让每一个线程负责最终结果矩阵中一个元素的计算，这样多个线程间就可以完全并行。

首先我们需要使用线性结构（一个数组）描述一个矩阵，前两个元素表示矩阵尺寸（行和列），后面跟着具体每一个元素。我们使用 WGSL 的 [struct](https://www.w3.org/TR/WGSL/#struct-types) 定义矩阵这个数据类型（类似 TS 中的 interface），其中的 [f32](https://www.w3.org/TR/WGSL/#floating-point-types) 是 WGSL（强类型语言）中的一种基础数据类型，当我们后续尝试从 Host 侧分配内存时，也要使用与之匹配的类型数组（Float32Array）：

```wgsl
// WGSL
struct Matrix {
  size : vec2<f32>; // 矩阵尺寸（长度为 2 的向量）
  numbers: array<f32>; // 矩阵元素（长度不固定的数组）
};

// 如果用 TS 描述
interface Matrix {
  size : [number, number];
  numbers: number[];
}
```

然后我们需要定义输入和输出数据结构。我们声明了两个输入矩阵和一个保存计算结果的矩阵，从后往前看通过 `Matrix` 声明了它们的类型（类似 TS），`<storage, read>` 分别定义了内存的用途和访问模式，其中 [storage](https://www.w3.org/TR/WGSL/#address-spaces-storage) 描述了内存的用途，而不同的用途又有对应的访问模式（读写）。例如这里三个矩阵都用于存储数据（可以从 Host 侧分配），其中两个输入矩阵为只读，结果矩阵可写：

```wgsl
// 第一个矩阵
@group(0) @binding(0) var<storage, read> firstMatrix : Matrix;
// 第二个矩阵
@group(0) @binding(1) var<storage, read> secondMatrix : Matrix;
// 结果矩阵
@group(0) @binding(2) var<storage, read_write> resultMatrix : Matrix;
```

接下来就需要定义具体的算法了，每个线程都会执行相同的 Compute Shader 处理不同的数据（SIMD），这就要求每个线程知道自己的 ID，才能从全局数据中获取自己感兴趣的部分数据。在 WGSL 中通过 main 函数的入参获取，这里我们使用内置变量 [`global_invocation_id`](https://www.w3.org/TR/WGSL/#builtin-values)，它的类型是 `vec3<u32>` ，`xyz` 分量都从 0 开始，三者相乘不能超过 256。

```wgsl
@compute @workgroup_size(${WORKGROUP_SIZE_X}, ${WORKGROUP_SIZE_Y})
fn main(
  @builtin(global_invocation_id) global_id : vec3<u32> // 当前线程全局 ID
) {
  // 超出结果矩阵的线程直接返回
  if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >= u32(secondMatrix.size.y)) {
    return;
  }

  // 写回结果矩阵尺寸
  resultMatrix.size = vec2<f32>(firstMatrix.size.x, secondMatrix.size.y);

  let resultCell = vec2<u32>(global_id.x, global_id.y);
  var result = 0.0;
  for (var i = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
    let a = i + resultCell.x * u32(firstMatrix.size.y);
    let b = resultCell.y + i * u32(secondMatrix.size.y);
    result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
  }

  // 结果矩阵中元素位置
  let index = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
  // 计算结果写回结果矩阵
  resultMatrix.numbers[index] = result;
}
```

## 输入与输出

定义好了 Kernel，我们需要向它传递输入，结束后获取输出结果。分配内存的工作在 Host 侧执行，通过 Device 创建 Buffer([createBuffer](/zh/plugins/device-renderer#createbuffer))，其中 `usage` 需要与 Compute Shader 中定义的内存用途对应，同时进行内存初始数据的写入。

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

创建完 Buffer 之后，需要绑定到 Kernel 的指定位置（与 Compute Shader 中的 binding 对应）：

```js
kernel.setBinding(0, firstMatrixBuffer);
kernel.setBinding(1, secondMatrixBuffer);
kernel.setBinding(2, resultBuffer);
```

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

## 更多算法实现

上述矩阵乘法更多用于演示目的，在图场景中有非常多适合并行的布局和分析算法，我们可以从 CUDA 实现中进行移植，例如：

-   [Fruchterman 布局算法](/zh/examples/gpgpu#fruchterman)
-   [Pagerank](/zh/examples/gpgpu#pagerank)
-   [SSSP 单源最短路径](/zh/examples/gpgpu#bellman-ford)

在图中节点/边数目达到一定规模时会带来非常可观的性能提升效果。以 pagerank 为例，在 1k 节点和 50w 条边的测试数据中，GPU 版本相较 CPU 版本有 100 倍以上的提升（300ms vs 30s）。
