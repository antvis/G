---
title: g-plugin-rough-svg-renderer
order: 3
---

使用 [rough.js](https://roughjs.com/) 的 SVG 版本进行手绘风格的渲染，[示例](/zh/examples/plugins#rough)。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*d4iiS5_3YVIAAAAAAAAAAAAAARQnAQ" width="500">

## 安装方式

首先需要使用 `g-svg` 渲染器，注册该插件，它会替换掉 [g-plugin-svg-renderer](/zh/plugins/svg-renderer) 中对于 2D 图形的渲染效果：

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-svg';
import { Plugin as PluginRoughSVGRenderer } from '@antv/g-plugin-rough-svg-renderer';

// create a renderer
const renderer = new Renderer();
renderer.registerPlugin(new PluginRoughSVGRenderer());

// create a canvas & use `g-svg`
const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer,
});
```

另外，我们支持所有 2D 图形，其中 [Text](/zh/api/basic/text)、[Image](/zh/api/basic/image) 和 [HTML](/zh/api/basic/html) 无手绘风格。

## 样式属性

除了 2D 图形的样式属性，rough.js 提供的配置项也可以使用。可以完全参考 [g-plugin-rough-canvas-renderer](/plugins/rough-canvas-renderer)。

## 拾取行为

非 `solid` 的填充样式会留下很多空白，这些空白区域并不会触发交互事件。这一点和 [g-plugin-canvas-renderer](/zh/plugins/canvas-renderer) 不一致。
