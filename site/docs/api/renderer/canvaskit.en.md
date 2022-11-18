---
title: Canvaskit Renderer
order: 0
---

Use [Skia](https://skia.org/user/api/) to draw 2D graphics. Load [Canvaskit](https://github.com/google/skia/tree/main/modules/canvaskit) in WASM format asynchronously at runtime, and wrap [WebGL2RenderingContext](https://developer .mozilla.org/en-US/Web/API/WebGL2RenderingContext) into `SkSurface`, which in turn is drawn by the `<canvas>` element on the page.

Skia offers more features than the Canvas2D API, such as text paragraph layout, [Lottie animation](https://skia.org/user/modules/skottie/), particle effects, and more. In addition to Chrome and Android, some cross-platform solutions such as [Flutter](https:/.flutter.dev/resources/architectural-overview), [Weex](https://github.com/alibaba/) weex) also use it as the underlying rendering engine.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_usaTqSm6vYAAAAAAAAAAAAAARQnAQ" width="200" alt="skottie lego">
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*919sR5Oxx_kAAAAAAAAAAAAAARQnAQ" width="300" alt="canvaskit particles">
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*7voUQqLoKrEAAAAAAAAAAAAAARQnAQ" width="300" alt="draw text along path">
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*DI1kQ6A8qQ8AAAAAAAAAAAAAARQnAQ" width="200" alt="paragraph decoration">
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*DYqRQLtqtIUAAAAAAAAAAAAAARQnAQ" width="200" alt="paragraph ellipsis">
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_q9uQLTx6ssAAAAAAAAAAAAAARQnAQ" width="160" alt="text emoji">

[DEMO in Codesandbox](https://codesandbox.io/s/g-canvaskit-q8gt6p?file=/src/App.tsx)

## Usage

As with `@antv/g`, there are two ways to use it.

### NPM Module

After installing `@antv/g-canvaskit` you can get the renderer from.

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

### CDN

```html
<script
  src="https://unpkg.com/@antv/g-canvaskit/dist/index.umd.min.js"
  type="application/javascript">
```

The renderer is available from the `G.Canvaskit` namespace under.

```js
const canvasRenderer = new window.G.Canvaskit.Renderer();
```

## Initial Configuration

### wasmDir

The path to the WASM folder for CanvasKit. The default value is `'https://unpkg.com/canvaskit-wasm@0.34.1/bin/full/'`, which means that it is downloaded from a CDN.

In practice, we can copy the WASM to the server resource directory (e.g. with a build tool like Webpack) instead of loading it from the CDN. In our case, the file is copied to the root directory (''/''), and the folder path can be specified via the `wasmDir` configuration item.

```js
const canvaskitRenderer = new CanvaskitRenderer({
    wasmDir: '/',
});
```

It is worth noting that CanvasKit provides several versions of the WASM file.

-   Lite version, about 7.1MB`'https://unpkg.com/canvaskit-wasm@0.34.1/bin/'`
-   Full-featured, about 7.9MB, includes full [enhancements](/en/api/renderer/canvaskit#enhancements), this version is recommended `'https://unpkg.com/canvaskit-wasm@0.34.1/bin/full'`
-   Development version, approx. 9.1MB `'https://unpkg.com/canvaskit-wasm@0.34.1/bin/profiling'`

### fonts

CanvasKit provides multi-line layout, decoration, omission, etc. in text and especially paragraphs compared to the familiar Canvas 2D API. The only problem is that the font file needs to be loaded at runtime.

For CJK (Chinese, Japanese, and Korean) fonts, if you use fonts that do not support them, the following effect will occur when rendering, as shown below from [an ISSUE in Flutter](https://github.com/flutter/flutter/issues/) 76248).

<img src="https://user-images.githubusercontent.com/7997154/107508434-4c5cf800-6ba1-11eb-93b4-8679ed76e4b9.png" width="400">

Therefore, Android uses [NotoSansCJK](https://fonts.google.com/noto/use#faq) font by default.

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

However, [the complete NotoSansCJK](https://github.com/googlefonts/noto-cjk/releases) is so large that in our actual development, if we only need Simplified Chinese, we can load only a subset of it (about 36MB):.

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

## Built-in plug-ins

The renderer has the following plug-ins built in.

-   [g-plugin-canvaskit-renderer](/en/plugins/canvaskit-renderer) Rendering with CanvasKit.
-   [g-plugin-canvas-picker](/en/plugins/canvas-picker) Picking up graphics based on mathematical methods and [CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/Web/API/CanvasRenderingContext2D)
-   [g-plugin-dom-interaction](/en/plugins/dom-interaction) DOM API-based event binding

## Enhanced Features

CanvasKit (full version) provides the following enhancements compared to the familiar Canvas 2D API.

-   [Skottie](https://skia.org/user/modules/skottie/) Lottie Player
-   Particle effect
-   Paragraph

### Lottie Player

The [Lottie](https://airbnb.design/introducing-lottie/) animation is created with the [Bodymovin](https://github.com/bodymovin/bodymovin) plugin for After Effects and exported to JSON format. JSON format. CanvasKit provides [Skottie](https://skia.org/user/modules/skottie/), a Lottie animation player.

In this [example](/en/examples/plugins/canvaskit/#skottie) we show how to play a Lego animation.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_usaTqSm6vYAAAAAAAAAAAAAARQnAQ" width="200" alt="skottie lego">

First create the renderer and get the [g-plugin-canvaskit-renderer](/en/api/renderer/renderer#getplugin) plugin via [getPlugin](/en/api/renderer/intro#getplugin).

```js
import { Renderer } from '@antv/g-canvaskit';

const canvaskitRenderer = new Renderer({
    wasmDir: '/',
});
const plugin = canvaskitRenderer.getPlugin('canvaskit-renderer');
```

Then wait for the canvas initialization to complete, load the Lottie animation description file, and call [playAnimation](/en/plugins/canvaskit-renderer#playanimation) to start playing immediately when it's done.

```js
(async () => {
    const cdn = 'https://storage.googleapis.com/skia-cdn/misc/';

    const [_, jsonstr] = await Promise.all([
        // wait for initialization of Canvas
        canvas.ready,
        // load Lottie description file
        fetch(cdn + 'lego_loader.json').then((response) => response.text()),
    ]);

    const animation = plugin.playAnimation(
        'sk_legos',
        jsonstr,
        [-50, 0, 350, 300],
    );
})();
```

If you want to remove the animation, you can call.

```js
animation.delete();
```

### Particle Effects

For example, particle effects such as fireworks, flames, etc. require generating and animating a large number of "particles", which are usually programmed in the GPU through the shader, e.g. interpolation calculations to change the position of each particle should be done in the GPU instead of the CPU.

CanvasKit provides a Skia-based programming language [SkSL(Skia's shading language)](https://skia.org/user/sksl/) implementation, which is syntactically very close to GLSL and is used in the shader to control particle generation and animation. and animation in the shader, which is a certain threshold for developers who have not been exposed to shader programming.

In this [example](/en/examples/plugins/canvaskit/#canvaskit-particles), we have implemented some particle effects.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*919sR5Oxx_kAAAAAAAAAAAAAARQnAQ" width="300" alt="canvaskit particles">

First create the renderer and get the [g-plugin-canvaskit-renderer](/en/api/renderer/renderer#getplugin) plugin via [getPlugin](/en/api/renderer/intro#getplugin).

```js
import { Renderer } from '@antv/g-canvaskit';

const canvaskitRenderer = new Renderer({
    wasmDir: '/',
});
const plugin = canvaskitRenderer.getPlugin('canvaskit-renderer');
```

Then call the plugin's [createParticles](/en/plugins/canvaskit-renderer#createparticles) to create the particle effect, transform the canvas to adjust the position of the particles in the callback function at each frame, and finally start the particle generation with [start]().

```js
const textParticles = plugin.createParticles(JSON.stringify(text), (canvas) => {
    canvas.translate(250, 250);
});
textParticles.start(Date.now() / 1000.0, true);
```

Finally, let's look at the key particle effect definitions.

-   `MaxCount` Number of particles
-   `Drawable` The type of particle, usually `'SkCircleDrawable'`, can be modified in size
-   `Code` SkSL code to control the life cycle of the particles, such as how the position and color should change in each frame
-   `Bindings`

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

### Draw text along the path

Compared to [fillText](https://developer.mozilla.org/zh-CN/Web/API/CanvasRenderingContext2D/fillText) in the Canvas2D API, CanvasKit provides the ability to draw along a specified path text along a specified path.

In this [example](/en/examples/plugins/canvaskit/#canvaskit-text-along-path), we can draw text along [Path](/en/api/basic/path).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*7voUQqLoKrEAAAAAAAAAAAAAARQnAQ" width="300" alt="draw text along path">

We can use the [alongPath]() attribute to.

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

Emoji cannot be supported by normal fonts.

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

For example, `NotoSansCJKsc-VF` will show the following effect.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*ADTaRYju0GsAAAAAAAAAAAAAARQnAQ" width="160" alt="broken emoji">

In this [example](/en/examples/plugins/canvaskit/#canvaskit-emoji), we load fonts that support Emoji such as [NotoColorEmoji](https://github.com/googlefonts/noto-emoji), which is also used in Android and Chrome use.

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

At this point it can be displayed normally, specifying two fonts in `fontFamily`.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_q9uQLTx6ssAAAAAAAAAAAAAARQnAQ" width="160" alt="text emoji">

```js
const emoji = new Text({
    style: {
        fontFamily: 'Roboto, Noto Color Emoji',
    },
});
```

### Text Paragraphs

CanvasKit provides enhanced [paragraph drawing capabilities](https://skia.org/user/modules/quickstart/#text-shaping).

### Text Decoration

The [text-decoration](https://developer.mozilla.org/zh-CN/Web/CSS/text-decoration) property can be used in CSS to set the appearance of the text's modifier lines.

In this [example](/en/examples/plugins/canvaskit/#canvaskit-paragraph), we use underscores.

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

The following attributes are supported.

-   decorationLine [text-decoration-line](https://developer.mozilla.org/zh-CN/Web/CSS/text-decoration-line) support: `'none'` `'underline'` `'overline'` `'line-through'`
-   decorationColor [text-decoration-color](https://developer.mozilla.org/zh-CN/Web/CSS/text-decoration-color)
-   decorationThickness [text-decoration-thickness](https://developer.mozilla.org/zh-CN/Web/CSS/text-decoration-thickness)
-   decorationStyle [text-decoration-style](https://developer.mozilla.org/zh-CN/Web/CSS/text-decoration-style) support: `'solid'` `'double'` `'dotted'` `'dashed'` `'wavy'`

### Text Ellipsis

In this [example](/en/examples/plugins/canvaskit/#canvaskit-paragraph), using `maxLines` and `ellipsis` allows you to truncate and add ellipses after exceeding.

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

Note that using certain fonts (e.g. Noto) can have the following strange effect.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*jjVTRaR7GPYAAAAAAAAAAAAAARQnAQ" width="160" alt="error ellipsis">

The reason is that Skia will add a blank character after the ellipsis, and the missing character in some font files will show "tofu", the solution is as follows.

-   https://github.com/flutter/flutter/issues/76473
-   https://github.com/flutter/flutter/issues/90135#issuecomment-984916656

### Text Direction

Using `direction` you can specify the text direction from left to right or right to left, supporting `'ltr'` and `'rtl'`, the default is `'ltr'`. The following figure shows the effect of `'rtl'`.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8oWlSpL5hGAAAAAAAAAAAAAAARQnAQ" width="160" alt="text direction">

### Foreground / BackgroundColor

The foreground and background colors of text can be specified using `foregroundColor` and `backgroundColor`.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*OaRqRa-ZiAcAAAAAAAAAAAAAARQnAQ" width="160" alt="text background-color">

### Text Shadow

Multiple shadows can be added to text in CSS using the [text-shadow](https://developer.mozilla.org/zh-CN/Web/CSS/text-shadow) property.

We support specifying a set of shadows via the `shadows` property, where each shadow supports the following configuration.

-   `color`
-   `blurRadius` The default is 0. The larger the value, the larger the blur radius and the lighter the shadows.
-   `offset` Specify the offset of the shadow relative to the text.

In this [example](/en/examples/plugins#canvaskit-paragraph), we specify two shadows.

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

Strut (meaning "pillar") sets the minimum line height relative to the baseline. Similar to the [line-height](https://developer.mozilla.org/zh-CN/Web/CSS/line-height) property in CSS.

StrutStyle can be configured in SkParagraph, and a document with the same name is available in Flutter: https://api.flutter.dev/flutter/painting/StrutStyle-class.html

We will pass on the following attributes.

-   strutEnabled
-   fontFamilies which can be consistent with TextStyle
-   fontSize
-   heightMultiplier
-   leading
-   halfLeading
-   forceStrutHeight

In this [example](/en/examples/plugins#canvaskit-paragraph) we use this to control line height and line spacing.

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

### Advanced Printing Features

The [font-feature-settings](https://developer.mozilla.org/zh-CN/Web/CSS/font-feature-settings) property in CSS can be consulted to control the advanced printing features in OpenType fonts.

We provide control of the `fontFeatures` property, which accepts an array of features. In this [example](/en/examples/plugins#canvaskit-paragraph), we use the Roboto font and turn on the small-cap feature (note the initial D).

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

Skia itself does not include Harfbuzz.

https://skia.org/user/tips/

But CanvasKit packages it in by default.

https://skia.googlesource.com/skia/+/main/modules/canvaskit/CHANGELOG.md#0_4_0_2019_02_25

https://skia.googlesource.com/skia.git/+/4bd08c52c07d1f2ae313a54b45e5937b80fe2fa1

> Text shaping with ShapedText object and SkCanvas.drawText. At compile time, one can choose between using Harfbuzz/ICU (default) or a primitive one (“primitive_shaper”) which just does line breaking. Using Harfbuzz/ICU substantially increases code size (4.3 MB to 6.4 MB).

## Performance

CanvasKit draws via [WebGL2RenderingContext](https://developer.mozilla.org/en-US/Web/API/WebGL2RenderingContext) and does a full redraw at each frame.
