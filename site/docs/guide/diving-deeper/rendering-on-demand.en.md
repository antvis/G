---
title: Rendering on Demand
order: 100
---

In most scenarios, the rendering engine will automatically redraw every frame. However, in some scenarios, we need to decide when to redraw ourselves.

First, we need to disable the renderer's "automatic rendering":

```javascript
const webglRenderer = new WebGLRenderer({
    // Disable automatic rendering
    enableAutoRendering: false,
});
```

Then, call the canvas's [redraw method](/en/api/canvas/scenegraph-lifecycle#render) at the appropriate time. For example, you can manually call it in a `rAF` callback:

```javascript
// create a main loop
const tick = () => {
    // call `render` in each frame
    canvas.render();
    requestAnimationFrame(tick);
};
tick();
```
