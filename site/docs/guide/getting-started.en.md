---
title: Getting Started
order: 0
redirect_from:
    - /en
    - /en
    - /en/guide
---

![CI](https://github.com/antvis/g/workflows/CI/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/antvis/g/badge.svg?branch=next)](https://coveralls.io/github/antvis/g?branch=next)

![](https://img.shields.io/badge/language-typescript-blue.svg) ![](https://img.shields.io/badge/license-MIT-000000.svg)

[![npm package](https://img.shields.io/npm/v/@antv/g)](https://www.npmjs.com/package/@antv/g) [![npm downloads](http://img.shields.io/npm/dm/@antv/g)](https://www.npmjs.com/package/@antv/g) [![Percentage of issues still open](http://isitmaintained.com/badge/open/antvis/g.svg)](http://isitmaintained.com/project/antvis/g 'Percentage of issues still open') [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=shields)](https://github.com/antvis/g/pulls)

As the underlying rendering engine of AntV, G is dedicated to provide consistent and high performance 2D / 3D graphics rendering capabilities for upper layer products, adapting all underlying rendering APIs (Canvas2D / SVG / WebGL / WebGPU / CanvasKit / Node.js) on the web side. In particular, it provides GPGPU support for algorithms suitable for parallel computing in graph scenarios.

<p>
  <a href="/en/examples/ecosystem#d3-force-directed-graph"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*PovRRJtsBMIAAAAAAAAAAAAAARQnAQ" /></a>
<a href="/en/examples/ecosystem#d3-barchart"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*h6vDS6eRVFoAAAAAAAAAAAAAARQnAQ" /></a>
<a href="/en/examples/plugins#rough-d3-barchart"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*aJaFSrYOLXMAAAAAAAAAAAAAARQnAQ" /></a>
<a href="/en/examples/plugins#yoga-text"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*IH1fSJN9fsMAAAAAAAAAAAAAARQnAQ" /></a>
<a href="/en/examples/plugins#box2dt"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Qw5OQLGQy_4AAAAAAAAAAAAAARQnAQ" /></a>
<a href="/en/examples/plugins#rough"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*d4iiS5_3YVIAAAAAAAAAAAAAARQnAQ" /></a>
<a href="/en/examples/plugins#skottie"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_usaTqSm6vYAAAAAAAAAAAAAARQnAQ" /></a>
<a href="/en/examples/plugins#canvaskit-particles"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*919sR5Oxx_kAAAAAAAAAAAAAARQnAQ" /></a>
<a href="/en/examples/3d#sphere"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*bsj2S4upLBgAAAAAAAAAAAAAARQnAQ" /></a>
<a href="/en/examples/3d#force-3d"><img height="160" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*3XFxQKWOeKoAAAAAAAAAAAAAARQnAQ" /></a>

</p>

## Features

**Easy-to-use API**。The graphics and event system is compatible with DOM Element & Event API, and the animation system is compatible with Web Animations API, which can be adapted to the existing ecology of Web side such as D3, Hammer.js gesture library, etc. at a very low cost.

**Support multiple rendering environments**。Support Canvas2D / SVG / WebGL / WebGPU / CanvasKit and runtime switching, and also server-side rendering.

**High performance rendering and computing**。WebGPU-based GPGPU support for parallelizable algorithms. [webgpu-graph](/en/api/gpgpu/webgpu-graph) is a library of graph analysis algorithms using GPU acceleration.

Extensible plug-in mechanism and rich set of plug-ins：

-   Rendering Related
    -   [g-plugin-canvas-renderer](/en/plugins/canvas-renderer) Rendering 2D graphics based on Canvas2D.
    -   [g-plugin-canvaskit-renderer](/en/plugins/canvaskit-renderer) Rendering 2D graphics based on [Skia](https://skia.org/docs/user/modules/quickstart).
    -   [g-plugin-svg-renderer](/en/plugins/svg-renderer) Rendering 2D graphics based on SVG.
    -   [g-plugin-device-renderer](/en/plugins/device-renderer) Rendering 2D graphics based on GPUDevice.
    -   [g-plugin-html-renderer](/en/plugins/html-renderer) Rendering DOM with HTML.
    -   [g-plugin-3d](/en/plugins/3d) Extended 3D capabilities.
    -   [g-plugin-rough-canvas-renderer](/en/plugins/rough-canvas-renderer) Perform hand-drawn style rendering with [rough.js](https://roughjs.com/) and Canvas2D.
    -   [g-plugin-rough-svg-renderer](/en/plugins/rough-svg-renderer) Perform hand-drawn style rendering with [rough.js](https://roughjs.com/) and SVG.
-   Picking
    -   [g-plugin-canvas-picker](/en/plugins/canvas-picker) Do picking with Canvas2D and mathematical calculations.
    -   [g-plugin-svg-picker](/en/plugins/svg-picker) Do picking with SVG and DOM API.
-   Accessibility
    -   [g-plugin-a11y](/en/plugins/a11y) Provides SEO, screen reader support and keyboard navigation.
-   Interaction
    -   [g-plugin-dom-interaction](/en/plugins/dom-interaction) Binds event listeners with DOM API.
    -   [g-plugin-control](/en/plugins/control) Provides camera interaction for 3D scenes.
    -   [g-plugin-dragndrop](/en/plugins/dragndrop) Provides Drag 'n' Drop based on PointerEvents.
-   Physics Engine
    -   [g-plugin-box2d](/en/plugins/box2d) Based on [Box2D](https://box2d.org/).
    -   [g-plugin-matterjs](/en/plugins/matterjs) Based on [matter.js](https://brm.io/matter-js/).
    -   [g-plugin-physx](/en/plugins/physx) Based on [PhysX](https://developer.nvidia.com/physx-sdk).
-   Layout Engine
    -   [g-plugin-yoga](/en/plugins/yoga) Provides Flex layout capabilities based on Yoga.
-   GPGPU
    -   [g-plugin-gpgpu](/en/plugins/gpgpu) Provides GPGPU capabilities based on WebGPU.
-   CSS Selector
    -   [g-plugin-css-select](/en/plugins/css-select) Supports for retrieval in the scene graph using CSS selectors.

Full [API Spec](/api.html).

## Usage

We currently support both CDN and NPM Module usage.

### CDN

Import the core and renderer code in UMD format:

```html
<!-- G Core -->
<script
    src="https://unpkg.com/@antv/g/dist/index.umd.min.js"
    type="application/javascript"
></script>
<!-- G Renderers, such as Canvas2D, SVG and WebGL -->
<script
    src="https://unpkg.com/@antv/g-canvas/dist/index.umd.min.js"
    type="application/javascript"
></script>
<!-- <script src="https://unpkg.com/@antv/g-svg/dist/index.umd.min.js" type="application/javascript"></script>
<script src="https://unpkg.com/@antv/g-webgl/dist/index.umd.min.js" type="application/javascript"></script> -->
```

Then we can use some core objects such as [Canvas](/en/api/canvas) and [Circle](/en/api/basic/circle) under the namespace `window.G`:

```js
const { Circle, Canvas, CanvasEvent } = window.G;

// create a Canvas2D renderer
const canvasRenderer = new window.G.Canvas2D.Renderer();

// create a canvas
const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: canvasRenderer,
});

// create a Circle
const circle = new Circle({
    style: {
        r: 50,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 4,
        cursor: 'pointer',
    },
});

// wait for the initialization of Canvas
canvas.addEventListener(CanvasEvent.READY, () => {
    // append a Circle to canvas
    canvas.appendChild(circle);
});
```

[Demo in CodeSandbox](https://codesandbox.io/s/yi-umd-xing-shi-shi-yong-g-701x5?file=/index.js)

### NPM Module

Install core and renderer from NPM：

```bash
# Core
$ npm install @antv/g --save

# Canvas2D Renderer
$ npm install @antv/g-canvas --save
# SVG Renderer
$ npm install @antv/g-svg --save
# WebGL Renderer
$ npm install @antv/g-webgl --save
```

Then we can import some core objects such as [Canvas](/en/api/canvas) and [Circle](/en/api/basic/circle) from `@antv/g`:

```js
import { Canvas, CanvasEvent, Circle } from '@antv/g';
import { Renderer } from '@antv/g-canvas';

const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: new Renderer(),
});

const circle = new Circle({
    style: {
        r: 50,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 4,
        cursor: 'pointer',
    },
});

canvas.addEventListener(CanvasEvent.READY, () => {
    canvas.appendChild(circle);
});
```

[DEMO in CodeSandbox](https://codesandbox.io/s/yi-npm-module-xing-shi-shi-yong-g-wjfux?file=/index.js)

[DEMO in Stackblitz](https://stackblitz.com/edit/vitejs-vite-nnas74?file=src/main.ts)
