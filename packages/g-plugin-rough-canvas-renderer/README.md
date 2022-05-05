# @antv/g-plugin-rough-canvas-renderer

Use [rough.js](https://roughjs.com/)(Canvas version).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*BhrwSLGlqXcAAAAAAAAAAAAAARQnAQ" width="300">

## Getting started

We should remove `g-plugin-canvas-renderer` & `g-plugin-canvas-picker` from `g-canvas` first.

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

Basic shapes:

- [x] Group
- [x] Circle
- [x] Ellipse
- [ ] Rect
- [ ] Image
- [ ] Line
- [ ] Polyline
- [ ] Polygon
- [ ] Path
- [ ] Text
