---
title: Document
order: 4
---

The following inheritance relationships exist in G.

-   Document -> Node -> EventTarget

We can analogize `Document` to `window.document` in the browser environment, e.g. in a browser.

-   It has a reference to `window` [defaultView](/en/api/builtin-objects/document#defaultview)
-   Access `<html>` elements via [documentElement](/en/api/builtin-objects/document#documentelement)
-   Nodes can be queried by a series of methods, such as [getElementById](/en/api/builtin-objects/document#getelementbyid)
-   Create an element by [createElement](/en/api/builtin-objects/document#createelement)

We have implemented the above browser-provided API as much as possible.

## Inherited from

[Node](/en/api/builtin-objects/node)

## Properties

### nodeName

implements [Node.nodeName](/en/api/builtin-objects/node#nodename), which returns `'document'` and can be used in event handlers to quickly determine the target, e.g. when clicking on a blank area of the canvas.

```js
canvas.addEventListener('click', (e) => {
    e.target; // Document

    if (e.target.nodeName === 'document') {
        //...
    }
});
```

### defaultView

Point to the [canvas](/en/api/canvas), e.g.

```js
canvas.document.defaultView; // canvas
```

<https://developer.mozilla.org/en-US/docs/Web/API/Document/defaultView>

### documentElement

Returns the root node in the scene graph. When creating a canvas, [Group](/en/api/basic/group) is used by default to create a.

```js
canvas.document.documentElement; // Group
canvas.document.documentElement.getBounds(); // Get the whole scene bounding box
```

<https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement>

### timeline

The default timeline, used in the animation system.

<https://developer.mozilla.org/zh-CN/docs/Web/API/Document/timeline>

### ownerDocument

Return null.

## Methods

Since it inherits from [Node](/en/api/builtin-objects/node), it obviously has event binding capabilities.

```js
canvas.document.addEventListener('click', () => {});
```

However, some of the methods, especially the node operations, differ from Node.

### Node Operations

Although it inherits from [Node](/en/api/builtin-objects/node), some node manipulation methods cannot be called on the Document, just as calling `document.appendChild` in the browser returns the following error.

```bash
Uncaught DOMException: Failed to execute 'appendChild' on 'Node': Only one element on document allowed.
```

### Node Query

The following node query methods are equivalent to executing on [document.documentElement](/en/api/builtin-objects/document#documentelement).

#### getElementById

<https://developer.mozilla.org/zh-CN/docs/Web/API/Document/getElementById>

#### getElementsByName

<https://developer.mozilla.org/zh-CN/docs/Web/API/Document/getElementsByName>

#### getElementsByClassName

<https://developer.mozilla.org/zh-CN/docs/Web/API/Document/getElementsByClassName>

#### getElementsByTagName

<https://developer.mozilla.org/zh-CN/docs/Web/API/Document/getElementsByTagName>

#### querySelector

<https://developer.mozilla.org/zh-CN/docs/Web/API/Document/querySelector>

#### querySelectorAll

<https://developer.mozilla.org/zh-CN/docs/Web/API/Document/querySelectorAll>

### createElement

Usually we recommend using `new Circle()` to create built-in or custom graphics, but we also provide something like the DOM [CustomElementRegistry](<https://developer.mozilla.org/en-US/docs/Web/API/> CustomElementRegistry) API to create a completed registered graph using [document.createElement](/en/api/builtin-objects/document#createelement), so the following writeup is equivalent.

```js
import { Shape, Circle } from '@antv/g';

const circle = canvas.document.createElement(Shape.CIRCLE, {
    style: { r: 100 },
});

// or
const circle = new Circle({ style: { r: 100 } });
```

<https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement>

### createElementNS

The current implementation is the same as [createElement](/en/api/builtin-objects/document#createelement).

### elementFromPoint

When we want to know how many shapes are stacked on a certain point in the canvas, we can do the pickup by API way, besides the interactive events.

This method accepts a set of `x, y` coordinates (under [Canvas coordinate system](/en/api/canvas/coordinates#canvas), if you want to use coordinates under other coordinate system, please use [conversion method](/en/api/canvas#conversion method)) as parameters and returns the pickup result.

In the following [example](/en/examples/canvas#element-from-point), we place a [Circle](/en/api/canvas/coordinates#canvas) with radius `100, 100` under [Canvas coordinate system](/en/api/canvas/coordinates#canvas). en/docs/api/basic/circle), which will be returned when picked up at the red dot.

```js
const topMostElement = await canvas.document.elementFromPoint(20, 100); // circle1

await canvas.document.elementFromPoint(0, 0); // canvas.document.documentElement
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*XAYjSJnlCIYAAAAAAAAAAAAAARQnAQ" width="400px">

There are three points to note.

1. Unlike the synchronous API provided by the browser, this method is **asynchronous** because some renderer implementations (e.g. `g-webgl`) need to be picked up via the GPU.
2. when only the topmost graph of the point hit is needed, `elementFromPoint` should be used instead of `elementsFromPoint`, as the former is faster than the latter in most scenarios
3. The pickup decision follows the following rules.

    1. Out of canvas viewport range (considering camera, not necessarily equal to canvas range) returns null.
    2. The [interactive](/en/api/basic/display-object#interactive) attribute**of the graph affects**pickup. Non-interactive graphics cannot be picked up. 3.
    3. The [visibility](/en/api/basic/display-object#visibility) attribute**of a drawing affects**pickup. Invisible shapes cannot be picked up. 4.
    4. The [opacity](/en/api/basic/display-object#opacity) attribute**of a drawing does not affect**pickup. Even if the graphic is completely transparent, it will still be picked up.

<https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint>

### elementsFromPoint

When there are multiple graphs stacked on the target point, this method returns them sorted by [z-index](/en/api/basic/display-object#zindex), with the first element of the result being the topmost graph.

This method also accepts a set of `x, y` coordinates as arguments.

In the following [example](/en/examples/canvas#element-from-point), circle2 is on top of circle1, so picking both in the overlapping region appears in the result array, and circle2 comes first.

```js
const elements = await canvas.document.elementsFromPoint(150, 150); // [circle2, circle1, document.documentElement]
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*LqlZSYwRBPoAAAAAAAAAAAAAARQnAQ" width="500px">

Caveats.

1. The difference between this return result and [composedPath()](/en/api/event#composedpath) on the event object is that the latter appends [Document](/en/api/builtin-objects/document) and [Canvas](/en/api/canvas) objects, while the former only goes to [Canvas root](/en/api/canvas#getroot-group). 2.
2. Return an empty array beyond the canvas viewport range.

<https://developer.mozilla.org/en-US/docs/Web/API/Document/elementsFromPoint>

### elementsFromBBox

Area queries, especially boundingbox-based detection, are particularly useful in scenarios such as

-   Dirty rectangle rendering for determining the affected area
-   Rectangle swiping for batch selection of graphics

This type of wraparound box-based detection does not need to be too precise, and is fast with spatial indexing like internal RBush.

This method is synchronous and accepts the enclosing box description `minX, minY, maxX, maxY` coordinates (under [Canvas coordinate system](/en/api/canvas/coordinates#canvas)).

```js
const elements = document.elementsFromBBox(minX, minY, maxX, maxY);
```

Caveats.

1. will consider [visibility](/en/api/basic/display-object#visibility) and [pointer-events](/en/api/basic/display-object#pointerevents) attributes
2. no need to consider GPU-based picking implementations like WebGL / WebGPU, synchronous methods
3. the returned array of elements is sorted by the actual rendering order

### elementFromPointSync

The synchronized version of [elementFromPoint](/en/api/builtin-objects/document#elementfrompoint), it is worth noting that not all [renderers](/en/api/renderer/renderer) will implement this method, currently only [g-canvas](/en/api/renderer/canvas), [g-svg](/en/api/renderer/svg) and [g-canvaskit](/en/api/renderer/canvaskit) provide the corresponding implementations.

```js
const element = canvas.document.elementFromPoint(0, 0); // canvas.document.documentElement
```

### elementsFromPointSync

The synchronized version of [elementsFromPoint](/en/api/builtin-objects/document#elementsfrompoint), it is worth noting that not all [renderers](/en/api/renderer/renderer) will implement this method, currently only [g-canvas](/en/api/renderer/canvas), [g-svg](/en/api/renderer/svg) and [g-canvaskit](/en/api/renderer/ canvaskit) provide the corresponding implementations.

```js
const elements = canvas.document.elementsFromPoint(150, 150); // [circle2, circle1, document.documentElement]
```
