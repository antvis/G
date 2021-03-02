English | [简体中文](./README-zh_CN.md)

# G

[![](https://img.shields.io/travis/antvis/g.svg)](https://travis-ci.org/antvis/g)
![](https://img.shields.io/badge/language-javascript-red.svg)
![](https://img.shields.io/badge/license-MIT-000000.svg)

[![npm package](https://img.shields.io/npm/v/@antv/g-canvas.svg)](https://www.npmjs.com/package/@antv/g-canvas)
[![npm downloads](http://img.shields.io/npm/dm/@antv/g-canvas.svg)](https://npmjs.org/package/@antv/g-canvas)
[![npm package](https://img.shields.io/npm/v/@antv/g-svg.svg)](https://www.npmjs.com/package/@antv/g-svg)
[![npm downloads](http://img.shields.io/npm/dm/@antv/g-svg.svg)](https://npmjs.org/package/@antv/g-svg)
[![Percentage of issues still open](http://isitmaintained.com/badge/open/antvis/g.svg)](http://isitmaintained.com/project/antvis/g 'Percentage of issues still open')

- A powerful rendering engine for AntV providing canvas and svg draw.

## ✨ Features

- Powerful and scalable rendering capability with built-in basic Graphics.
- Excellent rendering performance and supports visualization scenarios with large amounts of data.
- Complete simulation of browser DOM events, and no difference from native events.
- Smooth animation implementation and rich configuration interfaces.
- While providing Canvas and SVG version of implementation, and both of API basic consistent.

## 📦 Install

```bash
# Canvas version
$ npm install @antv/g-canvas --save

# SVG version
$ npm install @antv/g-svg --save
```

## 🔨 Usage

```html
<div id="c1"></div>
```

```js
import { Canvas } from '@antv/g-canvas';
// or use SVG version
// import { Canvas } from '@antv/g-svg';

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

## ⌨️ Development

```bash
$ git clone git@github.com:antvis/g.git
$ cd g
$ yarn install
$ yarn watch
$ yarn start
```
