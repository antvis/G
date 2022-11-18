---
title: 开始使用
order: 0
redirect_from:
    - /zh
    - /zh
    - /zh/guide
---

![CI](https://github.com/antvis/g/workflows/CI/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/antvis/g/badge.svg?branch=next)](https://coveralls.io/github/antvis/g?branch=next)

![](https://img.shields.io/badge/language-typescript-blue.svg) ![](https://img.shields.io/badge/license-MIT-000000.svg)

[![npm package](https://img.shields.io/npm/v/@antv/g)](https://www.npmjs.com/package/@antv/g) [![npm downloads](http://img.shields.io/npm/dm/@antv/g)](https://www.npmjs.com/package/@antv/g) [![Percentage of issues still open](http://isitmaintained.com/badge/open/antvis/g.svg)](http://isitmaintained.com/project/antvis/g 'Percentage of issues still open') [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=shields)](https://github.com/antvis/g/pulls)

G 作为 AntV 底层的渲染引擎，致力于为上层产品提供一致、高性能的 2D / 3D 图形渲染能力，适配 Web 端全部底层渲染 API（Canvas2D / SVG / WebGL / WebGPU / CanvasKit）。特别的，针对图场景下适合并行计算的算法提供 GPGPU 支持。

<p>
  <a href="/zh/examples/ecosystem#d3-force-directed-graph"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*PovRRJtsBMIAAAAAAAAAAAAAARQnAQ" /></a>
<a href="/zh/examples/ecosystem#d3-barchart"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*h6vDS6eRVFoAAAAAAAAAAAAAARQnAQ" /></a>
<a href="/zh/examples/plugins#rough-d3-barchart"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*aJaFSrYOLXMAAAAAAAAAAAAAARQnAQ" /></a>
<a href="/zh/examples/plugins#yoga-text"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*IH1fSJN9fsMAAAAAAAAAAAAAARQnAQ" /></a>
<a href="/zh/examples/plugins#box2dt"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Qw5OQLGQy_4AAAAAAAAAAAAAARQnAQ" /></a>
<a href="/zh/examples/plugins#rough"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*d4iiS5_3YVIAAAAAAAAAAAAAARQnAQ" /></a>
<a href="/zh/examples/plugins#skottie"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_usaTqSm6vYAAAAAAAAAAAAAARQnAQ" /></a>
<a href="/zh/examples/plugins#canvaskit-particles"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*919sR5Oxx_kAAAAAAAAAAAAAARQnAQ" /></a>
<a href="/zh/examples/3d#sphere"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*bsj2S4upLBgAAAAAAAAAAAAAARQnAQ" /></a>
<a href="/zh/examples/3d#force-3d"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*3XFxQKWOeKoAAAAAAAAAAAAAARQnAQ" /></a>

</p>

## 特性

**易用的 API**。其中图形、事件系统兼容 DOM Element & Event API，动画系统兼容 Web Animations API。可以以极低的成本适配 Web 端已有的生态例如 D3、Hammer.js 手势库等。

**适配多种渲染环境**。支持 Canvas2D / SVG / WebGL / WebGPU / CanvasKit 以及运行时切换，并支持服务端渲染。

**高性能的渲染与计算**。为可并行算法提供基于 WebGPU 的 GPGPU 支持。[webgpu-graph](/zh/api/gpgpu/webgpu-graph) 使用 GPU 加速的图分析算法库。

可扩展的插件机制以及丰富的插件集：

-   渲染相关
    -   [g-plugin-canvas-renderer](/zh/plugins/canvas-renderer) 基于 Canvas2D 渲染 2D 图形
    -   [g-plugin-canvaskit-renderer](/zh/plugins/canvaskit-renderer) 基于 [Skia](https://skia.org/docs/user/modules/quickstart) 渲染 2D 图形
    -   [g-plugin-svg-renderer](/zh/plugins/svg-renderer) 基于 SVG 渲染 2D 图形
    -   [g-plugin-device-renderer](/zh/plugins/device-renderer) 基于 GPUDevice 渲染 2D 图形
    -   [g-plugin-html-renderer](/zh/plugins/html-renderer) 渲染 DOM 元素
    -   [g-plugin-3d](/zh/plugins/3d) 基于 g-plugin-device-renderer 扩展 3D 能力
    -   [g-plugin-rough-canvas-renderer](/zh/plugins/rough-canvas-renderer) 使用 [rough.js](https://roughjs.com/) 和 Canvas2D 进行手绘风格渲染
    -   [g-plugin-rough-svg-renderer](/zh/plugins/rough-svg-renderer) 使用 [rough.js](https://roughjs.com/) 和 SVG 进行手绘风格渲染
-   拾取
    -   [g-plugin-canvas-picker](/zh/plugins/canvas-picker) 基于 Canvas2D
    -   [g-plugin-svg-picker](/zh/plugins/svg-picker) 基于 SVG
-   无障碍
    -   [g-plugin-a11y](/zh/plugins/a11y) 提供文本提取、Screen Reader、键盘导航等无障碍功能
-   交互
    -   [g-plugin-dom-interaction](/zh/plugins/dom-interaction) 基于 DOM API 绑定事件
    -   [g-plugin-control](/zh/plugins/control) 为 3D 场景提供相机交互
    -   [g-plugin-dragndrop](/zh/plugins/dragndrop) 基于 PointerEvents 提供 Drag 'n' Drop
    -   [g-plugin-annotation](/zh/plugins/annotation) 提供基础图形的绘制和编辑能力，类似 Fabric.js 和 Konva.js
-   物理引擎
    -   [g-plugin-box2d](/zh/plugins/box2d) 基于 Box2D
    -   [g-plugin-matterjs](/zh/plugins/matterjs) 基于 matter.js
    -   [g-plugin-physx](/zh/plugins/physx) 基于 PhysX
-   布局引擎
    -   [g-plugin-yoga](/zh/plugins/yoga) 基于 Yoga 提供 Flex 布局能力
-   GPGPU
    -   [g-plugin-gpgpu](/zh/plugins/gpgpu) 基于 WebGPU 提供 GPGPU 能力
-   CSS 选择器
    -   [g-plugin-css-select](/zh/plugins/css-select) 支持使用 CSS 选择器在场景图中检索

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

然后就可以在 `window.G` 的命名空间下使用 [Canvas](/zh/api/canvas)、[Circle](/zh/api/basic/circle) 这样的核心基础对象以及 [Canvas2D.Renderer](/zh/api/renderer) 这样的渲染器：

```js
// 从核心包中引入画布、Circle 等对象
const { Circle, Canvas, CanvasEvent } = window.G;

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

// 等待画布初始化完成
canvas.addEventListener(CanvasEvent.READY, () => {
    // 向画布中加入 Circle
    canvas.appendChild(circle);
});
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

然后就可以在核心包中使用 [Canvas](/zh/api/canvas)、[Circle](/zh/api/basic/circle) 这样的核心基础对象以及 [Renderer](/zh/api/renderer) 这样的渲染器：

```js
import { Canvas, CanvasEvent, Circle } from '@antv/g';
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

canvas.addEventListener(CanvasEvent.READY, () => {
    canvas.appendChild(circle);
});
```

[完整 CodeSandbox 例子](https://codesandbox.io/s/yi-npm-module-xing-shi-shi-yong-g-wjfux?file=/index.js)

[完整 Stackblitz 例子](https://stackblitz.com/edit/vitejs-vite-nnas74?file=src/main.ts)
