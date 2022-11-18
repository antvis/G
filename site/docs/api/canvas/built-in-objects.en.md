---
title: Built-in objects
order: 2
---

We all know the `window` object in the browser, the entry point of the DOM tree is `window.document`, and the entry point usually contains a root node `<html>` element, which can be obtained from `window.document.documentElement`. We add various DOM elements to this root node, such as `<head>`, `<body>`, etc.

Canvas canvases can be analogous to `window` objects. Similarly, each canvas is created with a built-in entry [Document](/en/api/builtin-objects/document), which can be obtained via `canvas.document`. This entry contains the root node of [Scene Graph](/en/guide/diving-deeper/scenegraph), which can be obtained via `canvas.document.documentElement`, and then you can add graphics to this root node via `appendChild` to complete the rendering. and then you can add graphics to this root node with `appendChild` to complete the rendering.

## document

Returns a built-in [Document](/en/api/builtin-objects/document) object that holds the root node of the scene graph. After getting this root node via `document.documentElement`, you can add child nodes using the scene graph capability:

```js
// append a Circle to canvas
canvas.document.documentElement.appendChild(circle);
canvas.document.documentElement.children; // [circle]
```

In addition to the add/remove node capability, other scene graph and event capabilities are also available on the root node:

```js
canvas.document.documentElement.getBounds();
canvas.document.addEventListener('click', () => {});
```

## document.documentElement

Alias of `getRoot()`, so the following two ways of writing it are equivalent:

```js
const root = canvas.getRoot(); // Group
const root = canvas.document.documentElement;
```

## getContextService

Get [rendering context](/en/api/renderer#rendering environment context), which is implemented by the renderer (`g-canvas/svg/webgl`). There are many common methods on this rendering context, such as:

-   `getDomElement()` Get the DOM element of current renderer, for example `g-canvas/webgl` will return a `<canvas>` element while `g-svg` will return a `<svg>` element.
-   `getDPR()` Get devicePixelRatio of current rendering context.

## getCamera

Get [camera](/en/api/camera/intro) and subsequently perform operations on that camera, such as switching projection mode, completing camera actions and animations, etc.

```js
const camera = canvas.getCamera();

// camera actions
camera.pan();
camera.rotate();

// switch to perspective projection
camera
    .setPosition(300, 100, 500)
    .setFocalPoint(300, 250, 0)
    .setPerspective(0.1, 1000, 75, 600 / 500);
```
