---
title: 第二节：使用渲染器
order: 2
---

在该系列教程中，我们将逐步实现一个简单的可视化场景，展示节点和边，并让它们具备拖拽、拾取等基本交互能力。

在上一节我们定义了一个简单的场景，在本节中，我们将学习如何使用[渲染器](/zh/api/renderer/intro)完成渲染。[本节示例](/zh/examples/guide/basic/#chapter2)

[完整 CodeSandbox 例子](https://codesandbox.io/s/ru-men-jiao-cheng-qs3zn?file=/index.js)

## 选择渲染器

首先我们需要引入一个或多个渲染器，如果引入了多个，还可以在[运行时切换](/zh/guide/diving-deeper/switch-renderer#运行时切换)。本例中我们只选择了一个 Canvas2D 渲染器：

```javascript
import { Renderer } from '@antv/g-canvas';

const renderer = new Renderer();
```

## 创建画布

然后我们需要创建画布，使用上面引入的渲染器：

```javascript
const canvas = new Canvas({
    container: 'container', // DOM 节点id
    width: 600, // 画布宽度
    height: 500, // 画布高度
    renderer,
});
```

## 向画布中添加图形

有了画布，我们可以把场景图中的两个节点和一条边加入画布，当然这一切要等待画布就绪之后。我们有两种方式获知画布何时就绪，一是监听 [就绪事件](/zh/api/canvas#ready-事件)，二是[等待就绪的 Promise 返回](/zh/api/canvas#ready)：

```javascript
canvas.addEventListener(CanvasEvent.READY, () => {
    canvas.appendChild(node1);
    canvas.appendChild(node2);
    canvas.appendChild(edge);
});

// 或者
await canvas.ready;
canvas.appendChild(node1);
canvas.appendChild(node2);
canvas.appendChild(edge);
```

此时就能看到渲染效果了，不过有些奇怪，边出现在了节点之上，甚至挡住了文本：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*HQoYSocN12MAAAAAAAAAAAAAARQnAQ)

这个问题是由我们加入画布的各个图形顺序导致，我们最后才将“边”加入画布，根据画家算法，它是最后绘制的，因此出现在了最顶层。

最简单的解决办法就是修改顺序，先绘制边，再绘制节点：

```javascript
canvas.appendChild(edge);
canvas.appendChild(node1);
canvas.appendChild(node2);
```

此时效果就正常了： ![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*te-lR4m9mRIAAAAAAAAAAAAAARQnAQ)

或者，我们也可以通过 `zIndex` 手动调整。

## 设置展示次序

类似 CSS 中的 `zIndex`，我们可以手动设置两个节点的绘制顺序，让它们比边高（默认为 0）即可：

```javascript
node1.style.zIndex = 1;
node2.style.zIndex = 1;
```

基础图形已经绘制出来了，下面让我们增加一些交互吧。
