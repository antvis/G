---
title: WebGPU Renderer
order: 3
---

Based on [WebGPU](https://www.w3.org/TR/webgpu/) to provide rendering and computation capabilities.

In particular, the ability to use the GPU for parallel computation is not available with WebGL, and we provide [g-plugin-gpgpu](/en/docs/plugins/gpgpu) to help simplify this process.

# Pre-requisites

The following pre-requisites need to be met.

## Feature Detection

When using it, you need to determine whether the current environment supports WebGPU, the following feature detection code from https://web.dev/gpu/#feature-detection.

```js
if ('gpu' in navigator) {
    // WebGPU is supported! 🎉
}
```

This is currently available in the latest version of Chrome (101) via Open Trial.

## WASM Support

At runtime we use [wgpu naga](https://github.com/gfx-rs/naga) for shader translation (GLSL 300 -> WGSL), so the runtime environment needs to support WASM.

# Usage

As with `@antv/g`, there are two ways to use it.

## NPM Module

After installing `@antv/g-webgl` you can get the renderer from.

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-webgpu';

const webgpuRenderer = new Renderer();

const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: webgpuRenderer,
});
```

## CDN

```html
<script
  src="https://unpkg.com/@antv/g-webgpu/dist/index.umd.min.js"
  type="application/javascript">
```

The renderer is available from the `G.WebGPU` namespace under.

```js
const webgpuRenderer = new window.G.WebGPU.Renderer();
```

# Built-in plug-ins

The renderer has the following plug-ins built in.

-   [g-plugin-device-renderer](/en/docs/plugins/device-renderer) GPUDevice based rendering capabilities
-   [g-plugin-webgpu-device](/en/docs/plugins/webgl-device) Implementing GPUDevice Capabilities based on WebGPU
-   [g-plugin-dom-interaction](/en/docs/plugins/dom-interaction) DOM API-based event binding

# Optional plug-ins

In addition to the built-in plug-ins, the following plug-ins are also available

## GPGPU

[g-plugin-gpgpu](/en/docs/plugins/gpgpu) provides GPGPU capabilities. Thanks to the WebGPU's support for Compute Shader, we can implement many parallelizable algorithms.

## 3D rendering capabilities

[g-plugin-3d](/en/docs/plugins/3d) Provides 3D rendering capabilities, including common objects such as [Mesh](/en/docs/api/3d/mesh) [Material](/en/docs/api/3d/material) [Geometry](/en/docs/api/3d/geometry).

## Camera Interaction

[g-plugin-control](/en/docs/plugins/control) 为 3D 场景提供相机交互，内部使用 Hammer.js 响应鼠标移动、滚轮事件。根据不同的 [相机类型](/en/docs/api/camera#%E7%9B%B8%E6%9C%BA%E7%B1%BB%E5%9E%8B)，提供不同的交互效果。
