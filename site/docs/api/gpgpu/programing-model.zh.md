---
title: 编程模型
order: 1
---

参考 CUDA 的编程模型，了解它有助于我们写出高性能的并行代码： https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#programming-model

## Host & Device

在 CUDA 中 Kernel（核函数）在 GPU 侧（Device）并行，CPU 侧（Host）负责写入、读取数据，指定线程组大小，调用 Kernel 等串行任务：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*ZWCaRLLs1ekAAAAAAAAAAAAAARQnAQ" alt="host & device" width="60%">

两者是需要配合执行的，例如在 Host 中分配内存，再拷贝到 Device 中：

```c
//allocate memory
cudaMalloc((void**) &d_in_V, V.size() *sizeof(int));

//copy to device memory
cudaMemcpy(d_in_V, V.data(), V.size() *sizeof(int), cudaMemcpyHostToDevice);
```

以下面的 CUDA 程序（矩阵加法）为例，核函数在 GPU 每一个线程间并行，每个线程根据自己的编号领取部分数据进行运算，将结果写回全局数组中。在加法中每一个线程负责两个矩阵间同位置元素的计算：

```c
// Kernel 定义
__global__ void MatAdd(
  float A[N][N], // 输入数组1
  float B[N][N], // 输入数组2
  float C[N][N]) // 结果数组
{
    int i = blockIdx.x * blockDim.x + threadIdx.x; // 这些都是线程组相关的内置变量，仅 Kernel 函数中可使用
    int j = blockIdx.y * blockDim.y + threadIdx.y;
    if (i < N && j < N)
        C[i][j] = A[i][j] + B[i][j]; // 执行加法并写回
}

int main()
{
    // ... 省略创建 buffer 过程
    // Kernel invocation
    dim3 threadsPerBlock(16, 16); // 指定线程组大小
    dim3 numBlocks(N / threadsPerBlock.x, N / threadsPerBlock.y);
    MatAdd<<<numBlocks, threadsPerBlock>>>(A, B, C); // 调用 Kernel 函数
}
```

## CUDA vs Compute Shader

“single source” 无疑是 CUDA 的一大亮点，即 Host、Device 代码都用 C++ 编写，对于使用者无疑大大减少了学习成本。而使用渲染 API 的 Compute Shader 肯定无法做到这一点，Device 代码必须使用 Shader 语言写，类似 RPC 调用使得同步变得困难，同时 Shader 语言限制颇多（无递归、参数类型受限）。

