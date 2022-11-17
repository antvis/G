---
title: 按需渲染
order: 100
---

在大多数场景下，渲染引擎会自动在每一帧重绘，但在部分场景下，我们需要自己决定重绘的时机。

首先我们需要关闭渲染器的“自动渲染”：

```javascript
const webglRenderer = new WebGLRenderer({
    // 关闭自动渲染
    enableAutoRendering: false,
});
```

然后在合适的实际调用画布的[重绘方法](/zh/api/canvas#render)，例如手动在 `rAF` 中调用：

```javascript
// create a main loop
const tick = () => {
    // call `render` in each frame
    canvas.render();
    requestAnimationFrame(tick);
};
tick();
```
