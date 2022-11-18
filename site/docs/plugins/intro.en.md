---
title: Introduction to the plug-in system
order: -100
redirect_from:
    - /en/plugins
---

In the process of continuous iteration, it is difficult to think through all the features that need to be supported at the beginning of development, and sometimes it is necessary to use the power of the community to continuously produce new feature points or optimize existing features. This requires the system to have a certain degree of scalability. The plug-in pattern is often the approach of choice, with the following advantages.

-   Single responsibility. Plug-in code is decoupled from the system code in engineering, can be developed independently, and the complexity of the internal logic of the framework isolated to developers.
-   Can be dynamically introduced and configured.

Plugin systems can be found in a wide range of popular software, such as Webpack, VSCode, and Chrome.

To make the rendering engine also well extensible, we also have a built-in plugin system that allows different renderers to extend their capabilities at runtime. The full set of currently supported plugins is listed below.

## Set of plug-ins

Extensible plug-in mechanism and rich set of plug-ins：

-   Rendering Related
    -   [g-plugin-canvas-renderer](/en/plugins/canvas-renderer) Rendering 2D graphics based on Canvas2D.
    -   [g-plugin-svg-renderer](/en/plugins/svg-renderer) Rendering 2D graphics based on SVG.
    -   [g-plugin-device-renderer](/en/plugins/device-renderer) Rendering 2D graphics based on GPUDevice.
    -   [g-plugin-html-renderer](/en/plugins/html-renderer) Rendering DOM with HTML.
    -   [g-plugin-3d](/en/plugins/3d) Extended 3D capabilities.
    -   [g-plugin-rough-canvas-renderer](/en/plugins/rough-canvas-renderer) Perform hand-drawn style rendering with [rough.js](https://roughjs.com/) and Canvs2D.
    -   [g-plugin-rough-svg-renderer](/en/plugins/rough-svg-renderer) Perform hand-drawn style rendering with [rough.js](https://roughjs.com/) and SVG.
    -   [g-plugin-canvaskit-renderer](/en/plugins/canvaskit-renderer) Rendering 2D graphics based on [Skia](https://skia.org/docs/user/modules/quickstart).
-   Picking
    -   [g-plugin-canvas-picker](/en/plugins/canvas-picker) Do picking with Canvas2D and mathematical calculations.
    -   [g-plugin-svg-picker](/en/plugins/svg-picker) Do picking with SVG and DOM API.
-   Interaction
    -   [g-plugin-dom-interaction](/en/plugins/dom-interaction) Binds event listeners with DOM API.
    -   [g-plugin-control](/en/plugins/control) Provides camera interaction for 3D scenes.
    -   [g-plugin-dragndrop](/en/plugins/dragndrop) Provides Drag 'n' Drop based on PointerEvents.
    -   [g-plugin-annotation](/en/plugins/annotation) Perform transformations on graphics in an interactive form like [Fabric.js](http://fabricjs.com/) and [Konva.js](https://konvajs.org/).
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
-   A11y
    -   [g-plugin-a11y](/en/plugins/a11y) Provides accessibility features.

### CDN

[Import the core and renderer code](/en/guide/introduce#cdn) in UMD format first, then import plugin code in the same way.

```html
<script src="https://unpkg.com/@antv/g-plugin-rough-canvas-renderer@1.7.16/dist/index.umd.min.js"></script>
```

Then we can use plugin under the namespace `window.G`, take [g-plugin-rough-canvas-renderer](/en/plugins/rough-canvas-renderer) as an example:

```js
const plugin = new window.G.RoughCanvasRenderer.Plugin();
```

[Codesandbox Example](https://codesandbox.io/s/yi-umd-xing-shi-shi-yong-g-yi-ji-cha-jian-zsoln8?file=/index.js)

### NPM Module

[Install core and renderer from NPM](/en/guide/introduce#npm-module) first, then we can install plugins in the same way. Take [g-plugin-rough-canvas-renderer](/en/plugins/rough-canvas-renderer) as an example:

```bash
$ npm install @antv/g-plugin-rough-canvas-renderer --save
```

Then we can [registerPlugin](/en/api/renderer/renderer#registerplugin) on renderer:

```js
import { Plugin } from '@antv/g-plugin-rough-canvas-renderer';

renderer.registerPlugin(new Plugin());
```

## Relationship with Renderer

These [renderers](/en/api/renderer/renderer) essentially consist of a set of plug-ins through which their capabilities can also be extended.

```js
renderer.registerPlugin(new Plugin());
```
