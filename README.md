English | [简体中文](./README-zh_CN.md)

# G

![CI](https://github.com/antvis/g/workflows/CI/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/antvis/g/badge.svg?branch=next)](https://coveralls.io/github/antvis/g?branch=next) [![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](#badge)

![TypeScript](https://img.shields.io/badge/language-typescript-blue.svg) ![License](https://img.shields.io/badge/license-MIT-000000.svg)

[![npm package](https://img.shields.io/npm/v/@antv/g)](https://www.npmjs.com/package/@antv/g) [![npm downloads](http://img.shields.io/npm/dm/@antv/g)](https://www.npmjs.com/package/@antv/g) [![Percentage of issues still open](http://isitmaintained.com/badge/open/antvis/g.svg)](http://isitmaintained.com/project/antvis/g 'Percentage of issues still open') [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=shields)](https://github.com/antvis/g/pulls)

As the underlying rendering engine of AntV, G is dedicated to provide consistent and high performance 2D / 3D graphics rendering capabilities for upper layer products, adapting all underlying rendering APIs (Canvas2D / SVG / WebGL / WebGPU / CanvasKit / Node.js) on the web side. In particular, it provides GPGPU support for algorithms suitable for parallel computing in graph scenarios.

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

## ✨ Features

**Easy-to-use API**。The graphics and event system is compatible with DOM Element & Event API, and the animation system is compatible with Web Animations API, which can be adapted to the existing ecosystem of Web side such as D3, Hammer.js gesture library, etc. at a very low cost.

**Support multiple rendering environments**。Support Canvas2D / SVG / WebGL / WebGPU / CanvasKit and runtime switching, and also server-side rendering.

**High performance rendering and computing**。WebGPU-based GPGPU support for parallelizable algorithms. [webgpu-graph](https://g-next.antv.vision/en/docs/api/gpgpu/webgpu-graph) is a library of graph analysis algorithms using GPU acceleration.

Extensible plug-in mechanism and rich set of plug-ins：

-   Rendering Related
    -   [g-plugin-canvas-renderer](https://g-next.antv.vision/en/docs/plugins/canvas-renderer) Rendering 2D graphics based on Canvas2D.
    -   [g-plugin-svg-renderer](https://g-next.antv.vision/en/docs/plugins/svg-renderer) Rendering 2D graphics based on SVG.
    -   [g-plugin-device-renderer](https://g-next.antv.vision/en/docs/plugins/device-renderer) Rendering 2D graphics based on GPUDevice.
    -   [g-plugin-html-renderer](https://g-next.antv.vision/en/docs/plugins/html-renderer) Rendering DOM with HTML.
    -   [g-plugin-3d](https://g-next.antv.vision/en/docs/plugins/3d) Extended 3D capabilities.
    -   [g-plugin-rough-canvas-renderer](https://g-next.antv.vision/en/docs/plugins/rough-canvas-renderer) Perform hand-drawn style rendering with [rough.js](https://roughjs.com/) and Canvs2D.
    -   [g-plugin-rough-svg-renderer](https://g-next.antv.vision/en/docs/plugins/rough-svg-renderer) Perform hand-drawn style rendering with [rough.js](https://roughjs.com/) and SVG.
    -   [g-plugin-canvaskit-renderer](https://g-next.antv.vision/en/docs/plugins/canvaskit-renderer) Rendering 2D graphics based on [Skia](https://skia.org/docs/user/modules/quickstart).
-   Picking
    -   [g-plugin-canvas-picker](https://g-next.antv.vision/en/docs/plugins/canvas-picker) Do picking with Canvas2D and mathematical calculations.
    -   [g-plugin-svg-picker](https://g-next.antv.vision/en/docs/plugins/svg-picker) Do picking with SVG and DOM API.
-   Interaction
    -   [g-plugin-dom-interaction](https://g-next.antv.vision/en/docs/plugins/dom-interaction) Binds event listeners with DOM API.
    -   [g-plugin-control](https://g-next.antv.vision/en/docs/plugins/control) Provides camera interaction for 3D scenes.
    -   [g-plugin-dragndrop](https://g-next.antv.vision/en/docs/plugins/dragndrop) Provides Drag 'n' Drop based on PointerEvents.
-   Physics Engine
    -   [g-plugin-box2d](https://g-next.antv.vision/en/docs/plugins/box2d) Based on [Box2D](https://box2d.org/).
    -   [g-plugin-matterjs](https://g-next.antv.vision/en/docs/plugins/matterjs) Based on [matter.js](https://brm.io/matter-js/).
    -   [g-plugin-physx](https://g-next.antv.vision/en/docs/plugins/physx) Based on [PhysX](https://developer.nvidia.com/physx-sdk).
-   Layout Engine
    -   [g-plugin-yoga](https://g-next.antv.vision/en/docs/plugins/yoga) Provides Flex layout capabilities based on Yoga.
-   GPGPU
    -   [g-plugin-gpgpu](https://g-next.antv.vision/en/docs/plugins/gpgpu) Provides GPGPU capabilities based on WebGPU.
-   CSS Selector
    -   [g-plugin-css-select](https://g-next.antv.vision/en/docs/plugins/css-select) Supports for retrieval in the scene graph using CSS selectors.
-   A11y
    -   [g-plugin-a11y](https://g-next.antv.vision/en/docs/plugins/a11y) Provides accessibility features.

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

Start previewing demos:

```bash
git clone git@github.com:antvis/g.git
cd g
pnpm install
pnpm build
pnpm dev
```

### API Spec

Start a dev-server on root dir, eg. `http-server`:

```bash
http-server -p 9090
```

Open api.html on `localhost:9090/spec/api.html`.

### Run test cases

Build and run test cases:

```bash
pnpm build
pnpm test
```

### Run demos

Preview our dev demos:

```bash
pnpm build
pnpm dev
```

## Inspired by

-   [Sprite.js](https://github.com/spritejs/spritejs)
-   [Pixi.js](https://pixijs.com/)
-   [PlayCanvas](https://playcanvas.com/)
-   [WebKit](https://github.com/WebKit/WebKit/blob/main/Source/WebCore)

<!-- GITCONTRIBUTOR_START -->

## Contributors

|     [<img src="https://avatars.githubusercontent.com/u/14918822?v=4" width="100px;"/><br/><sub><b>dengfuping</b></sub>](https://github.com/dengfuping)<br/>     |   [<img src="https://avatars.githubusercontent.com/u/3608471?v=4" width="100px;"/><br/><sub><b>xiaoiver</b></sub>](https://github.com/xiaoiver)<br/>    |     [<img src="https://avatars.githubusercontent.com/u/1264678?v=4" width="100px;"/><br/><sub><b>dxq613</b></sub>](https://github.com/dxq613)<br/>     | [<img src="https://avatars.githubusercontent.com/in/2141?v=4" width="100px;"/><br/><sub><b>dependabot-preview[bot]</b></sub>](https://github.com/apps/dependabot-preview)<br/> |   [<img src="https://avatars.githubusercontent.com/u/4224253?v=4" width="100px;"/><br/><sub><b>zhanba</b></sub>](https://github.com/zhanba)<br/>    |       [<img src="https://avatars.githubusercontent.com/u/507615?v=4" width="100px;"/><br/><sub><b>afc163</b></sub>](https://github.com/afc163)<br/>       |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------: |
|     [<img src="https://avatars.githubusercontent.com/u/1947344?v=4" width="100px;"/><br/><sub><b>limichange</b></sub>](https://github.com/limichange)<br/>      |   [<img src="https://avatars.githubusercontent.com/u/23075527?v=4" width="100px;"/><br/><sub><b>entronad</b></sub>](https://github.com/entronad)<br/>   |     [<img src="https://avatars.githubusercontent.com/u/7856674?v=4" width="100px;"/><br/><sub><b>hustcc</b></sub>](https://github.com/hustcc)<br/>     |          [<img src="https://avatars.githubusercontent.com/u/33517362?v=4" width="100px;"/><br/><sub><b>tangying1027</b></sub>](https://github.com/tangying1027)<br/>           |  [<img src="https://avatars.githubusercontent.com/u/1478197?v=4" width="100px;"/><br/><sub><b>zengyue</b></sub>](https://github.com/zengyue)<br/>   |       [<img src="https://avatars.githubusercontent.com/u/6628666?v=4" width="100px;"/><br/><sub><b>simaQ</b></sub>](https://github.com/simaQ)<br/>        |
|       [<img src="https://avatars.githubusercontent.com/u/1142242?v=4" width="100px;"/><br/><sub><b>lessmost</b></sub>](https://github.com/lessmost)<br/>        |     [<img src="https://avatars.githubusercontent.com/u/15646325?v=4" width="100px;"/><br/><sub><b>visiky</b></sub>](https://github.com/visiky)<br/>     |     [<img src="https://avatars.githubusercontent.com/u/31396322?v=4" width="100px;"/><br/><sub><b>lxfu1</b></sub>](https://github.com/lxfu1)<br/>      |                   [<img src="https://avatars.githubusercontent.com/u/7451866?v=4" width="100px;"/><br/><sub><b>ICMI</b></sub>](https://github.com/ICMI)<br/>                   | [<img src="https://avatars.githubusercontent.com/u/19731097?v=4" width="100px;"/><br/><sub><b>Deturium</b></sub>](https://github.com/Deturium)<br/> | [<img src="https://avatars.githubusercontent.com/u/29593318?v=4" width="100px;"/><br/><sub><b>Yanyan-Wang</b></sub>](https://github.com/Yanyan-Wang)<br/> |
| [<img src="https://avatars.githubusercontent.com/u/42212176?v=4" width="100px;"/><br/><sub><b>yiiiiiiqianyao</b></sub>](https://github.com/yiiiiiiqianyao)<br/> | [<img src="https://avatars.githubusercontent.com/u/37040897?v=4" width="100px;"/><br/><sub><b>moayuisuda</b></sub>](https://github.com/moayuisuda)<br/> | [<img src="https://avatars.githubusercontent.com/u/8325822?v=4" width="100px;"/><br/><sub><b>elaine1234</b></sub>](https://github.com/elaine1234)<br/> |              [<img src="https://avatars.githubusercontent.com/u/15213473?v=4" width="100px;"/><br/><sub><b>mxz96102</b></sub>](https://github.com/mxz96102)<br/>               |   [<img src="https://avatars.githubusercontent.com/u/12654153?v=4" width="100px;"/><br/><sub><b>DrugsZ</b></sub>](https://github.com/DrugsZ)<br/>   |       [<img src="https://avatars.githubusercontent.com/u/9443867?v=4" width="100px;"/><br/><sub><b>baizn</b></sub>](https://github.com/baizn)<br/>        |
|      [<img src="https://avatars.githubusercontent.com/u/10277628?v=4" width="100px;"/><br/><sub><b>terence55</b></sub>](https://github.com/terence55)<br/>      |    [<img src="https://avatars.githubusercontent.com/u/56076317?v=4" width="100px;"/><br/><sub><b>tyr1dev</b></sub>](https://github.com/tyr1dev)<br/>    |    [<img src="https://avatars.githubusercontent.com/u/2281857?v=4" width="100px;"/><br/><sub><b>budlion</b></sub>](https://github.com/budlion)<br/>    |               [<img src="https://avatars.githubusercontent.com/u/7278711?v=4" width="100px;"/><br/><sub><b>luoxupan</b></sub>](https://github.com/luoxupan)<br/>               |    [<img src="https://avatars.githubusercontent.com/u/54543761?v=4" width="100px;"/><br/><sub><b>ikxin</b></sub>](https://github.com/ikxin)<br/>    |   [<img src="https://avatars.githubusercontent.com/u/6812138?v=4" width="100px;"/><br/><sub><b>Leannechn</b></sub>](https://github.com/Leannechn)<br/>    |

[<img src="https://avatars.githubusercontent.com/u/10683193?v=4" width="100px;"/><br/><sub><b>dev-itsheng</b></sub>](https://github.com/dev-itsheng)<br/>

This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Wed Jun 21 2023 13:21:24 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->
