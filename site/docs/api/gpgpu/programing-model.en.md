---
title: Programming Model
order: 1
---

Referring to the CUDA programming model, understanding it helps us to write high-performance parallel code.

https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#programming-model

## Host & Device

In CUDA the Kernel is parallelized on the GPU side (Device), while the CPU side (Host) is responsible for serial tasks such as writing and reading data, specifying the size of the thread group, and calling the Kernel.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*ZWCaRLLs1ekAAAAAAAAAAAAAARQnAQ" alt="host & device" width="60%">

The two need to be executed in conjunction, for example, by allocating memory in the Host and copying it to the Device.

```c
//allocate memory
cudaMalloc((void**) &d_in_V, V.size() *sizeof(int));

//copy to device memory
cudaMemcpy(d_in_V, V.data(), V.size() *sizeof(int), cudaMemcpyHostToDevice);
```

In the following CUDA program (matrix addition), for example, the kernel function is parallelized between each thread of the GPU, and each thread receives part of the data according to its number to perform the operation and writes the result back to the global array. Each thread in the addition is responsible for the computation of elements in the same position between two matrices.

```c
// Kernel
__global__ void MatAdd(
  float A[N][N], // Input array 1
  float B[N][N], // Input array 2
  float C[N][N]) // Result array
{
    int i = blockIdx.x * blockDim.x + threadIdx.x; // These are built-in variables related to thread groups and are only available in Kernel functions
    int j = blockIdx.y * blockDim.y + threadIdx.y;
    if (i < N && j < N)
        C[i][j] = A[i][j] + B[i][j]; // Perform addition and write back
}

int main()
{
    // ... Omit the buffer creation process
    // Kernel invocation
    dim3 threadsPerBlock(16, 16); // Specify the thread group size
    dim3 numBlocks(N / threadsPerBlock.x, N / threadsPerBlock.y);
    MatAdd<<<numBlocks, threadsPerBlock>>>(A, B, C); // Calling Kernel Functions
}
```

## CUDA vs Compute Shader

"single source" is undoubtedly one of the highlights of CUDA, i.e. Host and Device code are written in C++, which definitely reduces the learning cost for users. This is definitely not possible with Compute Shader, which uses the rendering API. Device code must be written in the Shader language, which makes synchronization difficult due to RPC-like calls, and the Shader language has a lot of limitations (no recursion, restricted parameter types).

The following figure from this [PPT](https://docs.google.com/presentation/d/1dVSXORW6JurLUcx5UhE1_7EZHuXv8APjx2y_Bbs_1Vg/edit#slide=id.gd6c3b45912_0_10) compares differences between CUDA and Compute Shader.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*4tl8Q6vZ16MAAAAAAAAAAAAAARQnAQ" alt="CUDA vs compute shaders" width="80%">

CUDA C++ allows developers to write kernel functions in C++ and compile them into GPU-executable code using nvcc. If we want to do the same thing on the web side, the JS language doesn't scale well, in other words Device and Host code are hard to write together.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*zCZDRY8o2ncAAAAAAAAAAAAAARQnAQ" alt="CUDA vs compute shaders" width="80%">

A simple approach is to write the Device code in a string, taking advantage of the computational pipeline provided by the WebGPU API. The next question is which language should the Device code in the string be in?

-   WGSL. Using WebGPU's Shader language is the most straightforward, but there are some learning costs for front-end developers (but it's actually fine, you only need to learn Compute Shader), plus you lose syntax highlighting when writing code in strings.
-   TS. This is the idea behind the GWebGPU project, which provides syntax highlighting with the editor plugin.

Although the usage of CUDA and Compute Shader is quite different, it is not difficult to port a CUDA implementation to Compute Shader for the same algorithm, as long as Compute Shader is feature-rich enough.

## Thread, Block and Grid

GPU threads are not quite the same as what we normally understand as threads, these threads execute the same instructions, but just use different data (SIMD). In the kernel function each thread finds the data it is responsible for by its ID.

### Logic View

