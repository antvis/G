---
title: 第三节：增加交互
order: 3
---

在该系列教程中，我们将逐步实现一个简单的可视化场景，展示节点和边，并让它们具备拖拽、拾取等基本交互能力。

在本节中，我们将学习如何让图形响应事件 [本节示例](/zh/examples/guide/basic/#chapter3)。其中会涉及以下 API：

-   使用 [addEventListener](/zh/api/event/intro#addeventlistener) 为图形添加事件监听器：
-   使用 [style](/zh/api/basic/display-object#绘图属性) 修改图形样式属性
-   使用 [translateLocal](/zh/api/basic/display-object#平移) 改变节点位置

[完整 CodeSandbox 例子](https://codesandbox.io/s/ru-men-jiao-cheng-qs3zn?file=/index.js)

## 激活高亮

我们想让节点 1 响应激活事件：当鼠标移入时将节点变成红色，同时改变鼠标样式，移出后恢复。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Xw7JTZTFqMgAAAAAAAAAAAAAARQnAQ" width="200" alt="interaction">

和 DOM API 一样，我们通过 [addEventListener](/zh/api/event/intro#addeventlistener) 给图形增加事件监听器，监听 mouseenter 和 mouseleave 事件：

```js
node1.addEventListener('mouseenter', () => {
    // 修改图形样式属性
    node1.style.fill = 'red';
});
node1.addEventListener('mouseleave', () => {
    // 修改图形样式属性
    node1.style.fill = '#1890FF';
});
```

然后我们可以给节点添加 `cursor` 属性来设置[鼠标悬停样式](/zh/api/basic/display-object#鼠标样式)，这里使用“手指”形状 `pointer`：

```js
const node1 = new Circle({
    style: {
        //... 省略其他属性
        cursor: 'pointer',
    },
});
```

我们的[事件系统](/zh/api/event/intro)完全兼容 DOM Event API，这意味着可以使用前端熟悉的 API 实现事件监听器的绑定/解绑、触发自定义事件、事件委托等等功能。除了这些方法名更好记外，在下一节中我们还将看到它的另一大优势。

## 拖拽

拖拽是一个常见的交互动作，我们想实现对于节点 1 的拖拽功能，同时改变边的端点位置：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*5irUQKZPTVoAAAAAAAAAAAAAARQnAQ" width="400" alt="dragging">

### 使用 interact.js 实现拖拽

我们当然可以通过组合对基础事件（pointerup、pointermove、pointerdown）的监听来实现拖拽。但这里我们用一种更简单的方法，由于我们的[事件系统](/zh/api/event/intro)完全兼容 DOM Event API，因此可以直接使用 Web 端现成的拖拽库，例如 [interact.js](https://interactjs.io/) 来完成绝大部分“脏活累活”。而我们只需要做两件事：

1. 传给 interact.js 一个假的上下文 `canvas.document` 和节点 1，让它以为操作的是真实的 DOM
2. 在 interact.js 的 `onmove` 回调函数中改变节点和边端点的位置

```js
import interact from 'interactjs';

// 使用 interact.js 实现拖拽
interact(node1, {
    // 直接传入节点1
    context: canvas.document, // 传入上下文
}).draggable({
    onmove: function (event) {
        // interact.js 告诉我们的偏移量
        const { dx, dy } = event;
        // 改变节点1位置
        node1.translateLocal(dx, dy);
        // 获取节点1位置
        const [nx, ny] = node1.getLocalPosition();
        // 改变边的端点位置
        edge.style.x1 = nx;
        edge.style.y1 = ny;
    },
});
```

你可能注意到了，在拖拽时鼠标样式自动变成了 `move` 的形状，这完全是 interact.js 的功劳。之所以能这么做，是因为 [interact.js](https://interactjs.io/) 并不假设自身一定运行在真实的 DOM 环境。换言之，我们可以将 G 的图形伪装成 DOM 来“欺骗”它们。同样的道理，我们也可以直接使用 [hammer.js](/zh/api/event/gesture-dragndrop#直接使用-hammerjs) 这样的手势库。

### 改变节点位置

回到 `onmove` 回调函数中，我们需要改变节点的位置，而偏移量 interact.js 已经告诉我们了：

```js
node1.translateLocal(dx, dy);
```

类似 `translateLocal` 这样的[变换操作](/zh/api/basic/display-object#变换操作)还有很多，除了平移，还可以进行旋转和缩放。

改变边的端点也很简单，通过修改它的样式属性 `x1/y1` 就可以完成，可以查看 [Line](/zh/api/basic/line) 进一步了解：

```js
edge.style.x1 = nx;
edge.style.y1 = ny;
```

至此这个简单的场景就完成了，跟随我们的后续教程继续了解场景图、相机吧。
