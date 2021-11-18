---
title: g-plugin-gpgpu
order: -1
---

基于 WebGL 和 WebGPU 提供 GPGPU 能力。前者依靠纹理映射，但部分计算能力（共享内存、同步）受限，后者可以直接使用 Compute Shader。

# 安装方式

只能配合 `g-webgl` 渲染器使用：

```js
import { Renderer } from '@antv/g-webgl';
import { Plugin } from '@antv/g-plugin-gpgpu';

const webglRenderer = new Renderer();
webglRenderer.registerPlugin(new Plugin());
```

# Kernel

和 CUDA 中的核函数类似，计算逻辑写在 Shader 中。我们支持以下两种使用方式：

-   直接用 WebGPU 的 Shader 语言 WGSL 写计算逻辑，无需转译
-   使用 TS 写计算逻辑，通过 `g-webgpu-compiler` 转译成 GLSL 和 WGSL，分别在 WebGL 和 WebGPU 环境下运行

创建一个 Kernel：

```js
const kernel = new Kernel({
    canvas,
    code: ``,
});
```

其中构造函数接收以下参数：

-   canvas 必填，传入画布的实例
-   code 可选，WGSL 代码
-   bundle 可选，经过 compiler 编译后的产物

## createBuffer

创建一个 Buffer：

```js
kernel.createBuffer({
    name: 'firstMatrix',
    data: firstMatrix,
});
```

## dispatch

支持以下两种写法：

```js
kernel.dispatch([1, 1, 1]);
kernel.dispatch(1, 1, 1);
```

## readBuffer

读取 Buffer 内容，常用于获取最终的计算结果：

```js
const result = await kernel.readBuffer(buffer);
```
