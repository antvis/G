---
title: 线程、共享内存和同步
order: 3
---

对于前端开发者来说，鲜有机会在浏览器中实现一个可线程并行的算法。而在 GPU 编程模型中线程、共享内存和同步都是非常重要的概念。了解它们对于我们迁移一个已有的用 JS/TS 实现的可并行算法是很有帮助的。

# 线程网格和线程组

## 逻辑视图

下图来自 [http://on-demand.gputechconf.com/gtc/2010/presentations/S12312-DirectCompute-Pre-Conference-Tutorial.pdf](http://on-demand.gputechconf.com/gtc/2010/presentations/S12312-DirectCompute-Pre-Conference-Tutorial.pdf)，仅展示网格与线程组的层次关系，并不局限于 DirectCompute。

-   通过 `dispatch(x, y, z)` 分配一个 3 维的线程网格（Grid）
-   网格中包含了许多线程组（Work Group、Thread Group、Thread Block、本地工作组不同叫法），每一个线程组中又包含了许多线程，线程组也是 3 维的，一般在 Shader 中通过 `numthreads(x, y, z)` 指定
-   我们的 Shader 程序最终会运行在每一个线程上。对于每一个线程，可以获取自己在线程组中的 3 维坐标，也可以获取线程组在整个线程网格中的 3 维坐标，以此映射到不同的数据上

![image](https://user-images.githubusercontent.com/3608471/83828560-87a24f80-a713-11ea-8558-2813989db14a.png)

## 硬件视图

网格、线程组与线程的对应关系也体现在 GPU 的硬件实现上。

GPU 上有很多个 SM(Streaming Multiprocessor)，每一个 SM 包含了很多核心，下图为 CUDA 实现的对应关系： ![image](https://user-images.githubusercontent.com/3608471/83829499-968a0180-a715-11ea-801e-ce68b2681cdf.png)

下图来自：http://www.adms-conf.org/2019-presentations/ADMS19_nvidia_keynote.pdf ![image](https://user-images.githubusercontent.com/3608471/83829297-1ebbd700-a715-11ea-9083-ced1728ee10d.png)

## 线程变量

现在我们了解了网格、线程组和线程的层次关系，在每一个线程执行 Shader 程序时，需要了解自己在所在线程组中的坐标、线程组在整个线程网格中的坐标。下图来自 [https://docs.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-numthreads?redirectedfrom=MSDN](https://docs.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-numthreads?redirectedfrom=MSDN)，展示了这些坐标的计算逻辑：

![image](https://user-images.githubusercontent.com/3608471/83828472-53c72a00-a713-11ea-80e7-5ec22a688da8.png)

在 GWebGPU 中开发者可以通过 `import` 引用我们提供的线程变量：

| 变量名 | 类型 | 说明 |
| --- | --- | --- |
| numWorkGroups | ivec3 | dispatch 的线程工作组数目 |
| workGroupSize | ivec3 | Shader 内通过 `numthreads` 声明的每一个线程工作组包含的线程数 |
| workGroupID | ivec3 | 当前线程工作组的索引。取值范围为 `(0, 0, 0)` 到 `(numWorkGroups.x - 1, numWorkGroups.y - 1, numWorkGroups.z - 1)` 之间 |
| localInvocationID | ivec3 | 当前线程在自己线程组中的索引。取值范围为 `(0, 0, 0) 到 (workGroupSize.x - 1, * workGroupSize.y - 1, workGroupSize.z - 1)` 之间 |
| globalInvocationID | ivec3 | 当前线程在全局线程组中的索引。计算方法为 `workGroupID * workGroupSize + localInvocationID` |
| localInvocationIndex | int | 当前线程在自己线程组中的一维索引，计算方法为 `localInvocationID.z * workGroupSize.x * workGroupSize.y + localInvocationID.y * workGroupSize.x + localInvocationID.x` |

在下一节中我们将看到这些变量具体的使用方式。

## 如何分配网格与线程组大小 ？

现在我们知道可以通过 `dispatch(x, y, z)` 指定线程网格大小，通过 `numthreads(x, y, z)` 指定线程组大小。那如何分配这些大小呢？答案是视具体的计算任务而定，重点是如何映射到不同的数据上。

举例来说，如果我们想实现两个长度为 8 的向量加法，很容易想到可以分配总共 8 个线程，第一个线程处理两个数组第一个元素相加，以此类推。很明显，我们拆分网格与线程组的方案远不止一种：

1. `dispatch(8, 1, 1)` `numthreads(1, 1, 1)`
2. `dispatch(1, 8, 1)` `numthreads(1, 1, 1)`
3. `dispatch(2, 2, 1)` `numthreads(2, 1, 1)`

以第一种分配方式为例（这也是我们[示例]()的做法）：

-   `numWorkGroups` `(8, 1, 1)`
-   `workGroupSize` `(1, 1, 1)`
-   `workGroupID` 取值范围 `(0, 0, 0)` ~ `(7, 0, 0)` 之间
-   `globalInvocationID` 取值范围 `(0, 0, 0)` ~ `(7, 0, 0)` 之间
-   `localInvocationID` 由于每个线程组只有一个线程，因此每个线程在所处线程组中的坐标都为 `(0, 0, 0)`
-   `localInvocationIndex` 由于每个线程组只有一个线程，因此每个线程在所处线程组中的一维索引都为 0

因此可以使用 `globalInvocationID.x` 或者 `workGroupID.x` 作为输入数据的索引，让每一个线程引用对应数据：

```typescript
import { globalInvocationID } from 'g-webgpu';

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

如果换成第二种分配方式呢？显然只需要使用 `globalInvocationID.y` 替换掉 `globalInvocationID.x` 就行了。

而对于第三种分配方式，

-   `numWorkGroups` `(2, 2, 1)`
-   `workGroupSize` `(2, 1, 1)`
-   `workGroupID` 取值范围 `(0, 0, 0)` ~ `(1, 1, 0)` 之间
-   `globalInvocationID` 取值范围 `(0, 0, 0)` ~ `(3, 1, 0)` 之间
-   `localInvocationID` 取值范围 `(0, 0, 0)` ~ `(1, 0, 0)` 之间
-   `localInvocationIndex` 取值范围 `0` ~ `1` 之间

为了在每一个线程中获取对应的输入数据，就需要一些简单的运算了，例如： `const index = globalInvocationID.x * workGroupSize.x + globalInvocationID.y;`

因此在这个例子中显然第一种、第二种分配方式相对直观，也更容易实现。

最后留一个小小的思考题，如果我们的计算任务是对一张 8 \* 8 的图片设置成红色，即输入数据是一个二维数组，我们该如何分配呢？来看一个 CUDA 核函数的实现，忽略细节我们应该能领会到分配的思路：

```C
// test.compute
#pragma kernel FillWithRed // 1. 核函数名称

RWTexture2D<float4> res;   // 2. 输入图片纹理

[numthreads(8, 8, 1)]       // 3. 分配线程组大小，包含 64 个线程
void FillWithRed (uint3 dtid : SV_DispatchThreadID) // 4. 每个线程负责处理一个像素点
{
    // 通过 .xy 获取当前线程处理的像素点
    res[dtid.xy] = float4(1, 0, 0, 1); // 5. 每个像素点都设置成红色
}
```

这是一个来自 Metal 的实际例子，处理一张 1024 X 768 的图片。网格中包含 32 X 48 个线程组，每个线程组中包含 32 X 16 个线程。感兴趣可以继续阅读 https://developer.apple.com/documentation/metal/creating_threads_and_threadgroups： ![image](https://user-images.githubusercontent.com/3608471/84341659-3cd27d00-abd6-11ea-873a-c10fff0a12dc.png)

## 线程组大小限制

在计算管线中，每一个线程组中包含的线程数是有限制的。由于我们基于 WebGL 的实现无法使用 Compute Shader，因此可以忽略这个限制。而在 WebGPU 的实现中，这个限制取决于底层依赖的图形 API，目前尚未在 WebGPU API 中以常量形式透出：https://github.com/gpuweb/gpuweb/issues/275。

例如在 D3D 中，不同版本的 Compute Shader 对于每个线程组大小（`numthreads 中的 X*Y*Z`）是有限制的，来自：https://docs.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-numthreads

| Compute Shader | Maximum Z | Maximum Threads (`X*Y*Z`) |
| -------------- | --------- | ------------------------- |
| `cs_4_x`       | 1         | 768                       |
| `cs_5_0`       | 64        | 1024                      |

而在 Metal 的计算管线中，提供了 [maxTotalThreadsPerThreadgroup](https://developer.apple.com/documentation/metal/mtlcomputepipelinestate/1414927-maxtotalthreadsperthreadgroup)，根据设备线程组内存的不同并不是一个定值。

> The maxTotalThreadsPerThreadgroup property is dependent on the device, the register usage of your compute kernel, and threadgroup memory usage. After a compute pipeline state has been created, its maxTotalThreadsPerThreadgroup value doesn't change, but two pipeline states on the same device may return different values.

结合 [threadExecutionWidth](https://developer.apple.com/documentation/metal/mtlcomputepipelinestate/1414911-threadexecutionwidth) 计算可以得到理想中的线程组尺寸：来自：https://developer.apple.com/documentation/metal/calculating_threadgroup_and_grid_sizes

```
let w = pipelineState.threadExecutionWidth
let h = pipelineState.maxTotalThreadsPerThreadgroup / w
let threadsPerThreadgroup = MTLSizeMake(w, h, 1)
```

最后如果设备支持非定长（non-uniform）的线程组大小，Metal 还会计算进行裁剪，避免分配多余的线程：

![image](https://docs-assets.developer.apple.com/published/60fff83501/c8d2ae2f-3bb7-4621-8c1e-6d5e2143d424.png)

# 共享内存与同步

⚠️ 该特性目前仅在支持 WebGPU 的浏览器中可用

在某些计算任务中，每个线程不仅需要处理自己负责的那一部分数据，可能还需要读取、修改其他线程处理过的数据，此时就需要共享内存与同步了。

![image](https://user-images.githubusercontent.com/3608471/83833646-018c0600-a71f-11ea-92d9-f354bfa19345.png)

来自：https://zhuanlan.zhihu.com/p/128996252

> 一个变量被声明为 shared，那么它将被保存到特定的位置，从而对同一个本地工作组内所有计算着色器可见。如果某个计算着色器请求对共享变量进行写入，那么这个数据的修改信息将最终通知给同一个本地工作组的所有着色器。通常访问共享 shared 变量的性能会远好于访问图像或者着色器存储缓存（如主内存）的性能。因为着色器会将共享内存作为局部量处理，并且可以在设备中进行拷贝，所以访问共享变量可能比使用缓冲区的方法更迅速。因此，如果着色器需要对同一处内存进行大量的访问，优先考虑将内存拷贝到共享变量中，然后操作。

既然涉及到共享内存，肯定就需要设置同步点：

> 运行屏障（execution barrier），可以通过 barrier() 函数触发。如果计算着色器的一个请求遇到 barrier，那么它会停止运行，等待同一个本地工作组的所有请求也到达 barrier，然后才会执行后面的代码。

在 GWebGPU 中，可以通过：

-   `@shared(length)` 属性修饰器可以声明一个线程组内共享内存，读写方式和其他输入/输出变量一致。
-   通过 `barrier()` 可以触发共享内存同步

```typescript
import { globalInvocationID } from 'g-webgpu';

@numthreads(10, 1, 1)
class MyProgram {
  @in
  globalData: float[];

  @shared(1024)
  sharedData: float[];

  @main
  compute() {
    const tid = localInvocationID.x;
    const i = workGroupID.x * workGroupSize.x * 2 + localInvocationID.x;

    this.sharedData[tid] = this.globalData[i] + this.globalData[i + workGroupSize.x];
    barrier();
  }
}
```

具体例子可以参考 [Reduce]()。
