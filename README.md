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
<div id="container"></div>
```

```js
import { Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
// or
// import { Renderer as WebGLRenderer } from '@antv/g-webgl';
// import { Renderer as SVGRenderer } from '@antv/g-svg';

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 500,
  height: 500,
  renderer: new CanvasRenderer(), // select a renderer
});

// create a circle
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

// append to canvas
canvas.appendChild(circle);
```

## ⌨️ Development

```bash
$ git clone git@github.com:antvis/g.git
$ cd g
$ yarn install
$ yarn watch
$ yarn start
```
