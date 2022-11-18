---
title: g-plugin-svg-picker
order: 6
---

Provides SVG-based pickup capability.

## Usage

The [g-svg](/en/api/renderer/svg) renderer is built in by default, so there is no need to introduce it manually.

```js
import { Renderer as SvgRenderer } from '@antv/g-svg';
// Create a renderer with the plugin built in
const svgRenderer = new SvgRenderer();
```

## Principle of implementation

Get `SVGElement` directly using [elementFromPoint](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/elementFromPoint). Find it and query `DisplayObject` by `id` to return it.
