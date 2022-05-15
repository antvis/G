---
title: SVG 渲染器
order: 1
---

使用 [SVG](https://developer.mozilla.org/zh-CN/docs/Web/SVG) 绘制 2D 图形。会在容器中创建一个 `<svg>` 元素。

SVG 在文本渲染上直接依赖浏览器的能力，因而有独特的优势。另外通过 `<foreignObject>` 也可以嵌入 HTML 片段。

# 使用方式

和 `@antv/g` 一样，也有以下两种使用方式。

## NPM Module

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

## CDN 方式

```html
<script
  src="https://unpkg.com/@antv/g-svg/dist/index.umd.min.js"
  type="application/javascript">
```

从 `G.SVG` 命名空间下可以获取渲染器：

```js
const svgRenderer = new window.G.SVG.Renderer();
```

# 插件列表

该渲染器内置了以下插件：

-   [g-plugin-svg-renderer](/zh/docs/plugins/svg-renderer) 使用 SVG 元素绘制图形，例如 `<circle>` `<rect>` 等
-   [g-plugin-svg-picker](/zh/docs/plugins/svg-picker) 基于 [elementFromPoint](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/elementFromPoint) DOM API 拾取图形
-   [g-plugin-dom-interaction](/zh/docs/plugins/dom-interaction) 基于 DOM API 绑定事件
