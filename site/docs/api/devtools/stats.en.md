---
title: 内置的渲染统计信息
order: 1
---

G 内置了一些渲染相关的统计信息，可以通过 `canvas.getStats` 获取，例如在每一帧中获取：

```js
import { CanvasEvent } from '@antv/g';

canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
    canvas.getStats(); // { total: 0, rendered: 0 }
});
```

目前包含的统计信息如下：

-   total 当前帧中需要渲染的图形总数
-   rendered 当前帧中实际渲染的图形数目

其中 total 不一定等于当前场景中包含的图形数量，例如相比上一帧，当前帧所有图形都没有发生变化，此时不应该发生重绘，total 为 0。

在某些情况下 rendered 会比 total 少，例如图形被剔除（处于视口 / 视锥范围之外）。
