---
title: Canvas Renderer
order: 0
---

Use [CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/Web/API/CanvasRenderingContext2D) to draw 2D graphics. A `<canvas>` element will be created in the container.

## Usage

As with `@antv/g`, there are two ways to use it.

### NPM Module

After installing `@antv/g-canvas` you can get the renderer from it.

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

### CDN

```html
<script
  src="https://unpkg.com/@antv/g-canvas/dist/index.umd.min.js"
  type="application/javascript">
```

The renderer can be obtained from the `G.Canvas2D` namespace under.

```js
const canvasRenderer = new window.G.Canvas2D.Renderer();
```

## Initial Configuration

When creating a renderer, you can pass in some initialization configuration items, such as.

```js
import { Renderer } from '@antv/g-canvas';
const renderer = new Renderer({
    enableDirtyRectangleRendering: true,
});
```

### enableDirtyRectangleRendering

Indicates if "dirty rectangle" rendering is enabled. Enabled will improve the rendering performance in Canvas2D environment significantly. Enabled by default.

A common interaction is to highlight a shape with the mouse. In this case, only a small part of the scene has changed, so erasing the entire canvas and redrawing it is unnecessary. In analogy to the React diff algorithm that finds the smallest part of the scene that has really changed, "dirty rectangle" rendering reuses the previous frame's rendering as much as possible, drawing only the part that has changed, which is especially suitable for the Canvas2D API.

The following diagram illustrates this idea.

