---
title: g-plugin-canvas-picker
order: 4
---

提供基于 Canvas2D 的拾取能力。

## 安装方式

`g-canvas` 渲染器默认内置，因此无需手动引入。

```js
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
// 创建 Canvas 渲染器，其中内置了该插件
const canvasRenderer = new CanvasRenderer();
```

## 实现原理

基于 Canvas2D API 实现的拾取：

1. 使用 R-Tree 空间索引查找拾取点命中的一系列图形包围盒
2. 在这些图形中找到最顶层的一个图形，依据 `z-index`
3. 使用数学计算精确判定是否命中该图形，例如 Circle 测算到圆心距离是否小于半径

该方案基于 CPU，因此优化点在于包围盒相交运算是否足够快。
