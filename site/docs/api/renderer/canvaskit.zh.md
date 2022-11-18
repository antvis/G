---
title: Canvaskit 渲染器
order: 0
---

使用 [Skia](https://skia.org/user/api/) 绘制 2D 图形。在运行时异步加载 WASM 格式的 [Canvaskit](https://github.com/google/skia/tree/main/modules/canvaskit)，将 [WebGL2RenderingContext](https://developer.mozilla.org/en-US/Web/API/WebGL2RenderingContext) 封装成 `SkSurface` ，进而通过页面上的 `<canvas>` 元素进行绘制。

Skia 相比 Canvas2D API 提供了更多特性，例如文本段落排版、[Lottie 动画](https://skia.org/user/modules/skottie/)、粒子特效等。除了 Chrome 和 Android，一些跨平台的方案例如 [Flutter](https:/.flutter.dev/resources/architectural-overview)、[Weex](https://github.com/alibaba/weex) 中也使用了它作为底层渲染引擎。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_usaTqSm6vYAAAAAAAAAAAAAARQnAQ" width="200" alt="skottie lego">
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*919sR5Oxx_kAAAAAAAAAAAAAARQnAQ" width="300" alt="canvaskit particles">
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*7voUQqLoKrEAAAAAAAAAAAAAARQnAQ" width="300" alt="draw text along path">
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*DI1kQ6A8qQ8AAAAAAAAAAAAAARQnAQ" width="200" alt="paragraph decoration">
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*DYqRQLtqtIUAAAAAAAAAAAAAARQnAQ" width="200" alt="paragraph ellipsis">
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_q9uQLTx6ssAAAAAAAAAAAAAARQnAQ" width="160" alt="text emoji">

[Codesandbox 例子](https://codesandbox.io/s/g-canvaskit-q8gt6p?file=/src/App.tsx)

## 使用方式

和 `@antv/g` 一样，也有以下两种使用方式。

### NPM Module

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

### CDN 方式

```html
<script
  src="https://unpkg.com/@antv/g-canvaskit/dist/index.umd.min.js"
  type="application/javascript">
```

从 `G.Canvaskit` 命名空间下可以获取渲染器：

```js
const canvasRenderer = new window.G.Canvaskit.Renderer();
```

## 初始化配置

### wasmDir

CanvasKit 的 WASM 文件夹路径。默认值为 `'https://unpkg.com/canvaskit-wasm@0.34.1/bin/full/'`，即从 CDN 上下载。

在实际使用时，我们可以将 WASM 拷贝到服务器资源目录下（例如配合 Webpack 等构建工具），代替从 CDN 加载。在我们的网站中就将该文件拷贝到了根目录（`'/'`）下，此时可以通过 `wasmDir` 配置项指定文件夹路径：

```js
const canvaskitRenderer = new CanvaskitRenderer({
    wasmDir: '/',
});
```

值得一提的是 CanvasKit 提供了多个版本的 WASM 文件：

-   精简版，约 7.1MB，`'https://unpkg.com/canvaskit-wasm@0.34.1/bin/'`
-   全量功能，约 7.9MB，包含完整的[增强功能](/zh/api/renderer/canvaskit#增强功能)，推荐使用该版本 `'https://unpkg.com/canvaskit-wasm@0.34.1/bin/full'`
-   开发版本，约 9.1MB `'https://unpkg.com/canvaskit-wasm@0.34.1/bin/profiling'`

### fonts

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

## 内置插件

该渲染器内置了以下插件：

-   [g-plugin-canvaskit-renderer](/zh/plugins/canvaskit-renderer) 使用 CanvasKit 渲染 2D 图形
-   [g-plugin-canvas-picker](/zh/plugins/canvas-picker) 基于数学方法和 [CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/Web/API/CanvasRenderingContext2D) 拾取图形
-   [g-plugin-dom-interaction](/zh/plugins/dom-interaction) 基于 DOM API 绑定事件

## 增强功能

CanvasKit（完整版本）相较于我们熟悉的 Canvas 2D API，提供了以下增强功能：

-   [Skottie](https://skia.org/user/modules/skottie/) Lottie 动画播放器
-   粒子特效
-   段落排版

### Lottie 动画播放器

[Lottie](https://airbnb.design/introducing-lottie/) 动画通过 After Effects 的 [Bodymovin](https://github.com/bodymovin/bodymovin) 插件创建，导出成 JSON 格式。CanvasKit 提供了 [Skottie](https://skia.org/user/modules/skottie/) 这个 Lottie 动画播放器。

在该[示例](/zh/examples/plugins/canvaskit/#skottie)中我们展示了如何播放一个乐高动画：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_usaTqSm6vYAAAAAAAAAAAAAARQnAQ" width="200" alt="skottie lego">

首先创建渲染器并通过 [getPlugin](/zh/api/renderer/intro#getplugin) 获取 [g-plugin-canvaskit-renderer](/zh/plugins/canvaskit-renderer) 插件：

```js
import { Renderer } from '@antv/g-canvaskit';

// 创建渲染器
const canvaskitRenderer = new Renderer({
    wasmDir: '/',
});
// 获取渲染插件
const plugin = canvaskitRenderer.getPlugin('canvaskit-renderer');
```

然后等待画布初始化完成，并加载 Lottie 动画描述文件，完成后调用 [playAnimation](/zh/plugins/canvaskit-renderer#playanimation) 立刻开始播放：

```js
(async () => {
    const cdn = 'https://storage.googleapis.com/skia-cdn/misc/';

    const [_, jsonstr] = await Promise.all([
        // 等待画布初始化完成
        canvas.ready,
        // 加载 Lottie 动画描述文件
        fetch(cdn + 'lego_loader.json').then((response) => response.text()),
    ]);

    const animation = plugin.playAnimation(
        'sk_legos',
        jsonstr,
        [-50, 0, 350, 300],
    );
})();
```

如果想移除动画，可以调用：

```js
animation.delete();
```

### 粒子特效

例如烟火、火焰等粒子特效需要生成大量“粒子”并应用动画，通常在 GPU 中通过 Shader 编程实现，例如用以改变每个粒子位置的插值计算，应当放在 GPU 而非在 CPU 中完成。

CanvasKit 提供了基于 Skia 的编程语言 [SkSL(Skia’s shading language)](https://skia.org/user/sksl/) 实现，语法上十分接近 GLSL，在 Shader 中用以控制粒子的生成以及动画，对于没接触过 Shader 编程的开发者存在一定门槛。

在该[示例](/zh/examples/plugins/canvaskit/#canvaskit-particles)中，我们实现了一些粒子特效：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*919sR5Oxx_kAAAAAAAAAAAAAARQnAQ" width="300" alt="canvaskit particles">

首先创建渲染器并通过 [getPlugin](/zh/api/renderer/intro#getplugin) 获取 [g-plugin-canvaskit-renderer](/zh/plugins/canvaskit-renderer) 插件：

```js
import { Renderer } from '@antv/g-canvaskit';

// 创建渲染器
const canvaskitRenderer = new Renderer({
    wasmDir: '/',
});
// 获取渲染插件
const plugin = canvaskitRenderer.getPlugin('canvaskit-renderer');
```

然后调用插件的 [createParticles](/zh/plugins/canvaskit-renderer#createparticles) 创建粒子效果，在每一帧的回调函数中对画布进行变换以调整粒子的位置，最后通过 [start]() 开始生成粒子：

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

### 沿路径绘制文本

相较于 Canvas2D API 中的 [fillText](https://developer.mozilla.org/zh-CN/Web/API/CanvasRenderingContext2D/fillText)，CanvasKit 提供了沿指定路径绘制文本的能力。

在该[示例](/zh/examples/plugins/canvaskit/#canvaskit-text-along-path)中，我们可以沿 [Path](/zh/api/basic/path) 绘制文本：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*7voUQqLoKrEAAAAAAAAAAAAAARQnAQ" width="300" alt="draw text along path">

我们可以使用 [alongPath]() 属性：

```js
const alongPath = new Path({
    style: {
        d: 'M 0,40 C 5.5555555555555545...',
    },
});

const text = new Text({
    style: {
        fontFamily: 'sans-serif',
        fontSize: 22,
        fill: '#1890FF',
        text: 'abcdefghijklmn这是测试文字',
        alongPath,
    },
});
```

### Emoji

一般的字体是无法支持 Emoji 的：

```js
const emoji = new Text({
    style: {
        fontFamily: 'sans-serif',
        fontSize: 30,
        fill: 'black',
        text: 'Emoji 🍕🍔🍟🥝🍱🕶🎩👩‍👩‍👦👩‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧‍👧',
    },
});
```

例如 `NotoSansCJKsc-VF` 会展示如下效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*ADTaRYju0GsAAAAAAAAAAAAAARQnAQ" width="160" alt="broken emoji">

在该[示例](/zh/examples/plugins/canvaskit/#canvaskit-emoji)中，我们加载支持 Emoji 的字体例如 [NotoColorEmoji](https://github.com/googlefonts/noto-emoji)，它也在 Android 和 Chrome 中使用：

```js
const canvaskitRenderer = new CanvaskitRenderer({
    wasmDir: '/',
    fonts: [
        {
            name: 'Roboto',
            url: '/NotoSansCJKsc-VF.ttf',
        },
        {
            name: 'Noto Color Emoji',
            url: '/NotoColorEmoji.ttf',
        },
    ],
});
```

此时就可以正常展示了，在 `fontFamily` 中指定两种字体：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_q9uQLTx6ssAAAAAAAAAAAAAARQnAQ" width="160" alt="text emoji">

```js
const emoji = new Text({
    style: {
        fontFamily: 'Roboto, Noto Color Emoji',
    },
});
```

### 文本段落

CanvasKit 提供了增强的[段落绘制能力](https://skia.org/user/modules/quickstart/#text-shaping)。

### 修饰线

在 CSS 中可以使用 [text-decoration](https://developer.mozilla.org/zh-CN/Web/CSS/text-decoration) 属性设置文本的修饰线外观。

在该[示例](/zh/examples/plugins/canvaskit/#canvaskit-paragraph)中，我们使用下划线：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*DI1kQ6A8qQ8AAAAAAAAAAAAAARQnAQ" width="200" alt="paragraph decoration">

```js
const decoratedText = new Text({
    style: {
        fontFamily: 'sans-serif',
        fontSize: 22,
        fill: '#1890FF',
        text: 'abcdefghijklmnopqrstuvwxyz这是测试文本',
        wordWrap: true,
        wordWrapWidth: 100,
        decorationLine: 'underline',
        decorationColor: 'red',
        decorationStyle: 'wavy',
        decorationThickness: 1.5,
    },
});
```

支持以下属性：

-   decorationLine，对应 CSS [text-decoration-line](https://developer.mozilla.org/zh-CN/Web/CSS/text-decoration-line) 属性。支持 `'none'` `'underline'` `'overline'` `'line-through'`
-   decorationColor，对应 CSS [text-decoration-color](https://developer.mozilla.org/zh-CN/Web/CSS/text-decoration-color) 属性
-   decorationThickness，对应 CSS [text-decoration-thickness](https://developer.mozilla.org/zh-CN/Web/CSS/text-decoration-thickness) 属性，目前仅支持 `number` 类型
-   decorationStyle，对应 CSS [text-decoration-style](https://developer.mozilla.org/zh-CN/Web/CSS/text-decoration-style) 属性。支持 `'solid'` `'double'` `'dotted'` `'dashed'` `'wavy'`

### 文本截断

在该[示例](/zh/examples/plugins/canvaskit/#canvaskit-paragraph)中，使用 `maxLines` 和 `ellipsis` 可以实现超出后截断并添加省略号的效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*DYqRQLtqtIUAAAAAAAAAAAAAARQnAQ" width="200" alt="paragraph ellipsis">

```js
const text = new Text({
    style: {
        fontFamily: 'Roboto',
        fontSize: 22,
        fill: '#1890FF',
        text: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
        wordWrap: true,
        wordWrapWidth: 100,
        maxLines: 3,
        ellipsis: '...',
    },
});
```

需要注意的是使用某些字体（例如 Noto）会出现下面奇怪的效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*jjVTRaR7GPYAAAAAAAAAAAAAARQnAQ" width="160" alt="error ellipsis">

原因是 Skia 会在省略号之后添加一个空白字符，而某些字体文件中缺失该字符就会展示 “tofu”，解决方案如下：

-   https://github.com/flutter/flutter/issues/76473
-   https://github.com/flutter/flutter/issues/90135#issuecomment-984916656

### 文本方向

使用 `direction` 可以指定文本方向从左向右或者从右向左，支持 `'ltr'` 和 `'rtl'`，默认为 `'ltr'`。下图为 `'rtl'` 的效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8oWlSpL5hGAAAAAAAAAAAAAAARQnAQ" width="160" alt="text direction">

### 前景 / 背景色

使用 `foregroundColor` 和 `backgroundColor` 可以指定文本的前景和背景色：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*OaRqRa-ZiAcAAAAAAAAAAAAAARQnAQ" width="160" alt="text background-color">

### 阴影

在 CSS 中可以使用 [text-shadow](https://developer.mozilla.org/zh-CN/Web/CSS/text-shadow) 属性为文本添加多个阴影。

我们支持通过 `shadows` 属性指定一组阴影，其中每一个阴影支持如下配置：

-   color 阴影颜色
-   blurRadius 默认为 0。值越大，模糊半径越大，阴影也就越淡
-   offset 指定阴影相对文字的偏移量

在该[示例](/zh/examples/plugins#canvaskit-paragraph)中，我们指定了两个阴影：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*9zeYRbfP_6oAAAAAAAAAAAAAARQnAQ" width="160" alt="text shadows">

```js
const shadowedText = new Text({
    style: {
        shadows: [
            {
                color: 'black',
                blurRadius: 15,
            },
            {
                color: 'red',
                blurRadius: 5,
                offset: [10, 10],
            },
        ],
    },
});
```

### StrutStyle

Strut（意为“支柱”）可以设置相对于 baseline 的最小行高。类似 CSS 中的 [line-height](https://developer.mozilla.org/zh-CN/Web/CSS/line-height) 属性。

在 SkParagraph 中可以通过 StrutStyle 进行配置，Flutter 中也有同名文档：https://api.flutter.dev/flutter/painting/StrutStyle-class.html

我们会透传以下属性：

-   strutEnabled 是否启用
-   fontFamilies 字体，可以与 TextStyle 保持一致
-   fontSize 字号
-   heightMultiplier 行高高度系数
-   leading 行与行之间的空隙
-   halfLeading
-   forceStrutHeight

在该[示例](/zh/examples/plugins#canvaskit-paragraph)中我们以此控制行高和行间距：

```js
decoratedText.style.strutStyle = {
    strutEnabled: false,
    fontFamilies: ['sans-serif'],
    fontSize: 22,
    heightMultiplier: 1,
    leading: 0,
    halfLeading: false,
    forceStrutHeight: false,
};
```

### 高级印刷功能

可参考 CSS 中的 [font-feature-settings](https://developer.mozilla.org/zh-CN/Web/CSS/font-feature-settings) 属性，控制 OpenType 字体中的高级印刷功能。

我们提供 `fontFeatures` 属性控制，它接受一个特性数组。在该[示例](/zh/examples/plugins#canvaskit-paragraph)中，我们使用 Roboto 字体并开启了 small-cap 特性（注意首字母 D）：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*1g7gTKas4vYAAAAAAAAAAAAAARQnAQ" width="160" alt="text font-feature-settings">

```js
const fontFeaturesText = new Text({
    style: {
        fontFamily: 'Roboto',
        fontSize: 22,
        fill: '#1890FF',
        text: 'Difficult waffles 0O 3.14',
        fontFeatures: [
            {
                name: 'smcp',
                value: 1,
            },
            {
                name: 'zero',
                value: 1,
            },
        ],
    },
});
```

### Harfbuzz

Skia 本身是不包含 Harfbuzz 的： https://skia.org/user/tips/

但 CanvasKit 默认会将它打包进来：

https://skia.googlesource.com/skia/+/main/modules/canvaskit/CHANGELOG.md#0_4_0_2019_02_25

https://skia.googlesource.com/skia.git/+/4bd08c52c07d1f2ae313a54b45e5937b80fe2fa1

> Text shaping with ShapedText object and SkCanvas.drawText. At compile time, one can choose between using Harfbuzz/ICU (default) or a primitive one (“primitive_shaper”) which just does line breaking. Using Harfbuzz/ICU substantially increases code size (4.3 MB to 6.4 MB).

## 性能

CanvasKit 通过 [WebGL2RenderingContext](https://developer.mozilla.org/en-US/Web/API/WebGL2RenderingContext) 进行绘制，在每一帧都会进行全量重绘。
