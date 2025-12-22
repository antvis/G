---
title: Architecture Introduction
order: 0
redirect_from:
    - /en/inside-g
---

Usually, users can draw with G in three steps:

1. Use a [Scene Graph](/en/guide/diving-deeper/scenegraph) to describe the objects to be rendered.
2. [Import on demand](/en/guide/diving-deeper/switch-renderer) one or more Renderers.
3. Use the renderer to render the scene graph, and different renderers can be switched at runtime.

![](https://gw.alipayobjects.com/mddn/rms_6ae20b/afts/img/A*PAufRYPbf4UAAAAAAAAAAAAAARQnAQ)

Among them, the scene graph is an abstraction independent of various renderers. Therefore, in applications that are not related to the actual rendering effect, such as component libraries and layout systems, there is no need to deal directly with the renderer. Each renderer should ensure a consistent rendering effect in its own environment. In terms of syntax for building the scene graph and operating the nodes in the graph, we provide [methods consistent with the DOM API](/en/api/basic/display-object#add-and-remove-nodes), and also provide [CSS selector-like syntax](/en/api/basic/display-object#advanced-queries) to query nodes in the graph, so as to reduce the learning cost for front-end developers as much as possible.

In terms of extensibility, we provide a **plugin mechanism** from the two dimensions of scene graph and rendering service.

The scene graph plugin cares about the [lifecycle](/en/guide/advanced-topics/container) of each node, and selects some of these stages to extend the node's capabilities.

We have defined a unified core rendering layer, which does not care about the implementation of specific renderers, and exposes the lifecycle for extension. Taking the WebGL renderer as an example, it extends components such as Material for each node in the scene graph by registering plugins, so as to adapt to the WebGL rendering environment.

Through [dependency injection](/en/guide/advanced-topics/container), each renderer implements a unified context and rendering service interface. The core layer does not care about the specific implementation of the renderer, so different renderers can be dynamically replaced at runtime.

# Unified Rendering Service

We have defined a set of unified rendering services in the core layer of G, which defines the following lifecycle. Each renderer completes the rendering process in its own rendering environment by associating with each stage in the lifecycle:

```js
hooks = {
    // Rendering service initialization, also called when switching to a new renderer
    init: new SyncHook<[]>(),
    // Process objects to be rendered
    prepareEntities: new AsyncSeriesWaterfallHook<[Entity[], DisplayObject]>(['entities', 'root']),
    // Render frame begins
    beginFrame: new AsyncSeriesHook<[Entity[]]>(['entities']),
    // Rendering
    renderFrame: new AsyncSeriesHook<[Entity[]]>(['entities']),
    // Render frame ends
    endFrame: new AsyncSeriesHook<[Entity[]]>(['entities']),
    // Rendering service destroyed, called by the old renderer after switching to a new renderer
    destroy: new SyncHook<[]>(),
};
```

Among them, the core layer implements a series of general plugins, which are not related to the specific rendering environment:

**MountDisplayObjectPlugin**

- `prepareEntities` is called when it is mounted to the canvas for the first time, triggering the `mounted` lifecycle of the rendered object.

**DirtyCheckPlugin** implements [dirty rectangle rendering](/en/guide/advanced-topics/performance-optimization#dirty-rectangle-rendering)

- `init` listens for changes in the bounding box of each object to be rendered.
- `prepareEntities` filters the list of objects to be rendered that contain the dirty flag, merges the dirty rectangles, and uses R-Tree to speed up the query of the incremental redrawing object list.
- `endFrame` For each object in the list of objects that have been drawn in the current frame, save its bounding box for the next dirty check merge.
- `destroy` removes the listener for changes in the bounding box of each object to be rendered.

**CullingPlugin** is responsible for culling to get the smallest set of objects that need to be redrawn.

- `prepareEntities` culls through `visibility` and the viewport bounding box.

**SortPlugin** is responsible for object sorting.

- `prepareEntities` sorts by `z-index`.

## g-renderer-canvas

**DirtyRectanglePlugin**

- beginFrame
  - `context.save()`
  - Erase the dirty rectangle and create a clip.
- renderFrame
  - Apply the transformation matrix.
  - Apply properties in the Canvas 2D context.
  - Draw the path.
  - Fill and stroke.
- endFrame
  - `context.restore()`

## g-renderer-svg

## g-renderer-webgl
