---
title: g-plugin-canvaskit-renderer
order: 3
---

使用 [Skia](https://skia.org/docs/user/api/) 绘制 2D 图形。在运行时异步加载 WASM 格式的 [Canvaskit](https://github.com/google/skia/tree/main/modules/canvaskit)，将 [WebGL2RenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext) 封装成 `SkSurface` ，进而通过页面上的 `<canvas>` 元素进行绘制。

Skia 相比 Canvas2D API 提供了更多特性，例如文本段落排版、[Lottie 动画](https://skia.org/docs/user/modules/skottie/)等。除了 Chrome 和 Android，一些跨平台的方案例如 [Flutter](https://docs.flutter.dev/resources/architectural-overview)、[Weex](https://github.com/alibaba/weex) 中也使用了它作为底层渲染引擎。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_usaTqSm6vYAAAAAAAAAAAAAARQnAQ" width="200" alt="skottie lego">
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*919sR5Oxx_kAAAAAAAAAAAAAARQnAQ" width="300" alt="canvaskit particles">

## 安装方式

`g-canvaskit` 渲染器默认内置，因此无需手动引入。

```js
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
// 创建 CanvasKit 渲染器，其中内置了该插件
const canvaskitRenderer = new CanvaskitRenderer();
```

## API

### playAnimation

[Lottie](https://airbnb.design/introducing-lottie/) 动画通过 After Effects 的 [Bodymovin](https://github.com/bodymovin/bodymovin) 插件创建，导出成 JSON 格式。

完整方法签名如下，其中包含以下参数：

-   name 动画名称，必填
-   jsonStr JSON 格式的 Lottie 描述文件，必填
-   bounds 展示区域，接受的数据格式为 `[left, top, width, height]`，可选。不填写会尝试使用描述文件中定义的大小，即 `[0, 0, width, height]`
-   assets 额外的资源文件，可选。

返回一个 `ManagedSkottieAnimation` 对象

```js
playAnimation(name: string, jsonStr: string, bounds?: InputRect, assets?: any): ManagedSkottieAnimation;
```

首先创建渲染器并通过 [getPlugin](/zh/api/renderer/renderer#getplugin) 获取 [g-plugin-canvaskit-renderer]() 插件：

```js
import { Renderer } from '@antv/g-canvaskit';

// 创建渲染器
const canvaskitRenderer = new Renderer({
    wasmDir: '/',
});
// 获取渲染插件
const plugin = canvaskitRenderer.getPlugin('canvaskit-renderer');
```

然后等待画布初始化完成，并加载 Lottie 动画描述文件：

```js
(async () => {
    const cdn = 'https://storage.googleapis.com/skia-cdn/misc/';

    const [_, jsonstr] = await Promise.all([
        canvas.ready,
        fetch(cdn + 'lego_loader.json').then((response) => response.text()),
    ]);

    const animation = plugin.playAnimation(
        'sk_legos',
        jsonstr,
        [-50, 0, 350, 300],
    );
})();
```

如果想移除动画，可以在返回的动画对象上调用 `delete()` 方法：

```js
animation.delete();
```

### createParticles

例如烟火、火焰等粒子特效需要生成大量“粒子”并应用动画，通常在 GPU 中通过 Shader 编程实现，例如用以改变每个粒子位置的插值计算，应当放在 GPU 而非在 CPU 中完成。

CanvasKit 提供了基于 Skia 的编程语言 [SkSL(Skia’s shading language)](https://skia.org/docs/user/sksl/) 实现，语法上十分接近 GLSL，在 Shader 中用以控制粒子的生成以及动画，对于没接触过 Shader 编程的开发者存在一定门槛。

在该[示例](/zh/examples/plugins#canvaskit-particles)中，我们实现了一些粒子特效：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*919sR5Oxx_kAAAAAAAAAAAAAARQnAQ" width="300" alt="canvaskit particles">

首先创建渲染器并通过 [getPlugin](/zh/api/renderer/renderer#getplugin) 获取 [g-plugin-canvaskit-renderer](/zh/plugins/canvaskit-renderer) 插件：

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

如果想移除粒子效果，可以在返回的对象上调用 `delete()` 方法：

```js
particles.delete();
```
