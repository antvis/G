---
title: HTML 内容
order: 9
---

有时我们需要在画布上增加一些 HUD（Head-Up Display），例如 Tooltip。此时用 HTML + CSS 展现相比使用基础图形绘制有以下优势：

-   很多原生 HTML 组件难以绘制，例如一些输入类组件 `<input>` `<select>`
-   部分 HTML 原生特性难以实现，例如使用 g-canvas/webgl 绘制文本后无法选中，而如果用 HTML 展示文本就可以

```js
const html = new HTML({
    style: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        html: '<h1>This is Title</h1>',
    },
});
```

在实现中 g-canvas/webgl 会将 HTML 内容包裹在 `<div>` 中，以 `<canvas>` 的兄弟节点放在容器内。而在 g-svg 中使用 `<foreignObject>` 放入

```html
// g-canvas/webgl 的 DOM 结构
<div id="container">
    <canvas></canvas>
    <div>...</div>
</div>

// g-svg 的 DOM 结构
```

# 额外属性

## width

**类型**： `number`

**默认值**：无

**是否必须**：`true`

**说明**：内容宽度

## height

**类型**： `number`

**默认值**：无

**是否必须**：`true`

**说明**：内容高度

# 注意事项
