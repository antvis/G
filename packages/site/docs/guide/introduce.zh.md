---
title: 介绍
order: 0
redirect_from:
    - /zh
    - /zh/docs
    - /zh/docs/guide
---

G 作为 AntV 底层的渲染引擎，致力于为上层产品提供一致、高性能的 2D / 3D 图形渲染能力，适配 Web 端全部底层渲染 API（Canvas2D / SVG / WebGL / WebGPU）。

特别的，针对图场景下适合并行计算的算法提供 GPGPU 支持。

## 特性

-   更易用的 API。其中图形、事件系统兼容 DOM API，动画兼容 Web Animation API，自定义图形 CustomElement API。
-   适配 Web 端全部渲染环境。支持 Canvas2D / SVG / WebGL / WebGPU。
-   高性能的渲染与计算。为可并行算法提供 GPGPU 支持。
-   可扩展插件机制。

完整 [API Spec](/api.html)。

## 使用方式

目前我们支持 CDN 和 NPM Module 两种使用方式。

### CDN 方式

首先在 HTML 中引入 G 的核心和渲染器 UMD：

```html
<!-- G 核心 -->
<script
    src="https://unpkg.com/@antv/g/dist/index.umd.min.js"
    type="application/javascript"
></script>
<!-- G 渲染器，支持 Canvas2D/SVG/WebGL -->
<script
    src="https://unpkg.com/@antv/g-canvas/dist/index.umd.min.js"
    type="application/javascript"
></script>
<!-- <script src="https://unpkg.com/@antv/g-svg/dist/index.umd.min.js" type="application/javascript"></script>
<script src="https://unpkg.com/@antv/g-webgl/dist/index.umd.min.js" type="application/javascript"></script> -->
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

[完整 CodeSandbox 例子](https://codesandbox.io/s/yi-npm-module-xing-shi-shi-yong-g-wjfux?file=/index.js)
