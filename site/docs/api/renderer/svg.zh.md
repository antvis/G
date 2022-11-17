---
title: SVG 渲染器
order: 1
---

使用 [SVG](https://developer.mozilla.org/zh-CN/Web/SVG) 绘制 2D 图形。会在容器中创建一个 `<svg>` 元素。

SVG 在文本渲染上直接依赖浏览器的能力，因而有独特的优势。另外通过 `<foreignObject>` 也可以嵌入 HTML 片段。

## 使用方式

和 `@antv/g` 一样，也有以下两种使用方式。

### NPM Module

安装 `@antv/g-svg` 后可以从中获取渲染器：

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-svg';

const svgRenderer = new Renderer();

const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: svgRenderer,
});
```

### CDN 方式

```html
<script
  src="https://unpkg.com/@antv/g-svg/dist/index.umd.min.js"
  type="application/javascript">
```

从 `G.SVG` 命名空间下可以获取渲染器：

```js
const svgRenderer = new window.G.SVG.Renderer();
```

## 初始化配置

在创建渲染器时，可以传入一些初始化配置项，例如：

```js
import { Renderer } from '@antv/g-svg';
const renderer = new Renderer({
    outputSVGElementId: false,
});
```

### outputSVGElementId

该渲染器在生成 SVGElement 时会添加 `id` 属性，用于交互时拾取判定反查元素。但在服务端渲染这样的场景下，不存在交互也就无需生成，此时可通过该配置项关闭。

```html
<!-- 默认开启 -->
<g id="g_svg_g_450" fill="none"></g>

<!--关闭后 -->
<g fill="none"></g>
```

## 插件列表

该渲染器内置了以下插件：

-   [g-plugin-svg-renderer](/zh/plugins/svg-renderer) 使用 SVG 元素绘制图形，例如 `<circle>` `<rect>` 等
-   [g-plugin-svg-picker](/zh/plugins/svg-picker) 基于 [elementFromPoint](https://developer.mozilla.org/zh-CN/Web/API/Document/elementFromPoint) DOM API 拾取图形
-   [g-plugin-dom-interaction](/zh/plugins/dom-interaction) 基于 DOM API 绑定事件

## 可选插件

除了内置插件，还有以下可选插件。

### 手绘风格渲染

使用 [rough.js](https://roughjs.com/) 的 SVG 版本进行手绘风格的渲染。

我们提供了 [g-plugin-rough-svg-renderer](/zh/plugins/rough-svg-renderer) 插件，注册后会替换掉 [g-plugin-svg-renderer](/zh/plugins/svg-renderer) 对于部分 2D 图形的渲染能力。

[示例](/zh/examples/plugins/rough/#rough)效果如下：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*d4iiS5_3YVIAAAAAAAAAAAAAARQnAQ" width="500">

## 服务端渲染

该渲染器依赖 SVG DOM API 的渲染能力，并不局限在浏览器端，因此也可以使用 [JSDOM](https://github.com/jsdom/node-jsdom) 进行服务端渲染。

在我们的[集成测试](https://github.com/antvis/g/tree/next/integration/__node__tests__/svg)中，会在 Node 端配合 [JSDOM](https://github.com/jsdom/node-jsdom) 与 [node-canvas](https://github.com/Automattic/node-canvas) 渲染结果图片，与基准图片进行比对。其他服务端渲染场景也可以按照以下步骤进行：

1. 使用 [unregisterPlugin](/zh/api/renderer/renderer#unregisterplugin) 卸载掉 [g-svg](/zh/api/renderer/svg) 中内置的与 DOM API 相关的插件，例如负责事件绑定的 [g-plugin-dom-interaction](/zh/plugins/dom-interaction)
2. 使用 JSDOM 创建一个画布容器
3. 使用上一步的容器创建画布，同时传入 JSDOM 创建的 `document`，代替浏览器环境中的 `window.document`，`raf` 同理。
4. 正常使用 [g-svg](/zh/api/renderer/svg) 渲染器，通过 G 的 API 创建场景
5. 使用 [xmlserializer](https://www.npmjs.com/package/xmlserializer) 将 JSDOM 序列化成字符串，保存成 SVG 图片

https://github.com/antvis/g/blob/next/integration/__node__tests__/svg/circle.spec.js

```js
const fs = require('fs');
const { JSDOM } = require('jsdom');
const xmlserializer = require('xmlserializer');
const { Circle, Canvas } = require('@antv/g');
const { Renderer } = require('@antv/g-svg');

// create a renderer, unregister plugin relative to DOM
const renderer = new Renderer();
const domInteractionPlugin = renderer.getPlugin('dom-interaction');
renderer.unregisterPlugin(domInteractionPlugin);

// create JSDOM
const dom = new JSDOM(`
<div id="container">
</div>
`);

const SIZE = 200;
const canvas = new Canvas({
    container: 'container',
    width: SIZE,
    height: SIZE,
    renderer,
    document: dom.window.document, // use document created by JSDOM
    requestAnimationFrame: dom.window.requestAnimationFrame,
    cancelAnimationFrame: dom.window.cancelAnimationFrame,
});

// use G API constructing scene graph
const circle1 = new Circle({
    style: {
        cx: 10,
        cy: 10,
        r: 10,
        fill: 'red',
    },
});
canvas.appendChild(circle1);

// serialize JSDOM to SVG string
xmlserializer.serializeToString(
    dom.window.document.getElementById('container').children[0],
);
```
