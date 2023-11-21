[English](./README.md) | 简体中文

# G

![CI](https://github.com/antvis/g/workflows/CI/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/antvis/g/badge.svg?branch=next)](https://coveralls.io/github/antvis/g?branch=next) [![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](#badge)

![TypeScript](https://img.shields.io/badge/language-typescript-blue.svg) ![License](https://img.shields.io/badge/license-MIT-000000.svg)

[![npm package](https://img.shields.io/npm/v/@antv/g)](https://www.npmjs.com/package/@antv/g) [![npm downloads](http://img.shields.io/npm/dm/@antv/g)](https://www.npmjs.com/package/@antv/g) [![Percentage of issues still open](http://isitmaintained.com/badge/open/antvis/g.svg)](http://isitmaintained.com/project/antvis/g 'Percentage of issues still open') [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=shields)](https://github.com/antvis/g/pulls)

一款高效易用的可视化渲染引擎。

<p>
  <a href="https://g.antv.antgroup.com/examples/ecosystem/d3/#d3-force-directed-graph"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*PovRRJtsBMIAAAAAAAAAAAAAARQnAQ" alt="D3 force directed graph"/></a>
<a href="https://g.antv.antgroup.com/zh/examples/ecosystem/d3/#d3-barchart"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*h6vDS6eRVFoAAAAAAAAAAAAAARQnAQ" alt="D3 barchart"/></a>
<a href="https://g.antv.antgroup.com/zh/examples/plugins/rough/#rough-d3-barchart"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*aJaFSrYOLXMAAAAAAAAAAAAAARQnAQ" alt="D3 sketchy barchart"/></a>
<a href="https://g.antv.antgroup.com/zh/examples/plugins/yoga/#yoga-text"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*IH1fSJN9fsMAAAAAAAAAAAAAARQnAQ" alt="Yoga plugin"/></a>
<a href="https://g.antv.antgroup.com/zh/examples/plugins/physics-engine/#box2d"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Qw5OQLGQy_4AAAAAAAAAAAAAARQnAQ" alt="Box2D physics engine plugin"/></a>
<a href="https://g.antv.antgroup.com/zh/examples/plugins/rough/#rough"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*d4iiS5_3YVIAAAAAAAAAAAAAARQnAQ" alt="Rough.js plugin"/></a>
<a href="https://g.antv.antgroup.com/zh/examples/plugins/canvaskit/#skottie"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_usaTqSm6vYAAAAAAAAAAAAAARQnAQ" alt="Canvaskit plugin"/></a>
<a href="https://g.antv.antgroup.com/zh/examples/plugins/canvaskit/#canvaskit-particles"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*919sR5Oxx_kAAAAAAAAAAAAAARQnAQ" alt="Yoga plugin"/></a>
<a href="https://g.antv.antgroup.com/zh/examples/3d/geometry/#sphere"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*bsj2S4upLBgAAAAAAAAAAAAAARQnAQ" alt="Canvaskit plugin"/></a>
<a href="https://g.antv.antgroup.com/zh/examples/3d/3d-basic/#force-3d"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*3XFxQKWOeKoAAAAAAAAAAAAAARQnAQ" alt="3D force directed graph"/></a>
</p>

## ✨ 特性

-   更易用的 API。其中图形、事件系统兼容 DOM Element & Event API，动画系统兼容 Web Animations API。可以以极低的成本适配 Web 端已有的生态例如 D3、Hammer.js 手势库等。
-   适配 Web 端多种渲染环境。支持 Canvas2D / SVG / CanvasKit / WebGL / WebGPU 以及运行时切换，并支持服务端渲染。
-   高性能的渲染与计算。为可并行算法提供基于 WebGPU 的 GPGPU 支持。
    -   [webgpu-graph](https://g-next.antv.vision/zh/docs/api/gpgpu/webgpu-graph) 使用 GPU 加速的图分析算法库
-   可扩展的插件机制以及丰富的插件集：
    -   渲染相关
        -   [g-plugin-canvas-renderer](https://g-next.antv.vision/zh/docs/plugins/canvas-renderer) 基于 Canvas2D 渲染 2D 图形
        -   [g-plugin-svg-renderer](https://g-next.antv.vision/zh/docs/plugins/svg-renderer) 基于 SVG 渲染 2D 图形
        -   [g-plugin-device-renderer](https://g-next.antv.vision/zh/docs/plugins/device-renderer) 基于 GPUDevice 渲染 2D 图形
        -   [g-plugin-html-renderer](https://g-next.antv.vision/zh/docs/plugins/html-renderer) 渲染 DOM 元素
        -   [g-plugin-3d](https://g-next.antv.vision/zh/docs/plugins/3d) 基于 g-plugin-device-renderer 扩展 3D 能力
        -   [g-plugin-rough-canvas-renderer](https://g-next.antv.vision/zh/docs/plugins/rough-canvas-renderer) 使用 [rough.js](https://roughjs.com/) 和 Canvs2D 进行手绘风格渲染
        -   [g-plugin-rough-svg-renderer](https://g-next.antv.vision/zh/docs/plugins/rough-svg-renderer) 使用 [rough.js](https://roughjs.com/) 和 SVG 进行手绘风格渲染
        -   [g-plugin-canvaskit-renderer](https://g-next.antv.vision/zh/docs/plugins/canvaskit-renderer) 基于 [Skia](https://skia.org/docs/user/modules/quickstart) 渲染 2D 图形
    -   拾取
        -   [g-plugin-canvas-picker](https://g-next.antv.vision/zh/docs/plugins/canvas-picker) 基于 Canvas2D
        -   [g-plugin-svg-picker](https://g-next.antv.vision/zh/docs/plugins/svg-picker) 基于 SVG
    -   交互
        -   [g-plugin-dom-interaction](https://g-next.antv.vision/zh/docs/plugins/dom-interaction) 基于 DOM API 绑定事件
        -   [g-plugin-control](https://g-next.antv.vision/zh/docs/plugins/control) 为 3D 场景提供相机交互
        -   [g-plugin-dragndrop](https://g-next.antv.vision/en/docs/plugins/dragndrop) 基于 PointerEvents 提供 Drag 'n' Drop
    -   物理引擎
        -   [g-plugin-box2d](https://g-next.antv.vision/zh/docs/plugins/box2d) 基于 Box2D
        -   [g-plugin-matterjs](https://g-next.antv.vision/zh/docs/plugins/matterjs) 基于 matter.js
        -   [g-plugin-physx](https://g-next.antv.vision/zh/docs/plugins/physx) 基于 PhysX
    -   布局引擎
        -   [g-plugin-yoga](https://g-next.antv.vision/zh/docs/plugins/yoga) 基于 Yoga 提供 Flex 布局能力
    -   GPGPU
        -   [g-plugin-gpgpu](https://g-next.antv.vision/zh/docs/plugins/gpgpu) 基于 WebGPU 提供 GPGPU 能力
    -   CSS 选择器
        -   [g-plugin-css-select](https://g-next.antv.vision/zh/docs/plugins/css-select) 支持使用 CSS 选择器在场景图中检索

## 📦 安装

```bash
# 安装核心包
$ npm install @antv/g --save
# Canvas 渲染器
$ npm install @antv/g-canvas --save
# SVG 渲染器
$ npm install @antv/g-svg --save
# WebGL 渲染器
$ npm install @antv/g-webgl --save
```

## 🔨 使用

```html
<div id="container"></div>
```

```js
import { Circle, Canvas, CanvasEvent } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
// or
// import { Renderer as WebGLRenderer } from '@antv/g-webgl';
// import { Renderer as SVGRenderer } from '@antv/g-svg';

// 创建画布
const canvas = new Canvas({
    container: 'container',
    width: 500,
    height: 500,
    renderer: new CanvasRenderer(), // 选择一个渲染器
});

// 创建一个圆
const circle = new Circle({
    style: {
        cx: 100,
        cy: 100,
        r: 50,
        fill: 'red',
        stroke: 'blue',
        lineWidth: 5,
    },
});

canvas.addEventListener(CanvasEvent.READY, function () {
    // 加入画布
    canvas.appendChild(circle);

    // 监听 `click` 事件
    circle.addEventListener('click', function () {
        this.style.fill = 'green';
    });
});
```

## ⌨️ 开发

启动并预览示例：

```bash
git clone git@github.com:antvis/g.git
cd g
pnpm install
pnpm build
pnpm dev
```

### API Spec

在项目根目录下启动开发服务器，例如 `http-server`:

```bash
http-server -p 9090
```

访问 `localhost:9090/spec/api.html` 即可预览 API Spec。

### 运行测试用例

构建并运行测试用例：

```bash
pnpm build
pnpm test
```

### 启动开发示例

构建并启动 vite 示例：

```bash
pnpm build
pnpm dev
```

## 受以下项目启发

-   [Sprite.js](https://github.com/spritejs/spritejs)
-   [Pixi.js](https://pixijs.com/)
-   [PlayCanvas](https://playcanvas.com/)
-   [WebKit](https://github.com/WebKit/WebKit/blob/main/Source/WebCore)
