---
title: Canvaskit 渲染器
order: 0
---

使用 [Skia](https://skia.org/docs/user/api/) 绘制 2D 图形。在运行时异步加载 WASM 格式的 [Canvaskit](https://github.com/google/skia/tree/main/modules/canvaskit)，将 [WebGL2RenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext) 封装成 `SkSurface` ，进而通过页面上的 `<canvas>` 元素进行绘制。

Skia 相比 Canvas2D API 提供了更多特性，例如文本段落排版、[Lottie 动画](https://skia.org/docs/user/modules/skottie/)等。除了 Chrome 和 Android，一些跨平台的方案例如 [Flutter](https://docs.flutter.dev/resources/architectural-overview)、[Weex](https://github.com/alibaba/weex) 中也使用了它作为底层渲染引擎。

# 使用方式

和 `@antv/g` 一样，也有以下两种使用方式。

## NPM Module

安装 `@antv/g-canvaskit` 后可以从中获取渲染器：

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-canvaskit';

const canvaskitRenderer = new Renderer();

const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: canvaskitRenderer,
});
```

## CDN 方式

```html
<script
  src="https://unpkg.com/@antv/g-canvaskit/dist/index.umd.min.js"
  type="application/javascript">
```

从 `G.Canvaskit` 命名空间下可以获取渲染器：

```js
const canvasRenderer = new window.G.Canvaskit.Renderer();
```
