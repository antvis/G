---
title: GPGPU 初体验
order: 10
---

最终效果可以参考这个[示例](/zh/examples/tutorial/add2vectors)。

来看看这个非常简单的计算任务：两个长度为 8 的一维向量求和。类似 tensorflow 中提供的 `tf.add()`：

```typescript
// https://js.tensorflow.org/api/latest/#add
const a = tf.tensor1d([1, 2, 3, 4]);
const b = tf.tensor1d([10, 20, 30, 40]);

a.add(b).print(); // or tf.add(a, b)
```

我们很容易写出一个能在 CPU 侧运行的算法：写一个长度为 8 的循环，先计算两个数组中第一个元素的和，再计算第二个元素，以此类推。但第二个元素的计算并不依赖第一个元素的计算结果对吗？现在让我们从线程并行的角度来考虑这个问题，我们可以分配一个 `1 * 1 * 1` 的线程网格，其中唯一的一个线程组中包含 `8 * 1 * 1` 个线程，每个线程负责处理一个元素。如果对网格、线程组这些概念还不熟悉，可以参考[线程、共享内存与同步](/zh/docs/api/workgroup)。

下面我们通过两步完成该计算任务的创建：

1. 创建 Compute Kernel
2. 用 TypeScript 语法编写 Compute Shader

通过这个例子也能看出相比 API 组合调用，用户通过 TypeScript 来编写自己的并行计算任务显然能满足更多的场景。不过相同的是，我们的 Parser 会生成适合不同目标平台的 Shader 代码，用户只需要知道这份代码最终会运行在 GPU 侧。

# 创建 Compute Kernel

首先调用 [API](/zh/docs/api/compute-pipeline) 完成 Compute Kernel 的创建。我们使用 `dispatch` 分配了一个 `1 * 1 * 1` 的线程网格，通过 `setBinding` 传入了两个向量作为计算数据。

```typescript
import { World } from '@antv/g-webgpu';
import { Compiler } from '@antv/g-webgpu-compiler';

// create a world
const world = World.create({
    engineOptions: {
        supportCompute: true,
    },
});

const compiler = new Compiler();
// 下一节的 Shader 文本，使用 TS 语法编写
const precompiledBundle = compiler.compileBundle(gCode);

// create a kernel
const kernel = world
    .createKernel(precompiledBundle)
    .setDispatch([1, 1, 1]) // 线程网格
    .setBinding('vectorA', [1, 2, 3, 4, 5, 6, 7, 8]) // 绑定输入到 Compute Shader 中的两个参数
    .setBinding('vectorB', [1, 2, 3, 4, 5, 6, 7, 8]);
await kernel.execute();

// get output: [2, 4, 6, 8, 10, 12, 14, 16]
const output = await kernel.getOutput();
```

# 编写计算任务代码

首先我们使用 [numthreads](/zh/docs/api/syntax#线程组声明) 类装饰器声明了线程组的大小：

```typescript
@numthreads(8, 1, 1)
class Add2Vectors {}
```

然后我们声明了两个输入变量 `vectorA` 和 `vectorB`，使用 [in](/zh/docs/api/syntax#输入变量) 属性装饰器声明它们。同时，我们把最终的求和结果也输出到 `vectorA` 中，使用 [out](/zh/docs/api/syntax#输出变量) 属性装饰器声明。最后声明它们的类型：`float[]`。

```typescript
@numthreads(8, 1, 1)
class Add2Vectors {
  @in @out
  vectorA: float[];

  @in
  vectorB: float[];
}
```

然后我们可以定义最简单的求和方法，供后续的 `main` 函数调用。需要声明参数和返回值的类型，可以参考[声明函数](/zh/docs/api/syntax#声明函数)。

```typescript
@numthreads(8, 1, 1)
class Add2Vectors {
    sum(a: float, b: float): float {
        return a + b;
    }
}
```

最后我们以 `globalInvocationID.x` 作为索引从输入数组中获取当前线程处理的数据，完成求和后输出。如果线程变量还不熟悉，可以参考[线程变量](/zh/docs/api/workgroup#线程变量)。

```typescript
@numthreads(8, 1, 1)
class Add2Vectors {
  @in @out
  vectorA: float[];

  @in
  vectorB: float[];

  sum(a: float, b: float): float {
    return a + b;
  }

  @main
  compute() {
    // 获取当前线程处理的数据
    const a = this.vectorA[globalInvocationID.x];
    const b = this.vectorB[globalInvocationID.x];

    // 输出当前线程处理完毕的数据，即两个向量相加后的结果
    this.vectorA[globalInvocationID.x] = this.sum(a, b);
  }
}
```

至此我们就完成了这个计算任务的编写，最终效果可以参考[示例](/zh/examples/tutorial/add2vectors)。

# 预编译

目前在运行编译用户编写的 TypeScript 代码到目标平台会消耗很多时间，这还是在我们选择了 Pegjs 这样相对较轻（相比 Antlr）的 Parser 的情况下。 在绝大部分场景下，用户都不会在运行时修改编译好的 Shader 代码，因此预编译是一个不错的选择。

我们提供了[预编译 API](/zh/docs/api/compute-pipeline#获取预编译结果) 便于用户获取编译好的 Shader 代码。这样用户可以在开发过程中试运行成功后保存下编译结果，在实际运行代码中直接传入：

```typescript
// 试运行代码
const compiler = new Compiler();
const precompiledBundle = compiler.compileBundle(gCode);
// 获取编译结果 JSON 字符串
console.log(precompiledBundle.toString());

// 实际运行代码，使用试运行过程中获得的编译结果创建，不需要再引入 Compiler
const kernel = world.createKernel('{"shaders":{"WGSL":"import \\......');
```

完整[示例](/zh/examples/gpgpu/basic/add2vectors#add2vectors-precompiled)。

事实上 GPU.js 也是这么做的： https://github.com/gpujs/gpu.js#precompiled-and-lighter-weight-kernels

在下一个例子[Fruchterman 布局算法](/zh/docs/tutorial/gpgpu/gpgpu/fruchterman)中我们将看到使用预编译的显著效果。
