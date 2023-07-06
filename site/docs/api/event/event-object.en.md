---
title: Event Object
order: 50
---

In the event listener's callback function, we can get the event object and access the properties and methods on it. These properties and methods are consistent with the DOM Event API, so you can directly refer to their documentation.

We will try to normalize the native events to [PointerEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/PointerEvent) event object and then handle them uniformly, which can be accessed on [nativeEvent](/en/api/event#nativeevent) to access native events.

## General Properties

Common properties on the event object include event type, graphics of the current triggered event, location, etc., where location is related to [coordinate system](/en/api/canvas#coordinate system).

### type

Event type：

-   pointerup
-   pointerdown
-   pointerupoutside
-   pointermove
-   pointercancel

<https://developer.mozilla.org/en-US/docs/Web/API/Event/type>

### nativeEvent

Native event object. When we call [preventDefault](/en/api/event#preventdefault) method, it will call the method of the same name on the native event object.

### view

Point to [Canvas](/en/api/canvas).

<https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/view>

### altKey

If or not the event is triggered with an `alt` press.

<https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/altKey>

### metaKey

If or not the event is triggered with a `meta` press.

<https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/metaKey>

### ctrlKey

If or not the event is triggered with a `ctrl` press.

<https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/ctrlKey>

### shiftKey

If or not the event is triggered with a `shift` press.

<https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/shiftKey>

### timeStamp

Timestamp when the event was created.

<https://developer.mozilla.org/zh-CN/docs/Web/API/Event/timeStamp>

### eventPhase

The current event phase. There are three enumeration values as follows.

```js
CAPTURING_PHASE = 1;
AT_TARGET = 2;
BUBBLING_PHASE = 3;
```

For example, with the `capture` configuration item, events are processed only during the capture phase.

```js
circle.addEventListener(
    'click',
    (e: FederatedEvent) => {
        console.log(e.eventPhase); // e.CAPTURING_PHASE
    },
    { capture: true },
);
```

### detail

The data object carried by the event object. For example, when a click is triggered, the number of clicks is carried.

<https://developer.mozilla.org/zh-CN/docs/Web/API/CustomEvent/detail>

### target

<https://developer.mozilla.org/zh-CN/docs/Web/API/Event/target>

The [EventTarget](/en/api/builtin-objects/event-target) of the current triggering event.

Useful when implementing event delegation, for example in a scenario like this, similar to `ul/li` in the DOM.

```js
Group(ul) - Rect(li) - Rect(li);
```

We can listen for events on `ul` that will trigger when each `li` is clicked on.

```js
const ul = new Group();
const li1 = new Rect();
const li2 = new Rect();
ul.appendChild(li1);
ul.appendChild(li2);

ul.addEventListener(
    'click',
    (e) => {
        e.target; // li1 或者 li2
        e.currentTarget; // ul
    },
    false,
);
```

[Example](/en/examples/event#delegate)

### currentTarget

<https://developer.mozilla.org/zh-CN/docs/Web/API/Event/currentTarget>

Always points to the event-bound element.

```js
ul.addEventListener(
    'click',
    (e) => {
        e.currentTarget; // ul
    },
    false,
);
```

### canvasX/Y

Under [Canvas coordinate system/world coordinate system](/en/api/canvas#canvas), the upper left corner of the canvas DOM element is the origin, the X-axis is pointing to the right side of the screen and the Y-axis is pointing to the bottom of the screen. Can be interconverted with [viewportX/Y](/en/api/event#viewportxy), [see](/en/api/canvas#canvas--viewport).

```js
canvas.canvas2Viewport({ x: e.canvasX, y: e.canvasY }); // Point { x: 100, y: 100 }
canvas.viewport2Canvas({ x: e.viewportX, y: e.viewportY }); // Point { x: 0, y: 0 }
```

The alias is x/y, so the following writing is equivalent.

```js
e.canvasX;
e.x;

e.canvasY;
e.y;
```

### viewportX/Y

Under [Viewport coordinate system](/en/api/canvas#viewport), consider the camera transformation.

Can be interconverted with [canvasX/Y](/en/api/event#canvasxy), [see](/en/api/canvas#canvas--viewport).

```js
canvas.canvas2Viewport({ x: e.canvasX, y: e.canvasY }); // Point { x: 100, y: 100 }
canvas.viewport2Canvas({ x: e.viewportX, y: e.viewportY }); // Point { x: 0, y: 0 }
```

Can be interconverted with [clientX/Y](/en/api/event#clientxy), [see](/en/api/canvas#client--viewport).

```js
canvas.viewport2Client({ x: 0, y: 0 }); // Point { x: 100, y: 100 }
canvas.client2Viewport({ x: 100, y: 100 }); // Point { x: 0, y: 0 }
```

### clientX/Y

<https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/clientX>

Under [browser coordinate system](/en/api/canvas#client), the upper left corner is `(0, 0)`. G does not modify this property on the native event, so they are identical.

```js
e.clientX;
e.nativeEvent.clientX;
```

Can be interconverted with [viewportX/Y](/en/api/event#viewportxy), [see](/en/api/canvas#client--viewport).

```js
canvas.viewport2Client({ x: 0, y: 0 }); // Point { x: 100, y: 100 }
canvas.client2Viewport({ x: 100, y: 100 }); // Point { x: 0, y: 0 }
```

### screenX/Y

<https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/screenX>

Under [screen coordinate system](/en/api/canvas#screen), page scrolling is not considered. g does not modify this property on native events, so they are identical.

```js
e.screenX;
e.nativeEvent.screenX;
```

### pageX/Y

<https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/pageX>

Under [page coordinate system](/en/api/canvas#page), consider page scrolling. g does not modify this property on native events, so they are identical.

```js
e.pageX;
e.nativeEvent.pageX;
```

### movementX/Y

<https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/movementX>

The value of the mouse movement in the horizontal direction between the current event and the previous `mousemove` event. In other words, this value is calculated like this: `currentEvent.movementX = currentEvent.screenX - previousEvent.screenX`

## PointerEvent

### pointerType

Returns the device type of the event with the following return value.

-   `'pointer'` [PointerEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/PointerEvent)
-   `'mouse'` [MouseEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent)
-   `'touch'` [TouchEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/TouchEvent)

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType>

### pointerId

Returns a value that uniquely identifies the point in contact with the touch plane. This value remains consistent across all events raised by this finger (or stylus, etc.) until it leaves the touch plane.

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerId>

### isPrimary

If or not it is primary pointer, it means the current event is generated by the primary pointer in multi-touch scenario.

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/isPrimary>

### button

Identifies which button was clicked for the mouse event. 0 is the left button, 2 is the right button.

<https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button>

### buttons

<https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons>

### width

The width of the contact area. Returns `1` if the native event is MouseEvent.

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/width>

### height

The height of the contact area. Returns `1` if the native event is MouseEvent.

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/height>

### tiltX

The angle of the contact with the screen in the Y-Z plane. Returns a fixed value of `0` if the native event is MouseEvent.

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltX>

### tiltY

The angle of the contact with the screen in the X-Z plane. Returns a fixed value of `0` if the native event is MouseEvent.

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltY>

### pressure

Returns the amount of pressure corresponding to the finger squeezing the touch plane, from `0.0` (no pressure) to `1.0` (maximum pressure) as a floating point number. Returns a fixed value of `0.5` if the native event is MouseEvent.

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure>

### tangentialPressure

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tangentialPressure>

### twist

The clockwise rotation angle. Returns a fixed value of `0` if the native event is MouseEvent.

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/twist>

## WheelEvent

In the mouse wheel event, you can get the scroll amount.

### deltaX/Y/Z

<tag color="blue" text="WheelEvent">WheelEvent</tag>

<https://developer.mozilla.org/zh-CN/docs/Web/API/WheelEvent>

The amount of lateral/longitudinal/Z-axis roll of the roller.

## Methods

Certain methods on the event object can control the behavior of the event as it propagates, such as preventing bubbling, etc.

### stopImmediatePropagation

Prevents other event listeners listening to the same event from being called, and prevents bubbling.

<https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopImmediatePropagation>

For example, if multiple click listeners are bound to the graph.

```js
// group -> circle

circle.on(
    'click',
    () => {
        // Normal execution
    },
    false,
);

circle.on(
    'click',
    (e) => {
        // Normal execution
        e.stopImmediatePropagation();
    },
    false,
);

circle.on(
    'click',
    () => {
        // Listeners registered afterwards will not be executed
    },
    false,
);

group.on(
    'click',
    () => {
        // Since upward bubbling is prevented, the same will not be executed
    },
    false,
);
```

### stopPropagation

Stops further propagation of the current event in the capture and bubble phases.

<https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopPropagation>

The difference with `stopImmediatePropagation` is that it does not prevent other event listeners listening to the same event from being called.

### preventDefault

<https://developer.mozilla.org/zh-CN/docs/Web/API/Event/preventDefault>

Block the default browser behavior. Calling this method for Passive events is not valid and will throw a warning.

A solution for wheel events can be found at [Disable default page scrolling behavior in Chrome](/en/api/event#en/docs/api/event#disable-default-page-scrolling-behavior-in-chrome).

### composedPath

<https://developer.mozilla.org/zh-CN/docs/Web/API/Event/composedPath>

Returns the event path, which is an array containing [EventTarget](/en/api/builtin-objects/event-target), similar to `propagationPath` in the old G version. In this array, `event.target` is the first element of the array, [scene graph root](/en/api/canvas#the-root-node), [Document](/en/api/builtin-objects/document) and [Canvas](/en/api/canvas) are the three elements at the end of the array.

Still using a DOM-like `ul/li` scenario as an example.

```js
Group(ul) - Rect(li) - Rect(li);
```

Listen for events on `ul` that are triggered when each `li` is clicked, with the event propagation path being `[li1, ul, Group, Document, Canvas]`.

```js
const ul = new Group();
const li1 = new Rect();
const li2 = new Rect();
ul.appendChild(li1);
ul.appendChild(li2);

ul.addEventListener(
    'click',
    (e) => {
        const path = e.composedPath(); // [li1, ul, Group, Document, Canvas];
    },
    false,
);
```

[Example](/en/examples/event#delegate)

### clone

Currently event objects are reused in the event system to avoid the creation of a large number of event objects. Reused objects are only used to carry different data, such as coordinate information, native event objects, etc., so the life cycle is limited to the event handler, which can lead to unintended consequences once an attempt is made to cache the entire event object and use it outside the event handler. It is therefore recommended to cache the data carried on the event object rather than the object itself.

While keeping the above performance considerations in mind, we also provide a clone method that creates a new event object when the user really wants to cache it, e.g.

```js
circle.addEventListener('click', (e) => {
    const newEvent = e.clone();
});
```

The cloned event object will retain all the properties on the original event object.

Currently, we only support interactive events, namely [PointerEvent](/en/api/event#pointerevent) and [WheelEvent](/en/api/event#wheelevent). Other events such as AnimationEvent and CustomEvent are not supported at the moment.
