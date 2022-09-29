---
title: Canvas
order: -100
redirect_from:
    - /en/docs/api
---

We provide the Canvas as a core object in the `@antv/g`, which is a "mini-browser" from a rendering perspective implemented in the browser and hosts three types of objects:

-   [Scene Graph](/en/docs/guide/diving-deeper/scenegraph). We use it to describe the individual shapes in the scene and their hierarchical relationships.
-   [Camera](/en/docs/api/camera). We use it to define the angle at which the whole scene is viewed. We have a built-in camera for each canvas that uses orthogonal projection by default, which can be modified at any time subsequently.
-   [Renderer](/en/docs/api/renderer). We use it to specify which underlying technology the canvas uses to render the scene. Different renderers have different rendering capabilities, for example only `g-webgl` can render 3D graphics. In 2D scenes we try to achieve consistent rendering with different renderers.

When designing the canvas API, we referenced the DOM API, so they share many similarities:

-   The canvas can be analogous to the [window](https://developer.mozilla.org/en-US/docs/Web/API/Window) object in the browser environment. Like window, the canvas inherits from [EventTarget](/en/docs/api/builtin-objects/event-target) in the internal implementation. Unlike window, multiple canvases can coexist in the same page, i.e. multiple "parallel worlds" can exist at the same time.
-   The entry point of the page in the DOM tree is [window.document](https://developer.mozilla.org/en-US/docs/Web/API/Document) and in the canvas is `canvas.document`.
-   The root node in the DOM tree is [document.documentElement](https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement), which is `<html>`. It can also be accessed in the canvas via `canvas.document.documentElement`.

We chose to be as DOM API compatible as possible to reduce the memory learning cost for front-end users on the one hand, and to leverage the existing Web ecosystem on the other hand, e.g. to seamlessly access [existing gesture and drag libraries](/en/docs/api/event#gestureanddrag).

For unconventional browser environments, we also provide options such as [OffscreenCanvas in WebWorker](/en/docs/api/canvas#use-offscreencanvas-in-webworker-), [server-side rendering](/en/docs/api/canvas# server-side rendering) and other options.

# Inherited from

[EventTarget](/en/docs/api/builtin-objects/event-target)

# Initialization

When creating a canvas, we can pass in the following initialization parameters, which is the simplest way to initialize it.

-   container The id or DOM element of the canvas container, and the subsequent `<canvas>/<svg>` is automatically created within that DOM element.
-   width / height
-   renderer

```js
import { Canvas } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';

const webglRenderer = new WebGLRenderer();

const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: webglRenderer,
});
```

The above initialization approach only requires providing a container `container` that carries `<canvas>/<svg>`, but sometimes we have custom requirements as follows:

-   [Using existed `<canvas>`](/en/docs/api/canvas#使用创建好的-canvas-元素)
-   [Using OffscreenCanvas in WebWorker](/en/docs/api/canvas#在-webworker-中使用-offscreencanvas)
-   [Server-side rendering in Node.js](/en/docs/api/canvas#服务端渲染)

In this case you can use `canvas` instead of `container`, and more initialization parameters are as follows.

## container

Optional, `string | HTMLElement`. The id or DOM element of the canvas container. Later, when the renderer is initialized, `<canvas>/<svg>` is automatically created inside that container's DOM element.

## canvas

Optional, `HTMLCanvasElement | OffscreenCanvas | NodeCanvas`. Using existed `<canvas>` or OffscreenCanvas.

When this parameter is passed, the [container](/en/docs/api/canvas#container) argument is ignored and we assume that `<canvas>` has been created and added to the document, e.g.

```js
// create a <canvas>
const $canvas = document.createElement('canvas');
const dpr = window.devicePixelRatio;
$canvas.height = dpr * 600;
$canvas.width = dpr * 500;
$canvas.style.height = '600px';
$canvas.style.width = '500px';
document.getElementById('container').appendChild($canvas);

// using existed <canvas>
const canvas = new Canvas({
    canvas: $canvas,
    renderer: canvasRenderer,
});
```

In addition to the `HTMLCanvasElement` in the browser environment, you can also use:

-   [`OffscreenCanvas` in WebWorker](/en/docs/api/canvas#在-webworker-中使用-offscreencanvas)
-   [`NodeCanvas` in server-side rendering](/en/docs/api/canvas#服务端渲染)

Note that once this parameter is used, runtime switching of the renderer is no longer supported.

## width / height

Set the width and height of canvas.

-   Required if [container](/en/docs/api/canvas#container) passed in. The renderer will create `<canvas>` with these values.
-   Optional if [canvas](/en/docs/api/canvas#canvas) passed in. If not provided, we will calculate with `canvas.width/height` and `devicePixelRatio`.

## renderer

Required. The following renderers are currently supported:

-   [g-canvas](/en/docs/api/renderer/canvas)
-   [g-svg](/en/docs/api/renderer/svg)
-   [g-webgl](/en/docs/api/renderer/webgl)
-   [g-webgpu](/en/docs/api/renderer/webgpu)
-   [g-canvaskit](/en/docs/api/renderer/canvaskit)

It can be switched at runtime with [setRenderer()](/en/docs/api/canvas#setrendererrenderer-renderer) after initialized.

## background

Optional. The color used to clear the canvas when it is initialized, similar to WebGL's [clearColor](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/clearColor).

Using [\<color\>](/en/docs/api/css/css-properties-values-api#color), defaults to `'transparent'`.

In [this example](/en/examples/canvas#background), we have set a translucent red color for the Canvas, and the bottom `<div>` has a background gray color set by CSS: `<div>`.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*4QY6Rb9jIy8AAAAAAAAAAAAAARQnAQ" width="300" alt="canvas's background">

## cursor

Check to set the canvas default [mouse style](https://g-next.antv.vision/zh/docs/api/basic/display-object#cursor). If this property is also configured on top of a drawing picked up by an interaction event, it will override the mouse style configured on the canvas, but when the mouse is moved to a blank area, the mouse style configured on the canvas will take effect. The following figure demonstrates this.

```js
const canvas = new Canvas({
    //...
    cursor: 'crosshair',
});

const circle = new Circle({
    style: {
        //...
        cursor: 'pointer',
    },
});
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*YlqRRI5vjFgAAAAAAAAAAAAAARQnAQ" alt="cursor" width="150">

In addition to being set at canvas initialization, it can be subsequently modified by `setCursor()`.

```js
// Set at canvas initialization
canvas = new Canvas({
    //...
    cursor: 'crosshair',
});

// Or reset later
canvas.setCursor('crosshair');
```

# Special platform adaptations

On some special runtime platforms (e.g. applets), it is not possible to use global variables like [globalThis](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ globalThis), and internally we need to rely on it to create images (`new globalThis.Image()`), determine if a TouchEvent is supported (`'ontouchstart' in globalThis`), and so on. Therefore, users of these particular platforms need to manually pass in the specific creation and determination methods.

## document

Optional. Default will use `window.document`. In [g-svg based server-side rendering scheme](/en/docs/api/renderer/svg#server-side rendering), you need to replace `window.document` with the corresponding element provided by [JSDOM](https://github.com/jsdom/jsdom) in order to create the corresponding SVG element.

## devicePixelRatio

Optional. By default `window.devicePixelRatio` will be used, if there is no `window` object in the runtime environment, such as in WebWorker, you can pass it in manually, or use 1 if it is still not passed in.

## requestAnimationFrame

Optional. By default `window.requestAnimationFrame` will be used, if there is no `window` object in the runtime environment, such as an applet environment, you can pass it in manually.

## cancelAnimationFrame

Optional. By default `window.cancelAnimationFrame` will be used, if there is no `window` object in the runtime environment, such as an applet environment, you can pass it in manually.

## createImage

Optional. Returns an `HTMLImageElement` or similar object, which by default will be created using `() => new window.Image()`. If there is no `window` object in the runtime environment, such as an applet environment, you can pass it in manually.

For example, in the Alipay applet use [createImage](https://opendocs.alipay.com/mini/api/createimage).

```js
const canvas = new Canvas({
    createImage: () => canvas.createImage(),
});
```

## supportsCSSTransform

Optional. 是否支持在容器上应用 CSS Transform 的情况下确保交互事件坐标转换正确。

Whether or not CSS Transform is supported on the container to ensure that the interaction event coordinates are transformed correctly.

In this [example](/en/examples/canvas#supports-css-transform), we have enlarged the container by a factor of 1.1, and with this configuration enabled, mouse movement over the circle changes the mouse style correctly.

```js
const $wrapper = document.getElementById('container');
$wrapper.style.transform = 'scale(1.1)';
```

## supportsPointerEvents

Optional. Whether PointerEvent is supported or not, the default will use `! !globalThis.PointerEvent`. If `false` is passed, the event listener plugin will not listen for PointerEvent such as `pointerdown`.

## supportsTouchEvents

Optional. If `false` is passed, the event listener plugin will not listen to TouchEvent such as `touchstart`.

## isTouchEvent

Optional. Determines if a native event is a TouchEvent, accepts the native event as parameter, and returns the result.

## isMouseEvent

Optional. Determines if a native event is a MouseEvent, accepts the native event as parameter, and returns the result.

## offscreenCanvas

Optional. Returns an `HTMLCanvasElement | OffscreenCanvas` or similar object. Used to generate an offscreen Canvas2D context, it is currently used in the following scenarios.

-   The core service calls `ctx.measureText` to measure the text.
-   [g-plugin-canvas-picker](/en/docs/plugins/canvas-picker) will draw the path in context and call `ctx.isPointInPath` Canvas2D API.
-   [g-plugin-device-renderer](/en/docs/plugins/device-renderer) will call `ctx.createLinearGradient` in the context to draw the gradient and then generate the texture.

When not passed in by default, it will try to create an `OffscreenCanvas` and then use the DOM API to create an `HTMLCanvasElement` when it fails. However, in non-dom environments like applets, you need to manually pass in.

```js
const canvas = new Canvas({
    //...
    offscreenCanvas: {
        getContext: () => Canvas.createContext(),
    },
});
```

# Coordinate system

When we talk about "location", it must be relative to some coordinate system, in G we use Client, Screen, Page, Canvas and Viewport coordinate systems, for example, in [event system](/en/docs/api/event) you can get the coordinates from the event object in different coordinate systems.

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

<img src="https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes/canvas_default_grid.png" width="300" alt="canvas coordinates">

⚠️ If [g-plugin-3d](/en/docs/plugins/3d) plugin is used, the Z-axis is pointing off-screen.

We provide methods to convert between them, and in this [example](/en/examples/event#coordinates), move the mouse to see the value of the mouse location in each coordinate system:

-   Client <-> Viewport
-   Canvas <-> Viewport

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*kPfcTKwZG90AAAAAAAAAAAAAARQnAQ" width="300" alt="coordinates conversion">

## Client

Front-end developers should be most familiar with the Client browser coordinate system, which takes the upper-left corner of the browser as the origin, and G does not modify this coordinate value for native event objects, [example](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX).

https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX

If the document is not scrolled, which is equivalent to the Page coordinate, the following figure shows the difference with Screen:

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*TYQJR40KMm0AAAAAAAAAAAAAARQnAQ" width="300" alt="page coordinates">

## Screen

The screen coordinate system is also the common browser coordinate system, with the top left corner of the screen as the origin, and is affected by page scrolling. we won't modify this coordinate value of the native event object.

https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/screenX

It is worth mentioning that negative numbers may appear in dual screens, for example in the left screen, [example](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/screenX).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*SlEMSJq20R4AAAAAAAAAAAAAARQnAQ" width="300" alt="page coordinates">

## Page

With the top left corner of the document as the origin and considering the document scrolling, G does not modify this coordinate value of the native event object.

https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/pageX

## Canvas

An analogy can be drawn to the browser's Client coordinate system, also known as the world coordinate system, to which the positions we specify when creating a drawing are relative. It takes the top left corner of the DOM element of the canvas as the origin, with the X-axis pointing forward to the right side of the screen and the Y-axis pointing forward to the bottom of the screen. Also known as the "world coordinate system", when it comes to rotation, we set the direction of rotation to be clockwise along the axes.

## Viewport

In the browser's Page coordinate system, the coordinates of the element in the document do not change regardless of page scrolling; what changes is our viewing area.

Similarly, [camera](/en/docs/api/camera) determines the angle from which we view the world. If the camera does not move, the Viewport coordinate system and the Canvas coordinate system will coincide exactly, so the coordinates of the upper-left corner of the Viewport are the same as the origin of the Canvas coordinate system, `[0, 0]`, in our visible range. However, if the camera is panned, rotated, or scaled, the viewport will also change accordingly, and the position of `[0, 0]` in the upper-left corner of the viewport will no longer be `[0, 0]` in the Canvas coordinate system.

## Conversion method

We provide the following transformation methods needed to use Point, which has the following structure and can be introduced from the G core package, [example](/en/examples/event#coordinates):

```js
interface Point {
    x: number;
    y: number;
}

import type { Point } from '@antv/g';
```

### Client <-> Viewport

We provide a method for converting from the browser's Client coordinate system to the canvas Viewport coordinate system, [example](/en/examples/event#coordinates):

-   client2Viewport(client: Point): Point
-   viewport2Client(canvas: Point): Point

In the internal implementation, we use the following calculation logic, for example, from Client to Viewport, we first get the bounding box of the canvas DOM element under the Client coordinate system, using [getBoundingClientRect](https://developer.mozilla.org/en-US/ docs/Web/API/Element/getBoundingClientRect), and then subtract the coordinates of the upper-left corner of the bounding box from clientX/Y to get the coordinates of the upper-left corner of the DOM element relative to the canvas, i.e., the Viewport coordinates:

```js
// 获取画布 DOM 元素在 Client 坐标系下的包围盒
// @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
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

The [camera](/en/docs/api/camera) determines the angle from which we view the world. If the camera does not move, the Viewport coordinate system and the Canvas coordinate system will coincide exactly, so within our visible range, the coordinates of the upper-left corner of the viewport are the same as the Canvas coordinate system origin, both are `[0, 0]`. However, if the camera is panned, rotated, or scaled, the viewport will change accordingly, and the `[0, 0]` position in the upper-left corner of the viewport will no longer be `[0, 0]` in the Canvas coordinate system.

In [example](/en/examples/event#coordinates), we moved the camera up a distance (the whole world moves down in the viewer's eyes) and found that the center of the circle remains the same in the Canvas coordinate system, `[300, 200]`, but is shifted in the Viewport coordinate system as follows.

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

# The root node

We all know the `window` object in the browser, the entry point of the DOM tree is `window.document`, and the entry point usually contains a root node `<html>` element, which can be obtained from `window.document.documentElement`. We add various DOM elements to this root node, such as `<head>`, `<body>`, etc.

Canvas canvases can be analogous to `window` objects. Similarly, each canvas is created with a built-in entry [Document](/en/docs/api/builtin-objects/document), which can be obtained via `canvas.document`. This entry contains the root node of [Scene Graph](/en/docs/guide/diving-deeper/scenegraph), which can be obtained via `canvas.document.documentElement`, and then you can add graphics to this root node via `appendChild` to complete the rendering. and then you can add graphics to this root node with `appendChild` to complete the rendering.

## document

Returns a built-in [Document](/en/docs/api/builtin-objects/document) object that holds the root node of the scene graph. After getting this root node via `document.documentElement`, you can add child nodes using the scene graph capability:

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

## getRoot(): Group

Alias of `canvas.document.documentElement`, so the following two ways of writing it are equivalent:

```js
const root = canvas.getRoot();
const root = canvas.document.documentElement;
```

# Add/remove scene graph nodes

Since canvas does not inherit from [Node](/en/docs/api/builtin-objects/node), it does not have node manipulation capability by itself. However, we have added some shortcuts and the following node operations are essentially done on the root node, e.g. the following two writes are equivalent:

```js
canvas.appendChild(circle);
canvas.document.documentElement.appendChild(circle);
```

## appendChild(object: DisplayObject)

Adds the object to be rendered to the canvas. If the object has children, they are also added together.

```js
const circle = new Circle({ style: { r: 10 } });

canvas.appendChild(circle);
// or canvas.document.documentElement.appendChild(circle);
```

## removeChild(object: DisplayObject)

Removes the object from the canvas. If the object has children, they are removed as well.

```js
canvas.removeChild(circle);
// or canvas.document.documentElement.removeChild(circle);
```

To be consistent with the DOM API, just removing the object does not destroy it. If you want to destroy it, you need to call `destroy()`.

## removeChildren()

Removes and destroys all objects in the canvas.

```js
canvas.removeChildren();
// or canvas.document.documentElement.removeChildren();
```

# Modify the initialization configuration

When initializing the canvas we pass in the canvas size, renderer and other configurations, which may be modified subsequently, so we provide the following API.

## resize(width: number, height: number)

Sometimes we need to resize the canvas after initialization, for example by using [ResizeObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/ResizeObserver) to listen for container size changes.

```js
const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
        if (entry !== canvas) {
            continue;
        }
        const { width, height } = entry.contentRect;
        // resize canvas
        canvas.resize(width, height);
    }
});
resizeObserver.observe($container);
```

## setRenderer(renderer: Renderer)

In most scenarios we should specify a renderer at canvas initialization and never change it again. However, there are a few scenarios where we need to [switch renderers at runtime](/en/docs/guide/diving-deeper/switch-renderer#runtime), for example, almost all of the examples on our website do this.

```js
// switch to WebGL renderer if possible
if (tooManyShapes) {
    canvas.setRenderer(webglRenderer);
} else {
    canvas.setRenderer(svgRenderer);
}
```

# Lifecycle

The initialization logic is performed upon instantiation, and the following lifecycle methods can be called afterwards.

## ready

When initialization is complete, a Promise is returned that is equivalent to listening for the [CanvasEvent.READY](/en/docs/api/canvas#ready-event) event.

```js
await canvas.ready;

// or
import { CanvasEvent } from '@antv/g';
canvas.addEventListener(CanvasEvent.READY, () => {});
```

## render()

Rendering the canvas, since the renderer has auto-rendering enabled by default, there is no need to call it manually in most cases. However, some scenes require manual control of rendering timing, in which case [rendering-on-demand](/en/docs/guide/diving-deeper/rendering-on-demand) [example](/en/examples/canvas#rendering-on-demand).

```js
const webglRenderer = new WebGLRenderer({
    enableAutoRendering: false,
});

canvas.render();
```

## destroy(destroyScenegraph = true)

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

# Get built-in objects

You can quickly get some built-in objects in the canvas by using the following methods.

## getConfig(): CanvasConfig

Get the configuration of the initial incoming canvas.

```js
const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: webglRenderer,
});
canvas.getConfig(); // { container: 'container', width: 600, ... }
```

## getContextService(): ContextService

Get [rendering context](/en/docs/api/renderer#rendering environment context), which is implemented by the renderer (`g-canvas/svg/webgl`). There are many common methods on this rendering context, such as:

-   `getDomElement()` Get the DOM element of current renderer, for example `g-canvas/webgl` will return a `<canvas>` element while `g-svg` will return a `<svg>` element.
-   `getDPR()` Get devicePixelRatio of current rendering context.

## getCamera(): Camera

Get [camera](/en/docs/api/camera) and subsequently perform operations on that camera, such as switching projection mode, completing camera actions and animations, etc.

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

# Event

In the [event system](/en/docs/api/event), most events bubble up to the canvas. For example, if we click Circle in the following simple scenario, we can see the propagation path of the events in order.

```
Circle -> Group(canvas.document.documentElement) -> Document(canvas.document) -> Canvas：
```

```js
canvas.addEventListener('click', (e) => {
    e.propagationPath(); // [Circle, Group, Document, Canvas]
});
```

## Add/removeEventListener

Events can be bound on both the Canvas and the root node of the canvas.

```js
canvas.addEventListener('click', () => {});

// or
canvas.document.addEventListener('click', () => {});
```

More event-related operations are described in [event system](/en/docs/api/event).

## Canvas-specific events

The canvas will trigger corresponding events before and after initialization, rendering, and currently the following canvas-related events can be listened to.

```js
export enum CanvasEvent {
  READY = 'ready',
  BEFORE_RENDER = 'beforerender',
  AFTER_RENDER = 'afterrender',
  BEFORE_DESTROY = 'beforedestroy',
  AFTER_DESTROY = 'afterdestroy',
  RESIZE = 'resize',
}
```

For example, if we show the live frame rate in all the examples on the website, which is updated after each render, we can do it by listening to the `afterrender` event.

```js
import { CanvasEvent } from '@antv/g';

canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
    stats.update();
});
// or
canvas.addEventListener('afterrender', () => {
    stats.update();
});
```

### ready event

In the browser, we can use `window.onload` to find out if the initialization of the page, including HTML parsing, style parsing, resource loading, etc., is complete.

```js
// @see https://javascript.info/onload-ondomcontentloaded
window.onload = function () {
    alert('Page loaded');
};
```

Also in G these initializations are asynchronous, and we provide a similar `ready` event. After the initialization is done you can do things like scene graph creation.

```js
canvas.addEventListener(CanvasEvent.READY, () => {
    canvas.appendChild(circle);
});
```

In addition to listening to the `ready` event, you can also choose to [wait for this Promise](/en/docs/api/canvas#ready).

```js
await canvas.ready;
canvas.appendChild(circle);
```

# Using CustomElementRegistry

Usually we recommend using `new Circle()` to create built-in or custom graphics, but we also provide something like the DOM [CustomElementRegistry](https://developer.mozilla.org/en-US/docs/Web/API/ CustomElementRegistry) API to create a completed registered graph using [document.createElement](/en/docs/api/builtin-objects/document#createelement), so the following writeup is equivalent.

```js
import { Shape, Circle } from '@antv/g';

const circle = canvas.document.createElement(Shape.CIRCLE, { style: { r: 100 } });

// or
const circle = new Circle({ style: { r: 100 } });
```

`canvas.customElements` provides the following methods.

## define

The full method signature is:

```js
define(name: string, new (...any[]) => DisplayObject): void;
```

All of G's built-in graphics are registered during canvas initialization, and for custom graphics, if you also want to create them with the `createElement` method, registration can be done as follows.

```js
import { MyCustomShape } from 'my-custom-shape';
canvas.customElements.define(MyCustomShape.tag, MyCustomShape);

const myCustomShape = canvas.document.createElement(MyCustomShape.tag, {});
```

## get

The full method signature is:

```js
get(name: string): new (...any[]) => DisplayObject
```

Returns the constructor based on the string provided at the time of graphic registration.

```js
import { Shape } from '@antv/g';

canvas.customElements.get(Shape.CIRCLE); // Circle constructor
```

# Caveats

## Multiple Canvas Coexistence

Multiple canvases can coexist on the same page, i.e., multiple "parallel worlds" can exist at the same time. However, this is limited by the underlying rendering API, e.g. WebGL only allows up to 8 contexts. [example](/en/examples/canvas#multi-canvas)

## Using the created canvas element

In this [example](/en/examples/canvas#user-defined-canvas), we create our own `<canvas>` element, which we use to create the canvas.

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

## Using OffscreenCanvas in WebWorker

You may have seen some applications of the rendering engine:

-   Babylon.js https://doc.babylonjs.com/divingDeeper/scene/offscreenCanvas
-   Three.js https://r105.threejsfundamentals.org/threejs/lessons/threejs-offscreencanvas.html

We will use OffscreenCanvas in the following two scenarios, mainly using the Worker to relieve the main thread:

1. GPGPU 配合 g-webgl 和 g-plugin-gpgpu 使用，例如上层的图分析算法库
2. g-webgl 在 Worker 中渲染，同步结果到主线程

In this [example](/en/examples/canvas#offscreen-canvas) we demonstrate the second use, creating `<canvas>` in the main thread, transferring control to the WebWorker via `transferControlToOffscreen()`, and subsequently completing the rendering in the WebWorker and synchronizing the results to the main thread.

```js
// main thread
const $canvas = document.createElement('canvas') as HTMLCanvasElement;
const dpr = window.devicePixelRatio;
$canvas.height = dpr * 600;
$canvas.width = dpr * 500;
$canvas.style.height = '600px';
$canvas.style.width = '500px';
document.getElementById('container').appendChild($canvas);
const offscreen = $canvas.transferControlToOffscreen();

// 省略 Worker 创建过程

// 在 WebWorker 中使用 OffscreenCanvas
const canvas = new Canvas({
  canvas: offscreenCanvas, // 从主线程
  devicePixelRatio,
  renderer,
});
```

It's worth noting that OffscreenCanvas doesn't have event listening capabilities, our interactions happen on the `<canvas>` element in the main thread, so when the mouse click event is listened to, how do we know which shape in OffscreenCanvas hit?

We can achieve this by:

1.  Listen for interaction events on `<canvas>` and pass them to the worker via `postMessage` when triggered. Note that you can't pass a native event object like [PointerEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/ PointerEvent), it will report the following error when serializing. The correct approach is to extract the key properties of the native event object (e.g. `clientX/Y`) and pass them.

```
Uncaught (in promise) DOMException: Failed to execute 'postMessage' on 'Worker': PointerEvent object could not be cloned.
```

```js
// 在主线程中监听 `<canvas>` 事件
$canvas.addEventListener(
    'pointerdown',
    (e) => {
        // 向 WebWorker 传递可序列化的事件对象
        worker.triggerEvent('pointerdown', clonePointerEvent(e));
    },
    true,
);
```

2. Trigger the interaction event hook provided by the G rendering service in the worker, e.g. call the `pointerDown` hook when receiving the `pointerdown` signal from the main thread.

```js
export function triggerEvent(event, ev) {
    if (event === 'pointerdown') {
        canvas.getRenderingService().hooks.pointerDown.call(ev);
    }
}
```

3. [cursor](/en/docs/api/basic/display-object#鼠标样式) The mouse style obviously cannot be applied in the worker. We can tell the main thread to change the mouse style on `<canvas>` via `postMessage` in the Worker when we pick up the image.

## Server-side rendering

Depending on the renderer, we offer the following server-side rendering options:

-   [g-canvas + node-canvas](/en/docs/api/renderer/canvas#服务端渲染)
-   [g-svg + JSDOM](/en/docs/api/renderer/svg#服务端渲染)
-   [g-webgl + headless-gl]()

We currently use them in [integration tests](https://github.com/antvis/g/tree/next/integration/__node__tests__/).