The image below is from: [http://on-demand.gputechconf.com/gtc/2010/presentations/S12312-DirectCompute-Pre-Conference-Tutorial.pdf](http://on-demand.gputechconf.com/gtc/2010/presentations/S12312-DirectCompute-Pre-Conference-Tutorial.pdf). It only shows the hierarchical relationship between grids and thread groups, and is not limited to DirectCompute.

<img src="https://user-images.githubusercontent.com/3608471/83828560-87a24f80-a713-11ea-8558-2813989db14a.png" alt="GPU Programming Model" width="60%">

-   Assign a 3-dimensional thread grid via `dispatch(x, y, z)`
-   The grid contains many thread groups (Work Groups, Thread Groups, Thread Blocks, local workgroups are called differently), each of which contains many threads, and the thread groups are also 3-dimensional, generally specified in the Shader by `numthreads(x, y, z)`
-   Our Shader program will eventually run on each thread. For each thread, you can get the 3-dimensional coordinates of your own thread group, or you can get the 3-dimensional coordinates of the thread group in the whole thread grid, and map it to different data

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*rNh0SKfOOQAAAAAAAAAAAAAAARQnAQ" alt="Grid, Block and Thread" width="40%">

The number of Blocks and the number of threads in each Block are allocated in CUDA in the following way.

```
dim3 threadsPerBlock(16, 16); // Specify the thread group size
dim3 numBlocks(N / threadsPerBlock.x, N / threadsPerBlock.y);
MatAdd<<<numBlocks, threadsPerBlock>>>(A, B, C); // Calling Kernel Functions
```

Instead, the following syntax is used in the Compute Shader. https://www.w3.org/TR/WGSL/#entry-point-attributes

```
@compute @workgroup_size(8,4,1)
```

### Hardware View

The correspondence between grids, thread groups and threads is also reflected in the hardware implementation of the GPU.

There are many SMs (Streaming Multiprocessor) on the GPU and each SM contains many cores, the following diagram shows the correspondence of CUDA implementations.

<img src="https://user-images.githubusercontent.com/3608471/83829499-968a0180-a715-11ea-801e-ce68b2681cdf.png" alt="software & hardware" width="60%">

The image below is from: http://www.adms-conf.org/2019-presentations/ADMS19_nvidia_keynote.pdf

<img src="https://user-images.githubusercontent.com/3608471/83829297-1ebbd700-a715-11ea-9083-ced1728ee10d.png" alt="GPU execution model" width="60%">

### Thread Variables

Now that we understand the hierarchy of grids, thread groups and threads, each thread needs to know its own coordinates in the thread group it is in, and the coordinates of the thread group in the entire thread grid when it executes the Shader program. The following figure is from [https://docs.microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-numthreads?redirectedfrom=MSDN](https://docs. microsoft.com/en-us/windows/win32/direct3dhlsl/sm5-attributes-numthreads?redirectedfrom=MSDN), shows the logic for calculating these coordinates.

<img src="https://user-images.githubusercontent.com/3608471/83828472-53c72a00-a713-11ea-80e7-5ec22a688da8.png" alt="attributes numthreads" width="80%">

| parameter            | data type | remarks                                                                                                                                                                                                        |
| -------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| numWorkGroups        | ivec3     | Number of threaded workgroups for dispatch                                                                                                                                                                     |
| workGroupSize        | ivec3     | The number of threads per thread group declared by `numthreads` within the Shader                                                                                                                              |
| workGroupID          | ivec3     | The index of the current thread workgroup. The range of values is from `(0, 0, 0)` to `(numWorkGroups.x - 1, numWorkGroups.y - 1, numWorkGroups.z - 1)`                                                        |
| localInvocationID    | ivec3     | The index of the current thread in its own thread group. The range of values is from `(0, 0, 0)` to `(workGroupSize.x - 1, * workGroupSize.y - 1, workGroupSize.z - 1)`                                        |
| globalInvocationID   | ivec3     | The index of the current thread in the global thread group. It is calculated as `workGroupID * workGroupSize + localInvocationID`                                                                              |
| localInvocationIndex | int       | The one-dimensional index of the current thread in its own thread group, calculated as `localInvocationID.z * workGroupSize.x * workGroupSize.y + localInvocationID.y * workGroupSize.x + localInvocationID.x` |

### Shared memory and Synchronization

In some computing tasks, each thread not only needs to process the part of data it is responsible for, but may also need to read and modify the data processed by other threads, which requires shared memory and synchronization.

<img src="https://user-images.githubusercontent.com/3608471/83833646-018c0600-a71f-11ea-92d9-f354bfa19345.png" alt="shared memory" width="60%">

https://zhuanlan.zhihu.com/p/128996252

> When a variable is declared as shared, it will be saved to a specific location and thus visible to all compute shaders in the same local workgroup. If a compute shader requests a write to a shared variable, then information about the changes to this data will eventually be notified to all shaders in the same local workgroup. Access to shared variables is usually much better than access to image or shader storage caches (e.g. main memory). Because shaders treat shared memory as a local quantity and can make copies in the device, accessing shared variables may be faster than using the buffer approach. Therefore, if a shader needs to make a large number of accesses to the same memory, give preference to copying the memory to a shared variable and then manipulating it.

Since shared memory is involved, it is definitely necessary to set up synchronization points.

> The execution barrier, which can be triggered by the barrier() function. If a request from a compute shader encounters the barrier, it stops running and waits for all requests from the same local workgroup to also reach the barrier before executing the code that follows.

For example, in our implementation of Reduce summation [example](/en/examples/gpgpu#reduce), the following is used.

-   [shared memory](https://www.w3.org/TR/WGSL/#address-spaces-workgroup)
-   [workgroupBarrier](https://www.w3.org/TR/WGSL/#sync-builtin-functions)

```wgsl
var<workgroup> shared : array<f32, 128>;

workgroupBarrier();
```
