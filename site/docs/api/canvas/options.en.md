---
title: Options
order: 1
---

When creating a canvas, we can pass in the following initialization parameters, which is the simplest way to initialize it.

-   `container` The id or DOM element of the canvas container, and the subsequent `<canvas>/<svg>` is automatically created within that DOM element.
-   `width / height`
-   `renderer` Currently we provides [g-canvas](/en/api/renderer/canvas), [g-svg](/en/api/renderer/svg), [g-webgl](/en/api/renderer/webgl) etc.

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-canvas';

const renderer = new Renderer();

const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer,
});
```

The above initialization approach only requires providing a container `container` that carries `<canvas>/<svg>`, but sometimes we have custom requirements as follows:

-   [Using existed `<canvas>`](/en/api/canvas/faq#using-the-created-canvas-element)
-   [Using OffscreenCanvas in WebWorker](/en/api/canvas/offscreen-canvas-ssr#using-offscreencanvas-in-webworker)
-   [Server-side rendering in Node.js](/en/api/canvas/offscreen-canvas-ssr#server-side-rendering)

In this case you can use `canvas` instead of `container`, and more initialization parameters are as follows.

## container

Optional, `string | HTMLElement`. The id or DOM element of the canvas container. Later, when the renderer is initialized, `<canvas>/<svg>` is automatically created inside that container's DOM element.

## canvas

Optional, `HTMLCanvasElement | OffscreenCanvas | NodeCanvas`. Using existed `<canvas>` or OffscreenCanvas.

When this parameter is passed, the [container](/en/api/canvas#container) argument is ignored and we assume that `<canvas>` has been created and added to the document, e.g.

```js
// create a <canvas>
const $canvas = document.createElement('canvas');
const dpr = window.devicePixelRatio;
$canvas.height = dpr * 600;
$canvas.width = dpr * 500;
$canvas.style.height = '600px';
$canvas.style.width = '500px';
document.getElementById('container').appendChild($canvas);

// using existed <canvas>
const canvas = new Canvas({
    canvas: $canvas,
    renderer: canvasRenderer,
});
```

In addition to the `HTMLCanvasElement` in the browser environment, you can also use:

-   [`OffscreenCanvas` in WebWorker](/en/api/canvas#在-webworker-中使用-offscreencanvas)
-   [`NodeCanvas` in server-side rendering](/en/api/canvas#服务端渲染)

Note that once this parameter is used, runtime switching of the renderer is no longer supported.

## width / height

Set the width and height of canvas.

-   Required if [container](/en/api/canvas/options#container) passed in. The renderer will create `<canvas>` with these values.
-   Optional if [canvas](/en/api/canvas/options#canvas) passed in. If not provided, we will calculate with `canvas.width/height` and `devicePixelRatio`.

## renderer

Required. The following renderers are currently supported:

-   [g-canvas](/en/api/renderer/canvas)
-   [g-svg](/en/api/renderer/svg)
-   [g-webgl](/en/api/renderer/webgl)
-   [g-webgpu](/en/api/renderer/webgpu)
-   [g-canvaskit](/en/api/renderer/canvaskit)

It can be switched at runtime with [setRenderer()](/en/api/canvas/options#setrenderer) after initialized.

## background

Optional. The color used to clear the canvas when it is initialized, similar to WebGL's [clearColor](https://developer.mozilla.org/zh-CN/Web/API/WebGLRenderingContext/clearColor).

Using [\<color\>](/en/api/css/css-properties-values-api#color), defaults to `'transparent'`.

In [this example](/en/examples/canvas/canvas-basic/#background), we have set a translucent red color for the Canvas, and the bottom `<div>` has a background gray color set by CSS: `<div>`.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*4QY6Rb9jIy8AAAAAAAAAAAAAARQnAQ" width="300" alt="canvas's background">

## cursor

Set the canvas default [mouse style](/en/api/basic/display-object#cursor-style). If this property is also configured on top of a drawing picked up by an interaction event, it will override the mouse style configured on the canvas, but when the mouse is moved to a blank area, the mouse style configured on the canvas will take effect. The following figure demonstrates this.

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

In addition to being set at canvas initialization, it can be subsequently modified by `setCursor()`.

```js
// Set at canvas initialization
canvas = new Canvas({
    //...
    cursor: 'crosshair',
});

