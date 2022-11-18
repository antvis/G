---
title: Event
order: 8
---

In the [event system](/en/api/event/intro), most events bubble up to the canvas. For example, if we click Circle in the following simple scenario, we can see the propagation path of the events in order.

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

More event-related operations are described in [event system](/en/api/event/intro).

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

In addition to listening to the `ready` event, you can also choose to [wait for this Promise](/en/api/canvas/scenegraph-lifecycle#ready).

```js
await canvas.ready;
canvas.appendChild(circle);
```
