---
title: Introduction
order: -99
redirect_from:
    - /en/api/renderer
---

Renderers use the underlying rendering API to draw various types of graphics. We currently provide the following renderers, which are:

-   [g-canvas](/en/api/renderer/canvas) based on Canvas2D API
-   [g-canvaskit](/en/api/renderer/canvaskit) based on Canvaskit / Skia
-   [g-svg](/en/api/renderer/svg) based on SVG
-   [g-webgl](/en/api/renderer/webgl) based on WebGL 2/1
-   [g-webgpu](/en/api/renderer/webgpu) based on WebGPU

The renderer consists of a rendering context and a set of [plugins](/en/plugins) that allow the capabilities of the renderer to be dynamically extended at runtime.

Using the `g-canvas` renderer as an example, the basic usage is as follows.

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-canvas';

const canvasRenderer = new Renderer();
const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: canvasRenderer,
});
```

## Initial Configuration

When creating a renderer, a series of initialization configurations can be passed in to affect the actual rendering behavior.

### enableAutoRendering

Whether to enable auto-rendering or not, the default is on. "Auto-rendering" means that you do not need to manually invoke the rendering method of the canvas, but simply add the graphics to the canvas, which is also consistent with the browser behavior.

It can be turned off for some scenes where the rendering timing needs to be controlled manually.

```js
const webglRenderer = new WebGLRenderer({
    enableAutoRendering: false,
});
```

### enableDirtyCheck

Whether to turn on dirty check, default is on. When enabled, only changes in the graphics will trigger canvas redraw.

### enableCulling

Whether to turn on view cone culling, off by default. When on, only drawings within the viewport range will be drawn.

## Modify configuration

The `setConfig` allows you to modify the initial configuration, for example to enable automatic rendering again.

```js
renderer.setConfig({ enableAutoRendering: true });
```

## Plug-in related

We provide a number of ways to operate the plug-in.

### registerPlugin

Renders can dynamically add plugins at runtime to extend their capabilities, e.g. `g-webgl` can render 3D scenes via [g-pluin-3d](/en/plugins/3d).

```js
import { Plugin } from '@antv/g-plugin-3d';

webglRenderer.registerPlugin(new Plugin());
```

### unregisterPlugin

Removal of plug-ins.

```js
renderer.unregisterPlugin(plugin);
```

### getPlugin

Get plugins by name. Each plugin has its own name, and we agree that the name of `g-plugin-name` is `name`.

```js
import { Plugin } from '@antv/g-plugin-testonly';

const plugin = new Plugin();
plugin.name; // 'testonly'
```

So in the renderer it is possible to obtain by plugin name.

```js
renderer.register(plugin);

renderer.getPlugin('testonly'); // plugin
```

### getPlugins

Returns the list of plug-ins for the current renderer.

```js
renderer.getPlugins(); // [Plugin1, Plugin2]
```
