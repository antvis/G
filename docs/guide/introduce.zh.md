---
title: 介绍
order: 0
redirect_from:
  - /zh
  - /zh/docs
  - /zh/docs/guide
---

- G 是一款易用、高效、强大的 2D 可视化渲染引擎，提供 Canvas、SVG、WebGL 等多种渲染方式的实现。目前，已有多个顶级的可视化开源项目基于 G 开发，比如图形语法库 [G2](https://g2.antv.vision)、图可视化库 [G6](https://g6.antv.vision) 等。

## 特性

- 强大、可扩展的渲染能力，并内置常用的基础图形。
- 极致的渲染性能，支持大数据量的可视化场景。
- 完整模拟浏览器 DOM 的事件，与原生事件的表现无差异。
- 流畅的动画实现，以及丰富的配置接口。
- 同时提供 Canvas、SVG 和 WebGL 版本的实现，API 基本保持一致。

## 安装

```bash
# Core
$ npm install @antv/g --save

# Canvas renderer
$ npm install @antv/g-renderer-canvas --save
# SVG renderer
$ npm install @antv/g-renderer-svg --save
# WebGL renderer
$ npm install @antv/g-renderer-webgl --save
```

## 使用

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Hz29QLOXPRYAAAAAAAAAAABkARQnAQ)

```html
<div id="c1"></div>
```

```js
import { Canvas, Circle } from '@antv/g';
import { RENDERER as CANVAS_RENDERER } from '@antv/g-renderer-canvas';

const canvas = new Canvas({
  container: 'c1',
  width: 500,
  height: 500,
  renderer: CANVAS_RENDERER,
});

const circle = new Circle({
  attrs: {
    x: 100,
    y: 100,
    r: 50,
    fill: 'red',
    stroke: 'blue',
    lineWidth: 5,
  },
});

canvas.appendChild(circle);
```

## ⌨️ 开发

```bash
$ git clone git@github.com:antvis/g.git
$ cd g
$ npm install
$ npm run bootstrap
$ npm run build
```