// Or reset later
canvas.setCursor('crosshair');
```

## Special platform adaptations

On some special runtime platforms (e.g. applets), it is not possible to use global variables like [globalThis](<https://developer.mozilla.org/en-US/Web/JavaScript/Reference/Global_Objects/> globalThis), and internally we need to rely on it to create images (`new globalThis.Image()`), determine if a TouchEvent is supported (`'ontouchstart' in globalThis`), and so on. Therefore, users of these particular platforms need to manually pass in the specific creation and determination methods.

### document

Optional. Default will use `window.document`. In [g-svg based server-side rendering scheme](/en/api/renderer/svg#server-side-rendering), you need to replace `window.document` with the corresponding element provided by [JSDOM](https://github.com/jsdom/jsdom) in order to create the corresponding SVG element.

### devicePixelRatio

Optional. By default `window.devicePixelRatio` will be used, if there is no `window` object in the runtime environment, such as in WebWorker, you can pass it in manually, or use 1 if it is still not passed in.

### requestAnimationFrame

Optional. By default `window.requestAnimationFrame` will be used, if there is no `window` object in the runtime environment, such as an applet environment, you can pass it in manually.

### cancelAnimationFrame

Optional. By default `window.cancelAnimationFrame` will be used, if there is no `window` object in the runtime environment, such as an applet environment, you can pass it in manually.

### createImage

Optional. Returns an `HTMLImageElement` or similar object, which by default will be created using `() => new window.Image()`. If there is no `window` object in the runtime environment, such as an applet environment, you can pass it in manually.

For example, in the Alipay applet use [createImage](https://opendocs.alipay.com/mini/api/createimage).

```js
const canvas = new Canvas({
    createImage: () => canvas.createImage(),
});
```

### enableLargeImageOptimization <Badge>6.1.1</Badge>

`boolean`

Optional, default is `false`. Enable high-resolution large image rendering and interactive optimization, through downsampling and slice rendering strategy, large images with hundreds of millions of pixels can also be rendered and interacted smoothly.

:::warning{title=Limit}

Currently only implemented in the native Canvas renderer.

:::

### supportsCSSTransform

Optional. 是否支持在容器上应用 CSS Transform 的情况下确保交互事件坐标转换正确。

Whether or not CSS Transform is supported on the container to ensure that the interaction event coordinates are transformed correctly.

In this [example](/en/examples/canvas/container/#supports-css-transform), we have enlarged the container by a factor of 1.1, and with this configuration enabled, mouse movement over the circle changes the mouse style correctly.

```js
const $wrapper = document.getElementById('container');
$wrapper.style.transform = 'scale(1.1)';
```

### supportsPointerEvents

Optional. Whether PointerEvent is supported or not, the default will use `! !globalThis.PointerEvent`. If `false` is passed, the event listener plugin will not listen for PointerEvent such as `pointerdown`.

### supportsTouchEvents

Optional. If `false` is passed, the event listener plugin will not listen to TouchEvent such as `touchstart`.

### isTouchEvent

Optional. Determines if a native event is a TouchEvent, accepts the native event as parameter, and returns the result.

### isMouseEvent

Optional. Determines if a native event is a MouseEvent, accepts the native event as parameter, and returns the result.

### dblClickSpeed <Badge>6.0.12</Badge>

`number`

Optional, default is 200ms. Numeric type, determines whether two consecutive clicks trigger a double-click event [dblclick](https://developer.mozilla.org/en-US/docs/Web/API/Element/dblclick_event) .

### offscreenCanvas

Optional. Returns an `HTMLCanvasElement | OffscreenCanvas` or similar object. Used to generate an offscreen Canvas2D context, it is currently used in the following scenarios.

-   The core service calls `ctx.measureText` to measure the text.
-   [g-plugin-canvas-picker](/en/plugins/canvas-picker) will draw the path in context and call `ctx.isPointInPath` Canvas2D API.
-   [g-plugin-device-renderer](/en/plugins/device-renderer) will call `ctx.createLinearGradient` in the context to draw the gradient and then generate the texture.

When not passed in by default, it will try to create an `OffscreenCanvas` and then use the DOM API to create an `HTMLCanvasElement` when it fails. However, in non-dom environments like applets, you need to manually pass in.

```js
const canvas = new Canvas({
    //...
    offscreenCanvas: {
        getContext: () => Canvas.createContext(),
    },
});
```

### supportsMutipleCanvasesInOneContainer

Optional. If or not support multiple canvases under one container, default is false.

[Example](/en/examples/canvas/container/#shared-container)

## Modify the initialization configuration

When initializing the canvas we pass in the canvas size, renderer and other configurations, which may be modified subsequently, so we provide the following API.

### resize

Sometimes we need to resize the canvas after initialization, for example by using [ResizeObserver](https://developer.mozilla.org/zh-CN/Web/API/ResizeObserver) to listen for container size changes.

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

In most scenarios we should specify a renderer at canvas initialization and never change it again. However, there are a few scenarios where we need to [switch renderers at runtime](/en/guide/diving-deeper/switch-renderer#switching-at-runtime), for example, almost all of the examples on our website do this.

```js
// switch to WebGL renderer if possible
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

Set the canvas default [cursor style](/en/api/basic/display-object#cursor-style).

```js
canvas.setCursor('crosshair');
```

## getConfig

Get the configuration of the initial incoming canvas.

```js
const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: webglRenderer,
});
canvas.getConfig(); // { container: 'container', width: 600, ... }
```
