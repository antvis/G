---
title: 初始化参数
order: 1
---

在创建一个画布时，我们可以传入以下初始化参数，这也是最简单的初始化方式：

-   `container` 画布容器的 id 或 DOM 元素，后续在该 DOM 元素内自动创建 `<canvas>/<svg>`
-   `width / height` 画布宽度和高度
-   `renderer` 渲染器，目前支持 [g-canvas](/zh/api/renderer/canvas)、[g-svg](/zh/api/renderer/svg)、[g-webgl](/zh/api/renderer/webgl) 等

以 [g-canvas](/zh/api/renderer/canvas) 为例：

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-canvas';

// 创建渲染器
const renderer = new Renderer();

// 创建画布
const canvas = new Canvas({
    container: 'container', // 画布 DOM 容器 id
    width: 600, // 画布宽度
    height: 500, // 画布高度
    renderer, // 指定渲染器
});
```

以上初始化方式只需要提供一个承载 `<canvas>/<svg>` 的容器 `container`，但有时我们有如下自定义需求：

-   自行创建 `<canvas>`，[详见](/zh/api/canvas/faq#使用创建好的-canvas-元素)
-   在 WebWorker 中使用 OffscreenCanvas，[详见](/zh/api/canvas/offscreen-canvas-ssr)
-   在 Node 端使用 node-canvas 进行服务端渲染，[详见](/zh/api/canvas/offscreen-canvas-ssr#服务端渲染)

此时可以使用 `canvas` 代替 `container`，更多初始化参数如下。

## container

可选，`string | HTMLElement`，画布容器的 id 或 DOM 元素。后续当渲染器初始化时，会在该容器 DOM 元素内自动创建 `<canvas>/<svg>`。

## canvas

可选，`HTMLCanvasElement | OffscreenCanvas | NodeCanvas`，已创建好的 `<canvas>` 元素或者 OffscreenCanvas。

当传入此参数时，[container](/zh/api/canvas#container) 参数将被忽略，我们假定 `<canvas>` 已经创建完毕并且加入到文档中，例如：

```js
// 用户自行创建 <canvas>
const $canvas = document.createElement('canvas');
// 设置画布大小
const dpr = window.devicePixelRatio;
$canvas.height = dpr * 600;
$canvas.width = dpr * 500;
$canvas.style.height = '600px';
$canvas.style.width = '500px';
// 用户自行将 <canvas> 加入文档
document.getElementById('container').appendChild($canvas);

// 使用创建好的 <canvas> 创建画布
const canvas = new Canvas({
    canvas: $canvas,
    renderer: canvasRenderer,
});
```

除了浏览器环境下的 `HTMLCanvasElement`，还可以使用：

-   `OffscreenCanvas` 在 WebWorker 中运行，[详见](/zh/api/canvas#在-webworker-中使用-offscreencanvas)
-   `NodeCanvas` 在 Node 端使用 node-canvas 进行服务端渲染，[详见](/zh/api/canvas#服务端渲染)

需要注意的是，一旦使用了该参数，就不再支持运行时切换渲染器了。

## width / height

画布宽高。

-   如果设置了 [container](/zh/api/canvas/options#container)，必填。渲染器创建 `<canvas>` 时将使用传入的宽高设置。
-   如果设置了 [canvas](/zh/api/canvas/options#canvas)，选填。如果不填写，将使用 `canvas.width/height` 与 `devicePixelRatio` 计算。

## renderer

必填，目前支持以下渲染器:

-   基于 Canvas2D 的 [g-canvas](/zh/api/renderer/canvas)
-   基于 CanvasKit 的 [g-canvaskit](/zh/api/renderer/canvaskit)
-   基于 SVG 的 [g-svg](/zh/api/renderer/svg)
-   基于 WebGL 2/1 的 [g-webgl](/zh/api/renderer/webgl)
-   基于 WebGPU 的 [g-webgpu](/zh/api/renderer/webgpu)

后续可以在运行时通过 [setRenderer()](/zh/api/canvas/options#setrenderer) 切换。

## background

选填，画布初始化时用于清除的颜色。类似 WebGL 中的 [clearColor](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/clearColor)。

支持 [\<color\>](/zh/api/css/css-properties-values-api#color) 取值，默认值为 `'transparent'`。

在该[示例](/zh/examples/canvas/canvas-basic/#background)中，我们为 Canvas 设置了一个半透明的红色，而最底层的 `<div>` 通过 CSS 设置了背景灰色：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*4QY6Rb9jIy8AAAAAAAAAAAAAARQnAQ" width="300" alt="canvas's background">

## cursor

选填，设置画布默认的[鼠标样式](/zh/api/basic/display-object#鼠标样式)。如果通过交互事件拾取到的图形之上也配置了该属性，会覆盖掉画布上配置的鼠标样式，但当鼠标移动到空白区域时，画布上配置的鼠标样式就会生效了。下图展示了这一点：

```js
const canvas = new Canvas({
    //...
    cursor: 'crosshair',
});

const circle = new Circle({
    style: {
        //...
        cursor: 'pointer',
    },
});
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*YlqRRI5vjFgAAAAAAAAAAAAAARQnAQ" alt="cursor" width="150">

除了在画布初始化时设置，后续还可以通过 `setCursor()` 修改：

```js
// 画布初始化时设置
canvas = new Canvas({
    //...
    cursor: 'crosshair',
});

// 或者后续修改
canvas.setCursor('crosshair');
```

## 特殊运行平台适配

在一些特殊的运行平台（例如小程序）上，无法正常使用类似 [globalThis](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis) 这样的全局变量，而在内部我们又需要依靠它创建图片（`new globalThis.Image()`）、判断是否支持 TouchEvent（`'ontouchstart' in globalThis`）等。因此需要这些特殊平台的使用者手动传入特有的创建以及判断方式。

