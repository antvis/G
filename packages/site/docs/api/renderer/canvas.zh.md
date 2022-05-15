---
title: Canvas 渲染器
order: 0
---

使用 [CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D) 绘制 2D 图形。会在容器中创建一个 `<canvas>` 元素。

# 使用方式

和 `@antv/g` 一样，也有以下两种使用方式。

## NPM Module

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

## CDN 方式

```html
<script
  src="https://unpkg.com/@antv/g-canvas/dist/index.umd.min.js"
  type="application/javascript">
```

从 `G.Canvas` 命名空间下可以获取渲染器：

```js
const canvasRenderer = new window.G.Canvas.Renderer();
```

# 初始化配置

在创建渲染器时，可以传入一些初始化配置项，例如：

```js
import { Renderer } from '@antv/g-canvas';
const renderer = new Renderer({
    enableDirtyRectangleRendering: true,
});
```

## enableDirtyRectangleRendering

是否开启“脏矩形”渲染。开启后将大幅提升 Canvas2D 环境下的渲染性能。默认开启。

一种常见的交互是通过鼠标高亮某个图形。此时场景中仅有一小部分发生了改变，擦除画布中的全部图形再重绘就显得没有必要了。类比 React diff 算法能够找出真正变化的最小部分，“脏矩形”渲染能尽可能复用上一帧的渲染结果，仅绘制变更部分，特别适合 Canvas2D API。

下图展示了这个思路：

-   当鼠标悬停在圆上时，我们知道了对应的“脏矩形”，也就是这个圆的包围盒
-   找到场景中与这个包围盒区域相交的其他图形，这里找到了另一个矩形
-   使用 [clearRect](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/clearRect) 清除这个“脏矩形”，代替清空整个画布
-   按照 z-index 依次绘制一个矩形和圆形

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*6zyLTL-AIbQAAAAAAAAAAAAAARQnAQ)

在以上求交与区域查询的过程中，我们可以复用剔除方案中的优化手段，例如加速结构。在实现中我们使用了 [RBush](https://github.com/mourner/rbush)。

显然当动态变化的对象数目太多时，该优化手段就失去了意义，试想经过一番计算合并后的“脏矩形”几乎等于整个画布，那还不如直接清空重绘所有对象。因此例如 Pixi.js 这样的 2D 游戏渲染引擎就[不考虑内置](https://github.com/pixijs/pixi.js/issues/3503)。

但在可视化这类相对静态的场景下就显得有意义了，例如在触发拾取后只更新图表的局部，其余部分保持不变。

# 内置插件

该渲染器内置了以下插件：

-   [g-plugin-canvas-renderer](/zh/docs/plugins/canvas-renderer) 使用 [CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D) 渲染 2D 图形
-   [g-plugin-canvas-picker](/zh/docs/plugins/canvas-picker) 基于数学方法和 [CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D) 拾取图形
-   [g-plugin-dom-interaction](/zh/docs/plugins/dom-interaction) 基于 DOM API 绑定事件

# 可选插件

除了内置插件，还有以下可选插件。

## 手绘风格渲染

使用 [rough.js](https://roughjs.com/) 的 Canvas 版本进行手绘风格的渲染。

我们提供了 [g-plugin-rough-canvas-renderer](/zh/docs/plugins/rough-canvas-renderer) 插件，注册后会替换掉 [g-plugin-canvas-renderer](/zh/docs/plugins/canvas-renderer) 对于部分 2D 图形的渲染能力。

[示例](/zh/examples/plugins#rough)效果如下：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*d4iiS5_3YVIAAAAAAAAAAAAAARQnAQ" width="500">

# 服务端渲染

该渲染器依赖 [CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D) 渲染能力，并不局限在浏览器端，因此也可以使用 [node-canvas](https://github.com/Automattic/node-canvas) 进行[服务端渲染](/zh/docs/api/canvas#服务端渲染)。
