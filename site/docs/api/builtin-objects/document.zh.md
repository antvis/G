---
title: Document
order: 4
---

在 G 中有以下继承关系：

-   Document -> Node -> EventTarget

我们可以把 `Document` 类比成浏览器环境中的 `window.document`，例如在浏览器中：

-   它有指向 `window` 的引用 [defaultView](/zh/api/builtin-objects/document#defaultview)
-   通过 [documentElement](/zh/api/builtin-objects/document#documentelement) 访问 `<html>` 元素
-   可以通过一系列方法查询节点，例如 [getElementById](/zh/api/builtin-objects/document#getelementbyid)
-   通过 [createElement](/zh/api/builtin-objects/document#createelement) 创建元素

我们尽可能实现了以上浏览器提供的 API。

## 继承自

[Node](/zh/api/builtin-objects/node)

## 属性

### nodeName

实现了 [Node.nodeName](/zh/api/builtin-objects/node#nodename)，返回 `'document'`，在事件处理器中可用来快速判断 target，例如点击了画布的空白区域时：

```js
canvas.addEventListener('click', (e) => {
    e.target; // Document

    if (e.target.nodeName === 'document') {
        //...
    }
});
```

### defaultView

指向画布，例如：

```js
canvas.document.defaultView; // canvas
```

<https://developer.mozilla.org/en-US/docs/Web/API/Document/defaultView>

### documentElement

返回场景图中的根节点，在创建画布时会默认使用 [Group](/zh/api/basic/group) 创建一个：

```js
canvas.document.documentElement; // Group
canvas.document.documentElement.getBounds(); // 获取整个场景的包围盒
```

<https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement>

### timeline

默认时间轴，在动画系统中使用。

<https://developer.mozilla.org/zh-CN/docs/Web/API/Document/timeline>

### ownerDocument

返回 null

## 方法

由于继承自 [Node](/zh/api/builtin-objects/node)，因此显然拥有了事件绑定能力：

```js
canvas.document.addEventListener('click', () => {});
```

但在一些方法特别是节点操作上和 Node 有差异。

### 节点操作

虽然继承了 [Node](/zh/api/builtin-objects/node)，但在 Document 上无法调用一些节点操作方法，正如在浏览器中调用 `document.appendChild` 会返回如下错误一样：

```bash
Uncaught DOMException: Failed to execute 'appendChild' on 'Node': Only one element on document allowed.
```

### 节点查询

以下节点查询方法等同于在 document.documentElement 上执行。

#### getElementById

<https://developer.mozilla.org/zh-CN/docs/Web/API/Document/getElementById>

#### getElementsByName

<https://developer.mozilla.org/zh-CN/docs/Web/API/Document/getElementsByName>

#### getElementsByClassName

<https://developer.mozilla.org/zh-CN/docs/Web/API/Document/getElementsByClassName>

#### getElementsByTagName

<https://developer.mozilla.org/zh-CN/docs/Web/API/Document/getElementsByTagName>

#### querySelector

<https://developer.mozilla.org/zh-CN/docs/Web/API/Document/querySelector>

#### querySelectorAll

<https://developer.mozilla.org/zh-CN/docs/Web/API/Document/querySelectorAll>

### createElement

通常我们建议使用 `new Circle()` 这样的方式创建内置或者自定义图形，但我们也提供了类似 DOM [CustomElementRegistry](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry) API，可以使用 [document.createElement](/zh/api/builtin-objects/document#createelement) 创建完成注册的图形，因此以下写法等价：

```js
import { Shape, Circle } from '@antv/g';

const circle = canvas.document.createElement(Shape.CIRCLE, {
    style: { r: 100 },
});

// 或者
const circle = new Circle({ style: { r: 100 } });
```

<https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement>

### createElementNS

目前实现同 createElement。

### elementFromPoint

当我们想知道画布中某个点上堆叠了多少个图形，除了通过交互事件，还可以通过 API 方式完成拾取。

该方法接受一组 `x, y` 坐标（在 [Canvas 坐标系](/zh/api/canvas/coordinates#canvas)下，如果想使用其他坐标系下的坐标，请使用[转换方法](/zh/api/canvas/coordinates#转换方法)）为参数，返回拾取结果。

在下面的[例子](/zh/examples/canvas/canvas-basic/#element-from-point)中，我们在 [Canvas 坐标系](/zh/api/canvas/coordinates#canvas)下 `[100, 100]` 放置了一个半径为 `100` 的 [Circle](/zh/api/basic/circle)，在红点处拾取时会返回它：

```js
const topMostElement = await canvas.document.elementFromPoint(20, 100); // circle1

await canvas.document.elementFromPoint(0, 0); // canvas.document.documentElement
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*XAYjSJnlCIYAAAAAAAAAAAAAARQnAQ" width="400px">

有三点需要注意：

1. 有别于浏览器提供的同步 API，由于部分渲染器的实现（例如 `g-webgl`）需要通过 GPU 方式完成拾取，因此该方法为**异步**
2. 当只需要获取该点命中的最顶层的图形时，应该使用 `elementFromPoint` 而非 `elementsFromPoint`，前者在绝大部分场景下都比后者快
3. 拾取判定遵循以下规则：

    1. 超出画布视口范围（考虑到相机，并不一定等于画布范围）返回 null。
    2. 图形的 [interactive](/zh/api/basic/display-object#interactive) 属性**会影响**拾取。不可交互图形无法拾取。
    3. 图形的 [visibility](/zh/api/basic/display-object#visibility) 属性**会影响**拾取。不可见图形无法拾取。
    4. 图形的 [opacity](/zh/api/basic/display-object#opacity) 属性**不会影响**拾取。即使图形完全透明，依然也会被拾取到。

<https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint>

### elementsFromPoint

当目标点上有多个图形堆叠时，该方法会按照 [z-index](/zh/api/basic/display-object#zindex) 排序后返回它们，返回结果中的第一个元素为最顶层的图形。

该方法同样接受一组 `x, y` 坐标作为参数。

在下面的[例子](/zh/examples/canvas/canvas-basic/#element-from-point)中，circle2 在 circle1 之上，因此在重叠区域进行拾取两者都会出现在结果数组中，并且 circle2 在前：

```js
const elements = await canvas.document.elementsFromPoint(150, 150); // [circle2, circle1, document.documentElement]
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*LqlZSYwRBPoAAAAAAAAAAAAAARQnAQ" width="500px">

注意事项：

1. 该返回结果和事件对象上的 [composedPath()](/zh/api/event/event-object#composedpath) 的差别是，后者会在返回数组中追加 [Document](/zh/api/builtin-objects/document) 和 [Canvas](/zh/api/canvas) 对象，而前者只到 [画布根节点](/zh/api/canvas/built-in-objects#documentdocumentelement) 为止。
2. 超出画布视口范围返回空数组。

<https://developer.mozilla.org/en-US/docs/Web/API/Document/elementsFromPoint>

### elementsFromBBox

区域查询特别是基于包围盒的检测在以下场景中特别适用：

-   脏矩形渲染中用于确定受影响区域
-   矩形刷选批量选中图形

此类基于包围盒的检测不需要太精确，配合内部 RBush 这样的空间索引，因此速度很快。

该方法为同步方法，接受包围盒描述 `minX, minY, maxX, maxY` 坐标（在 [Canvas 坐标系](/zh/api/canvas/coordinates#canvas)下）：

```js
const elements = document.elementsFromBBox(minX, minY, maxX, maxY);
```

注意事项：

1. 会考虑 [visibility](/zh/api/basic/display-object#visibility) 和 [pointer-events](/zh/api/basic/display-object#pointerevents) 属性
2. 无需考虑 WebGL / WebGPU 这样基于 GPU 的拾取实现，为同步方法
3. 返回的元素数组按实际渲染次序排序

### elementFromPointSync

[elementFromPoint](/zh/api/builtin-objects/document#elementfrompoint) 的同步版本，值得注意的是，并不是所有[渲染器](/zh/api/renderer/renderer)都会实现该方法，目前仅有 [g-canvas](/zh/api/renderer/canvas)，[g-svg](/zh/api/renderer/svg) 和 [g-canvaskit](/zh/api/renderer/canvaskit) 提供了对应实现：

```js
const element = canvas.document.elementFromPoint(0, 0); // canvas.document.documentElement
```

### elementsFromPointSync

[elementsFromPoint](/zh/api/builtin-objects/document#elementsfrompoint) 的同步版本，值得注意的是，并不是所有[渲染器](/zh/api/renderer/renderer)都会实现该方法，目前仅有 [g-canvas](/zh/api/renderer/canvas)，[g-svg](/zh/api/renderer/svg) 和 [g-canvaskit](/zh/api/renderer/canvaskit) 提供了对应实现：

```js
const elements = canvas.document.elementsFromPoint(150, 150); // [circle2, circle1, document.documentElement]
```
