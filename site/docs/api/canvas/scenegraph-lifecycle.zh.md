---
title: 场景图能力与生命周期
order: 2
---

## 添加/删除场景图节点

由于画布并没有继承 [Node](/zh/api/builtin-objects/node)，因此它本身并不具备节点操作能力。但我们增加了一些快捷方式，以下节点操作本质上都是在根节点上完成的，例如以下两种写法等价：

```js
canvas.appendChild(circle);
canvas.document.documentElement.appendChild(circle);
```

### appendChild

向画布中添加待渲染对象。如果该对象有子节点也会一并加入。

```js
const circle = new Circle({ style: { r: 10 } });

canvas.appendChild(circle);
// or canvas.document.documentElement.appendChild(circle);
```

方法签名如下：

```
appendChild(object: DisplayObject): DisplayObject;
```

### removeChild

从画布中移除对象。如果该对象有子节点也会一并移除。

```js
canvas.removeChild(circle);
// or canvas.document.documentElement.removeChild(circle);
```

方法签名如下：

```
removeChild(object: DisplayObject): DisplayObject;
```

为了和 DOM API 保持一致，仅移除对象并不会销毁。如果要销毁需要调用 `destroy()`。

### removeChildren

移除画布中所有对象。

```js
canvas.removeChildren();
// or canvas.document.documentElement.removeChildren();
```

### destroyChildren

移除并销毁画布中所有对象。

```js
canvas.destroyChildren();
```

## 生命周期

在实例化时会进行初始化逻辑，随后可调用以下生命周期方法。

### ready

初始化工作完成后，返回一个 Promise，等价于监听 [CanvasEvent.READY](/zh/api/canvas/event#ready-事件) 事件：

```js
await canvas.ready;

// 等价于
import { CanvasEvent } from '@antv/g';
canvas.addEventListener(CanvasEvent.READY, () => {});
```

### render

渲染画布，由于渲染器默认开启了自动渲染，大多数情况下不需要手动调用。但有些场景需要手动控制渲染时机，此时可以进行[按需渲染](/zh/guide/diving-deeper/rendering-on-demand) [示例](/zh/examples/canvas/canvas-basic/#rendering-on-demand)：

```js
// 关闭自动渲染
const webglRenderer = new WebGLRenderer({
    enableAutoRendering: false,
});

canvas.render();
```

### destroy(destroyScenegraph = true)

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
