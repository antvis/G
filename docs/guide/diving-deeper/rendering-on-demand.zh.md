---
title: 按需渲染
order: 1
---

在大多数场景下，渲染引擎会自动在每一帧重绘，但在部分场景下，我们需要自己决定重绘的时机。

首先我们需要关闭“自动渲染”：

```javascript
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  autoRendering: false, // 关闭自动渲染
});
```

然后在合适的实际调用重绘方法，例如手动在 `rAF` 中调用：

```javascript
// create a main loop
const tick = () => {
  // call `render` in each frame
  canvas.render();
  requestAnimationFrame(tick);
};
tick();
```
