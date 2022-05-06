---
title: g-plugin-rough-canvas-renderer
order: 3
---

使用 [rough.js](https://roughjs.com/) 的 Canvas 版本绘制，[示例](/zh/examples/plugins#rough)。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*BhrwSLGlqXcAAAAAAAAAAAAAARQnAQ" width="300">

## 安装方式

首先需要从 `g-canvas` 中移除 [g-plugin-canvas-renderer](/zh/docs/plugins/canvas-renderer) 和 [g-plugin-canvas-picker](/zh/docs/plugins/canvas-picker) 两个插件。

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

需要注意的是一旦使用该插件，“脏矩形渲染”便无法使用，这意味着任何图形的任何样式属性改变，都会导致画布的全量重绘。

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

rough.js 并不支持 `opacity`，但我们可以通过 `globalAlpha` 实现，这一点和 [g-plugin-canvas-renderer](/zh/docs/plugins/canvas-renderer) 一样。

### Picking

在 [g-plugin-canvas-picker](/zh/docs/plugins/canvas-picker) 中我们使用空间索引快速过滤，再配合图形几何定义的数学计算完成精确拾取。

但在手绘风格下，似乎无法也没必要做精确拾取。
