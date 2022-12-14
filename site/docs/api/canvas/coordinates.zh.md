---
title: 坐标系
order: 2
---

当我们说起“位置”，一定是相对于某个坐标系下而言，在 G 中我们会使用到 Client、Screen、Page、Canvas 以及 Viewport 坐标系，例如在[事件系统](/zh/api/event/intro)中可以从事件对象上获取不同坐标系下的坐标：

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

这些坐标系都以左上角为原点：
<img src="https://developer.mozilla.org/en-US/Web/API/Canvas_API/Tutorial/Drawing_shapes/canvas_default_grid.png" alt="canvas coordinates origin">

⚠️ 如果使用了 [g-plugin-3d](/zh/plugins/3d) 插件，Z 轴正向指向屏幕外。

我们提供了它们之间的转换方法，在这个[示例](/zh/examples/canvas/canvas-basic/#coordinates)中，移动鼠标可以看到鼠标所在位置在各个坐标系下的值：

-   Client <-> Viewport
-   Canvas <-> Viewport

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*kPfcTKwZG90AAAAAAAAAAAAAARQnAQ" width="300" alt="coordinates conversion">

## Client

前端开发者最熟悉的应该是 Client 浏览器坐标系，它以浏览器左上角为原点，G 不会修改原生事件对象的这个坐标值，[示例](https://developer.mozilla.org/en-US/Web/API/MouseEvent/clientX)。

https://developer.mozilla.org/en-US/Web/API/MouseEvent/clientX

如果文档没有滚动，等同于 Page 坐标，下图展示了与 Screen 的差别：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*TYQJR40KMm0AAAAAAAAAAAAAARQnAQ" alt="page screen coordinates">

## Screen

屏幕坐标系也是浏览器常用的坐标系，以屏幕左上角为原点，会受页面滚动影响。G 不会修改原生事件对象的这个坐标值。 https://developer.mozilla.org/en-US/Web/API/MouseEvent/screenX

值得一提的是，在双屏下可能会出现负数，例如在左侧屏幕中，[示例](https://developer.mozilla.org/en-US/Web/API/MouseEvent/screenX)：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*SlEMSJq20R4AAAAAAAAAAAAAARQnAQ" width="300" alt="screen coordinates">

## Page

以文档左上角为原点，考虑文档滚动，G 不会修改原生事件对象的这个坐标值。 https://developer.mozilla.org/en-US/Web/API/MouseEvent/pageX

## Canvas

可以类比浏览器的 Client 坐标系，也称作世界坐标系，我们在创建图形时指定的位置均相对于该坐标系。它以画布 DOM 元素的左上角为原点，X 轴正向指向屏幕右侧，Y 轴正向指向屏幕下方。也称作“世界坐标系”，涉及到旋转时，我们设定沿坐标轴正向顺时针为旋转方向。

## Viewport

在浏览器的 Page 坐标系中，不管页面如何滚动，元素在文档中的坐标都不会改变，改变的是我们的可视区域。

同样的，[相机](/zh/api/camera/intro)决定了我们观察世界的角度，如果相机没有发生移动，Viewport 视口坐标系和 Canvas 坐标系将完全重合，因此在我们的可见范围内，视口左上角坐标与 Canvas 坐标系原点一样，都是 `[0, 0]`。但如果相机发生了平移、旋转、缩放，视口也会发生相应变化，此时视口左上角 `[0, 0]` 对应 Canvas 坐标系下的位置就不再是 `[0, 0]` 了。

## 转换方法

我们提供以下转换方法需要使用到 Point，它的结构如下，可以从 G 核心包中引入，[示例](/zh/examples/canvas/canvas-basic/#coordinates)：

```js
interface Point {
    x: number;
    y: number;
}

import type { Point } from '@antv/g';
```

### Client <-> Viewport

我们提供了从浏览器的 Client 坐标系到画布 Viewport 视口坐标系的转换方法，[示例](/zh/examples/canvas/canvas-basic/#coordinates)：

-   client2Viewport(client: Point): Point
-   viewport2Client(canvas: Point): Point

在内部实现中，我们使用了以下计算逻辑，例如从 Client 到 Viewport，首先获取画布 DOM 元素在 Client 坐标系下的包围盒，使用到了 [getBoundingClientRect](https://developer.mozilla.org/en-US/Web/API/Element/getBoundingClientRect)，然后用 clientX/Y 减去包围盒左上角坐标，就得到了相对画布 DOM 元素左上角的坐标，即 Viewport 坐标：

```js
// 获取画布 DOM 元素在 Client 坐标系下的包围盒
// @see https://developer.mozilla.org/en-US/Web/API/Element/getBoundingClientRect
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

[相机](/zh/api/camera)决定了我们观察世界的角度，如果相机没有发生移动，Viewport 视口坐标系和 Canvas 坐标系将完全重合，因此在我们的可见范围内，视口左上角坐标与 Canvas 坐标系原点一样，都是 `[0, 0]`。但如果相机发生了平移、旋转、缩放，视口也会发生相应变化，此时视口左上角 `[0, 0]` 对应 Canvas 坐标系下的位置就不再是 `[0, 0]` 了。

在[示例](/zh/examples/canvas/canvas-basic/#coordinates)中，我们将相机向上移动了一段距离（整个世界在观察者眼中向下移动），可以发现圆心在 Canvas 坐标系下位置不变，仍然为 `[300, 200]`，但在 Viewport 坐标系下发生了偏移：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*qe5tR4G5AD4AAAAAAAAAAAAAARQnAQ" width="300" alt="canvas to viewport">

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
