[English](./README.md) | 简体中文

# G

[![](https://img.shields.io/travis/antvis/g.svg)](https://travis-ci.org/antvis/g) ![](https://img.shields.io/badge/language-javascript-red.svg) ![](https://img.shields.io/badge/license-MIT-000000.svg)

[![npm package](https://img.shields.io/npm/v/@antv/g-canvas.svg)](https://www.npmjs.com/package/@antv/g-canvas) [![npm downloads](http://img.shields.io/npm/dm/@antv/g-canvas.svg)](https://npmjs.org/package/@antv/g-canvas) [![npm package](https://img.shields.io/npm/v/@antv/g-svg.svg)](https://www.npmjs.com/package/@antv/g-svg) [![npm downloads](http://img.shields.io/npm/dm/@antv/g-svg.svg)](https://npmjs.org/package/@antv/g-svg) [![Percentage of issues still open](http://isitmaintained.com/badge/open/antvis/g.svg)](http://isitmaintained.com/project/antvis/g 'Percentage of issues still open')

-   一款高效易用的可视化 2D 渲染引擎，支持 Web 端 Canvas / SVG / WebGL / WebGPU 渲染 API。

## ✨ 特性

-   强大、可扩展的渲染能力，并内置常用的基础图形。
-   极致的渲染性能，支持大数据量的可视化场景。
-   完整模拟浏览器 DOM 的事件，与原生事件的表现无差异。
-   流畅的动画实现，以及丰富的配置接口。
-   同时提供 Canvas 和 SVG 版本的实现，且两者的 API 基本保持一致。

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
import { Circle, Canvas } from '@antv/g';
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
        x: 100,
        y: 100,
        r: 50,
        fill: 'red',
        stroke: 'blue',
        lineWidth: 5,
    },
});

// 加入画布
canvas.appendChild(circle);
```

## ⌨️ 开发

使用 Yarn 进行开发，启动并预览站点：

```bash
$ git clone git@github.com:antvis/g.git
$ cd g
$ yarn install
$ yarn start
```

### API Spec

在项目根目录下启动开发服务器，例如 `http-server`:

```bash
$ http-server -p 9090
```

访问 `localhost:9090/dev-docs/api.html` 即可预览 API Spec。

### 运行测试用例

构建并运行测试用例：

```bash
$ yarn build
$ yarn test
```
