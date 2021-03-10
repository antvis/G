[English](./README.md) | 简体中文

# G

[![](https://img.shields.io/travis/antvis/g.svg)](https://travis-ci.org/antvis/g)
![](https://img.shields.io/badge/language-javascript-red.svg)
![](https://img.shields.io/badge/license-MIT-000000.svg)

[![npm package](https://img.shields.io/npm/v/@antv/g-canvas.svg)](https://www.npmjs.com/package/@antv/g-canvas)
[![npm downloads](http://img.shields.io/npm/dm/@antv/g-canvas.svg)](https://npmjs.org/package/@antv/g-canvas)
[![npm package](https://img.shields.io/npm/v/@antv/g-svg.svg)](https://www.npmjs.com/package/@antv/g-svg)
[![npm downloads](http://img.shields.io/npm/dm/@antv/g-svg.svg)](https://npmjs.org/package/@antv/g-svg)
[![Percentage of issues still open](http://isitmaintained.com/badge/open/antvis/g.svg)](http://isitmaintained.com/project/antvis/g 'Percentage of issues still open')

- 一款高效易用的可视化 2D 渲染引擎，同时提供 Canvas 和 SVG 版本的实现。

## ✨ 特性

- 强大、可扩展的渲染能力，并内置常用的基础图形。
- 极致的渲染性能，支持大数据量的可视化场景。
- 完整模拟浏览器 DOM 的事件，与原生事件的表现无差异。
- 流畅的动画实现，以及丰富的配置接口。
- 同时提供 Canvas 和 SVG 版本的实现，且两者的 API 基本保持一致。

## 📦 安装

```bash
# 移动端 版本
$ npm install @antv/g-mobile --save

# Canvas 版本
$ npm install @antv/g-canvas --save

# SVG 版本
$ npm install @antv/g-svg --save
```

## 🔨 使用

```html
<div id="c1"></div>
```

```js
import { Canvas } from '@antv/g-mobile';

const canvas = new Canvas({
  container: 'c1',
  width: 500,
  height: 500,
});

const group = canvas.addGroup();
group.addShape('circle', {
  attrs: {
    x: 100,
    y: 100,
    r: 50,
    fill: 'red',
    stroke: 'blue',
    lineWidth: 5,
  },
});
```

## ⌨️ 开发

```bash
$ git clone git@github.com:antvis/g.git
$ cd g
$ npm install
$ npm run bootstrap
$ npm run build
```
