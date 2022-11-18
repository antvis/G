---
title: OffscreenCanvas & Server-side Rendering
order: 9
---

## Using OffscreenCanvas in WebWorker

You may have seen some applications of the rendering engine:

-   Babylon.js https://doc.babylonjs.com/divingDeeper/scene/offscreenCanvas
-   Three.js https://r105.threejsfundamentals.org/threejs/lessons/threejs-offscreencanvas.html

We will use OffscreenCanvas in the following two scenarios, mainly using the Worker to relieve the main thread:

1. GPGPU 配合 g-webgl 和 g-plugin-gpgpu 使用，例如上层的图分析算法库
2. g-webgl 在 Worker 中渲染，同步结果到主线程

In this [example](/en/examples/canvas#offscreen-canvas) we demonstrate the second use, creating `<canvas>` in the main thread, transferring control to the WebWorker via `transferControlToOffscreen()`, and subsequently completing the rendering in the WebWorker and synchronizing the results to the main thread.

```js
// main thread
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

It's worth noting that OffscreenCanvas doesn't have event listening capabilities, our interactions happen on the `<canvas>` element in the main thread, so when the mouse click event is listened to, how do we know which shape in OffscreenCanvas hit?

We can achieve this by:

1.  Listen for interaction events on `<canvas>` and pass them to the worker via `postMessage` when triggered. Note that you can't pass a native event object like [PointerEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/ PointerEvent), it will report the following error when serializing. The correct approach is to extract the key properties of the native event object (e.g. `clientX/Y`) and pass them.

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

2. Trigger the interaction event hook provided by the G rendering service in the worker, e.g. call the `pointerDown` hook when receiving the `pointerdown` signal from the main thread.

```js
export function triggerEvent(event, ev) {
    if (event === 'pointerdown') {
        canvas.getRenderingService().hooks.pointerDown.call(ev);
    }
}
```

3. [cursor](/en/api/basic/display-object#鼠标样式) The mouse style obviously cannot be applied in the worker. We can tell the main thread to change the mouse style on `<canvas>` via `postMessage` in the Worker when we pick up the image.

## Server-side rendering

Depending on the renderer, we offer the following server-side rendering options:

-   [g-canvas + node-canvas](/en/api/renderer/canvas#服务端渲染)
-   [g-svg + JSDOM](/en/api/renderer/svg#服务端渲染)
-   [g-webgl + headless-gl]()

We currently use them in [integration tests](https://github.com/antvis/g/tree/next/integration/__node__tests__/).