-   When the mouse hovers over the circle, we know the corresponding "dirty rectangle", which is the enclosing box of the circle.
-   Find other shapes in the scene that intersect with this enclosing box area, here another rectangle is found.
-   Use [clearRect](https://developer.mozilla.org/zh-CN/Web/API/CanvasRenderingContext2D/clearRect) to clear this "dirty rectangle ", instead of clearing the entire canvas
-   Draws a rectangle and a circle in order of z-index

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*6zyLTL-AIbQAAAAAAAAAAAAAARQnAQ" width="400" alt="dirty rectangle rendering">

In the above intersection and region query, we can reuse the optimizations in the culling scheme, such as the acceleration structure. In the implementation we use [RBush](https://github.com/mourner/rbush).

Obviously, when the number of dynamically changing objects is too large, this optimization becomes meaningless, as the "dirty rectangle" is almost equal to the whole canvas after some calculations, so it is better to just empty and redraw all objects. So 2D game rendering engines like Pixi.js, for example, are [not considered built-in](https://github.com/pixijs/pixi.js/issues/3503).

But it makes sense in relatively static scenarios like visualization, where for example only parts of the chart are updated after triggering a pickup, and the rest remains unchanged.

### enableDirtyRectangleRenderingDebug

Used for debug, disabled by default, when enabled the canvas will trigger `CanvasEvent.DIRTY_RECTANGLE` event and carry dirty rectangle information which can be used for subsequent visualization.

In this [example](/en/examples/perf/basic/#canvas-dirty-rectangle), the current dirty rectangle that needs to be cleared is displayed as the mouse passes over the individual circles, and the current frame will only redraw the area.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*iIJcRpUFEBUAAAAAAAAAAAAAARQnAQ" alt="dirty rectangle rendering" width="300">

Note that the coordinates of the dirty rectangle are under the [Canvas coordinate system](/en/api/canvas/coordinates), so if you want to draw the floating layer using HTML, you need to use the [coordinate system conversion method](/en/api/canvas/coordinates#canvas---viewport).

```js
// display dirty rectangle
const $dirtyRectangle = document.createElement('div');
$dirtyRectangle.style.cssText = `
position: absolute;
pointer-events: none;
background: rgba(255, 0, 0, 0.5);
`;
$wrapper.appendChild($dirtyRectangle);

canvas.addEventListener(CanvasEvent.DIRTY_RECTANGLE, (e) => {
    const { dirtyRect } = e.detail;
    const { x, y, width, height } = dirtyRect;

    const dpr = window.devicePixelRatio;

    // convert from canvas coords to viewport
    $dirtyRectangle.style.left = `${x / dpr}px`;
    $dirtyRectangle.style.top = `${y / dpr}px`;
    $dirtyRectangle.style.width = `${width / dpr}px`;
    $dirtyRectangle.style.height = `${height / dpr}px`;
});
```

## Built-in plug-ins

The renderer has the following plug-ins built in.

-   [g-plugin-canvas-renderer](/en/plugins/canvas-renderer) Rendering with [CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/Web/API/CanvasRenderingContext2D).
-   [g-plugin-canvas-picker](/en/plugins/canvas-picker) Picking up graphics based on mathematical methods and [CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/Web/API/CanvasRenderingContext2D).
-   [g-plugin-dom-interaction](/en/plugins/dom-interaction) DOM API-based event binding.

## Optional plug-ins

In addition to the built-in plug-ins, the following optional plug-ins are available.

### Hand-drawn style rendering

Use the Canvas version of [rough.js](https://roughjs.com/) for hand-drawn style rendering.

We provide [g-plugin-rough-canvas-renderer](/en/plugins/rough-canvas-renderer) plugin, which will replace [g-plugin-canvas-renderer](/en/plugins/canvas-renderer) for partial 2D graphics rendering capability after registration.

[Example](/en/examples/plugins/rough/#rough).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*d4iiS5_3YVIAAAAAAAAAAAAAARQnAQ" width="500">

## Server-side rendering

This renderer relies on [CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/Web/API/CanvasRenderingContext2D) rendering capabilities and is not limited to the browser side, so you can also use [node-canvas](https://github.com/Automattic/node-canvas) for server-side rendering.

In our [integration test](https://github.com/antvis/g/tree/next/integration/__node__tests__/canvas), it will be paired with [node-canvas](https://github.com/) on the Node side Automattic/node-canvas) to render the result image and compare it with the baseline image. Other server-side rendering scenarios can also follow the following steps.

1. Use [unregisterPlugin](/en/api/renderer/renderer#unregisterplugin) to uninstall the DOM API-related plugins built into [g-canvas](/en/api/renderer/canvas). For example [g-plugin-dom-interaction](/en/plugins/dom-interaction) which is responsible for event binding
2. Use [node-canvas](https://github.com/Automattic/node-canvas) to create a class `Canvas` object to be passed into the canvas via the [canvas](/en/api/canvas#canvas) property
3. Normal use of [g-canvas](/en/api/renderer/canvas) renderer to create scenes via G's API
4. Use the methods provided by [node-canvas](https://github.com/Automattic/node-canvas) (e.g. [createPNGStream](<https://github.com/Automattic/node-canvas># canvascreatepngstream)) to output the resulting image

<https://github.com/antvis/g/blob/next/integration/>**node**tests\_\_/canvas/circle.spec.js

```js
const { createCanvas } = require('canvas');
const { Circle, Canvas } = require('@antv/g');
const { Renderer } = require('@antv/g-canvas');

// create a node-canvas
const nodeCanvas = createCanvas(200, 200);

// create a renderer, unregister plugin relative to DOM
const renderer = new Renderer();
const domInteractionPlugin = renderer.getPlugin('dom-interaction');
renderer.unregisterPlugin(domInteractionPlugin);

const canvas = new Canvas({
    width: 200,
    height: 200,
    canvas: nodeCanvas, // use node-canvas
    renderer,
});

const circle = new Circle({
    style: {
        r: 10,
        fill: 'red',
    },
});
canvas.appendChild(circle);

// output image
const out = fs.createWriteStream(__dirname + RESULT_IMAGE);
const stream = nodeCanvas.createPNGStream();
stream.pipe(out);
out.on('finish', () => {});
```

## Takeover CanvasRenderingContext2D and continue drawing

If you want to use [CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/Web/API/CanvasRenderingContext2D) to continue drawing after G has drawn, you can get the context at `CanvasEvent. AFTER_RENDER` to get the context when G has finished drawing, but since it is set to be transformable in the context, it needs to be cleared before drawing, and then you can draw in the Canvas native coordinate system:

```js
// 在 G 绘制完接着画
canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
    // 获取原生 Canvas2DContext
    const context = canvas.getContextService().getContext();

    // 重置 transform
    context.resetTransform();

    // 绘制
    context.fillStyle = 'red';
    context.fillRect(200, 200, 100, 100);
});
```

[DEMO in CodeSandbox](https://codesandbox.io/s/zhi-jie-shi-yong-canvas-2d-context-hui-zhi-8ymfg9?file=/index.js)
