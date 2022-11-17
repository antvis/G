---
title: g-plugin-canvas-picker
order: 4
---

Provides Canvas2D-based pickup capabilities.

## Usage

The [g-canvas](/en/api/renderer/canvas) renderer is built in by default, so there is no need to introduce it manually.

```js
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
// Create a renderer with the plugin built in
const canvasRenderer = new CanvasRenderer();
```

## Principle of implementation

Pickups based on the Canvas2D API implementation.

1. Use the R-Tree spatial index to find a series of graph bounding boxes hit by a pickup point
2. Find the topmost graph among these graphs, based on the `z-index`
3. Use mathematical calculations to determine precisely whether the figure is hit or miss, e.g. Circle measures whether the distance to the center of the circle is less than the radius

The solution is CPU-based, so the optimization point is whether the enclosing box intersection operation is fast enough.
