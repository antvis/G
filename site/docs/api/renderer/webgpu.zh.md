---
title: WebGPU 渲染器
order: 3
---

基于 [WebGPU](https://www.w3.org/TR/webgpu/) 提供渲染和计算能力。

特别是利用 GPU 进行并行计算的能力，是 WebGL 所不具备的，我们提供了 [g-plugin-gpgpu](/zh/plugins/gpgpu) 帮助简化这一过程。

## 前置条件

以下前置条件需要满足。

### 特性检测

在使用时需要判断当前环境是否支持 WebGPU，下面特性检测代码来自：<https://web.dev/gpu/#feature-detection>：

```js
if ('gpu' in navigator) {
    // WebGPU is supported! 🎉
}
```

目前在 Chrome 最新版本（101）中可以通过 Open Trial 开启。

### WASM 支持

在运行时我们使用 [wgpu naga](https://github.com/gfx-rs/naga) 进行 Shader 转译（GLSL 300 -> WGSL），因此需要运行环境支持 WASM。

## 使用方式

和 `@antv/g` 一样，也有以下两种使用方式。

### NPM Module

安装 `@antv/g-webgpu` 后可以从中获取渲染器：

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-webgpu';

const webgpuRenderer = new Renderer({
    shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});

const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: webgpuRenderer,
});
```

### CDN 方式

```html
<script
  src="https://unpkg.com/@antv/g-webgpu/dist/index.umd.min.js"
  type="application/javascript">
```

从 `G.WebGPU` 命名空间下可以获取渲染器：

```js
const webgpuRenderer = new window.G.WebGPU.Renderer({
    shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});
```

## 初始化配置

### shaderCompilerPath

由于我们的 Shader 使用 GLSL 300 编写，因此需要转译到 WGSL 才能在 WebGPU 中运行。这一步我们使用了 naga，编译成 WASM 后便可以在浏览器运行，因此需要在运行时加载它：

```js
const webgpuRenderer = new WebGPURenderer({
    shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});
```

### onContextLost

和 WebGL 一样，WebGPU 应用在运行过程中也有可能出现上下文丢失的情况，此时会触发该回调函数。

<https://github.com/gpuweb/gpuweb/blob/main/design/ErrorHandling.md#fatal-errors-requestadapter-requestdevice-and-devicelost>

```js
const webgpuRenderer = new WebGPURenderer({
    shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
    onContextLost: () => {},
});
```

## 内置插件

该渲染器内置了以下插件：

-   [g-plugin-device-renderer](/zh/plugins/device-renderer) 基于 GPUDevice 提供渲染能力
-   [g-plugin-webgpu-device](/zh/plugins/webgpu-device) 基于 WebGPU 实现 GPUDevice 能力
-   [g-plugin-dom-interaction](/zh/plugins/dom-interaction) 基于 DOM API 绑定事件

## 可选插件

除了内置插件，还可以选择以下插件。

### GPGPU

[g-plugin-gpgpu](/zh/plugins/gpgpu) 提供 GPGPU 能力。得益于 WebGPU 对于 Compute Shader 的支持度，我们可以实现很多可并行算法。

### 3D 渲染能力

[g-plugin-3d](/zh/plugins/3d) 提供 3D 渲染能力，包括 [Mesh](/zh/api/3d/mesh) [Material](/zh/api/3d/material) [Geometry](/zh/api/3d/geometry) 等常见对象。

### 相机交互

[g-plugin-control](/zh/plugins/control) 为 3D 场景提供相机交互，内部使用 Hammer.js 响应鼠标移动、滚轮事件。根据不同的 [相机类型](/zh/api/camera/intro)，提供不同的交互效果。
