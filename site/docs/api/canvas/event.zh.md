---
title: 画布事件
order: 8
---

在[事件系统](/zh/api/event/intro)中，大部分事件都会冒泡直至画布。例如我们在如下简单场景下点击 Circle，可以查看事件的传播路径依次为：

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

更多事件相关操作详见[事件系统](/zh/api/event/intro)

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
// 或者
canvas.addEventListener('ready', () => {
    canvas.appendChild(circle);
});
```

除了监听 `ready` 事件，还可以选择[等待 ready 这个 Promise](/zh/api/canvas/scenegraph-lifecycle#ready)：

```js
await canvas.ready;
canvas.appendChild(circle);
```
