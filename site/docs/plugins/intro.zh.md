---
title: 插件系统介绍
order: -100
redirect_from:
    - /zh/plugins
---

在持续迭代的过程中，开发之初很难把所有需要支持的功能都想清楚，有时候还需要借助社区的力量去持续生产新的功能点，或者优化已有的功能。这就需要系统具备一定的可扩展性。而插件模式就是常常选用的方法，其优点包括：

- 单一职责。插件代码与系统代码在工程上解耦，可独立开发，并对开发者隔离框架内部逻辑的复杂度。
- 可动态引入和配置。

在众多常用软件中都能找到插件系统的存在，例如 Webpack、VSCode 和 Chrome 浏览器。

为了让渲染引擎也具有良好的可扩展性，我们也内置了一套插件系统，让不同的渲染器可以在运行时扩展自身能力。目前支持的完整插件集如下。

## 插件集

- 渲染相关
  - [canvas-renderer](/plugins/canvas-renderer) 基于 Canvas2D 渲染 2D 图形
  - [canvaskit-renderer](/plugins/canvaskit-renderer) 基于 CanvasKit / Skia 渲染 2D 图形
  - [svg-renderer](/plugins/svg-renderer) 基于 SVG 渲染 2D 图形
  - [g-plugin-device-renderer](/plugins/device-renderer) 基于 WebGPU / WebGL 渲染 2D 图形
  - [html-renderer](/plugins/html-renderer) 渲染 DOM 元素
  - [g-plugin-3d](/plugins/3d) 基于 g-plugin-device-renderer 扩展 3D 能力
  - [g-plugin-rough-canvas-renderer](/plugins/rough-canvas-renderer) 基于 rough.js 和 Canvas2D 渲染手绘风格图形
  - [g-plugin-rough-svg-renderer](/plugins/rough-svg-renderer) 基于 rough.js 和 SVG 渲染手绘风格图形
- 拾取
  - [canvas-picker](/plugins/canvas-picker) 基于 Canvas2D
  - [svg-picker](/plugins/svg-picker) 基于 SVG
- 无障碍
  - [g-plugin-a11y](/plugins/a11y) 提供文本提取、Screen Reader、键盘导航等无障碍功能
- 交互
  - [dom-interaction](/plugins/dom-interaction) 基于 DOM API 绑定事件
  - [g-plugin-dragndrop](/plugins/dragndrop) 基于 PointerEvents 实现拖放功能
  - [g-plugin-control](/plugins/control) 为 3D 场景提供相机交互
  - [g-plugin-annotation](/plugins/annotation) 提供基础图形的绘制和编辑能力，类似 [Fabric.js](http://fabricjs.com/) 和 [Konva.js](https://konvajs.org/)
- 物理引擎
  - [g-plugin-box2d](/plugins/box2d) 基于 Box2D
  - [g-plugin-matterjs](/plugins/matterjs) 基于 matter.js
  - [g-plugin-physx](/plugins/physics-engine) 基于 PhysX
- 布局引擎
  - [g-plugin-yoga](/plugins/yoga) 基于 Yoga 提供 Flex 布局能力
- GPGPU
  - [g-plugin-gpgpu](/plugins/gpgpu) 基于 WebGPU 提供 GPGPU 能力
- CSS 选择器
  - [g-plugin-css-select](/plugins/css-select) 支持使用 CSS 选择器在场景图中检索

## 使用方式

### CDN

首先[引入核心和渲染器](/guide/getting-started#cdn-方式)，然后在 HTML 中引入插件的 UMD：

```html
<!-- 插件 -->
<script src="https://unpkg.com/@antv/g-plugin-rough-canvas-renderer@1.7.16/dist/index.umd.min.js"></script>
```

然后在 `window.G` 的命名空间下使用插件，以 [g-plugin-rough-canvas-renderer](/plugins/rough-canvas-renderer) 为例：

```js
const plugin = new window.G.RoughCanvasRenderer.Plugin();
```

[CodeSandbox 例子](https://codesandbox.io/s/yi-umd-xing-shi-shi-yong-g-yi-ji-cha-jian-zsoln8?file=/index.js)

### NPM Module

首先[安装核心包和渲染器](/guide/getting-started#npm-module)，然后安装插件，以 [g-plugin-rough-canvas-renderer](/plugins/rough-canvas-renderer) 为例：

```bash
npm install @antv/g-plugin-rough-canvas-renderer --save
```

然后可以使用 [registerPlugin](/api/renderer/intro#registerplugin) 在渲染器上注册插件：

```js
import { Plugin } from '@antv/g-plugin-rough-canvas-renderer';

renderer.registerPlugin(new Plugin());
```

## 与渲染器的关系

渲染器本质上是由一组插件组成，以 [g-canvas](/api/renderer/canvas) 为例，在构造函数中内置了一系列插件：

```js
this.registerPlugin(new ContextRegisterPlugin());
this.registerPlugin(new ImageLoader.Plugin());
this.registerPlugin(new CanvasPathGenerator.Plugin());
this.registerPlugin(new CanvasRenderer.Plugin());
this.registerPlugin(new DomInteraction.Plugin());
this.registerPlugin(new CanvasPicker.Plugin());
this.registerPlugin(new HTMLRenderer.Plugin());
```

在运行时也可以扩展它们的能力：

```js
import { Plugin } from '@antv/g-plugin-rough-canvas-renderer';
renderer.registerPlugin(new Plugin());
```
