---
title: Introduction
order: 0
---

## What is GPGPU?

GPUs and CPUs are good at performing different types of computational tasks due to different hardware architectures. In particular, in single instruction stream multiple data stream (SIMD) scenarios, GPUs are much faster than CPUs.

The following image is from: [https://www.techpowerup.com/199624/nvidia-to-launch-geforce-337-50-beta-later-today](https://www.techpowerup.com/199624/nvidia-to-launch-geforce-337-50-beta-later-today). Clearly demonstrates the huge advantages of GPUs in both floating point operations per second and data throughput metrics.

<img src="https://user-images.githubusercontent.com/3608471/83615466-2a928680-a5b9-11ea-80cf-fac28e0d91cc.png" alt="gpu vs cpu" width="600">

The powerful computing power of the GPU is not limited to rendering, <strong>G</strong>eneral-<strong>p</strong>urpose computing on <strong>g</strong>raphics <strong>p</strong>rocessing <strong>u</strong>nits, that is the introduction of the GPU general-purpose computing concept pushes this capability to a broader computing scenario.

Early Classic Series Books GPU Gems [Gem2 🔗](https://developer.nvidia.com/gpugems/gpugems2/part-iv-general-purpose-computation-gpus-primer) [Gem3 🔗](https://developer.nvidia.com/gpugems/gpugems3/part-vi-gpu-computing) includes a large number of practices in general-purpose computing, including video decoding, real-time encryption and decryption, image compression, random number generation, simulation, and so on.

Modern GPUs are more likely to design hardware for specific types of computational tasks. For example, Nvidia's Turing architecture includes the Tensor Core, which specializes in tensor calculations, and the RT Core, which is dedicated to ray-tracing calculations.

<img src="https://user-images.githubusercontent.com/3608471/83622800-0b98f200-a5c3-11ea-95b4-df99f287fa53.png" alt="Nvidia turing" width="600">

To lower the barrier to GPU-oriented programming for developers, Nvidia has proposed the CUDA（<strong>C</strong>ompute <strong>U</strong>nified <strong>D</strong>evice <strong>A</strong> rchitecture）. Developers can write their own code for computational tasks in C, Java, Python, and other languages.

And as front-end developers, we are facing more and more data-intensive computing tasks suitable for parallelism, can we use GPGPU technology on the web side?

## Using GPGPU on the web side

In fact, there are already many excellent GPGPU practices on the Web side, such as:

-   [tensorflow.js](https://github.com/tensorflow/tfjs)
-   [GPU.js](https://github.com/gpujs/gpu.js)
-   [Stardust.js](https://stardustjs.github.io/)

### Implementation based on WebGL

From an implementation point of view, the above solutions all use the WebGL graphics API to emulate Compute Shaders that are not supported, specifically through programmable Vertex/Fragment Shaders in the regular rendering pipeline, if you are interested in our implementation, you can read [Principles of Classic GPGPU Implementation](/zh/ api/implements). The following diagram from [http://www.vizitsolutions.com/portfolio/webgl/gpgpu/](http://www.vizitsolutions.com/portfolio/webgl/gpgpu/) briefly shows the basic implementation.

<img src="https://user-images.githubusercontent.com/3608471/83623503-fd97a100-a5c3-11ea-83d3-bf2c11836219.png" alt="GPGPU based on WebGL" width="300">

This is of course for compatibility reasons, as the thread groups, shared memory, synchronization and other mechanisms that should be present in the Compute Shader cannot be emulated by the Vertex/Fragment Shader. In addition, the compute pipeline is also much more compact compared to the regular rendering pipeline. In the figure below, the programmable rendering and compute pipelines for Vulkan are shown on the left and right, respectively, from: [https://vulkan.lunarg.com/doc/view/1.0.26.0/windows/vkspec.chunked/ch09.html](https://vulkan.lunarg.com/doc/view/1.0.26.0/windows/vkspec.chunked/ch09.html):

<img src="https://user-images.githubusercontent.com/3608471/83636874-4574f300-a5d9-11ea-81d8-af77eb46caa1.png" alt="compute pipeline" width="500">

Of course WebGL 2 also considered native support for Compute Shader, which is after all a core feature in OpenGL ES 3.1. Even the [WebGL 2.0 Compute draft](https://www.khronos.org/registry/webgl/specs/latest/2.0-compute/) and [DEMO](https://github.com/9ballsyndrome/ WebGL_Compute_shader) have also been proposed for a long time. However, due to Apple's lack of support, WebGL 2.0 Compute currently only runs under Windows Chrome/Edge. Similarly, the WebGL 2.0 Transform Feedback has compatibility issues as an alternative.

The image below is from: [https://slideplayer.com/slide/16710114/](https://slideplayer.com/slide/16710114/), shows the correspondence between WebGL and OpenGL.

<img src="https://user-images.githubusercontent.com/3608471/83636450-959f8580-a5d8-11ea-8881-6496f16b1311.png" alt="WebGL vs OpenGL" width="500">

### Implementation based on WebGPU

WebGPU, the successor to WebGL, is currently [supported](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status) by major browser vendors and can be experienced in the following browsers (experimental feature webgpu flag needs to be enabled).

-   Chrome Canary
-   Edge Canary
-   Safari Technology Preview

Chrome 94 is now supported by Origin trial: https://web.dev/gpu/

The image below is from: [https://www.chromestatus.com/feature/6213121689518080](https://www.chromestatus.com/feature/6213121689518080). As a modern graphics API, one of the features of WebGPU is support for Compute Shader, which is rightfully our first choice for the future.

<img src="https://user-images.githubusercontent.com/3608471/83626014-6d5b5b00-a5c7-11ea-8ec1-410cb4e5dcfc.png" alt="WebGPU on Chrome" width="500">

In addition to computation, the browser implementation of the WebGPU API encapsulates modern graphics APIs like Vulkan, DX12, and Metal instead of OpenGL, further reducing driver overhead and providing better support for multi-threading. For users, the problems that existed in the WebGL API in the past will also be solved. The shader language for WebGPU has been determined to be [WGSL](https://www.w3.org/TR/WGSL).

Although WebGPU is still in the development stage, there are many good practices, such as:

-   tensorflow.js is trying [WebGPU-based backend implementation](https://github.com/tensorflow/tfjs/tree/master/tfjs-backend-webgpu/src)。
-   Babylon.js is trying to implement [a WebGPU-based rendering engine](https://doc.babylonjs.com/extensions/webgpu)。

## The computing scenarios and challenges we face

When we focus from the field of general-purpose computing to visualization scenarios, we find that many parallelizable computational tasks exist that are suitable for GPU execution, such as:

-   The [Fruchterman layout algorithm](https://github.com/antvis/G6/blob/master/src/layout/fruchterman.ts) in G6 is a typical example, where the position of each node in each iteration needs to be calculated based on the positions of other nodes, and it needs to go through many iterations to reach a steady state. The computation of each node position in each iteration is based on the positions of other nodes, and it takes many iterations to reach a stable state, so it is computationally intensive.
-   Instanced-based Vis. Stardust.js is exactly for this scenario, such as the sanddance effect.
-   Data transformation. In charting scenarios where large amounts of data require high interaction, many parallelizable algorithms such as reduce & scan can be executed in the GPU. P4 & P5（IEEE TRANSACTIONS ON VISUALIZATION AND COMPUTER GRAPHICS, VOL. 26, NO. 3, MARCH 2020）
