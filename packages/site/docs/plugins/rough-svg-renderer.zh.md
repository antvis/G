---
title: g-plugin-rough-svg-renderer
order: 3
---

使用 [rough.js](https://roughjs.com/) 的 SVG 版本进行手绘风格的渲染，[示例](/zh/examples/plugins#rough)。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*d4iiS5_3YVIAAAAAAAAAAAAAARQnAQ" width="500">

## 安装方式

首先需要使用 `g-svg` 渲染器，注册该插件，它会替换掉 [g-plugin-svg-renderer](/zh/docs/plugins/svg-renderer) 中对于 2D 图形的渲染效果：

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

另外，我们支持所有 2D 图形，其中 [Text](/zh/docs/api/basic/text)、[Image](/zh/docs/api/basic/image) 和 [HTML](/zh/docs/api/basic/html) 无手绘风格。

## 样式属性

除了 2D 图形的样式属性，rough.js 提供的配置项也可以使用。

### opacity

rough.js 并不支持 `opacity`，这一点和 [g-plugin-canvas-renderer](/zh/docs/plugins/canvas-renderer) 一样。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*gl6ETYiyCCQAAAAAAAAAAAAAARQnAQ" width="200">

但需要注意的是，由于 rough.js 未开放相关配置项，因此 `fillOpacity` 和 `strokeOpacity` 并不生效：

```js
circle.style.opacity = 0.5;
```

### shadow

rough.js 并不支持 `shadow` 相关效果，但我们提供了相关效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*JKLVSrYk7BYAAAAAAAAAAAAAARQnAQ" width="300">

配置项可以参考 [阴影](/zh/docs/api/basic/display-object#阴影)：

```js
circle.style.shadowColor = '#000';
circle.style.shadowBlur = 0;
circle.style.shadowOffsetX = 0;
circle.style.shadowOffsetY = 0;
```

### rough.js 相关属性

rough.js 提供了很多影响手绘效果的配置项，都可以正常使用：

https://github.com/rough-stuff/rough/wiki#options

例如我们可以修改填充风格，在该 [示例](/zh/examples/plugins#rough) 中可以调节更多配置项：

```js
circle.style.fillStyle = 'zigzag';
```

## 拾取行为

非 `solid` 的填充样式会留下很多空白，这些空白区域并不会触发交互事件。这一点和 [g-plugin-canvas-renderer](/zh/docs/plugins/canvas-renderer) 不一致。
