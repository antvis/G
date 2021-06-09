---
title: g-plugin-webgl-renderer
order: 2
---

提供基于 WebGL 的渲染能力，也包括基于 GPU 的拾取能力。
内置 G 核心包提供的全部 2D 基础图形，同时暴露其他自定义 2D/3D 图形的扩展能力。

# 安装方式

`g-webgl` 渲染器默认内置，因此无需手动引入。

```js
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
// 创建 WebGL 渲染器，其中内置了该插件
const webglRenderer = new WebGLRenderer();
```

# 扩展能力

该插件提供以下扩展能力，例如 [g-plugin-3d](/zh/docs/plugins/3d) 正是基于该插件提供了 Cube 等 3D 图形。

## 组件

我们为每个实体扩充了以下组件，可以随时获取它们：
```js
const entity = displayObject.getEntity();
const renderable = entity.getComponent(Renderable3D);
const material = entity.getComponent(Material3D);
const geometry = entity.getComponent(Geometry3D);
```

### Renderable3D

包含 Model

### Geometry3D

包含了各顶点数组、索引数组。

#### setAttribute(name: string, data: BufferData)

设置/更新顶点数组。

#### setIndex(data: number[] | Uint8Array | Uint16Array | Uint32Array)

设置/更新索引数组。

### Material3D

包含了编译后的 vertex/fragment shader，以及 WebGL 全局状态设置。

#### setDefines(defines: Record<string, boolean | number>)
向 shader 中注入 `#define key value`。

#### setUniform(name: string | Record<string, BufferData>, data?: BufferData)
传入一个/组 uniform 变量。

#### setCull(cull: IModelInitializationOptions['cull'])
设置正/背面剔除。

#### setBlend(blend: IModelInitializationOptions['blend'])
设置混合。

## ShaderModuleService

提供简易的 Shader 模块化构建服务：
* 片段引入
* uniform 默认值

```ts
import { ShaderModuleService } from '@antv/g-plugin-webgl-renderer';

// 从容器中注入
@inject(ShaderModuleService)
private shaderModule: ShaderModuleService;

// 注册 shader 模块
this.shaderModule.registerModule('material-basic', {
  vs: imageVertex,
  fs: imageFragment,
});
// 取得编译结果
const { vs, fs, uniforms: extractedUniforms } = this.shaderModule.getModule('material-basic');
```

在 Shader 中可以使用 `#pragma include` 预编译指令引入代码片段，例如在 vertex shader 中使用贴图代码片段：
```glsl
uniform float u_Opacity : 1.0;

#pragma include "map.declaration"

void main() {
  vec4 diffuseColor = v_Color;

  #pragma include "map"

  gl_FragColor = diffuseColor;
  gl_FragColor.a = gl_FragColor.a * u_Opacity;
}
```
