---
title: Choose a renderer
order: 99
---

After describing the objects to be rendered by the scene graph, we need to give them to the renderer. Which renderer to use is introduced by the user on demand and can be switched at runtime.

## Use renderer on demand

We currently provide a variety of [renderers](/en/api/renderer/intro) that users can introduce on-demand like plugins, but at least one is required.

```js
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
```

This allows you to choose one of the renderers introduced when creating [Canvas](/zh/api/canvas/intro), e.g. if we introduce a Canvas and a WebGL renderer, we can choose between the two.

```js
import { Canvas } from '@antv/g';
const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    // renderer: new CanvasRenderer(),
    renderer: new WebGLRenderer(),
});
```

Many rendering engines choose the default renderer for the user, for example Pixi.js gives preference to WebGL and downgrades to Canvas if it is not supported. in G this choice is left to the user.

## Switching at runtime

If multiple renderers are introduced, they can be switched at runtime. Currently all DEMOs on the G website can be switched in the `renderer` panel without interrupting the animation. In G6, for example, you can dynamically determine whether you need to switch to the WebGL renderer by the number of nodes and edges.

```js
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SvgRenderer } from '@antv/g-svg';

const webglRenderer = new WebGLRenderer();
const svgRenderer = new SvgRenderer();

if (tooManyShapes) {
    canvas.setRenderer(webglRenderer);
} else {
    canvas.setRenderer(svgRenderer);
}
```
