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

# 初始化配置

## wasmDir

CanvasKit 的 WASM 文件夹路径。默认值为 `'https://unpkg.com/canvaskit-wasm@0.34.0/bin/'`，即从 CDN 上下载。例如在我们的网站中将该文件拷贝到了根目录下：

```js
const canvaskitRenderer = new CanvaskitRenderer({
    wasmDir: '/',
});
```

## fonts

CanvasKit 相较于我们熟悉的 Canvas 2D API，在文本尤其是段落方面提供了多行布局、装饰、省略等功能。唯一的问题是需要在运行时加载字体文件。

对于 CJK(Chinese, Japanese, and Korean) 字符，如果使用了不支持它们的字体，在渲染时会出现以下效果，下图来自 [Flutter 的一个 ISSUE](https://github.com/flutter/flutter/issues/76248)：

<img src="https://user-images.githubusercontent.com/7997154/107508434-4c5cf800-6ba1-11eb-93b4-8679ed76e4b9.png" width="400">

因此 Android 默认使用 [NotoSansCJK](https://fonts.google.com/noto/use#faq) 字体：

```xml
<family lang="zh-Hans">
    <font weight="400" style="normal" index="2">NotoSansCJK-Regular.ttc</font>
</family>
<family lang="zh-Hant zh-Bopo">
    <font weight="400" style="normal" index="3">NotoSansCJK-Regular.ttc</font>
</family>
<family lang=" ja  ja-Latn">
    <font weight="400" style="normal" index="0">NotoSansCJK-Regular.ttc</font>
</family>
<family lang="ko ko-Latn  ">
    <font weight="400" style="normal" index="1">NotoSansCJK-Regular.ttc</font>
</family>
```

但[完整的 NotoSansCJK](https://github.com/googlefonts/noto-cjk/releases) 体积非常大，在我们的实际开发中，如果只需要简体中文，可以仅加载它的子集（约 36MB）：

```js
const canvaskitRenderer = new CanvaskitRenderer({
    wasmDir: '/',
    fonts: [
        {
            name: 'sans-serif',
            url: '/NotoSansCJKsc-VF.ttf',
        },
    ],
});
```