### document

可选。默认将使用 `window.document`。在[基于 g-svg 的服务端渲染方案](/zh/api/renderer/svg#服务端渲染)中，需要将 `window.document` 替换成 [JSDOM](https://github.com/jsdom/jsdom) 提供的对应元素，以便创建对应 SVG 元素。

### devicePixelRatio

可选。默认将使用 `window.devicePixelRatio`，如果运行环境中无 `window` 对象，例如 WebWorker 中，可以手动传入，如果仍未传入则使用 1。

### requestAnimationFrame

可选。默认将使用 `window.requestAnimationFrame`，如果运行环境中无 `window` 对象，例如小程序环境，可以手动传入。

### cancelAnimationFrame

可选。默认将使用 `window.cancelAnimationFrame`，如果运行环境中无 `window` 对象，例如小程序环境，可以手动传入。

### createImage

可选。返回一个 `HTMLImageElement` 或类似对象，默认将使用 `() => new window.Image()` 创建，如果运行环境中无 `window` 对象，例如小程序环境，可以手动传入。

例如支付宝小程序中使用 [createImage](https://opendocs.alipay.com/mini/api/createimage)：

```js
const canvas = new Canvas({
    // 省略其他参数
    createImage: () => canvas.createImage(),
});
```

### enableLargeImageOptimization <Badge>6.1.1</Badge>

`boolean`

可选，默认为 `false`。开启高分辨率大图渲染与交互优化，通过降采样与切片渲染策略使得上亿像素的大图也能流畅渲染和交互。

:::warning{title=限制}

目前仅在原生 Canvas 渲染器中实现。

:::

### supportsCSSTransform

可选。是否支持在容器上应用 CSS Transform 的情况下确保交互事件坐标转换正确。

在该 [示例](/zh/examples/canvas/container/#supports-css-transform) 中，我们将容器放大了 1.1 倍，开启该配置项后，鼠标移动到圆上可以正确变化鼠标样式：

```js
const $wrapper = document.getElementById('container');
$wrapper.style.transform = 'scale(1.1)';
```

### supportsPointerEvents

可选。是否支持 PointerEvent，默认将使用 `!!globalThis.PointerEvent` 判断。如果传入 `false`，事件监听插件将不会监听例如 `pointerdown` 等 PointerEvent。

### supportsTouchEvents

可选。是否支持 TouchEvent。如果传入 `false`，事件监听插件将不会监听例如 `touchstart` 等 TouchEvent。

### isTouchEvent

可选。判断一个原生事件是否是 TouchEvent，接受原生事件作为参数，返回判定结果。

### isMouseEvent

可选。判断一个原生事件是否是 MouseEvent，接受原生事件作为参数，返回判定结果。

### dblClickSpeed <Badge>6.0.12</Badge>

`number`

可选，默认为 200ms。判断两次连续点击是否触发双击事件 [dblclick](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/dblclick_event) 的速度。

### offscreenCanvas

可选。返回一个 `HTMLCanvasElement | OffscreenCanvas` 或类似对象。用于生成一个离屏的 Canvas2D 上下文，目前它使用在以下场景：

-   g 绘制并调用 `ctx.measureText` 度量文本
-   [g-plugin-canvas-picker](/zh/plugins/canvas-picker) 会在上下文中绘制一遍路径，再调用 `ctx.isPointInPath` Canvas2D API
-   [g-plugin-device-renderer](/zh/plugins/device-renderer) 会在上下文中调用 `ctx.createLinearGradient` 绘制渐变，再生成纹理

默认不传入时会尝试创建 `OffscreenCanvas`，失败后再使用 DOM API 创建一个 `HTMLCanvasElement`。但在小程序这样非 DOM 环境中，需要手动传入：

```js
const canvas = new Canvas({
    // 省略其他参数
    offscreenCanvas: {
        // 小程序中创建上下文方法
        getContext: () => Canvas.createContext(),
    },
});
```

### supportsMutipleCanvasesInOneContainer

可选。是否支持一个 container 下容纳多个画布，默认为 false。

[示例](/zh/examples/canvas/container/#shared-container)

## 修改初始化配置

在初始化画布时我们传入了画布尺寸、渲染器等配置，后续可能对它们进行修改，因此我们提供了以下 API。

### resize

有时我们需要在初始化之后调整画布尺寸，传入新的画布宽度和高度。方法签名如下：

```js
resize(width: number, height: number): void;
```

例如使用 [ResizeObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/ResizeObserver) 监听容器尺寸变化：

```js
const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
        if (entry !== canvas) {
            continue;
        }
        const { width, height } = entry.contentRect;
        // resize canvas
        canvas.resize(width, height);
    }
});
resizeObserver.observe($container);
```

### setRenderer

在绝大部分场景下我们都应该在画布初始化时指定一个渲染器，后续再也不会更改。但也有小部分场景需要在运行时[切换渲染器](/zh/guide/diving-deeper/switch-renderer#运行时切换)，例如 G 官网中几乎所有的示例都是这样做的：

```js
// 当图元数目很多时切换到 WebGL 渲染器
if (tooManyShapes) {
    canvas.setRenderer(webglRenderer);
} else {
    canvas.setRenderer(svgRenderer);
}
```

方法签名如下：

```js
setRenderer(renderer: Renderer): Promise<void>;
```

需要注意的是，在切换渲染器时需要重新初始化渲染环境，因此该方法为异步方法。

### setCursor

修改画布默认的[鼠标样式](/zh/api/basic/display-object#鼠标样式)。

```js
canvas.setCursor('crosshair');
```

### getConfig

获取初始传入画布的配置。

```js
const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: webglRenderer,
});
canvas.getConfig(); // { container: 'container', width: 600, ... }
```
