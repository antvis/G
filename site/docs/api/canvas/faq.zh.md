---
title: 常见问题
order: 100
---

## 多个画布共存

在同一个页面中，多个画布可以共存，即可以同时存在多个“平行世界”。但受限于底层渲染 API，例如 WebGL 只允许至多 8 个上下文。[示例](/zh/examples/canvas/container/#multi-canvas)

## 使用创建好的 canvas 元素

在该 [示例](/zh/examples/canvas/container/#user-defined-canvas) 中，我们自行创建 `<canvas>` 元素，用它来创建画布：

```js
const $canvas = document.createElement('canvas');
$canvas.width = 600;
$canvas.height = 500;
document.getElementById('container').appendChild($canvas);

const canvas = new Canvas({
    canvas: $canvas,
    renderer: new CanvasRenderer(),
});
```
