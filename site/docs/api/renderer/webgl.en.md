---
title: WebGL Renderer
order: 2
---

Use [WebGLRenderingContext](https://developer.mozilla.org/en-US/Web/API/WebGLRenderingContext) or [WebGL2RenderingContext](https: //developer.mozilla.org/en-US/Web/API/WebGL2RenderingContext) for rendering. Compared with [Canvas renderer](/en/api/renderer/canvas) and [SVG renderer](/en/api/renderer/svg), it has more powerful rendering capabilities and has obvious advantages in large volume graphics and 3D scenes.

## Usage

As with `@antv/g`, there are two ways to use it.

### NPM Module

After installing `@antv/g-webgl` you can get the renderer from.

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-webgl';

const webglRenderer = new Renderer();

const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: webglRenderer,
});
```

### CDN

```html
<script
  src="https://unpkg.com/@antv/g-webgl/dist/index.umd.min.js"
  type="application/javascript">
```

The renderer is available from the `G.WebGL` namespace under.

```js
const webglRenderer = new window.G.WebGL.Renderer();
```

## Initial Configuration

### targets

Selects the rendering environment. The default value is `['webgl2', 'webgl1']` and is automatically downgraded automatically by that priority.

For example, in some special environments, only the WebGL1 environment is selected to run in.

```js
const webglRenderer = new WebGLRenderer({
    targets: ['webgl1'],
});
```

### onContextLost

The `webglcontextlost` event of the WebGL API is fired if the user agent detects that the drawing buffer associated with a WebGLRenderingContext object has been lost.

<https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/webglcontextlost_event>

```js
const webglRenderer = new WebGLRenderer({
    onContextLost: (e: Event) => {},
});
```

### onContextRestored

The `webglcontextrestored` event of the WebGL API is fired if the user agent restores the drawing buffer for a WebGLRenderingContext object.

<https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextrestored_event>

```js
const webglRenderer = new WebGLRenderer({
    onContextRestored: (e: Event) => {},
});
```

### onContextCreationError

The `webglcontextcreationerror` event of the WebGL API is fired if the user agent is unable to create a WebGLRenderingContext context.

<https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextcreationerror_event>

```js
const webglRenderer = new WebGLRenderer({
    onContextCreationError: (e: Event) => {},
});
```

## Built-in plug-ins

The renderer has the following plug-ins built in.

-   [g-plugin-device-renderer](/en/plugins/device-renderer) GPUDevice based rendering capabilities
-   [g-plugin-webgl-device](/en/plugins/webgl-device) Implementing GPUDevice Capabilities based on [WebGLRenderingContext](https://developer.mozilla.org/en-US/Web/API/WebGLRenderingContext) and [WebGL2RenderingContext](https://developer.mozilla.org/en-US/Web/API/WebGL2RenderingContext)
-   [g-plugin-dom-interaction](/en/plugins/dom-interaction) DOM API-based event binding

## Optional plug-ins

In addition to the built-in plug-ins, the following plug-ins are also available.

### 3D rendering capabilities

[g-plugin-3d](/en/plugins/3d) Provides 3D rendering capabilities, including common objects such as [Mesh](/en/api/3d/mesh) [Material](/en/api/3d/material) [Geometry](/en/api/3d/geometry).

### Camera Interaction

[g-plugin-control](/en/plugins/control) provides camera interaction for 3D scenes, internally using Hammer.js to respond to mouse-over, scroll-wheel events. Depending on the [camera type](/en/api/camera/intro), different interaction effects are provided.
