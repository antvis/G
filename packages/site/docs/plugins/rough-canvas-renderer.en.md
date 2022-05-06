---
title: g-plugin-rough-canvas-renderer
order: 3
---

Use [rough.js](https://roughjs.com/)(Canvas version), [demo](/zh/examples/plugins#rough)。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*BhrwSLGlqXcAAAAAAAAAAAAAARQnAQ" width="300">

## Getting started

To use `g-plugin-rough-canvas-renderer` instead of `g-plugin-canvas-renderer`, we should remove it and `g-plugin-canvas-picker` from `g-canvas` preset first.

The dirty-rectangle rendering won't work in this scenario, any change on display objects will cause fullscreen re-rendering.

```js
import { Canvas } from '@antv/g';
import { Renderer, CanvasRenderer, CanvasPicker } from '@antv/g-canvas';
import { Plugin as PluginRoughCanvasRenderer } from '@antv/g-plugin-rough-canvas-renderer';

// create a renderer
const renderer = new Renderer();

// fetch all plugins in `g-canvas` preset
const plugins = renderer.getPlugins();

// remove `g-plugin-canvas-renderer` & `g-plugin-canvas-picker`
[CanvasRenderer.Plugin, CanvasPicker.Plugin].forEach((pluginClazz) => {
  const index = plugins.findIndex((plugin) => plugin instanceof pluginClazz);
  plugins.splice(index, 1);
});

// register `g-plugin-rough-canvas-renderer`
plugins.push(new PluginRoughCanvasRenderer());
// or
// renderer.registerPlugin(new PluginRoughCanvasRenderer());

// create a canvas & use `g-canvas`
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});
```

## TODO

### Basic shapes

- [x] Group
- [x] Circle
- [x] Ellipse
- [ ] Rect, `radius` won't work
- [ ] Line
- [ ] Polyline
- [ ] Polygon
- [ ] Path
- [ ] Text
- [ ] Image

### Opacity

rough.js don't support `opacity` now, but we can augment it with `globalAlpha`.

### Picking

Maybe it's not necessary to pick target in a precise way.
