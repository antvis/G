---
title: 简介
order: 0
---

## 什么是 GPGPU ？

由于硬件结构不同，GPU 与 CPU 擅长执行不同类型的计算任务。特别的，在单指令流多数据流（SIMD）场景下，GPU 的运算速度远超 CPU。

下图来自：[https://www.techpowerup.com/199624/nvidia-to-launch-geforce-337-50-beta-later-today](https://www.techpowerup.com/199624/nvidia-to-launch-geforce-337-50-beta-later-today)，清晰的展示了 GPU 在每秒浮点数运算次数与数据吞吐量两项指标下的巨大优势。

<img src="https://user-images.githubusercontent.com/3608471/83615466-2a928680-a5b9-11ea-80cf-fac28e0d91cc.png" alt="gpu vs cpu" width="600">

GPU 强大的计算能力早已不局限于渲染，<strong>G</strong>eneral-<strong>p</strong>urpose computing on <strong>g</strong>raphics <strong>p</strong>rocessing <strong>u</strong>nits 即 GPU 通用计算概念的提出将这种能力推向了更广阔的计算场景。

早期的经典系列书籍 GPU Gems [Gem2 🔗](https://developer.nvidia.com/gpugems/gpugems2/part-iv-general-purpose-computation-gpus-primer) [Gem3 🔗](https://developer.nvidia.com/gpugems/gpugems3/part-vi-gpu-computing) 中就收录了大量通用计算领域的实践，包括了视频解码、实时加解密、图片压缩、随机数生成、仿真等等。

现代的 GPU 更是针对特定类型的计算任务设计硬件。例如 Nvidia 的 Turing 架构中就包含了专门进行张量计算的 Tensor Core 和光线追踪计算的 RT Core。

<img src="https://user-images.githubusercontent.com/3608471/83622800-0b98f200-a5c3-11ea-95b4-df99f287fa53.png" alt="Nvidia turing" width="600">

为了降低开发者面向 GPU 编程的门槛，Nvidia 提出了 CUDA（<strong>C</strong>ompute <strong>U</strong>nified <strong>D</strong>evice <strong>A</strong>rchitecture，统一计算架构），开发者可以使用 C、Java、Python 等语言编写自己的计算任务代码。

而作为前端开发者，我们面对的适合并行的数据密集型计算任务也越来越多，是否能在 Web 端使用 GPGPU 技术呢？

## 在 Web 端应用

事实上，在 Web 端已经有了很多优秀的 GPGPU 实践，例如：

-   [tensorflow.js](https://github.com/tensorflow/tfjs)。用户通过 API 组合调用完成计算任务。
-   [GPU.js](https://github.com/gpujs/gpu.js)。用户使用 JS 编写简单的计算任务。
-   [Stardust.js](https://stardustjs.github.io/)。用户使用 Mark 语言定义计算任务，实现 Sanddance 效果。

### WebGL 实现

从实现角度看，以上方案都使用 WebGL 图形 API 来模拟并不支持的 Compute Shader，具体来说都是通过常规渲染管线中可编程的 Vertex/Fragment Shader 完成，如果对我们的实现感兴趣，可以阅读[经典 GPGPU 的实现原理](/zh/api/implements)。下图来自 [http://www.vizitsolutions.com/portfolio/webgl/gpgpu/](http://www.vizitsolutions.com/portfolio/webgl/gpgpu/)，简单展示了基本的实现过程：

<img src="https://user-images.githubusercontent.com/3608471/83623503-fd97a100-a5c3-11ea-83d3-bf2c11836219.png" alt="GPGPU based on WebGL" width="300">

这当然是出于兼容性考虑，Compute Shader 中本应具有的线程组、共享内存、同步等机制都无法通过 Vertex/Fragment Shader 模拟。另外计算管线相比常规渲染管线也要精简很多。下图中左右两侧分别是 Vulkan 的可编程渲染与计算管线，来自 [https://vulkan.lunarg.com/doc/view/1.0.26.0/windows/vkspec.chunked/ch09.html](https://vulkan.lunarg.com/doc/view/1.0.26.0/windows/vkspec.chunked/ch09.html)：

<img src="https://user-images.githubusercontent.com/3608471/83636874-4574f300-a5d9-11ea-81d8-af77eb46caa1.png" alt="compute pipeline" width="500">

当然 WebGL 2 也考虑过原生支持 Compute Shader，毕竟这也是 OpenGL ES 3.1 中的核心特性。甚至 [WebGL 2.0 Compute 草案](https://www.khronos.org/registry/webgl/specs/latest/2.0-compute/) 和 [DEMO](https://github.com/9ballsyndrome/WebGL_Compute_shader) 也早就提出了。但由于苹果的不支持，目前 WebGL 2.0 Compute 也仅能在 Windows Chrome/Edge 下运行。同理 WebGL 2.0 的 Transform Feedback 作为另一个选择也存在兼容性问题。

下图来自 [https://slideplayer.com/slide/16710114/](https://slideplayer.com/slide/16710114/)，展示了 WebGL 与 OpenGL 的对应关系：

<img src="https://user-images.githubusercontent.com/3608471/83636450-959f8580-a5d8-11ea-8881-6496f16b1311.png" alt="WebGL vs OpenGL" width="500">

### WebGPU 实现

而作为 WebGL 的继任者 WebGPU，目前得到了各大浏览器厂商的[支持](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status)，可以在以下浏览器中体验（需要开启实验特性 webgpu flag）：

-   Chrome Canary
-   Edge Canary
-   Safari Technology Preview

目前 Chrome 94 版本已经通过 Origin trial 支持：https://web.dev/gpu/

下图来自：[https://www.chromestatus.com/feature/6213121689518080](https://www.chromestatus.com/feature/6213121689518080)，作为现代化的图形 API，WebGPU 的一大特性就是支持 Compute Shader。这理所当然成为了未来我们的第一选择：

<img src="https://user-images.githubusercontent.com/3608471/83626014-6d5b5b00-a5c7-11ea-8ec1-410cb4e5dcfc.png" alt="WebGPU on Chrome" width="500">

除了计算，浏览器实现 WebGPU API 时封装了 Vulkan、DX12、Metal 这些现代化图形 API 而非 OpenGL，进一步降低了驱动开销，也更好地支持多线程。对于使用者而言，过去 WebGL API 中存在的种种问题也将得到解决。目前 WebGPU 的 Shader 语言已经确定为 [WGSL](https://www.w3.org/TR/WGSL)。

虽然 WebGPU 还处于开发中阶段，但也有了很多优秀的实践，例如：

-   tensorflow.js 正在尝试 [基于 WebGPU 的 backend 实现](https://github.com/tensorflow/tfjs/tree/master/tfjs-backend-webgpu/src)。
-   Babylon.js 正在尝试实现 [基于 WebGPU 渲染引擎](https://doc.babylonjs.com/extensions/webgpu)。

## 我们面对的计算场景与挑战

当我们从通用计算领域聚焦到可视化场景时，会发现存在着很多适合 GPU 执行的可并行计算任务，例如：

-   布局计算。G6 中的 [Fruchterman 布局算法](https://github.com/antvis/G6/blob/master/src/layout/fruchterman.ts)是一个很典型的例子，在每次迭代中每个节点的位置都需要根据其他节点位置进行计算，并且需要经历很多次迭代才能达到稳定状态，因此计算量很大。
-   Instanced-based 可视化。Stardust.js 正是针对这个场景，例如 sanddance 效果。
-   data transformation。在海量数据要求高交互的图表场景下，很多可并行的算法例如 reduce & scan 都可以在 GPU 中执行。P4 & P5（IEEE TRANSACTIONS ON VISUALIZATION AND COMPUTER GRAPHICS, VOL. 26, NO. 3, MARCH 2020） 在这方面有很多实践。
