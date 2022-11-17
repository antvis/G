---
title: 理解事件传播路径
order: 4
---

在之前的[入门教程](/zh/guide/chapter3)中，我们已经掌握了如何为图形添加事件监听器。在本教程中我们将深入了解监听器被触发时，事件对象上一些有用的属性和方法，同时理解事件传播路径，最终实现一个简单的事件委托效果。

最终示例：

-   [官网示例](/zh/examples/event#delegate)
-   [CodeSandbox 示例](https://codesandbox.io/s/jiao-cheng-shi-jian-wei-tuo-lq7wz?file=/index.js)

## 事件传播机制

这次我们的场景十分简单，类似 DOM 中的 ul/li：

```
Group(ul)
    - Rect(li)
    - Rect(li)
```

我们希望给 ul 下每个 li 增加点击事件监听，最直接的做法当然是：

```js
li1.addEventListener('click', () => {});
li2.addEventListener('click', () => {});
```

这没有任何问题，但每次给 ul 添加新的 li 时，都需要添加这样的一个监听器，有没有“一劳永逸”的方法呢？

在引入事件委托之前，我们先来看看事件传播机制。由于我们完全兼容 DOM Event API，不妨借用 MDN 上的教程来说明。在下图中，当我们点击 `<video>` 元素时，会依次触发捕获（capturing）和冒泡（bubbling）两个阶段，前者从根节点一路进行到目标节点，触发路径上每个节点的 onclick 事件监听器（如有），后者则相反。

https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Building_blocks/Events

![](https://mdn.mozillademos.org/files/14075/bubbling-capturing.png)

在我们的示例场景中，点击每一个 li 时同样也会经历上述传播阶段，因此只需要在父节点 ul 上监听即可，事件自然会冒泡上来，这就是事件委托：

```js
ul.addEventListener('click', (ev) => {
    ev.target; // li1 li2...
});
```

## 事件对象

事件对象上有很多有用的属性，我们先来看看上一节中提到的事件传播路径，通过[composedPath()](/zh/api/event#composedpath)方法可以获取它。当我们点击 li1 时，此时路径会返回如下结果：

```js
ev.composedPath(); // [Rect(li1), Group(ul), Group(root), Document, Canvas];
```

该结果是一个数组，依次展示了从事件触发的目标节点到根节点的路径，我们从后往前看：

-   [Canvas](/zh/api/canvas) 即画布对象，可以对应 `window`
-   [Document](/zh/api/builtin-objects/document) 文档，可以对应 `window.document`
-   [Group(root)](/zh/api/builtin-objects/document#documentelement) 文档根节点，可以对应 `window.document.documentElement`

除了事件传播路径，事件对象上其他的常用属性有：

-   [target](/zh/api/event#target) 返回当前触发事件的图形
-   [currentTarget](/zh/api/event#currenttarget) 总是指向事件绑定的图形
-   各个坐标系下的[事件坐标](/zh/api/event#canvasxy)

## 添加事件监听器的高级用法

还有一些常见的需求可以在绑定事件时做到，例如绑定一个“一次性”的监听器：

```js
circle.addEventListener('click', () => {}, { once: true });
```

再比如注册一个仅在事件捕获阶段执行的监听器：

```js
circle.addEventListener('click', () => {}, { capture: true });
// 或者
circle.addEventListener('click', () => {}, true);
```

更多用法可以参考 [addEventListener()](/zh/api/event#addeventlistener) 的文档。
