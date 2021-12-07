English | [简体中文](./README-zh_CN.md)

# G

[![](https://img.shields.io/travis/antvis/g.svg)](https://travis-ci.org/antvis/g) ![](https://img.shields.io/badge/language-javascript-red.svg) ![](https://img.shields.io/badge/license-MIT-000000.svg)

[![npm package](https://img.shields.io/npm/v/@antv/g-canvas.svg)](https://www.npmjs.com/package/@antv/g-canvas) [![npm downloads](http://img.shields.io/npm/dm/@antv/g-canvas.svg)](https://npmjs.org/package/@antv/g-canvas) [![npm package](https://img.shields.io/npm/v/@antv/g-svg.svg)](https://www.npmjs.com/package/@antv/g-svg) [![npm downloads](http://img.shields.io/npm/dm/@antv/g-svg.svg)](https://npmjs.org/package/@antv/g-svg) [![Percentage of issues still open](http://isitmaintained.com/badge/open/antvis/g.svg)](http://isitmaintained.com/project/antvis/g 'Percentage of issues still open')

-   A powerful rendering engine for AntV implemented with Canvas2D / SVG / WebGL / WebGPU.

## ✨ Features

-   Powerful and scalable rendering capability with built-in basic Graphics.
-   Excellent rendering performance and supports visualization scenarios with large amounts of data.
-   Complete simulation of browser DOM events, and no difference from native events.
-   Smooth animation implementation and rich configuration interfaces.
-   While providing Canvas and SVG version of implementation, and both of API basic consistent.

## 📦 Install

```bash
# Install Core
$ npm install @antv/g --save
# Canvas Renderer
$ npm install @antv/g-canvas --save
# SVG Renderer
$ npm install @antv/g-svg --save
# WebGL Renderer
$ npm install @antv/g-webgl --save
```

## 🔨 Usage

```html
<div id="container"></div>
```

```js
import { Circle, Canvas } from '@antv/g';
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
    style: {
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

Start previewing site:

```bash
$ git clone git@github.com:antvis/g.git
$ cd g
$ yarn install
$ yarn start
```

### API Spec

Start a dev-server on root dir, eg. `http-server`:

```bash
$ http-server -p 9090
```

Open api.html on `localhost:9090/dev-docs/api.html`.

<!-- GITCONTRIBUTOR_START -->

## Contributors

| [<img src="https://avatars.githubusercontent.com/u/14918822?v=4" width="100px;"/><br/><sub><b>dengfuping</b></sub>](https://github.com/dengfuping)<br/> | [<img src="https://avatars.githubusercontent.com/u/3608471?v=4" width="100px;"/><br/><sub><b>xiaoiver</b></sub>](https://github.com/xiaoiver)<br/> | [<img src="https://avatars.githubusercontent.com/u/1264678?v=4" width="100px;"/><br/><sub><b>dxq613</b></sub>](https://github.com/dxq613)<br/> | [<img src="https://avatars.githubusercontent.com/in/2141?v=4" width="100px;"/><br/><sub><b>dependabot-preview[bot]</b></sub>](https://github.com/apps/dependabot-preview)<br/> | [<img src="https://avatars.githubusercontent.com/u/507615?v=4" width="100px;"/><br/><sub><b>afc163</b></sub>](https://github.com/afc163)<br/> | [<img src="https://avatars.githubusercontent.com/u/4224253?v=4" width="100px;"/><br/><sub><b>zhanba</b></sub>](https://github.com/zhanba)<br/> |
| :-: | :-: | :-: | :-: | :-: | :-: |
| [<img src="https://avatars.githubusercontent.com/u/1947344?v=4" width="100px;"/><br/><sub><b>limichange</b></sub>](https://github.com/limichange)<br/> | [<img src="https://avatars.githubusercontent.com/u/23075527?v=4" width="100px;"/><br/><sub><b>entronad</b></sub>](https://github.com/entronad)<br/> | [<img src="https://avatars.githubusercontent.com/u/7856674?v=4" width="100px;"/><br/><sub><b>hustcc</b></sub>](https://github.com/hustcc)<br/> | [<img src="https://avatars.githubusercontent.com/u/6628666?v=4" width="100px;"/><br/><sub><b>simaQ</b></sub>](https://github.com/simaQ)<br/> | [<img src="https://avatars.githubusercontent.com/u/1142242?v=4" width="100px;"/><br/><sub><b>zqlu</b></sub>](https://github.com/zqlu)<br/> | [<img src="https://avatars.githubusercontent.com/u/19731097?v=4" width="100px;"/><br/><sub><b>Deturium</b></sub>](https://github.com/Deturium)<br/> |
| [<img src="https://avatars.githubusercontent.com/u/29593318?v=4" width="100px;"/><br/><sub><b>Yanyan-Wang</b></sub>](https://github.com/Yanyan-Wang)<br/> | [<img src="https://avatars.githubusercontent.com/u/8325822?v=4" width="100px;"/><br/><sub><b>elaine1234</b></sub>](https://github.com/elaine1234)<br/> | [<img src="https://avatars.githubusercontent.com/u/15646325?v=4" width="100px;"/><br/><sub><b>visiky</b></sub>](https://github.com/visiky)<br/> | [<img src="https://avatars.githubusercontent.com/u/9443867?v=4" width="100px;"/><br/><sub><b>baizn</b></sub>](https://github.com/baizn)<br/> | [<img src="https://avatars.githubusercontent.com/u/10277628?v=4" width="100px;"/><br/><sub><b>terence55</b></sub>](https://github.com/terence55)<br/> | [<img src="https://avatars.githubusercontent.com/u/2281857?v=4" width="100px;"/><br/><sub><b>budlion</b></sub>](https://github.com/budlion)<br/> |
| [<img src="https://avatars.githubusercontent.com/u/7278711?v=4" width="100px;"/><br/><sub><b>luoxupan</b></sub>](https://github.com/luoxupan)<br/> | [<img src="https://avatars.githubusercontent.com/u/6812138?v=4" width="100px;"/><br/><sub><b>Leannechn</b></sub>](https://github.com/Leannechn)<br/> |

This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Tue Dec 07 2021 10:00:16 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->
