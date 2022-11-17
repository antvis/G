---
title: SVG Renderer
order: 1
---

Use [SVG](https://developer.mozilla.org/zh-CN/Web/SVG) to draw 2D graphics. A `<svg>` element is created in the container.

SVG has the unique advantage of relying directly on the browser's ability to render text. It is also possible to embed HTML fragments via `<foreignObject>`.

## Usage

As with `@antv/g`, there are two ways to use it.

### NPM Module

After installing `@antv/g-svg` you can get the renderer from.

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-svg';

const svgRenderer = new Renderer();

const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: svgRenderer,
});
```

### CDN

```html
<script
  src="https://unpkg.com/@antv/g-svg/dist/index.umd.min.js"
  type="application/javascript">
```

The renderer is available from the `G.SVG` namespace under.

```js
const svgRenderer = new window.G.SVG.Renderer();
```

## Initial Configuration

When creating a renderer, you can pass in some initialization configuration items, such as.

```js
import { Renderer } from '@antv/g-svg';
const renderer = new Renderer({
    outputSVGElementId: false,
});
```

### outputSVGElementId

The renderer adds the `id` attribute when generating the SVGElement, which is used to pick up the decision to counter-check the element when interacting. However, in scenarios like server-side rendering, where there is no interaction and no need for generation, this can be turned off with this configuration item.

```html
<!-- Enable by default -->
<g id="g_svg_g_450" fill="none"></g>

<!-- Disable -->
<g fill="none"></g>
```

## Built-in plug-ins

The renderer has the following plug-ins built in.

-   [g-plugin-svg-renderer](/en/plugins/svg-renderer) Draw shapes using SVG elements, such as `<circle>`, `<rect>`, etc.
-   [g-plugin-svg-picker](/en/plugins/svg-picker) Pick up graphics based on [elementFromPoint](https://developer.mozilla.org/zh-CN/Web/API/Document/elementFromPoint) DOM API
-   [g-plugin-dom-interaction](/en/plugins/dom-interaction) DOM API-based event binding

## Optional plug-ins

In addition to the built-in plug-ins, the following optional plug-ins are available.

### Hand-drawn style rendering

Use the SVG version of [rough.js](https://roughjs.com/) for hand-drawn style rendering.

We provide [g-plugin-rough-svg-renderer](/en/plugins/rough-svg-renderer) plugin, which will replace [g-plugin-svg-renderer](/en/plugins/svg- renderer) for some 2D graphics.

The effect of [example](/en/examples/plugins/rough/#rough) is as follows.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*d4iiS5_3YVIAAAAAAAAAAAAAARQnAQ" width="500">

## Server-side rendering

The renderer relies on the rendering capabilities of the SVG DOM API and is not limited to the browser side, so server-side rendering is also possible using [JSDOM](https://github.com/jsdom/node-jsdom).

In our [integration test](https://github.com/antvis/g/tree/next/integration/__node__tests__/svg), we will work with [JSDOM](https://github.com/jsdom/node-) on the Node side jsdom) with [node-canvas](https://github.com/Automattic/node-canvas) to render the result image and compare it with the benchmark image. Other server-side rendering scenes can also follow the following steps.

1. Use [unregisterPlugin](/en/api/renderer/renderer#unregisterplugin) to unregister the DOM API-related plugins built into [g-svg](/en/api/renderer/svg), such as the event binding [g-plugin-dom-interaction](/en/plugins/dom-interaction).
2. Create a canvas container using JSDOM.
3. Use the container from the previous step to create the canvas, and pass in the `document` created by JSDOM instead of `window.document` in the browser environment, and the same for `raf`.
4. Normal use of [g-svg](/en/api/renderer/svg) renderer to create scenes via G's API.
5. Use [xmlserializer](https://www.npmjs.com/package/xmlserializer) to serialize JSDOM to a string and save it as an SVG image.

https://github.com/antvis/g/blob/next/integration/__node__tests__/svg/circle.spec.js

```js
const fs = require('fs');
const { JSDOM } = require('jsdom');
const xmlserializer = require('xmlserializer');
const { Circle, Canvas } = require('@antv/g');
const { Renderer } = require('@antv/g-svg');

// create a renderer, unregister plugin relative to DOM
const renderer = new Renderer();
const domInteractionPlugin = renderer.getPlugin('dom-interaction');
renderer.unregisterPlugin(domInteractionPlugin);

// create JSDOM
const dom = new JSDOM(`
<div id="container">
</div>
`);

const SIZE = 200;
const canvas = new Canvas({
    container: 'container',
    width: SIZE,
    height: SIZE,
    renderer,
    document: dom.window.document, // use document created by JSDOM
    requestAnimationFrame: dom.window.requestAnimationFrame,
    cancelAnimationFrame: dom.window.cancelAnimationFrame,
});

// use G API constructing scene graph
const circle1 = new Circle({
    style: {
        cx: 10,
        cy: 10,
        r: 10,
        fill: 'red',
    },
});
canvas.appendChild(circle1);

// serialize JSDOM to SVG string
xmlserializer.serializeToString(
    dom.window.document.getElementById('container').children[0],
);
```
