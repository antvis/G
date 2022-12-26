---
title: Coordinate system
order: 2
---

When we talk about "location", it must be relative to some coordinate system, in G we use Client, Screen, Page, Canvas and Viewport coordinate systems, for example, in [event system](/en/api/event/intro) you can get the coordinates from the event object in different coordinate systems.

```js
canvas.addEventListener('click', (e) => {
    e.clientX;
    e.screenX;
    e.pageX;
    e.canvasX;
    e.viewportX;
});
```

Of these coordinate systems, Client, Screen, and Page are all natively supported by the browser, so we don't make any changes to these coordinate values on the event object. The Canvas canvas is like a "mini-browser" implemented in the browser, so its viewport coordinate system is analogous to the browser's Client coordinate system. When the camera moves, our viewing area changes, similar to a page scrolling, but the position of the graphics in the world does not change, so the Canvas coordinate system is analogous to the browser's Page coordinate system.

These coordinate systems all have the upper left corner as the origin:

<img src="https://developer.mozilla.org/en-US/Web/API/Canvas_API/Tutorial/Drawing_shapes/canvas_default_grid.png" alt="canvas coordinates origin">

⚠️ If [g-plugin-3d](/en/plugins/3d) plugin is used, the Z-axis is pointing off-screen.

We provide methods to convert between them, and in this [example](/en/examples/canvas/canvas-basic/#coordinates), move the mouse to see the value of the mouse location in each coordinate system:

-   Client <-> Viewport
-   Canvas <-> Viewport

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*kPfcTKwZG90AAAAAAAAAAAAAARQnAQ" width="300" alt="coordinates conversion">

## Client

Front-end developers should be most familiar with the Client browser coordinate system, which takes the upper-left corner of the browser as the origin, and G does not modify this coordinate value for native event objects, [example](https://developer.mozilla.org/en-US/Web/API/MouseEvent/clientX).

https://developer.mozilla.org/en-US/Web/API/MouseEvent/clientX

If the document is not scrolled, which is equivalent to the Page coordinate, the following figure shows the difference with Screen:

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*TYQJR40KMm0AAAAAAAAAAAAAARQnAQ" width="300" alt="page coordinates">

## Screen

The screen coordinate system is also the common browser coordinate system, with the top left corner of the screen as the origin, and is affected by page scrolling. we won't modify this coordinate value of the native event object.

https://developer.mozilla.org/en-US/Web/API/MouseEvent/screenX

It is worth mentioning that negative numbers may appear in dual screens, for example in the left screen, [example](https://developer.mozilla.org/en-US/Web/API/MouseEvent/screenX).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*SlEMSJq20R4AAAAAAAAAAAAAARQnAQ" width="300" alt="screen coordinates">

## Page

With the top left corner of the document as the origin and considering the document scrolling, G does not modify this coordinate value of the native event object.

https://developer.mozilla.org/en-US/Web/API/MouseEvent/pageX

## Canvas

An analogy can be drawn to the browser's Client coordinate system, also known as the world coordinate system, to which the positions we specify when creating a drawing are relative. It takes the top left corner of the DOM element of the canvas as the origin, with the X-axis pointing forward to the right side of the screen and the Y-axis pointing forward to the bottom of the screen. Also known as the "world coordinate system", when it comes to rotation, we set the direction of rotation to be clockwise along the axes.

## Viewport

In the browser's Page coordinate system, the coordinates of the element in the document do not change regardless of page scrolling; what changes is our viewing area.

Similarly, [camera](/en/api/camera/intro) determines the angle from which we view the world. If the camera does not move, the Viewport coordinate system and the Canvas coordinate system will coincide exactly, so the coordinates of the upper-left corner of the Viewport are the same as the origin of the Canvas coordinate system, `[0, 0]`, in our visible range. However, if the camera is panned, rotated, or scaled, the viewport will also change accordingly, and the position of `[0, 0]` in the upper-left corner of the viewport will no longer be `[0, 0]` in the Canvas coordinate system.

## Conversion method

We provide the following transformation methods needed to use Point, which has the following structure and can be introduced from the G core package, [example](/en/examples/canvas/canvas-basic/#coordinates):

```js
interface Point {
    x: number;
    y: number;
}

import type { Point } from '@antv/g';
```

### Client <-> Viewport

We provide a method for converting from the browser's Client coordinate system to the canvas Viewport coordinate system, [example](/en/examples/canvas/canvas-basic/#coordinates):

-   client2Viewport(client: Point): Point
-   viewport2Client(canvas: Point): Point

In the internal implementation, we use the following calculation logic, for example, from Client to Viewport, we first get the bounding box of the canvas DOM element under the Client coordinate system, using [getBoundingClientRect](https://developer.mozilla.org/en-US/ Web/API/Element/getBoundingClientRect), and then subtract the coordinates of the upper-left corner of the bounding box from clientX/Y to get the coordinates of the upper-left corner of the DOM element relative to the canvas, i.e., the Viewport coordinates:

```js
// 获取画布 DOM 元素在 Client 坐标系下的包围盒
// @see https://developer.mozilla.org/en-US/Web/API/Element/getBoundingClientRect
const bbox = $canvas.getBoundingClientRect();

viewportX = clientX - bbox.left;
viewportY = clientY - bbox.top;
```

For example, the `<canvas>` element in the DOM tree is absolutely positioned at `[100, 100]` from the top left corner of the browser, and when the mouse moves to the `[0, 0]` position in the top left corner of `<canvas>`, the Client coordinates are `[100, 100]`.

```js
canvas.viewport2Client({ x: 0, y: 0 }); // Point { x: 100, y: 100 }
canvas.client2Viewport({ x: 100, y: 100 }); // Point { x: 0, y: 0 }
```

For compatibility with older versions of the G API, we also provide:

-   getPointByClient(clientX: number, clientY: number): Point
-   getClientByPoint(viewportX: number, viewportY: number): Point

### Canvas <-> Viewport

The [camera](/en/api/camera) determines the angle from which we view the world. If the camera does not move, the Viewport coordinate system and the Canvas coordinate system will coincide exactly, so within our visible range, the coordinates of the upper-left corner of the viewport are the same as the Canvas coordinate system origin, both are `[0, 0]`. However, if the camera is panned, rotated, or scaled, the viewport will change accordingly, and the `[0, 0]` position in the upper-left corner of the viewport will no longer be `[0, 0]` in the Canvas coordinate system.

In [example](/en/examples/canvas/canvas-basic/#coordinates), we moved the camera up a distance (the whole world moves down in the viewer's eyes) and found that the center of the circle remains the same in the Canvas coordinate system, `[300, 200]`, but is shifted in the Viewport coordinate system as follows.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*qe5tR4G5AD4AAAAAAAAAAAAAARQnAQ" width="300" alt="canvas to viewport">

We offer the following conversion methods:

-   viewport2Canvas(viewport: Point): Point
-   canvas2Viewport(canvas: Point): Point

In the internal implementation, we use the following computational logic to transform, for example, from Canvas to Viewport, from the world coordinate system to the crop coordinate system, to NDC, and finally to the viewport coordinate system:

```js
// Camera VP Matrix
const camera = canvas.getCamera();
const projectionMatrix = camera.getPerspective();
const viewMatrix = camera.getViewTransform();
const vpMatrix = mat4.multiply(mat4.create(), projectionMatrix, viewMatrix);

// Canvas -> Clip
const clip = vec3.fromValues(canvasX, canvasY, 0);
vec3.transformMat4(clip, clip, vpMatrix);

// Clip -> NDC -> Viewport and FlipY
const { width, height } = this.canvasConfig; // 画布宽高
viewportX = ((clip[0] + 1) / 2) * width;
viewportY = (1 - (clip[1] + 1) / 2) * height;
```
