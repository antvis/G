---
title: 介绍
order: 0
redirect_from:
    - /zh
    - /zh/docs
    - /zh/docs/guide
---

-   G 是一款易用、高效、强大的 2D 可视化渲染引擎，提供 Canvas、SVG、WebGL 等多种渲染方式的实现。目前，已有多个顶级的可视化开源项目基于 G 开发，比如图形语法库 [G2](https://g2.antv.vision)、图可视化库 [G6](https://g6.antv.vision) 等。

## 特性

-   强大、可扩展的渲染能力，并内置常用的基础图形。
-   极致的渲染性能，支持大数据量的可视化场景。
-   完整模拟浏览器 DOM 的事件，与原生事件的表现无差异。
-   流畅的动画实现，以及丰富的配置接口。
-   同时提供 Canvas、SVG 和 WebGL 版本的实现，API 基本保持一致。

## 使用方式

目前我们支持 CDN 和 NPM Module 两种使用方式。

### CDN 方式

首先在 HTML 中引入 G 的核心和渲染器 UMD：

```html
<!-- G 核心 -->
<script
    src="https://unpkg.com/@antv/g@next/dist/index.umd.js"
    type="application/javascript"
></script>
<!-- G 渲染器，支持 Canvas2D/SVG/WebGL -->
<script
    src="https://unpkg.com/@antv/g-canvas@next/dist/index.umd.js"
    type="application/javascript"
></script>
<!-- <script src="https://unpkg.com/@antv/g-svg@next/dist/index.umd.js" type="application/javascript"></script>
<script src="https://unpkg.com/@antv/g-webgl@next/dist/index.umd.js" type="application/javascript"></script> -->
```

然后就可以在 `window.G` 的命名空间下使用 [Canvas](/zh/docs/api/canvas)、[Circle](/zh/docs/api/basic/circle) 这样的核心基础对象以及 [Canvas2D.Renderer](/zh/docs/api/renderer) 这样的渲染器：

```js
// 从核心包中引入画布、Circle 等对象
const { Circle, Canvas } = window.G;

// 创建一个渲染器，这里使用 Canvas2D
const canvasRenderer = new window.G.Canvas2D.Renderer();

// 创建画布
const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: canvasRenderer,
});

// 创建一个 Circle
const circle = new Circle({
    style: {
        r: 50,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 4,
        cursor: 'pointer',
    },
});

// 向画布中加入 Circle
canvas.appendChild(circle);
```

[完整 CodeSandbox 例子](https://codesandbox.io/s/yi-umd-xing-shi-shi-yong-g-701x5?file=/index.js)

### NPM Module

首先安装核心包和渲染器：

```bash
# 核心包
$ npm install @antv/g --save

# Canvas2D 渲染器
$ npm install @antv/g-canvas --save
# SVG 渲染器
$ npm install @antv/g-svg --save
# WebGL 渲染器
$ npm install @antv/g-webgl --save
```

然后就可以在核心包中使用 [Canvas](/zh/docs/api/canvas)、[Circle](/zh/docs/api/basic/circle) 这样的核心基础对象以及 [Renderer](/zh/docs/api/renderer) 这样的渲染器：

```js
import { Canvas, Circle } from '@antv/g';
import { Renderer } from '@antv/g-canvas';

const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: new Renderer(),
});

const circle = new Circle({
    style: {
        r: 50,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 4,
        cursor: 'pointer',
    },
});

canvas.appendChild(circle);
```
