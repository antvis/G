---
title: Canvas 渲染器
order: 0
---

使用 [CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/Web/API/CanvasRenderingContext2D) 绘制 2D 图形。会在容器中创建一个 `<canvas>` 元素。

## 使用方式

和 `@antv/g` 一样，也有以下两种使用方式。

### NPM Module

安装 `@antv/g-canvas` 后可以从中获取渲染器：

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

### CDN 方式

```html
<script
  src="https://unpkg.com/@antv/g-canvas/dist/index.umd.min.js"
  type="application/javascript">
```

从 `G.Canvas2D` 命名空间下可以获取渲染器：

```js
const canvasRenderer = new window.G.Canvas2D.Renderer();
```

## 初始化配置

在创建渲染器时，可以传入一些初始化配置项，例如：

```js
import { Renderer } from '@antv/g-canvas';
const renderer = new Renderer({
    enableDirtyRectangleRendering: true,
});
```

### enableDirtyRectangleRendering

是否开启“脏矩形”渲染。开启后将大幅提升 Canvas2D 环境下的渲染性能。默认开启。

一种常见的交互是通过鼠标高亮某个图形。此时场景中仅有一小部分发生了改变，擦除画布中的全部图形再重绘就显得没有必要了。类比 React diff 算法能够找出真正变化的最小部分，“脏矩形”渲染能尽可能复用上一帧的渲染结果，仅绘制变更部分，特别适合 Canvas2D API。

下图展示了这个思路：

-   当鼠标悬停在圆上时，我们知道了对应的“脏矩形”，也就是这个圆的包围盒
-   找到场景中与这个包围盒区域相交的其他图形，这里找到了另一个矩形
-   使用 [clearRect](https://developer.mozilla.org/zh-CN/Web/API/CanvasRenderingContext2D/clearRect) 清除这个“脏矩形”，代替清空整个画布
-   按照 z-index 依次绘制一个矩形和圆形

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*6zyLTL-AIbQAAAAAAAAAAAAAARQnAQ" width="400" alt="dirty rectangle rendering">

在以上求交与区域查询的过程中，我们可以复用剔除方案中的优化手段，例如加速结构。在实现中我们使用了 [RBush](https://github.com/mourner/rbush)。

显然当动态变化的对象数目太多时，该优化手段就失去了意义，试想经过一番计算合并后的“脏矩形”几乎等于整个画布，那还不如直接清空重绘所有对象。因此例如 Pixi.js 这样的 2D 游戏渲染引擎就[不考虑内置](https://github.com/pixijs/pixi.js/issues/3503)。

但在可视化这类相对静态的场景下就显得有意义了，例如在触发拾取后只更新图表的局部，其余部分保持不变。

### enableDirtyRectangleRenderingDebug

用于 debug，默认关闭，开启后画布会触发 `CanvasEvent.DIRTY_RECTANGLE` 事件并携带脏矩形信息，可用于后续可视化。

在该[示例](/zh/examples/perf/basic/#canvas-dirty-rectangle)中，当鼠标划过各个圆时，能展示出当前需要被清除的脏矩形，当前帧仅会重绘该区域：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*iIJcRpUFEBUAAAAAAAAAAAAAARQnAQ" alt="dirty rectangle rendering" width="300">

需要注意的是，脏矩形的坐标在 [Canvas 坐标系下](/zh/api/canvas/coordinates)，如果想使用 HTML 绘制浮层，需要使用[坐标系转换方法](/zh/api/canvas/coordinates#canvas---viewport)：

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

## 内置插件

该渲染器内置了以下插件：

-   [g-plugin-canvas-renderer](/zh/plugins/canvas-renderer) 使用 [CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/Web/API/CanvasRenderingContext2D) 渲染 2D 图形
-   [g-plugin-canvas-picker](/zh/plugins/canvas-picker) 基于数学方法和 [CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/Web/API/CanvasRenderingContext2D) 拾取图形
-   [g-plugin-dom-interaction](/zh/plugins/dom-interaction) 基于 DOM API 绑定事件

## 可选插件

除了内置插件，还有以下可选插件。

### 手绘风格渲染

使用 [rough.js](https://roughjs.com/) 的 Canvas 版本进行手绘风格的渲染。

我们提供了 [g-plugin-rough-canvas-renderer](/zh/plugins/rough-canvas-renderer) 插件，注册后会替换掉 [g-plugin-canvas-renderer](/zh/plugins/canvas-renderer) 对于部分 2D 图形的渲染能力。

[示例](/zh/examples/plugins/rough/#rough)效果如下：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*d4iiS5_3YVIAAAAAAAAAAAAAARQnAQ" width="500">

## 服务端渲染

该渲染器依赖 [CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/Web/API/CanvasRenderingContext2D) 渲染能力，并不局限在浏览器端，因此也可以使用 [node-canvas](https://github.com/Automattic/node-canvas) 进行服务端渲染。

在我们的[集成测试](https://github.com/antvis/g/tree/next/integration/__node__tests__/canvas)中，会在 Node 端配合 [node-canvas](https://github.com/Automattic/node-canvas) 渲染结果图片，与基准图片进行比对。其他服务端渲染场景也可以按照以下步骤进行：

1. 使用 [unregisterPlugin](/zh/api/renderer/renderer#unregisterplugin) 卸载掉 [g-canvas](/zh/api/renderer/canvas) 中内置的与 DOM API 相关的插件，例如负责事件绑定的 [g-plugin-dom-interaction](/zh/plugins/dom-interaction)
2. 使用 [node-canvas](https://github.com/Automattic/node-canvas) 创建一个类 `Canvas` 对象，通过 [canvas](/zh/api/canvas#canvas) 属性传入画布
3. 正常使用 [g-canvas](/zh/api/renderer/canvas) 渲染器，通过 G 的 API 创建场景
4. 使用 [node-canvas](https://github.com/Automattic/node-canvas) 提供的方法（例如 [createPNGStream](https://github.com/Automattic/node-canvas#canvascreatepngstream)）输出结果图片

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

## 接管上下文绘制

如果希望在 G 绘制之后使用 [CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/Web/API/CanvasRenderingContext2D) 继续绘制，可以在 `CanvasEvent.AFTER_RENDER` 时获取上下文，此时 G 已经完成了绘制，但由于在上下文中设置可 transform，在绘制前需要先清除，然后就可以按照 Canvas 原生坐标系进行绘制：

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

[示例](https://codesandbox.io/s/zhi-jie-shi-yong-canvas-2d-context-hui-zhi-8ymfg9?file=/index.js)
