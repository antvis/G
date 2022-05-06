# @antv/g-plugin-rough-canvas-renderer

Use [rough.js](https://roughjs.com/)(Canvas version) to render sketchy styled shapes, inspired by [roughViz](https://github.com/jwilber/roughViz).

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

## Features

### Basic shapes

- [x] Group
- [x] Circle
- [x] Ellipse
- [x] Rect, `radius` won't work
- [x] Line
- [x] Polyline
- [x] Polygon
- [x] Path
- [x] Text
- [ ] Image

### Opacity

rough.js don't support `opacity` now, but we can augment it with `globalAlpha`.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*gl6ETYiyCCQAAAAAAAAAAAAAARQnAQ" width="200">

We can use `opacity` but not `fillOpacity` or `strokeOpacity` separately:

```js
circle.style.opacity = 0.5;
```

### Shadow

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*JKLVSrYk7BYAAAAAAAAAAAAAARQnAQ" width="300">

Shadow can also work:

```js
circle.style.shadowColor = '#000';
circle.style.shadowBlur = 0;
circle.style.shadowOffsetX = 0;
circle.style.shadowOffsetY = 0;
```

### Text & Image

Text & Image should be the same in `g-plugin-canvas-renderer`.

### Picking

Maybe it's not necessary to pick target in a precise way.
