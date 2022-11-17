---
title: OffscreenCanvas 和服务端渲染
order: 9
---

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

3. [cursor](/zh/api/basic/display-object#鼠标样式) 鼠标样式显然无法在 Worker 中应用。我们可以在拾取到图形时在 Worker 中通过 `postMessage` 告知主线程修改 `<canvas>` 上的鼠标样式。

## 服务端渲染

依据不同的渲染器，我们提供了以下服务端渲染方案：

-   [g-canvas + node-canvas](/zh/api/renderer/canvas#服务端渲染)
-   [g-svg + JSDOM](/zh/api/renderer/svg#服务端渲染)
-   [g-webgl + headless-gl]()

目前我们在[集成测试](https://github.com/antvis/g/tree/next/integration/__node__tests__/)中使用它们。
