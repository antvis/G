---
title: 画布
order: -100
redirect_from:
    - /en/docs/api
---

我们在 G 核心包 `@antv/g` 中提供了 Canvas 画布这一核心对象，从渲染的角度上看，它是一个在浏览器中实现的“小浏览器”，承载着以下三类对象：

-   [场景图](/zh/docs/guide/diving-deeper/scenegraph)。我们通过它描述场景中的各个图形及其层次关系。
-   [相机](/zh/docs/api/camera)。我们通过它定义观察整个场景的角度。我们为每一个画布内置了一个默认使用正交投影的相机，后续可随时修改。
-   [渲染器](/zh/docs/api/renderer)。我们通过它指定画布使用何种底层技术来渲染场景。不同的渲染器有着不同的渲染能力，例如只有 `g-webgl` 才能渲染 3D 图形。在 2D 场景下我们会尽力实现不同渲染器下一致的渲染效果。

在设计画布 API 时，我们参考了 DOM API，因此它们有着很多相似之处：

-   画布可以类比成浏览器环境中的 [window](https://developer.mozilla.org/en-US/docs/Web/API/Window) 对象。和 window 一样，在内部实现中我们也让画布继承了 [EventTarget](/zh/docs/api/builtin-objects/event-target)。与 window 不同的是，在同一个页面中，多个画布可以共存，即可以同时存在多个“平行世界”。
-   在 DOM 树中页面的入口为 [window.document](https://developer.mozilla.org/en-US/docs/Web/API/Document)，在画布中为 `canvas.document`。
-   在 DOM 树中根节点为 [document.documentElement](https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement)，也就是 `<html>`。在画布中同样可以通过 `canvas.document.documentElement` 访问。

我们选择尽可能兼容 DOM API，一方面降低了前端使用者的记忆学习成本，另一方面可以充分利用现有的 Web 生态，例如可以无缝接入[现有的手势和拖拽库](/zh/docs/api/event#手势和拖拽)。

对于非常规浏览器环境，我们也提供了例如 [WebWorker 中使用 OffscreenCanvas](/zh/docs/api/canvas#在-webworker-中使用-offscreencanvas)、[服务端渲染](/zh/docs/api/canvas#服务端渲染)等方案。

# 继承自

[EventTarget](/zh/docs/api/builtin-objects/event-target)

# 初始化

在创建一个画布时，我们可以传入以下初始化参数，这也是最简单的初始化方式：

-   container 画布容器的 id 或 DOM 元素，后续在该 DOM 元素内自动创建 `<canvas>/<svg>`
-   width / height 画布宽度和高度
-   renderer 渲染器，目前支持 `g-canvas` `g-svg` 和 `g-webgl`

```js
import { Canvas } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';

// 创建渲染器
const webglRenderer = new WebGLRenderer();

// 创建画布
const canvas = new Canvas({
    container: 'container', // 画布 DOM 容器 id
    width: 600, // 画布宽度
    height: 500, // 画布高度
    renderer: webglRenderer, // 指定渲染器
});
```

以上初始化方式只需要提供一个承载 `<canvas>/<svg>` 的容器 `container`，但有时我们有如下自定义需求：

-   自行创建 `<canvas>`，[详见](/zh/docs/api/canvas#使用创建好的-canvas-元素)
-   在 WebWorker 中使用 OffscreenCanvas，[详见](/zh/docs/api/canvas#在-webworker-中使用-offscreencanvas)
-   在 Node 端使用 node-canvas 进行服务端渲染，[详见](/zh/docs/api/canvas#服务端渲染)

此时可以使用 `canvas` 代替 `container`，更多初始化参数如下。

## container

可选，`string | HTMLElement`，画布容器的 id 或 DOM 元素。后续当渲染器初始化时，会在该容器 DOM 元素内自动创建 `<canvas>/<svg>`。

## canvas

可选，`HTMLCanvasElement | OffscreenCanvas | NodeCanvas`，已创建好的 `<canvas>` 元素或者 OffscreenCanvas。

当传入此参数时，[container](/zh/docs/api/canvas#container) 参数将被忽略，我们假定 `<canvas>` 已经创建完毕并且加入到文档中，例如：

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

-   `OffscreenCanvas` 在 WebWorker 中运行，[详见](/zh/docs/api/canvas#在-webworker-中使用-offscreencanvas)
-   `NodeCanvas` 在 Node 端使用 node-canvas 进行服务端渲染，[详见](/zh/docs/api/canvas#服务端渲染)

需要注意的是，一旦使用了该参数，就不再支持运行时切换渲染器了。

## width / height

画布宽高。

-   如果设置了 [container](/zh/docs/api/canvas#container)，必填。渲染器创建 `<canvas>` 时将使用传入的宽高设置。
-   如果设置了 [canvas](/zh/docs/api/canvas#canvas)，选填。如果不填写，将使用 `canvas.width/height` 与 `devicePixelRatio` 计算。

## renderer

必填，目前支持以下渲染器:

-   基于 Canvas2D 的 [g-canvas](/zh/docs/api/renderer/canvas)
-   基于 SVG 的 [g-svg](/zh/docs/api/renderer/svg)
-   基于 WebGL 2/1 的 [g-webgl](/zh/docs/api/renderer/webgl)
-   基于 WebGPU 的 [g-webgpu](/zh/docs/api/renderer/webgpu)

后续可以在运行时通过 [setRenderer()](/zh/docs/api/canvas#setrendererrenderer-renderer) 切换。

## background

选填，画布初始化时用于清除的颜色。类似 WebGL 中的 [clearColor](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/clearColor)。

支持 [\<color\>](/zh/docs/api/css/css-properties-values-api#color) 取值，默认值为 `'transparent'`。

在该[示例](/zh/examples/canvas#background)中，我们为 Canvas 设置了一个半透明的红色，而最底层的 `<div>` 通过 CSS 设置了背景灰色：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*4QY6Rb9jIy8AAAAAAAAAAAAAARQnAQ" width="300" alt="canvas's background">

# 特殊运行平台适配

在一些特殊的运行平台（例如小程序）上，无法正常使用类似 [globalThis](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis) 这样的全局变量，而在内部我们又需要依靠它创建图片（`new globalThis.Image()`）、判断是否支持 TouchEvent（`'ontouchstart' in globalThis`）等。因此需要这些特殊平台的使用者手动传入特有的创建以及判断方式。

## document

可选。默认将使用 `window.document`。在[基于 g-svg 的服务端渲染方案](/zh/docs/api/renderer/svg#服务端渲染)中，需要将 `window.document` 替换成 [JSDOM](https://github.com/jsdom/jsdom) 提供的对应元素，以便创建对应 SVG 元素。

## devicePixelRatio

可选。默认将使用 `window.devicePixelRatio`，如果运行环境中无 `window` 对象，例如 WebWorker 中，可以手动传入，如果仍未传入则使用 1。

## requestAnimationFrame

可选。默认将使用 `window.requestAnimationFrame`，如果运行环境中无 `window` 对象，例如小程序环境，可以手动传入。

## cancelAnimationFrame

可选。默认将使用 `window.cancelAnimationFrame`，如果运行环境中无 `window` 对象，例如小程序环境，可以手动传入。

## createImage

可选。返回一个 `HTMLImageElement` 或类似对象，默认将使用 `() => new window.Image()` 创建，如果运行环境中无 `window` 对象，例如小程序环境，可以手动传入。

例如支付宝小程序中使用 [createImage](https://opendocs.alipay.com/mini/api/createimage)：

```js
const canvas = new Canvas({
    // 省略其他参数
    createImage: () => canvas.createImage(),
});
```

## supportsPointerEvents

可选。是否支持 PointerEvent，默认将使用 `!!globalThis.PointerEvent` 判断。如果传入 `false`，事件监听插件将不会监听例如 `pointerdown` 等 PointerEvent。

## supportsTouchEvents

可选。是否支持 TouchEvent。如果传入 `false`，事件监听插件将不会监听例如 `touchstart` 等 TouchEvent。

## isTouchEvent

可选。判断一个原生事件是否是 TouchEvent，接受原生事件作为参数，返回判定结果。

## isMouseEvent

可选。判断一个原生事件是否是 MouseEvent，接受原生事件作为参数，返回判定结果。

## offscreenCanvas

可选。返回一个 `HTMLCanvasElement | OffscreenCanvas` 或类似对象。用于生成一个离屏的 Canvas2D 上下文，目前它使用在以下场景：

-   g 绘制并调用 `ctx.measureText` 度量文本
-   [g-plugin-canvas-picker](/zh/docs/plugins/canvas-picker) 会在上下文中绘制一遍路径，再调用 `ctx.isPointInPath` Canvas2D API
-   [g-plugin-device-renderer](/zh/docs/plugins/device-renderer) 会在上下文中调用 `ctx.createLinearGradient` 绘制渐变，再生成纹理

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

# 坐标系

当我们说起“位置”，一定是相对于某个坐标系下而言，在 G 中我们会使用到 Client、Screen、Page、Canvas 以及 Viewport 坐标系，例如在[事件系统](/zh/docs/api/event)中可以从事件对象上获取不同坐标系下的坐标：

```js
canvas.addEventListener('click', (e) => {
    e.clientX;
    e.screenX;
    e.pageX;
    e.canvasX;
    e.viewportX;
});
```

在这些坐标系中，Client、Screen、Page 都是浏览器原生支持的坐标系，因此我们不会对事件对象上的这些坐标值做任何修改。而 Canvas 画布类似在浏览器中实现的一个“小浏览器”，因此它的视口坐标系即 Viewport 就可以类比成浏览器的 Client 坐标系。而当相机发生移动时，我们的可视范围随之改变，类似页面发生滚动，但图形在世界中的位置并没有改变，因此 Canvas 坐标系就可以类比成浏览器的 Page 坐标系。

这些坐标系都以左上角为原点： ![](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes/canvas_default_grid.png)

⚠️ 如果使用了 [g-plugin-3d](/zh/docs/plugins/3d) 插件，Z 轴正向指向屏幕外。

我们提供了它们之间的转换方法，在这个[示例](/zh/examples/event#coordinates)中，移动鼠标可以看到鼠标所在位置在各个坐标系下的值：

-   Client <-> Viewport
-   Canvas <-> Viewport

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*kPfcTKwZG90AAAAAAAAAAAAAARQnAQ)

## Client

前端开发者最熟悉的应该是 Client 浏览器坐标系，它以浏览器左上角为原点，G 不会修改原生事件对象的这个坐标值，[示例](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX)。

https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX

如果文档没有滚动，等同于 Page 坐标，下图展示了与 Screen 的差别：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*TYQJR40KMm0AAAAAAAAAAAAAARQnAQ)

## Screen

屏幕坐标系也是浏览器常用的坐标系，以屏幕左上角为原点，会受页面滚动影响。G 不会修改原生事件对象的这个坐标值。 https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/screenX

值得一提的是，在双屏下可能会出现负数，例如在左侧屏幕中，[示例](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/screenX)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*SlEMSJq20R4AAAAAAAAAAAAAARQnAQ)

## Page

以文档左上角为原点，考虑文档滚动，G 不会修改原生事件对象的这个坐标值。 https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/pageX

## Canvas

可以类比浏览器的 Client 坐标系，也称作世界坐标系，我们在创建图形时指定的位置均相对于该坐标系。它以画布 DOM 元素的左上角为原点，X 轴正向指向屏幕右侧，Y 轴正向指向屏幕下方。也称作“世界坐标系”，涉及到旋转时，我们设定沿坐标轴正向顺时针为旋转方向。

## Viewport

在浏览器的 Page 坐标系中，不管页面如何滚动，元素在文档中的坐标都不会改变，改变的是我们的可视区域。

同样的，[相机](/zh/docs/api/camera)决定了我们观察世界的角度，如果相机没有发生移动，Viewport 视口坐标系和 Canvas 坐标系将完全重合，因此在我们的可见范围内，视口左上角坐标与 Canvas 坐标系原点一样，都是 `[0, 0]`。但如果相机发生了平移、旋转、缩放，视口也会发生相应变化，此时视口左上角 `[0, 0]` 对应 Canvas 坐标系下的位置就不再是 `[0, 0]` 了。

## 转换方法

我们提供以下转换方法需要使用到 Point，它的结构如下，可以从 G 核心包中引入，[示例](/zh/examples/event#coordinates)：

```js
interface Point {
    x: number;
    y: number;
}

import type { Point } from '@antv/g';
```

### Client <-> Viewport

我们提供了从浏览器的 Client 坐标系到画布 Viewport 视口坐标系的转换方法，[示例](/zh/examples/event#coordinates)：

-   client2Viewport(client: Point): Point
-   viewport2Client(canvas: Point): Point

在内部实现中，我们使用了以下计算逻辑，例如从 Client 到 Viewport，首先获取画布 DOM 元素在 Client 坐标系下的包围盒，使用到了 [getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)，然后用 clientX/Y 减去包围盒左上角坐标，就得到了相对画布 DOM 元素左上角的坐标，即 Viewport 坐标：

```js
// 获取画布 DOM 元素在 Client 坐标系下的包围盒
// @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
const bbox = $canvas.getBoundingClientRect();

viewportX = clientX - bbox.left;
viewportY = clientY - bbox.top;
```

例如 DOM 树中的 `<canvas>` 元素通过绝对定位，处于距浏览器左上角 `[100, 100]` 的位置，当鼠标移动到 `<canvas>` 左上角 `[0, 0]` 位置时，可以得到 Client 坐标为 `[100, 100]`：

```js
canvas.viewport2Client({ x: 0, y: 0 }); // Point { x: 100, y: 100 }
canvas.client2Viewport({ x: 100, y: 100 }); // Point { x: 0, y: 0 }
```

为了兼容旧版 G API，我们也提供了：

-   getPointByClient(clientX: number, clientY: number): Point
-   getClientByPoint(viewportX: number, viewportY: number): Point

### Canvas <-> Viewport

[相机](/zh/docs/api/camera)决定了我们观察世界的角度，如果相机没有发生移动，Viewport 视口坐标系和 Canvas 坐标系将完全重合，因此在我们的可见范围内，视口左上角坐标与 Canvas 坐标系原点一样，都是 `[0, 0]`。但如果相机发生了平移、旋转、缩放，视口也会发生相应变化，此时视口左上角 `[0, 0]` 对应 Canvas 坐标系下的位置就不再是 `[0, 0]` 了。

在[示例](/zh/examples/event#coordinates)中，我们将相机向上移动了一段距离（整个世界在观察者眼中向下移动），可以发现圆心在 Canvas 坐标系下位置不变，仍然为 `[300, 200]`，但在 Viewport 坐标系下发生了偏移：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*qe5tR4G5AD4AAAAAAAAAAAAAARQnAQ)

我们提供了以下转换方法：

-   viewport2Canvas(viewport: Point): Point
-   canvas2Viewport(canvas: Point): Point

在内部实现中，我们使用了以下计算逻辑，例如从 Canvas 到 Viewport，经历从世界坐标系到裁剪坐标系，再到 NDC，最后到视口坐标系的变换：

```js
// 计算相机 VP 矩阵
const camera = canvas.getCamera();
const projectionMatrix = camera.getPerspective();
const viewMatrix = camera.getViewTransform();
const vpMatrix = mat4.multiply(mat4.create(), projectionMatrix, viewMatrix);

// 世界坐标系（Canvas） -> 裁剪坐标系（Clip）
const clip = vec3.fromValues(canvasX, canvasY, 0);
vec3.transformMat4(clip, clip, vpMatrix);

// Clip -> NDC -> Viewport 同时翻转 Y 轴
const { width, height } = this.canvasConfig; // 画布宽高
viewportX = ((clip[0] + 1) / 2) * width;
viewportY = (1 - (clip[1] + 1) / 2) * height;
```

# 入口与根节点

我们都知道浏览器中的 `window` 对象，DOM 树的入口为 `window.document`，而入口中通常会包含一个根节点 `<html>` 元素，它可以通过 `window.document.documentElement` 获得。我们向这个根节点下添加各种 DOM 元素，例如 `<head>` `<body>` 等。

Canvas 画布可以类比到 `window` 对象。与之类似，每一个画布在创建时都内置了一个入口 [Document](/zh/docs/api/builtin-objects/document)，可以通过 `canvas.document` 获取。这个入口包含了[场景图](/zh/docs/guide/diving-deeper/scenegraph)的根节点，这个根节点可以通过 `canvas.document.documentElement` 获取，随后可以通过 `appendChild` 向这个根节点中添加图形完成渲染。

## document

返回一个内置的 [Document](/zh/docs/api/builtin-objects/document) 对象，它拥有场景图的根节点。通过 `document.documentElement` 获取到这个根节点后，可以使用场景图能力添加子节点：

```js
// 向画布中添加一个 Circle
canvas.document.documentElement.appendChild(circle);
canvas.document.documentElement.children; // [circle]
```

除了添加/删除节点能力，其他场景图能力、事件能力也都可以在根节点上使用：

```js
canvas.document.documentElement.getBounds(); // 获取当前场景包围盒大小
canvas.document.addEventListener('click', () => {}); // 绑定事件
```

## getRoot(): Group

`canvas.document.documentElement` 的别名，因此以下两种写法等价：

```js
const root = canvas.getRoot();
const root = canvas.document.documentElement;
```

# 添加/删除场景图节点

由于画布并没有继承 [Node](/zh/docs/api/builtin-objects/node)，因此它本身并不具备节点操作能力。但我们增加了一些快捷方式，以下节点操作本质上都是在根节点上完成的，例如以下两种写法等价：

```js
canvas.appendChild(circle);
canvas.document.documentElement.appendChild(circle);
```

## appendChild(object: DisplayObject)

向画布中添加待渲染对象。如果该对象有子节点也会一并加入。

```js
const circle = new Circle({ style: { r: 10 } });

canvas.appendChild(circle);
// or canvas.document.documentElement.appendChild(circle);
```

## removeChild(object: DisplayObject)

从画布中移除对象。如果该对象有子节点也会一并移除。

```js
canvas.removeChild(circle);
// or canvas.document.documentElement.removeChild(circle);
```

## removeChildren()

移除并销毁画布中所有对象。

```js
canvas.removeChildren();
// or canvas.document.documentElement.removeChildren();
```

# 修改初始化配置

在初始化画布时我们传入了画布尺寸、渲染器等配置，后续可能对它们进行修改，因此我们提供了以下 API。

## resize(width: number, height: number)

有时我们需要在初始化之后调整画布尺寸，例如使用 [ResizeObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/ResizeObserver) 监听容器尺寸变化：

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

## setRenderer(renderer: Renderer)

在绝大部分场景下我们都应该在画布初始化时指定一个渲染器，后续再也不会更改。但也有小部分场景需要在运行时[切换渲染器](/zh/docs/guide/diving-deeper/switch-renderer#运行时切换)，例如 G 官网中几乎所有的示例都是这样做的：

```js
// 当图元数目很多时切换到 WebGL 渲染器
if (tooManyShapes) {
    canvas.setRenderer(webglRenderer);
} else {
    canvas.setRenderer(svgRenderer);
}
```

# 生命周期

在实例化时会进行初始化逻辑，随后可调用以下生命周期方法。

## ready

初始化工作完成后，返回一个 Promise，等价于监听 [CanvasEvent.READY](/zh/docs/api/canvas#ready-事件) 事件：

```js
await canvas.ready;

// 等价于
import { CanvasEvent } from '@antv/g';
canvas.addEventListener(CanvasEvent.READY, () => {});
```

## render()

渲染画布，由于渲染器默认开启了自动渲染，大多数情况下不需要手动调用。但有些场景需要手动控制渲染时机，此时可以进行[按需渲染](/zh/docs/guide/diving-deeper/rendering-on-demand) [示例](/zh/examples/canvas#rendering-on-demand)：

```js
// 关闭自动渲染
const webglRenderer = new WebGLRenderer({
    enableAutoRendering: false,
});

canvas.render();
```

## destroy(destroyScenegraph = true)

销毁画布，依次执行以下销毁逻辑：

-   如果开启了自动渲染，停止主渲染循环
-   将整个场景图从画布中移除，如果设置了 `destroyScenegraph` 还会销毁整个场景图
-   销毁渲染上下文

```js
// 仅销毁画布，保留场景图
canvas.destroy();

// 一并销毁画布中的场景图
canvas.destroy(true);
```

# 获取内置对象

通过以下方法可以快速获取画布中的一些内置对象。

## getConfig(): CanvasConfig

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

## getContextService(): ContextService

获取[渲染上下文](/zh/docs/api/renderer#渲染环境上下文)，由渲染器（`g-canvas/svg/webgl`）实现。该渲染上下文上有很多常用的方法，例如：

-   getDomElement() 返回上下文所处的 DOM 元素，例如 `g-canvas/webgl` 会返回 `<canvas>`，而 `g-svg` 会返回 `<svg>`
-   getDPR() 返回上下文的 devicePixelRatio

## getCamera(): Camera

获取[相机](/zh/docs/api/camera)，后续可对该相机进行操作，例如切换投影模式、完成相机动作和动画等。

```js
const camera = canvas.getCamera();

// 相机动作
camera.pan();
camera.rotate();

// 切换透视投影模式
camera
    .setPosition(300, 100, 500)
    .setFocalPoint(300, 250, 0)
    .setPerspective(0.1, 1000, 75, 600 / 500);
```

# 事件

在[事件系统](/zh/docs/api/event)中，大部分事件都会冒泡直至画布。例如我们在如下简单场景下点击 Circle，可以查看事件的传播路径依次为：

```
Circle -> Group(canvas.document.documentElement) -> Document(canvas.document) -> Canvas：
```

```js
canvas.addEventListener('click', (e) => {
    e.propagationPath(); // [Circle, Group, Document, Canvas]
});
```

## 绑定/解绑

在 Canvas 画布和画布根节点上都可以绑定事件：

```js
// 在画布上绑定
canvas.addEventListener('click', () => {});

// 在画布根节点上绑定
canvas.document.addEventListener('click', () => {});
```

更多事件相关操作详见[事件系统](/zh/docs/api/event)

## 画布特有事件

画布在初始化、渲染前后会触发对应事件，目前可以监听以下画布相关事件：

```js
export enum CanvasEvent {
  READY = 'ready', // 画布相关服务准备就绪后触发
  BEFORE_RENDER = 'beforerender', // 在每一帧渲染前触发
  AFTER_RENDER = 'afterrender', // 在每一帧渲染后触发
  BEFORE_DESTROY = 'beforedestroy', // 在销毁前触发
  AFTER_DESTROY = 'afterdestroy', // 在销毁后触发
  RESIZE = 'resize', // 在 resize 时触发
}
```

例如我们在官网所有例子中展示实时帧率，该组件在每次渲染后更新，我们就可以通过监听 `afterrender` 事件完成：

```js
import { CanvasEvent } from '@antv/g';

canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
    stats.update();
});
// 或者
canvas.addEventListener('afterrender', () => {
    stats.update();
});
```

### ready 事件

在浏览器中我们可以通过 `window.onload` 获知包含 HTML 解析、样式解析、资源加载等页面初始化工作是否完成：

```js
// @see https://javascript.info/onload-ondomcontentloaded
window.onload = function () {
    alert('Page loaded');
};
```

同样在 G 中这些初始化工作也是异步的，我们也提供了类似的 `ready` 事件。在初始化完成后可以进行场景图创建等工作：

```js
canvas.addEventListener(CanvasEvent.READY, () => {
    canvas.appendChild(circle);
});
```

除了监听 `ready` 事件，还可以选择[等待 ready 这个 Promise](/zh/docs/api/canvas#ready)：

```js
await canvas.ready;
canvas.appendChild(circle);
```

# 使用 CustomElementRegistry

通常我们建议使用 `new Circle()` 这样的方式创建内置或者自定义图形，但我们也提供了类似 DOM [CustomElementRegistry](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry) API，可以使用 [document.createElement](/zh/docs/api/builtin-objects/document#createelement) 创建完成注册的图形，因此以下写法等价：

```js
import { Shape, Circle } from '@antv/g';

const circle = canvas.document.createElement(Shape.CIRCLE, { style: { r: 100 } });

// 或者
const circle = new Circle({ style: { r: 100 } });
```

`canvas.customElements` 提供了以下方法。

## define

完整方法签名为：

```js
define(name: string, new (...any[]) => DisplayObject): void;
```

所有 G 的内置图形在画布初始化时都完成了注册，对于自定义图形，如果也想通过 createElement 的方法创建，也可以按如下方式完成注册：

```js
import { MyCustomShape } from 'my-custom-shape';
canvas.customElements.define(MyCustomShape.tag, MyCustomShape);

const myCustomShape = canvas.document.createElement(MyCustomShape.tag, {});
```

## get

完整方法签名为：

```js
get(name: string): new (...any[]) => DisplayObject
```

根据图形注册时提供的字符串，返回构造函数：

```js
import { Shape } from '@antv/g';

canvas.customElements.get(Shape.CIRCLE); // Circle constructor
```

# 注意事项

## 多个画布共存

在同一个页面中，多个画布可以共存，即可以同时存在多个“平行世界”。但受限于底层渲染 API，例如 WebGL 只允许至多 8 个上下文。[示例](/zh/examples/canvas#multi-canvas)

## 使用创建好的 canvas 元素

在该 [示例](/zh/examples/canvas#user-defined-canvas) 中，我们自行创建 `<canvas>` 元素，用它来创建画布：

```js
const $canvas = document.createElement('canvas');
$canvas.width = 600;
$canvas.height = 500;
document.getElementById('container').appendChild($canvas);

const canvas = new Canvas({
    canvas: $canvas,
    renderer: new CanvasRenderer(),
});
```

## 在 WebWorker 中使用 OffscreenCanvas

你可能看到过一些渲染引擎的应用：

-   Babylon.js https://doc.babylonjs.com/divingDeeper/scene/offscreenCanvas
-   Three.js https://r105.threejsfundamentals.org/threejs/lessons/threejs-offscreencanvas.html

我们在以下两个场景会使用到 OffscreenCanvas，主要利用 Worker 解放主线程压力：

1. GPGPU 配合 g-webgl 和 g-plugin-gpgpu 使用，例如上层的图分析算法库
2. g-webgl 在 Worker 中渲染，同步结果到主线程

在该 [示例](/zh/examples/canvas#offscreen-canvas) 中我们演示了第二种用法，在主线程创建 `<canvas>`，通过 `transferControlToOffscreen()` 将控制权转移给 WebWorker，后续在 WebWorker 中完成渲染，将结果同步给主线程：

```js
// 主线程
const $canvas = document.createElement('canvas') as HTMLCanvasElement;
const dpr = window.devicePixelRatio;
$canvas.height = dpr * 600;
$canvas.width = dpr * 500;
$canvas.style.height = '600px';
$canvas.style.width = '500px';
document.getElementById('container').appendChild($canvas);
const offscreen = $canvas.transferControlToOffscreen();

// 省略 Worker 创建过程

// 在 WebWorker 中使用 OffscreenCanvas
const canvas = new Canvas({
  canvas: offscreenCanvas, // 从主线程
  devicePixelRatio,
  renderer,
});
```

值得注意的是事件交互。OffscreenCanvas 并不具备事件监听能力，我们的交互都发生在主线程的 `<canvas>` 元素上，当鼠标点击事件被监听时，我们如何得知 OffscreenCanvas 中哪个图形命中了呢？

我们可以这样实现：

1. 监听 `<canvas>` 上的交互事件，触发后将事件通过 `postMessage` 传递给 Worker。注意这里并不能直接传递类似 [PointerEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/PointerEvent) 这样的原生事件对象，在序列化时会报如下错误。正确的做法是提取原生事件对象上的关键属性（例如 `clientX/Y`）进行传递：

```
Uncaught (in promise) DOMException: Failed to execute 'postMessage' on 'Worker': PointerEvent object could not be cloned.
```

```js
// 在主线程中监听 `<canvas>` 事件
$canvas.addEventListener(
    'pointerdown',
    (e) => {
        // 向 WebWorker 传递可序列化的事件对象
        worker.triggerEvent('pointerdown', clonePointerEvent(e));
    },
    true,
);
```

2. 在 Worker 中触发 G 渲染服务提供的交互事件 hook，例如接收到主线程传来的 `pointerdown` 信号时调用 `pointerDown` hook：

```js
export function triggerEvent(event, ev) {
    if (event === 'pointerdown') {
        canvas.getRenderingService().hooks.pointerDown.call(ev);
    }
}
```

3. [cursor](/zh/docs/api/basic/display-object#鼠标样式) 鼠标样式显然无法在 Worker 中应用。我们可以在拾取到图形时在 Worker 中通过 `postMessage` 告知主线程修改 `<canvas>` 上的鼠标样式。

## 服务端渲染

依据不同的渲染器，我们提供了以下服务端渲染方案：

-   [g-canvas + node-canvas](/zh/docs/api/renderer/canvas#服务端渲染)
-   [g-svg + JSDOM](/zh/docs/api/renderer/svg#服务端渲染)
-   [g-webgl + headless-gl]()

目前我们在[集成测试](https://github.com/antvis/g/tree/next/integration/__node__tests__/)中使用它们。
