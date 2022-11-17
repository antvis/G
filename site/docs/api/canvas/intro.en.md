---
title: Introduction
order: -100
redirect_from:
    - /en/api
---

We provide the Canvas as a core object in the `@antv/g`, which is a "mini-browser" from a rendering perspective implemented in the browser and hosts three types of objects:

-   [Scene Graph](/en/api/canvas/scenegraph-lifecycle). We use it to describe the individual shapes in the scene and their hierarchical relationships.
-   [Camera](/en/api/camera/intro). We use it to define the angle at which the whole scene is viewed. We have a built-in camera for each canvas that uses orthogonal projection by default, which can be modified at any time subsequently.
-   [Renderer](/en/api/renderer/intro). We use it to specify which underlying technology the canvas uses to render the scene. Different renderers have different rendering capabilities, for example only [g-webgl](/en/api/renderer/webgl) can render 3D graphics. In 2D scenes we try to achieve consistent rendering with different renderers.

When designing the canvas API, we referenced the DOM API, so they share many similarities:

-   The canvas can be analogous to the [window](https://developer.mozilla.org/en-US/docs/Web/API/Window) object in the browser environment. Like window, the canvas inherits from [EventTarget](/en/api/builtin-objects/event-target) in the internal implementation. Unlike window, multiple canvases can coexist in the same page, i.e. multiple "parallel worlds" can exist at the same time.
-   The entry point of the page in the DOM tree is [window.document](https://developer.mozilla.org/en-US/docs/Web/API/Document) and in the canvas is `canvas.document`.
-   The root node in the DOM tree is [document.documentElement](https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement), which is `<html>`. It can also be accessed in the canvas via `canvas.document.documentElement`.

We chose to be as DOM API compatible as possible to reduce the memory learning cost for front-end users on the one hand, and to leverage the existing Web ecosystem on the other hand, e.g. to seamlessly access [existing gesture and drag libraries](/en/api/event/gesture-dragndrop).

For unconventional browser environments, we also provide options such as [OffscreenCanvas in WebWorker](/en/api/canvas/offscreen-canvas-ssr), [server-side rendering](/en/api/canvas/offscreen-canvas-ssr) and other options.

# Inherited from

[EventTarget](/en/api/builtin-objects/event-target)
