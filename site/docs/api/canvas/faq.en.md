---
title: Frequently Asked Questions
order: 100
---

## Multiple Canvas Coexistence

Multiple canvases can coexist on the same page, i.e., multiple "parallel worlds" can exist at the same time. However, this is limited by the underlying rendering API, e.g. WebGL only allows up to 8 contexts. [example](/en/examples/canvas/container/#multi-canvas)

## Using the created canvas element

In this [example](/en/examples/canvas/container/#user-defined-canvas), we create our own `<canvas>` element, which we use to create the canvas.

```js
const $canvas = document.createElement('canvas');
$canvas.width = 600;
$canvas.height = 500;
document.getElementById('container').appendChild($canvas);

const canvas = new Canvas({
    canvas: $canvas,
    renderer: new CanvasRenderer(),
});
```
