English | [简体中文](./README-zh_CN.md)

# G

![CI](https://github.com/antvis/g/workflows/CI/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/antvis/g/badge.svg?branch=next)](https://coveralls.io/github/antvis/g?branch=next)

![](https://img.shields.io/badge/language-typescript-blue.svg) ![](https://img.shields.io/badge/license-MIT-000000.svg)

[![npm package](https://img.shields.io/npm/v/@antv/g)](https://www.npmjs.com/package/@antv/g) [![npm downloads](http://img.shields.io/npm/dm/@antv/g)](https://www.npmjs.com/package/@antv/g) [![Percentage of issues still open](http://isitmaintained.com/badge/open/antvis/g.svg)](http://isitmaintained.com/project/antvis/g 'Percentage of issues still open') [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=shields)](https://github.com/antvis/g/pulls)

A powerful rendering engine for AntV.

<p>
  <a href="https://g-next.antv.vision/zh/examples/ecosystem#d3-force-directed-graph"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*PovRRJtsBMIAAAAAAAAAAAAAARQnAQ" /></a>
<a href="https://g-next.antv.vision/zh/examples/ecosystem#d3-barchart"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*h6vDS6eRVFoAAAAAAAAAAAAAARQnAQ" /></a>
<a href="https://g-next.antv.vision/zh/examples/plugins#rough-d3-barchart"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*aJaFSrYOLXMAAAAAAAAAAAAAARQnAQ" /></a>
<a href="https://g-next.antv.vision/zh/examples/plugins#yoga-text"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*IH1fSJN9fsMAAAAAAAAAAAAAARQnAQ" /></a>
<a href="https://g-next.antv.vision/zh/examples/plugins#box2dt"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Qw5OQLGQy_4AAAAAAAAAAAAAARQnAQ" /></a>
<a href="https://g-next.antv.vision/zh/examples/plugins#rough"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*d4iiS5_3YVIAAAAAAAAAAAAAARQnAQ" /></a>
<a href="https://g-next.antv.vision/zh/examples/plugins#skottie"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_usaTqSm6vYAAAAAAAAAAAAAARQnAQ" /></a>
<a href="https://g-next.antv.vision/zh/examples/plugins#canvaskit-particles"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*919sR5Oxx_kAAAAAAAAAAAAAARQnAQ" /></a>
<a href="https://g-next.antv.vision/zh/examples/3d#sphere"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*bsj2S4upLBgAAAAAAAAAAAAAARQnAQ" /></a>
<a href="https://g-next.antv.vision/zh/examples/3d#force-3d"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*3XFxQKWOeKoAAAAAAAAAAAAAARQnAQ" /></a>

</p>

## ✨ Features

-   Provides a series of easy-to-use APIs.
    -   The graphics and event systems are compatible with the DOM [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) & [Event](https://developer.mozilla.org/en-US/docs/Web/API/Event) API, which means we can take over the default rendering process of [D3](https://github.com/d3/d3) or use gesture libs such as [Hammer.js](http://hammerjs.github.io/) easily.
    -   The animation system is compatible with [Web Animation API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API).
    -   The style system is compatible with [CSS Typed OM](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Typed_OM_API) & [CSS Layout API](https://github.com/w3c/css-houdini-drafts/blob/main/css-layout-api/EXPLAINER.md).
-   Provides Canvas2D / SVG / WebGL / WebGPU / Skia renderers, you can choose one on demand or switch between them at runtime. We also support [server-side rendering](https://g-next.antv.vision/zh/docs/api/renderer/canvas#%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%B8%B2%E6%9F%93) with [node-canvas](https://github.com/Automattic/node-canvas) and [JSDOM](https://github.com/jsdom/jsdom).
-   Besides the high-performance rendering, we also provide GPGPU capabilities based on [WebGPU](https://www.w3.org/TR/webgpu/).
    -   [webgpu-graph](https://g-next.antv.vision/zh/docs/api/gpgpu/webgpu-graph) A GPU accelerated graph analytics library.
-   There're a lot of out-of-the-box plugins：
    -   Rendering
        -   [g-plugin-canvas-renderer](https://g-next.antv.vision/en/docs/plugins/canvas-renderer) Renders 2D graphics with Canvas2D API.
        -   [g-plugin-svg-renderer](https://g-next.antv.vision/en/docs/plugins/svg-renderer) Render 2D graphics with SVG API.
        -   [g-plugin-device-renderer](https://g-next.antv.vision/en/docs/plugins/device-renderer) Render 2D graphics with WebGL 1/2 and WebGPU API.
        -   [g-plugin-html-renderer](https://g-next.antv.vision/en/docs/plugins/html-renderer) Provides raw HTML elements.
        -   [g-plugin-3d](https://g-next.antv.vision/en/docs/plugins/3d) Expanded 3D rendering capabilities such as Geometry, Material, Mesh and Lights.
        -   [g-plugin-rough-canvas-renderer](https://g-next.antv.vision/en/docs/plugins/rough-canvas-renderer) Render sketchy styled shapes with [rough.js](https://roughjs.com/) and Canvas2D.
        -   [g-plugin-rough-svg-renderer](https://g-next.antv.vision/en/docs/plugins/rough-svg-renderer) Render sketchy styled shapes with [rough.js](https://roughjs.com/) and SVG.
        -   [g-plugin-canvaskit-renderer](https://g-next.antv.vision/en/docs/plugins/canvaskit-renderer) Renders 2D graphics with [Skia](https://skia.org/docs/user/modules/quickstart).
    -   Picking
        -   [g-plugin-canvas-picker](https://g-next.antv.vision/en/docs/plugins/canvas-picker) Implements graphics picking with Canvas2D API.
        -   [g-plugin-svg-picker](https://g-next.antv.vision/en/docs/plugins/svg-picker) Implements graphics picking with SVG API.
    -   Interaction
        -   [g-plugin-dom-interaction](https://g-next.antv.vision/en/docs/plugins/dom-interaction) Register event listeners with DOM API.
        -   [g-plugin-control](https://g-next.antv.vision/en/docs/plugins/control) Provides controls such as orbit based on [Camera](https://g-next.antv.vision/en/docs/api/camera).
        -   [g-plugin-dragndrop](https://g-next.antv.vision/en/docs/plugins/dragndrop) Provides Drag 'n' Drop based on Pointer Events.
    -   Physics engine
        -   [g-plugin-box2d](https://g-next.antv.vision/en/docs/plugins/box2d) Based on [Box2D](https://box2d.org/).
        -   [g-plugin-matterjs](https://g-next.antv.vision/en/docs/plugins/matterjs) Based on [matter.js](https://brm.io/matter-js/).
        -   [g-plugin-physx](https://g-next.antv.vision/en/docs/plugins/physx) Based on [PhysX](https://github.com/ashconnell/physx-js).
    -   Layout engine
        -   [g-plugin-yoga](https://g-next.antv.vision/en/docs/plugins/yoga) Based on [Yoga](https://yogalayout.com/).
    -   GPGPU
        -   [g-plugin-gpgpu](https://g-next.antv.vision/en/docs/plugins/gpgpu) Provides GPGPU capabilities based on WebGPU.
    -   CSS select
        -   [g-plugin-css-select](https://g-next.antv.vision/en/docs/plugins/css-select) Query graphics in scenegraph with CSS select syntax.

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
import { Circle, Canvas, CanvasEvent } from '@antv/g';
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
        cx: 100,
        cy: 100,
        r: 50,
        fill: 'red',
        stroke: 'blue',
        lineWidth: 5,
    },
});

canvas.addEventListener(CanvasEvent.READY, function () {
    // append to canvas
    canvas.appendChild(circle);

    // add listener for `click` event
    circle.addEventListener('click', function () {
        this.style.fill = 'green';
    });
});
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

Open api.html on `localhost:9090/spec/api.html`.

### Run test cases

Build and run test cases:

```bash
$ yarn build
$ yarn test
```

## Inspired by

-   [Sprite.js](https://github.com/spritejs/spritejs)
-   [Pixi.js](https://pixijs.com/)
-   [PlayCanvas](https://playcanvas.com/)
-   [Webkit](https://github.com/WebKit/WebKit/blob/main/Source/WebCore)

<!-- GITCONTRIBUTOR_START -->

## Contributors

| [<img src="https://avatars.githubusercontent.com/u/14918822?v=4" width="100px;"/><br/><sub><b>dengfuping</b></sub>](https://github.com/dengfuping)<br/> | [<img src="https://avatars.githubusercontent.com/u/3608471?v=4" width="100px;"/><br/><sub><b>xiaoiver</b></sub>](https://github.com/xiaoiver)<br/> | [<img src="https://avatars.githubusercontent.com/u/1264678?v=4" width="100px;"/><br/><sub><b>dxq613</b></sub>](https://github.com/dxq613)<br/> | [<img src="https://avatars.githubusercontent.com/in/2141?v=4" width="100px;"/><br/><sub><b>dependabot-preview[bot]</b></sub>](https://github.com/apps/dependabot-preview)<br/> | [<img src="https://avatars.githubusercontent.com/u/507615?v=4" width="100px;"/><br/><sub><b>afc163</b></sub>](https://github.com/afc163)<br/> | [<img src="https://avatars.githubusercontent.com/u/4224253?v=4" width="100px;"/><br/><sub><b>zhanba</b></sub>](https://github.com/zhanba)<br/> |
| :-: | :-: | :-: | :-: | :-: | :-: |
| [<img src="https://avatars.githubusercontent.com/u/1947344?v=4" width="100px;"/><br/><sub><b>limichange</b></sub>](https://github.com/limichange)<br/> | [<img src="https://avatars.githubusercontent.com/u/23075527?v=4" width="100px;"/><br/><sub><b>entronad</b></sub>](https://github.com/entronad)<br/> | [<img src="https://avatars.githubusercontent.com/u/7856674?v=4" width="100px;"/><br/><sub><b>hustcc</b></sub>](https://github.com/hustcc)<br/> | [<img src="https://avatars.githubusercontent.com/u/6628666?v=4" width="100px;"/><br/><sub><b>simaQ</b></sub>](https://github.com/simaQ)<br/> | [<img src="https://avatars.githubusercontent.com/u/1142242?v=4" width="100px;"/><br/><sub><b>zqlu</b></sub>](https://github.com/zqlu)<br/> | [<img src="https://avatars.githubusercontent.com/u/19731097?v=4" width="100px;"/><br/><sub><b>Deturium</b></sub>](https://github.com/Deturium)<br/> |
| [<img src="https://avatars.githubusercontent.com/u/29593318?v=4" width="100px;"/><br/><sub><b>Yanyan-Wang</b></sub>](https://github.com/Yanyan-Wang)<br/> | [<img src="https://avatars.githubusercontent.com/u/8325822?v=4" width="100px;"/><br/><sub><b>elaine1234</b></sub>](https://github.com/elaine1234)<br/> | [<img src="https://avatars.githubusercontent.com/u/15646325?v=4" width="100px;"/><br/><sub><b>visiky</b></sub>](https://github.com/visiky)<br/> | [<img src="https://avatars.githubusercontent.com/u/9443867?v=4" width="100px;"/><br/><sub><b>baizn</b></sub>](https://github.com/baizn)<br/> | [<img src="https://avatars.githubusercontent.com/u/10277628?v=4" width="100px;"/><br/><sub><b>terence55</b></sub>](https://github.com/terence55)<br/> | [<img src="https://avatars.githubusercontent.com/u/2281857?v=4" width="100px;"/><br/><sub><b>budlion</b></sub>](https://github.com/budlion)<br/> |
| [<img src="https://avatars.githubusercontent.com/u/7278711?v=4" width="100px;"/><br/><sub><b>luoxupan</b></sub>](https://github.com/luoxupan)<br/> | [<img src="https://avatars.githubusercontent.com/u/6812138?v=4" width="100px;"/><br/><sub><b>Leannechn</b></sub>](https://github.com/Leannechn)<br/> |

This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Tue Dec 07 2021 10:00:16 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->
