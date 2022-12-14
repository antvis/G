---
title: Scenegraph & Lifecycle
order: 2
---

## Add/remove scene graph nodes

Since canvas does not inherit from [Node](/en/api/builtin-objects/node), it does not have node manipulation capability by itself. However, we have added some shortcuts and the following node operations are essentially done on the root node, e.g. the following two writes are equivalent:

```js
canvas.appendChild(circle);
canvas.document.documentElement.appendChild(circle);
```

### appendChild

Adds the object to be rendered to the canvas. If the object has children, they are also added together.

```js
const circle = new Circle({ style: { r: 10 } });

canvas.appendChild(circle);
// or canvas.document.documentElement.appendChild(circle);
```

### removeChild

Removes the object from the canvas. If the object has children, they are removed as well.

```js
canvas.removeChild(circle);
// or canvas.document.documentElement.removeChild(circle);
```

To be consistent with the DOM API, just removing the object does not destroy it. If you want to destroy it, you need to call `destroy()`.

### removeChildren

Removes all objects in the canvas.

```js
canvas.removeChildren();
// or canvas.document.documentElement.removeChildren();
```

### destroyChildren

Removes and destroys all objects in the canvas.

```js
canvas.destroyChildren();
```

## Lifecycle

The initialization logic is performed upon instantiation, and the following lifecycle methods can be called afterwards.

### ready

When initialization is complete, a Promise is returned that is equivalent to listening for the [CanvasEvent.READY](/en/api/canvas/event#ready-event) event.

```js
await canvas.ready;

// or
import { CanvasEvent } from '@antv/g';
canvas.addEventListener(CanvasEvent.READY, () => {});
```

### render

Rendering the canvas, since the renderer has auto-rendering enabled by default, there is no need to call it manually in most cases. However, some scenes require manual control of rendering timing, in which case [rendering-on-demand](/en/guide/diving-deeper/rendering-on-demand) [example](/en/examples/canvas/canvas-basic/#rendering-on-demand).

```js
const webglRenderer = new WebGLRenderer({
    enableAutoRendering: false,
});

canvas.render();
```

### destroy(destroyScenegraph = true)

Destroy the canvas, executing the following destruction logic in turn.

-   If auto-rendering is enabled, stop the main rendering loop.
-   Remove the entire scene graph from the canvas, and destroy it if `destroyScenegraph` is set.
-   Destroying the rendering context.

```js
// Destroy the canvas only, keep the scene graph
canvas.destroy();

// Destroy the scene graph in the canvas together
canvas.destroy(true);
```
