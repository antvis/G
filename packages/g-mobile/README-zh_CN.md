[English](./README.md) | 简体中文

# g-mobile

[![](https://img.shields.io/travis/antvis/g.svg)](https://travis-ci.org/antvis/g)
![](https://img.shields.io/badge/language-javascript-red.svg)
![](https://img.shields.io/badge/license-MIT-000000.svg)

[![npm package](https://img.shields.io/npm/v/@antv/g-canvas.svg)](https://www.npmjs.com/package/@antv/g-mobile)
[![npm downloads](http://img.shields.io/npm/dm/@antv/g-canvas.svg)](https://npmjs.org/package/@antv/g-mobile)
[![Percentage of issues still open](http://isitmaintained.com/badge/open/antvis/g.svg)](http://isitmaintained.com/project/antvis/g 'Percentage of issues still open')

- 一款高效易用的移动端 Canvas 渲染引擎。

## ✨ 特性

- 强大、可扩展的渲染能力，并内置常用的基础图形。
- 极致的渲染性能，支持大数据量的可视化场景。
- 完整模拟移动端/浏览器 DOM 的事件，与原生事件的表现无差异。
- 流畅的动画实现，以及丰富的配置接口。

## 📦 安装

```bash
$ npm install @antv/g-mobile --save
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
