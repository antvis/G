---
title: Canvaskit 渲染器
order: 0
---

使用 [Skia](https://skia.org/docs/user/api/) 绘制 2D 图形。在运行时异步加载 WASM 格式的 [Canvaskit](https://github.com/google/skia/tree/main/modules/canvaskit)，将 [WebGL2RenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext) 封装成 `SkSurface` ，进而通过页面上的 `<canvas>` 元素进行绘制。

Skia 相比 Canvas2D API 提供了更多特性，例如文本段落排版、[Lottie 动画](https://skia.org/docs/user/modules/skottie/)、粒子特效等。除了 Chrome 和 Android，一些跨平台的方案例如 [Flutter](https://docs.flutter.dev/resources/architectural-overview)、[Weex](https://github.com/alibaba/weex) 中也使用了它作为底层渲染引擎。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_usaTqSm6vYAAAAAAAAAAAAAARQnAQ" width="200" alt="skottie lego">
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*919sR5Oxx_kAAAAAAAAAAAAAARQnAQ" width="300" alt="canvaskit particles">

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

CanvasKit 的 WASM 文件夹路径。默认值为 `'https://unpkg.com/canvaskit-wasm@0.34.1/bin/full/'`，即从 CDN 上下载。

在实际使用时，我们可以将 WASM 拷贝到服务器资源目录下（例如配合 Webpack 等构建工具），代替从 CDN 加载。在我们的网站中就将该文件拷贝到了根目录（`'/'`）下，此时可以通过 `wasmDir` 配置项指定文件夹路径：

```js
const canvaskitRenderer = new CanvaskitRenderer({
    wasmDir: '/',
});
```

值得一提的是 CanvasKit 提供了多个版本的 WASM 文件：

-   精简版，约 7.1MB，`'https://unpkg.com/canvaskit-wasm@0.34.1/bin/'`
-   全量功能，约 7.9MB，包含完整的[增强功能](/zh/docs/api/renderer/canvaskit#增强功能)，推荐使用该版本 `'https://unpkg.com/canvaskit-wasm@0.34.1/bin/full'`
-   开发版本，约 9.1MB `'https://unpkg.com/canvaskit-wasm@0.34.1/bin/profiling'`

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

# 增强功能

CanvasKit（完整版本）相较于我们熟悉的 Canvas 2D API，提供了以下增强功能：

-   [Skottie](https://skia.org/docs/user/modules/skottie/) Lottie 动画播放器
-   粒子特效
-   段落排版

## Lottie 动画播放器

[Lottie](https://airbnb.design/introducing-lottie/) 动画通过 After Effects 的 [Bodymovin](https://github.com/bodymovin/bodymovin) 插件创建，导出成 JSON 格式。CanvasKit 提供了 [Skottie](https://skia.org/docs/user/modules/skottie/) 这个 Lottie 动画播放器。

在该[示例](/zh/examples/plugins#skottie)中我们展示了如何播放一个乐高动画：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_usaTqSm6vYAAAAAAAAAAAAAARQnAQ" width="200" alt="skottie lego">

首先创建渲染器并通过 [getPlugin](/zh/docs/api/renderer/renderer#getplugin) 获取 [g-plugin-canvaskit-renderer](/zh/docs/plugins/canvaskit-renderer) 插件：

```js
import { Renderer } from '@antv/g-canvaskit';

// 创建渲染器
const canvaskitRenderer = new Renderer({
    wasmDir: '/',
});
// 获取渲染插件
const plugin = canvaskitRenderer.getPlugin('canvaskit-renderer');
```

然后等待画布初始化完成，并加载 Lottie 动画描述文件，完成后调用 [playAnimation](/zh/docs/plugins/canvaskit-renderer#playanimation) 立刻开始播放：

```js
(async () => {
    const cdn = 'https://storage.googleapis.com/skia-cdn/misc/';

    const [_, jsonstr] = await Promise.all([
        // 等待画布初始化完成
        canvas.ready,
        // 加载 Lottie 动画描述文件
        fetch(cdn + 'lego_loader.json').then((response) => response.text()),
    ]);

    const animation = plugin.playAnimation('sk_legos', jsonstr, [-50, 0, 350, 300]);
})();
```

如果想移除动画，可以调用：

```js
animation.delete();
```

## 粒子特效

例如烟火、火焰等粒子特效需要生成大量“粒子”并应用动画，通常在 GPU 中通过 Shader 编程实现，例如用以改变每个粒子位置的插值计算，应当放在 GPU 而非在 CPU 中完成。

CanvasKit 提供了基于 Skia 的编程语言 [SkSL(Skia’s shading language)](https://skia.org/docs/user/sksl/) 实现，语法上十分接近 GLSL，在 Shader 中用以控制粒子的生成以及动画，对于没接触过 Shader 编程的开发者存在一定门槛。

在该[示例](/zh/examples/plugins#canvaskit-particles)中，我们实现了一些粒子特效：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*919sR5Oxx_kAAAAAAAAAAAAAARQnAQ" width="300" alt="canvaskit particles">

首先创建渲染器并通过 [getPlugin](/zh/docs/api/renderer/renderer#getplugin) 获取 [g-plugin-canvaskit-renderer](/zh/docs/plugins/canvaskit-renderer) 插件：

```js
import { Renderer } from '@antv/g-canvaskit';

// 创建渲染器
const canvaskitRenderer = new Renderer({
    wasmDir: '/',
});
// 获取渲染插件
const plugin = canvaskitRenderer.getPlugin('canvaskit-renderer');
```

然后调用插件的 [createParticles](/zh/docs/plugins/canvaskit-renderer#createparticles) 创建粒子效果，在每一帧的回调函数中对画布进行变换以调整粒子的位置，最后通过 [start]() 开始生成粒子：

```js
const textParticles = plugin.createParticles(JSON.stringify(text), (canvas) => {
    canvas.translate(250, 250);
});
textParticles.start(Date.now() / 1000.0, true);
```

最后我们来看关键的粒子效果定义：

-   MaxCount 粒子数目
-   Drawable 粒子的类型，通常使用 `'SkCircleDrawable'` 即可，可以修改大小
-   Code SkSL 代码，用以控制粒子的生命周期，例如每一帧中位置和颜色应该如何改变
-   Bindings

```js
const text = {
    MaxCount: 2000,
    Drawable: {
        Type: 'SkCircleDrawable',
        Radius: 1,
    },
    Code: [
        'void effectSpawn(inout Effect effect) {',
        '  effect.rate = 1000;',
        '}',
        '',
        'void spawn(inout Particle p) {',
        '  p.lifetime = mix(1, 3, rand(p.seed));',
        '  float a = radians(mix(250, 290, rand(p.seed)));',
        '  float s = mix(10, 30, rand(p.seed));',
        '  p.vel.x = cos(a) * s;',
        '  p.vel.y = sin(a) * s;',
        '  p.pos += text(rand(p.seed)).xy;',
        '}',
        '',
        'void update(inout Particle p) {',
        '  float4 startColor = float4(1, 0.196, 0.078, 1);',
        '  float4 endColor   = float4(1, 0.784, 0.078, 1);',
        '  p.color = mix(startColor, endColor, p.age);',
        '}',
        '',
    ],
    Bindings: [
        {
            Type: 'SkTextBinding',
            Name: 'text',
            Text: 'AntV',
            FontSize: 96,
        },
    ],
};
```

## 文本段落

# 性能

CanvasKit 通过 [WebGL2RenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext) 进行绘制。
