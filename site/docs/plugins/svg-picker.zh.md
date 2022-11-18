---
title: g-plugin-svg-picker
order: 6
---

提供基于 SVG 的拾取能力。

## 安装方式

`g-svg` 渲染器默认内置，因此无需手动引入。

```js
import { Renderer as SvgRenderer } from '@antv/g-svg';
// 创建 SVG 渲染器，其中内置了该插件
const svgRenderer = new SvgRenderer();
```

## 实现原理

直接使用 [elementFromPoint](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/elementFromPoint) 获取 `SVGElement`。找到后通过 `id` 查询 `DisplayObject` 返回。