下图来自该 [PPT](https://docs.google.com/presentation/d/1dVSXORW6JurLUcx5UhE1_7EZHuXv8APjx2y_Bbs_1Vg/edit#slide=id.gd6c3b45912_0_10)，对比了 CUDA 和 Compute Shader 的差异：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*4tl8Q6vZ16MAAAAAAAAAAAAAARQnAQ" alt="CUDA vs compute shaders" width="80%">

CUDA C++ 让开发者可以用 C++ 编写核函数，使用 nvcc 编译成 GPU 可执行的代码。如果我们想在 Web 端做同样的事情，JS 语言并不好扩展，换言之 Device 和 Host 代码很难写在一起。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*zCZDRY8o2ncAAAAAAAAAAAAAARQnAQ" alt="CUDA vs compute shaders" width="80%">

一个简单的做法是将 Device 代码写在字符串中，利用 WebGPU API 提供的计算管线。下一个问题是字符串中的 Device 代码应该使用哪种语言呢？

-   WGSL。使用 WebGPU 的 Shader 语言最直接，但对于前端开发者有一定学习成本（但其实还好，只需要学 Compute Shader），另外在字符串里写代码会丧失语法高亮。
-   TS。让前端开发者写 TS 代码，通过编译器生成 WGSL。之前 GWebGPU 这个项目就是这种思路，配合编辑器插件能提供语法高亮。

尽管 CUDA 和 Compute Shader 用法差异大，但对于同一个算法来说，将 CUDA 实现移植到 Compute Shader 中并不难，只要 Compute Shader 的特性足够丰富。

## 线程 & 组 & 网格

GPU 线程和通常意义上我们理解的线程还不太一样，这些线程执行同样的指令，只是使用不同的数据（SIMD）。在核函数中每个线程通过 ID 找到自己负责的数据。

### 逻辑视图

下图来自 [http://on-demand.gputechconf.com/gtc/2010/presentations/S12312-DirectCompute-Pre-Conference-Tutorial.pdf](http://on-demand.gputechconf.com/gtc/2010/presentations/S12312-DirectCompute-Pre-Conference-Tutorial.pdf)，仅展示网格与线程组的层次关系，并不局限于 DirectCompute。

<img src="https://user-images.githubusercontent.com/3608471/83828560-87a24f80-a713-11ea-8558-2813989db14a.png" alt="GPU Programming Model" width="60%">

-   通过 `dispatch(x, y, z)` 分配一个 3 维的线程网格（Grid）
-   网格中包含了许多线程组（Work Group、Thread Group、Thread Block、本地工作组不同叫法），每一个线程组中又包含了许多线程，线程组也是 3 维的，一般在 Shader 中通过 `numthreads(x, y, z)` 指定
-   我们的 Shader 程序最终会运行在每一个线程上。对于每一个线程，可以获取自己在线程组中的 3 维坐标，也可以获取线程组在整个线程网格中的 3 维坐标，以此映射到不同的数据上

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*rNh0SKfOOQAAAAAAAAAAAAAAARQnAQ" alt="Grid, Block and Thread" width="40%">

在 CUDA 中使用如下方式分配 Blocks 数量和每个 Block 中的线程数量：

```
dim3 threadsPerBlock(16, 16); // 指定线程组大小
dim3 numBlocks(N / threadsPerBlock.x, N / threadsPerBlock.y);
MatAdd<<<numBlocks, threadsPerBlock>>>(A, B, C); // 调用 Kernel 函数
```

而在 Compute Shader 中使用如下语法： https://www.w3.org/TR/WGSL/#entry-point-attributes

```
@compute @workgroup_size(8,4,1)
```

### 硬件视图

网格、线程组与线程的对应关系也体现在 GPU 的硬件实现上。

GPU 上有很多个 SM(Streaming Multiprocessor)，每一个 SM 包含了很多核心，下图为 CUDA 实现的对应关系：

<img src="https://user-images.githubusercontent.com/3608471/83829499-968a0180-a715-11ea-801e-ce68b2681cdf.png" alt="software & hardware" width="60%">

下图来自：http://www.adms-conf.org/2019-presentations/ADMS19_nvidia_keynote.pdf

<img src="https://user-images.githubusercontent.com/3608471/83829297-1ebbd700-a715-11ea-9083-ced1728ee10d.png" alt="GPU execution model" width="60%">

### 线程变量

现在我们了解了网格、线程组和线程的层次关系，在每一个线程执行 Shader 程序时，需要了解自己在所在线程组中的坐标、线程组在整个线程网格中的坐标。下图来自 [https://docs.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-numthreads?redirectedfrom=MSDN](https://docs.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-numthreads?redirectedfrom=MSDN)，展示了这些坐标的计算逻辑：

<img src="https://user-images.githubusercontent.com/3608471/83828472-53c72a00-a713-11ea-80e7-5ec22a688da8.png" alt="attributes numthreads" width="80%">

| 变量名               | 类型  | 说明                                                                                                                                                                 |
| -------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| numWorkGroups        | ivec3 | dispatch 的线程工作组数目                                                                                                                                            |
| workGroupSize        | ivec3 | Shader 内通过 `numthreads` 声明的每一个线程工作组包含的线程数                                                                                                        |
| workGroupID          | ivec3 | 当前线程工作组的索引。取值范围为 `(0, 0, 0)` 到 `(numWorkGroups.x - 1, numWorkGroups.y - 1, numWorkGroups.z - 1)` 之间                                               |
| localInvocationID    | ivec3 | 当前线程在自己线程组中的索引。取值范围为 `(0, 0, 0) 到 (workGroupSize.x - 1, * workGroupSize.y - 1, workGroupSize.z - 1)` 之间                                       |
| globalInvocationID   | ivec3 | 当前线程在全局线程组中的索引。计算方法为 `workGroupID * workGroupSize + localInvocationID`                                                                           |
| localInvocationIndex | int   | 当前线程在自己线程组中的一维索引，计算方法为 `localInvocationID.z * workGroupSize.x * workGroupSize.y + localInvocationID.y * workGroupSize.x + localInvocationID.x` |

### 共享内存与同步

在某些计算任务中，每个线程不仅需要处理自己负责的那一部分数据，可能还需要读取、修改其他线程处理过的数据，此时就需要共享内存与同步了。

<img src="https://user-images.githubusercontent.com/3608471/83833646-018c0600-a71f-11ea-92d9-f354bfa19345.png" alt="shared memory" width="60%">

来自：https://zhuanlan.zhihu.com/p/128996252

> 一个变量被声明为 shared，那么它将被保存到特定的位置，从而对同一个本地工作组内所有计算着色器可见。如果某个计算着色器请求对共享变量进行写入，那么这个数据的修改信息将最终通知给同一个本地工作组的所有着色器。通常访问共享 shared 变量的性能会远好于访问图像或者着色器存储缓存（如主内存）的性能。因为着色器会将共享内存作为局部量处理，并且可以在设备中进行拷贝，所以访问共享变量可能比使用缓冲区的方法更迅速。因此，如果着色器需要对同一处内存进行大量的访问，优先考虑将内存拷贝到共享变量中，然后操作。

既然涉及到共享内存，肯定就需要设置同步点：

> 运行屏障（execution barrier），可以通过 barrier() 函数触发。如果计算着色器的一个请求遇到 barrier，那么它会停止运行，等待同一个本地工作组的所有请求也到达 barrier，然后才会执行后面的代码。

例如在我们实现的 Reduce 求和的[例子](/zh/examples/gpgpu#reduce)中，使用了：

-   [线程间共享内存](https://www.w3.org/TR/WGSL/#address-spaces-workgroup)
-   [workgroupBarrier](https://www.w3.org/TR/WGSL/#sync-builtin-functions)

```wgsl
var<workgroup> shared : array<f32, 128>;

workgroupBarrier();
```
