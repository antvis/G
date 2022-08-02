---
title: WebGL Renderer
order: 2
---

Use [WebGLRenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext) or [WebGL2RenderingContext](https: //developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext) for rendering. Compared with [Canvas renderer](/en/docs/api/renderer/canvas) and [SVG renderer](/en/docs/api/renderer/svg), it has more powerful rendering capabilities and has obvious advantages in large volume graphics and 3D scenes.

# Usage

As with `@antv/g`, there are two ways to use it.

## NPM Module

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

## CDN

```html
<script
  src="https://unpkg.com/@antv/g-webgl/dist/index.umd.min.js"
  type="application/javascript">
```

The renderer is available from the `G.WebGL` namespace under.

```js
const webglRenderer = new window.G.WebGL.Renderer();
```

# Initial Configuration

## targets

Selects the rendering environment. The default value is `['webgl2', 'webgl1']` and is automatically downgraded automatically by that priority.

For example, in some special environments, only the WebGL1 environment is selected to run in.

```js
const webglRenderer = new WebGLRenderer({
    targets: ['webgl1'],
});
```

# Built-in plug-ins

The renderer has the following plug-ins built in.

-   [g-plugin-device-renderer](/en/docs/plugins/device-renderer) GPUDevice based rendering capabilities
-   [g-plugin-webgl-device](/en/docs/plugins/webgl-device) Implementing GPUDevice Capabilities based on [WebGLRenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext) and [WebGL2RenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext)
-   [g-plugin-dom-interaction](/en/docs/plugins/dom-interaction) DOM API-based event binding

# Optional plug-ins

In addition to the built-in plug-ins, the following plug-ins are also available.

## 3D rendering capabilities

[g-plugin-3d](/en/docs/plugins/3d) Provides 3D rendering capabilities, including common objects such as [Mesh](/en/docs/api/3d/mesh) [Material](/en/docs/api/3d/material) [Geometry](/en/docs/api/3d/geometry).

## Camera Interaction

[g-plugin-control](/en/docs/plugins/control) provides camera interaction for 3D scenes, internally using Hammer.js to respond to mouse-over, scroll-wheel events. Depending on the [camera type](/en/docs/api/camera#camera-types), different interaction effects are provided.
