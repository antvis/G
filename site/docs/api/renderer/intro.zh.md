---
title: 简介
order: -99
redirect_from:
    - /zh/api/renderer
---

渲染器使用底层渲染 API 绘制各类图形，目前我们提供了以下渲染器，分别是：

-   基于 Canvas2D 的 [g-canvas](/zh/api/renderer/canvas)
-   基于 Canvaskit / Skia 的 [g-canvaskit](/zh/api/renderer/canvaskit)
-   基于 SVG 的 [g-svg](/zh/api/renderer/svg)
-   基于 WebGL 2/1 的 [g-webgl](/zh/api/renderer/webgl)
-   基于 WebGPU 的 [g-webgpu](/zh/api/renderer/webgpu)

渲染器由一个渲染上下文和一组[插件](/zh/plugins)组成，通过插件可以在运行时动态扩展渲染器的能力。

以 `g-canvas` 渲染器为例，基础使用方式如下：

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-canvas';

const canvasRenderer = new Renderer();
const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: canvasRenderer,
});
```

## 初始化配置

在创建渲染器时，可以传入一系列初始化配置影响实际渲染行为。

### enableAutoRendering

是否开启自动渲染，默认开启。所谓“自动渲染”是指无需手动调用画布的渲染方法，只需将图形添加到画布中，这也和浏览器行为一致。

有些场景需要手动控制渲染时机时可关闭：

```js
const webglRenderer = new WebGLRenderer({
    // 关闭自动渲染
    enableAutoRendering: false,
});
```

### enableDirtyCheck

是否开启脏检查，默认开启。开启后只有图形发生变化才会触发画布重绘。

### enableCulling

是否开启视锥剔除，默认关闭。开启后只有视口范围内的图形才会被绘制。

## 修改配置

通过 `setConfig` 可以修改初始化配置，例如再次开启自动渲染：

```js
renderer.setConfig({ enableAutoRendering: true });
```

## 插件相关

我们提供了一系列操作插件的方法。

### registerPlugin

渲染器可以在运行时动态添加插件，扩展自身能力，例如 `g-webgl` 可以通过 [g-pluin-3d](/zh/plugins/3d) 进行 3D 场景的渲染：

```js
import { Plugin } from '@antv/g-plugin-3d';
// 注册 3D 插件
webglRenderer.registerPlugin(new Plugin());
```

### unregisterPlugin

移除插件：

```js
renderer.unregisterPlugin(plugin);
```

### getPlugin

根据名称获取插件。每个插件都有自己的名称，我们约定 `g-plugin-name` 的名称为 `name`：

```js
import { Plugin } from '@antv/g-plugin-testonly';

const plugin = new Plugin();
plugin.name; // 'testonly'
```

因此在渲染器中可以通过插件名获取：

```js
renderer.register(plugin);

renderer.getPlugin('testonly'); // plugin
```

### getPlugins

返回当前渲染器的插件列表：

```js
renderer.getPlugins(); // [Plugin1, Plugin2]
```
