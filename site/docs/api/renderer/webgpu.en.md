---
title: WebGPU Renderer
order: 3
---

Based on [WebGPU](https://www.w3.org/TR/webgpu/) to provide rendering and computation capabilities.

In particular, the ability to use the GPU for parallel computation is not available with WebGL, and we provide [g-plugin-gpgpu](/en/plugins/gpgpu) to help simplify this process.

## Pre-requisites

The following pre-requisites need to be met.

### Feature Detection

When using it, you need to determine whether the current environment supports WebGPU, the following feature detection code from <https://web.dev/gpu/#feature-detection>.

```js
if ('gpu' in navigator) {
    // WebGPU is supported! 🎉
}
```

This is currently available in the latest version of Chrome (101) via Open Trial.

### WASM Support

At runtime we use [wgpu naga](https://github.com/gfx-rs/naga) for shader translation (GLSL 300 -> WGSL), so the runtime environment needs to support WASM.

## Usage

As with `@antv/g`, there are two ways to use it.

### NPM Module

After installing `@antv/g-webgpu` you can get the renderer from.

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

### CDN

```html
<script
  src="https://unpkg.com/@antv/g-webgpu/dist/index.umd.min.js"
  type="application/javascript">
```

The renderer is available from the `G.WebGPU` namespace under.

```js
const webgpuRenderer = new window.G.WebGPU.Renderer({
    shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});
```

## Initial Configuration

### shaderCompilerPath

Since our shader is written in GLSL 300, it needs to be translated to WGSL in order to run in WebGPU. For this step we use naga, which is compiled into WASM to run in the browser, so it needs to be loaded at runtime:

```js
const webgpuRenderer = new WebGPURenderer({
    shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});
```

### onContextLost

Like WebGL, WebGPU applications may experience context loss during runtime, and this callback function will be triggered.

<https://github.com/gpuweb/gpuweb/blob/main/design/ErrorHandling.md#fatal-errors-requestadapter-requestdevice-and-devicelost>

```js
const webgpuRenderer = new WebGPURenderer({
    shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
    onContextLost: () => {},
});
```

## Built-in plug-ins

The renderer has the following plug-ins built in.

-   [g-plugin-device-renderer](/en/plugins/device-renderer) GPUDevice based rendering capabilities
-   [g-plugin-webgpu-device](/en/plugins/webgl-device) Implementing GPUDevice Capabilities based on WebGPU
-   [g-plugin-dom-interaction](/en/plugins/dom-interaction) DOM API-based event binding

## Optional plug-ins

In addition to the built-in plug-ins, the following plug-ins are also available

### GPGPU

[g-plugin-gpgpu](/en/plugins/gpgpu) provides GPGPU capabilities. Thanks to the WebGPU's support for Compute Shader, we can implement many parallelizable algorithms.

### 3D rendering capabilities

[g-plugin-3d](/en/plugins/3d) Provides 3D rendering capabilities, including common objects such as [Mesh](/en/api/3d/mesh) [Material](/en/api/3d/material) [Geometry](/en/api/3d/geometry).

### Camera Interaction

[g-plugin-control](/en/plugins/control) provides camera interaction for 3D scenes, internally using Hammer.js to respond to mouse-over, scroll-wheel events. Depending on the [camera type](/en/api/camera/intro), different interaction effects are provided.
