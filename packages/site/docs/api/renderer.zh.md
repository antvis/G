---
title: 渲染器
order: -2
---

渲染器使用底层渲染 API 绘制各类图形，目前我们提供了三种渲染器，分别是：

-   基于 Canvas2D 的 `g-canvas`
-   基于 SVG 的 `g-svg`
-   基于 WebGL 的 `g-webgl`

渲染器由一个渲染上下文和一组插件组成，通过插件可以在运行时动态扩展渲染器的能力。

# 初始化配置

## enableAutoRendering

是否开启自动渲染，默认开启。有些场景需要手动控制渲染时机时可关闭：

```js
const webglRenderer = new WebGLRenderer({
    // 关闭自动渲染
    enableAutoRendering: false,
});
```

## enableDirtyRectangleRendering

是否开启脏矩阵渲染，仅 `g-canvas` 生效。

# 修改配置

通过 `setConfig` 可以修改初始化配置，例如再次开启自动渲染：

```js
renderer.setConfig({ enableAutoRendering: true });
```

# 注册插件

渲染器可以在运行时动态添加插件，扩展自身能力，例如 `g-webgl` 可以通过 [g-pluin-3d](/zh/docs/plugins/3d) 进行 3D 场景的渲染：

```js
import { containerModule } from '@antv/g-plugin-3d';
// 注册 3D 插件
webglRenderer.registerPlugin(containerModule);
```

# [WIP]自定义渲染器
