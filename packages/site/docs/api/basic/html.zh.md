---
title: HTML 容器
order: 9
---

有时我们需要在画布上增加一些 HUD（Head-Up Display），例如 Tooltip。

在 g-svg 中使用 foreignObject

```js
const html = new HTML({
    style: {
        html: '<h1>This is Title</h1>',
    },
});
```
