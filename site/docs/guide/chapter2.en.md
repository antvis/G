---
title: Section II - Using the renderer
order: 2
---

In this tutorial series, we will step-by-step implement a simple visualization scene that shows nodes and edges and gives them basic interaction capabilities such as dragging and picking.

In the previous section we defined a simple scene, in this section we will learn how to use [renderer](/en/api/renderer/intro) to complete the rendering.

-   [Example of this section](/en/examples/guide/basic/#chapter2)
-   [DEMO in CodeSandbox](https://codesandbox.io/s/ru-men-jiao-cheng-qs3zn?file=/index.js)

## Choosing a renderer

First we need to introduce one or more renderers, and if we introduce more than one, we can also switch them [at runtime](/en/guide/diving-deeper/switch-renderer#runtime). In this example we have selected only one Canvas2D renderer:

```javascript
import { Renderer } from '@antv/g-canvas';

const renderer = new Renderer();
```

## Creating a canvas

Then we need to create the canvas, using the renderer introduced above:.

```javascript
const canvas = new Canvas({
    container: 'container', // id of the DOM container
    width: 600,
    height: 500,
    renderer,
});
```

## Adding graphics to the canvas

With the canvas, we can add two nodes and an edge from the scene graph to the canvas, but of course we have to wait until the canvas is ready. We have two ways to know when the canvas is ready, either by listening to the [ready event](/en/api/canvas#ready-event) or [waiting for the ready Promise to return](/en/api/canvas#ready).

```javascript
canvas.addEventListener(CanvasEvent.READY, () => {
    canvas.appendChild(node1);
    canvas.appendChild(node2);
    canvas.appendChild(edge);
});

// or
await canvas.ready;
canvas.appendChild(node1);
canvas.appendChild(node2);
canvas.appendChild(edge);
```

At this point you can see the rendering effect, but there is something strange, the edge appears on top of the node, even blocking the text:

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*HQoYSocN12MAAAAAAAAAAAAAARQnAQ" width="400" alt="abnormal effect">

This problem is caused by the order in which we added the shapes to the canvas. We added the "edge" to the canvas last, and according to the painter's algorithm, it was drawn last, so it appears at the top.

The simplest solution is to modify the order, drawing the edges first and then the nodes.

```javascript
canvas.appendChild(edge);
canvas.appendChild(node1);
canvas.appendChild(node2);
```

At this point the effect is normal.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*te-lR4m9mRIAAAAAAAAAAAAAARQnAQ" width="400" alt="normal effect">

Alternatively, we can manually adjust the `zIndex`.

## Setting the display order

Similar to `zIndex` in CSS, we can manually set the drawing order of the two nodes so that they are higher than the edge (default is 0)：

```javascript
node1.style.zIndex = 1;
node2.style.zIndex = 1;
```

The basic graphics are drawn, so let's add some interaction.
