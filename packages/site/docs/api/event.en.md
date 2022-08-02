---
title: Event
order: -3
---

The event system can provide rich interactions and we follow two principles in its design.

-   Keeping it as consistent as possible with the DOM API, besides reducing learning costs, is most important to be able to access existing ecologies (e.g. gesture libraries).
-   Only standard events are provided. Advanced events such as drag and drop, gestures, etc. are defined by extension.

Developers familiar with [DOM Event Stream](https://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-flow-h2) will be familiar with the following concepts.

-   Event objects have a reference to the EventTarget, which is naturally a DOM element in the DOM and [EventTarget](/en/docs/api/builtin-objects/event-target) in G.
-   The event stream contains capture and bubble phases, and you can intervene in them through certain methods on the event object.
-   One or more listeners can be added to an event, and they are triggered sequentially in the order in which they are registered.

The following diagram shows the three phases of event propagation, the listener is triggered from top to bottom in the capture phase, and bubbles up after reaching the target node. In the listener, you can get the current phase by [eventPhase](/en/docs/api/event#eventphase). The following image is from https://javascript.info/bubbling-and-capturing#capturing

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*zJBbSL2D5mkAAAAAAAAAAAAAARQnAQ" width="500" alt="event capture">

We currently support the following [base events](/en/docs/api/event#type), which are compatible with DOM event streams as much as possible, so we have included reference links to the corresponding DOM Event APIs in many of the API introductions below.

For example, we want to add a simple mouse-in/out interaction to this circle, [example](/en/examples/event#shapes).

```js
circle.addEventListener('mouseenter', () => {
    circle.attr('fill', '#2FC25B');
});
circle.addEventListener('mouseleave', () => {
    circle.attr('fill', '#1890FF');
});
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*D7xLQp4L4VoAAAAAAAAAAAAAARQnAQ" width="300" alt="interactive event">

# Listenable events

We currently support listening to two types of events: interaction events and scene graph events. The former is the same as most of the mouse and touch screen events provided in the DOM Event API, while the latter is based on the scene graph triggered when nodes are added, deleted, or property transformed.

## Interaction events

Browser support for interaction events has gone through the following stages, as detailed in.

https://javascript.info/pointer-events#the-brief-history

-   The earliest supported is [MouseEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent).
-   With the popularity of mobile devices, [TouchEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/TouchEvent) appeared and also triggered [MouseEvent](https://developer.mozilla. org/zh-cn/docs/Web/API/MouseEvent)
-   Then later new devices appeared, such as the pen, so that the various event structures were different and painful to use (e.g. hammer.js for [compatibility of processing](https://github.com/hammerjs/hammer.js/tree/master/src/input))
-   A new standard has been proposed, [PointerEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/PointerEvent) that wants to cover all the above input devices

The image below is from https://w3c.github.io/pointerevents/

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*FtyaTL5gzv4AAAAAAAAAAAAAARQnAQ" width="200" alt="pointer event">

So now the Level 2 PointerEvent is supported by all major browsers: https://www.w3.org/TR/pointerevents2/

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Doz_TbygcIIAAAAAAAAAAAAAARQnAQ" width="100%" alt="can i use pointer event">

The new runtime environments also all use a uniform definition like PointerEvent and no longer have Touch / Mouse / PenEvent, e.g.

-   Flutter：https://api.flutter.dev/flutter/gestures/PointerEvent-class.html
-   Kraken：https://zhuanlan.zhihu.com/p/371640453

We therefore recommend using PointerEvent directly. multi-finger touch gestures are also fully implementable, e.g.

-   Pinch: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures

The following interaction events are currently supported for listening.

PointerEvents:

-   `pointerdown`
-   `pointerup`
-   `pointerupoutside`
-   `pointertap`
-   `pointerover`
-   `pointerenter`
-   `pointerleave`
-   `pointerout`

MouseEvents:

-   `mousedown` Left mouse button pressed
-   `rightdown` Right mouse button pressed
-   `mouseup` Left mouse button lift
-   `rightup` Right mouse button lift
-   `mouseupoutside` Different graphics when the left mouse button is lifted and when it is pressed
-   `rightupoutside` Different graphics when the right mouse button is raised and pressed
-   `click` Click & double click [how to distinguish?](/en/docs/api/event#doubleclick)
-   `mousemove` The mouse continuously moves over the graph
-   `mouseover` Mouse over the graph will bubble
-   `mouseout` The mouse is removed from the graph and will bubble up
-   `mouseenter` The mouse is moved in from the graph and will not bubble
-   `mouseleave` The mouse is removed from this graphic without bubbling
-   `wheel`

TouchEvents:

-   `touchstart`
-   `touchend`
-   `touchendoutside`
-   `touchmove`
-   `touchcancel`

## SceneGraph Events

In addition to interaction events, we can also listen for some scene graph-related events, such as listening for the first load of each node on the canvas (`g-svg` will create the DOM associated with the current graph at this point), [example](/en/examples/event#builtin)

```js
import { ElementEvent } from '@antv/g';

canvas.addEventListener(ElementEvent.MOUNTED, (e) => {
    e.target;
});
```

We currently support the following scenegraph related events.

-   `CHILD_INSERTED` Triggered when a child node is added as a parent.
-   `INSERTED` Triggered when added as a child node.
-   `CHILD_REMOVED` Triggered when a parent node is removed as a child node.
-   `REMOVED` Triggered when removed as a child node.
-   `MOUNTED` Triggered when first entering the canvas.
-   `UNMOUNTED` Triggered when removed from the canvas.
-   `ATTR_MODIFIED` Triggered when modifying properties.
-   `DESTROY` Triggered on destruction.

In the following example, the canvas listens for INSERTED REMOVED MOUNTED and UNMOUNTED events. The following events are triggered sequentially when the scene graph is added and removed.

```js
canvas.addEventListener(ElementEvent.INSERTED, (e) => {
    console.log(ElementEvent.INSERTED, e.target);
});
// Omitting other event listeners

parent.appendChild(child); // Building father-son relationships
canvas.appendChild(parent); // Add to the scenegraph
canvas.removeChild(parent, false); // Remove from the scene graph, but do not destroy

// MOUNTED parent
// MOUNTED child
// INSERTED parent
// REMOVED parent
// UNMOUNTED child
// UNMOUNTED parent
```

# Event Listeners

## addEventListener

Adding event listeners to graphics is fully referenced in the DOM Event API: https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener

Method signature.

```js
target.addEventListener(type, listener, options);
target.addEventListener(type, listener, useCapture);
```

Parameters:

-   type 事件名称，[内置标准事件](/en/docs/api/event#type) 或[自定义事件名](/en/docs/api/event#custom-events)
-   listener 事件监听器，支持以下两种写法：
    -   处理函数 `Function`
    -   [EventListener](https://developer.mozilla.org/zh-CN/docs/Web/API/EventListener/handleEvent) 对象，形如 `{ handleEvent: Function }`
-   options `可选`
    -   capture `boolean`，表示 listener 会在该类型的事件捕获阶段传播到该 EventTarget 时触发。
    -   once `boolean`，表示 listener 在添加之后最多只调用一次。如果是 `true`， listener 会在其被调用之后自动移除。
-   useCapture `可选` `boolean` 默认为 `false`。如果是 `true`，向上冒泡的事件不会触发 listener。

```js
button.addEventListener('click', () => {});
button.addEventListener('click', {
  handleEvent(e): {}
});
```

Register listeners that are executed only during the capture phase.

```js
circle.addEventListener('click', () => {}, { capture: true });
circle.addEventListener('click', () => {}, true);
```

Register listeners that are executed only once.

```js
circle.addEventListener('click', () => {}, { once: true });
```

For compatibility with the old G API, the use of `on` is also supported, so the following writeup is equivalent.

```js
circle.addEventListener('mouseenter', () => {});
circle.on('mouseenter', () => {});
```

You can refer to [this section](/en/docs/api/event#the-problem-of-this-within-the-event-listener) for more information about the pointing of this in the listener.

## removeEventListener

Removing the event listener.

```js
circle.removeEventListener('click', handler);
```

The use of `off` is also supported for compatibility with older versions of the G API, so the following writeup is equivalent.

```js
circle.removeEventListener('mouseenter', () => {});
circle.off('mouseenter', () => {});
```

## removeAllEventListeners

Removes all event listeners.

The use of `off` is also supported for compatibility with older versions of the G API, so the following writeup is equivalent.

```js
circle.removeAllEventListeners();
circle.off();
```

## dispatchEvent

Manually triggered events, like interactively triggered events, go through the full event propagation process.

https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent

⚠️ Before manually firing an event on a drawing, you must ensure that the element has been added to the canvas.

### Custom Events

In addition to the built-in standard events, sometimes we also need to trigger some custom events, refer to [Web CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent), we also support the following writeup, [examples](/en/examples/event#custom).

```js
import { CustomEvent } from '@antv/g';

const event = new CustomEvent('build', { detail: { prop1: 'xx' } });
circle.addEventListener('build', (e) => {
    e.target; // circle
    e.detail; // { prop1: 'xx' }
});

circle.dispatchEvent(event);
```

The parameters of the CustomEvent constructor are as follows.

-   `eventName` required, type is `string`
-   `eventObject` optional, contains the following attributes.
    -   `detail` contains custom data which type is `any`

For compatibility with older G APIs, the use of `emit` is also supported.

```js
circle.on('build', (e) => {
    e.target; // circle
    e.detail; // { prop1: 'xx' }
});
circle.emit('build', { prop1: 'xx' });
```

# Event Object

In the event listener's callback function, we can get the event object and access the properties and methods on it. These properties and methods are consistent with the DOM Event API, so you can directly refer to their documentation.

We will try to normalize the native events to [PointerEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/PointerEvent) event object and then handle them uniformly, which can be accessed on [nativeEvent](/en/docs/api/event#nativeevent) to access native events.

## General Properties

Common properties on the event object include event type, graphics of the current triggered event, location, etc., where location is related to [coordinate system](/en/docs/api/canvas#coordinate system).

### type

Event type：

-   pointerup
-   pointerdown
-   pointerupoutside
-   pointermove
-   pointercancel

https://developer.mozilla.org/en-US/docs/Web/API/Event/type

### nativeEvent

Native event object. When we call [preventDefault](/en/docs/api/event#preventdefault) method, it will call the method of the same name on the native event object.

### view

Point to [Canvas](/en/docs/api/canvas).

https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/view

### altKey

If or not the event is triggered with an `alt` press.

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/altKey

### metaKey

If or not the event is triggered with a `meta` press.

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/metaKey

### ctrlKey

If or not the event is triggered with a `ctrl` press.

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/ctrlKey

### shiftKey

If or not the event is triggered with a `shift` press.

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/shiftKey

### timeStamp

Timestamp when the event was created.

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/timeStamp

### eventPhase

The current event phase. There are three enumeration values as follows.

```
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

https://developer.mozilla.org/zh-CN/docs/Web/API/CustomEvent/detail

### target

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/target

The [EventTarget](/en/docs/api/builtin-objects/event-target) of the current triggering event.

Useful when implementing event delegation, for example in a scenario like this, similar to `ul/li` in the DOM.

```
Group(ul)
    - Rect(li)
    - Rect(li)
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

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/currentTarget

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

Under [Canvas coordinate system/world coordinate system](/en/docs/api/canvas#canvas), the upper left corner of the canvas DOM element is the origin, the X-axis is pointing to the right side of the screen and the Y-axis is pointing to the bottom of the screen. Can be interconverted with [viewportX/Y](/en/docs/api/event#viewportxy), [see](/en/docs/api/canvas#canvas--viewport).

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

Under [Viewport coordinate system](/en/docs/api/canvas#viewport), consider the camera transformation.

Can be interconverted with [canvasX/Y](/en/docs/api/event#canvasxy), [see](/en/docs/api/canvas#canvas--viewport).

```js
canvas.canvas2Viewport({ x: e.canvasX, y: e.canvasY }); // Point { x: 100, y: 100 }
canvas.viewport2Canvas({ x: e.viewportX, y: e.viewportY }); // Point { x: 0, y: 0 }
```

Can be interconverted with [clientX/Y](/en/docs/api/event#clientxy), [see](/en/docs/api/canvas#client--viewport).

```js
canvas.viewport2Client({ x: 0, y: 0 }); // Point { x: 100, y: 100 }
canvas.client2Viewport({ x: 100, y: 100 }); // Point { x: 0, y: 0 }
```

### clientX/Y

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/clientX

Under [browser coordinate system](/en/docs/api/canvas#client), the upper left corner is `(0, 0)`. G does not modify this property on the native event, so they are identical.

```js
e.clientX;
e.nativeEvent.clientX;
```

Can be interconverted with [viewportX/Y](/en/docs/api/event#viewportxy), [see](/en/docs/api/canvas#client--viewport).

```js
canvas.viewport2Client({ x: 0, y: 0 }); // Point { x: 100, y: 100 }
canvas.client2Viewport({ x: 100, y: 100 }); // Point { x: 0, y: 0 }
```

### screenX/Y

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/screenX

Under [screen coordinate system](/en/docs/api/canvas#screen), page scrolling is not considered. g does not modify this property on native events, so they are identical.

```js
e.screenX;
e.nativeEvent.screenX;
```

### pageX/Y

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/pageX

Under [page coordinate system](/en/docs/api/canvas#page), consider page scrolling. g does not modify this property on native events, so they are identical.

```js
e.pageX;
e.nativeEvent.pageX;
```

### movementX/Y

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/movementX

The value of the mouse movement in the horizontal direction between the current event and the previous `mousemove` event. In other words, this value is calculated like this: `currentEvent.movementX = currentEvent.screenX - previousEvent.screenX`

## PointerEvent

### pointerType

Returns the device type of the event with the following return value.

-   `'pointer'` [PointerEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/PointerEvent)
-   `'mouse'` [MouseEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent)
-   `'touch'` [TouchEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/TouchEvent)

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType

### pointerId

Returns a value that uniquely identifies the point in contact with the touch plane. This value remains consistent across all events raised by this finger (or stylus, etc.) until it leaves the touch plane.

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerId

### isPrimary

If or not it is primary pointer, it means the current event is generated by the primary pointer in multi-touch scenario.

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/isPrimary

### button

Identifies which button was clicked for the mouse event. 0 is the left button, 1 is the right button.

https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button

### buttons

https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons

### width

The width of the contact area. Returns `1` if the native event is MouseEvent.

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/width

### height

The height of the contact area. Returns `1` if the native event is MouseEvent.

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/height

### tiltX

The angle of the contact with the screen in the Y-Z plane. Returns a fixed value of `0` if the native event is MouseEvent.

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltX

### tiltY

The angle of the contact with the screen in the X-Z plane. Returns a fixed value of `0` if the native event is MouseEvent.

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltY

### pressure

Returns the amount of pressure corresponding to the finger squeezing the touch plane, from `0.0` (no pressure) to `1.0` (maximum pressure) as a floating point number. Returns a fixed value of `0.5` if the native event is MouseEvent.

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure

### tangentialPressure

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tangentialPressure

### twist

The clockwise rotation angle. Returns a fixed value of `0` if the native event is MouseEvent.

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/twist

## WheelEvent

In the mouse wheel event, you can get the scroll amount.

### deltaX/Y/Z

<tag color="blue" text="WheelEvent">WheelEvent</tag>

https://developer.mozilla.org/zh-CN/docs/Web/API/WheelEvent

The amount of lateral/longitudinal/Z-axis roll of the roller.

## Methods

Certain methods on the event object can control the behavior of the event as it propagates, such as preventing bubbling, etc.

### stopImmediatePropagation

Prevents other event listeners listening to the same event from being called, and prevents bubbling.

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopImmediatePropagation

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

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopPropagation

The difference with `stopImmediatePropagation` is that it does not prevent other event listeners listening to the same event from being called.

### preventDefault

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/preventDefault

Block the default browser behavior. Calling this method for Passive events is not valid and will throw a warning.

A solution for wheel events can be found at [Disable default page scrolling behavior in Chrome](/en/docs/api/event#en/docs/api/event#disable-default-page-scrolling-behavior-in-chrome).

### composedPath

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/composedPath

Returns the event path, which is an array containing [EventTarget](/en/docs/api/builtin-objects/event-target), similar to `propagationPath` in the old G version. In this array, `event.target` is the first element of the array, [scene graph root](/en/docs/api/canvas#the-root-node), [Document](/en/docs/api/builtin-objects/document) and [Canvas](/en/docs/api/canvas) are the three elements at the end of the array.

Still using a DOM-like `ul/li` scenario as an example.

```
Group(ul)
    - Rect(li)
    - Rect(li)
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

# Gesture & Drag'n'Drop

When we want to implement certain "advanced events" in addition to the base events, such as common gestures and drag and drop, we can do so by combining these base events. Thanks to the scene graph's compatibility with the DOM API, we can also use the existing ecosystem directly and let these libraries think they are still manipulating the DOM.

## Use Hammer.js

Taking a gesture library like [Hammer.js](https://github.com/hammerjs/hammer.js) as an example, we can pass `DisplayObject` in directly since it is fully DOM API compatible. In addition, we need to tell Hammer.js that our input event is a PointerEvent via [inputClass](https://hammerjs.github.io/jsdoc/Hammer.defaults.html#.inputClass), so we don't need to take into account interaction events such as TouchEvent and other interactive events, [example](/en/examples/event#hammer).

```js
import Hammer from 'hammerjs';

const hammer = new Hammer(circle, {
    inputClass: Hammer.PointerEventInput, // use PointerEvent
});
hammer.on('press', (e) => {
    console.log("You're pressing me!");
    console.log(e.target); // circle
});
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*i7SaRaYw0YcAAAAAAAAAAAAAARQnAQ" width="400">

## Implementing Pinch Gestures with PointerEvents

The Pinch gesture is implemented in this [example](/en/examples/event#pinch-with-pointer), see https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_ zoom_gestures

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*MkM3TYXZsHsAAAAAAAAAAAAAARQnAQ" width="300">

The core idea is to manage the touch points on the screen by listening to PointerEvents based on the [pointerId](/en/docs/api/event#pointerid) on the event object without caring about Mouse/TouchEvent.

## Direct use of Interact.js

[Interact.js](https://interactjs.io/) is an interaction library that includes Drag&Drop, Resize, gestures, and more.

As an example of drag and drop.

```js
import interact from 'interactjs';

interact(
    circle, //draggable object
    {
        context: canvas.document, // Pass the canvas document in
    },
).draggable({
    startAxis: 'xy', // Allows dragging in both horizontal and vertical directions
    lockAxis: 'start', // Lock the dragging direction to the initial setting
    onmove: function (event) {
        const { dx, dy } = event; // interact.js mounts dx/dy on the event object
        circle.translateLocal(dx, dy); // Move the object
    },
});
```

[Example](/en/examples/event#interact)

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*9YqIQo56RasAAAAAAAAAAAAAARQnAQ" width="400">

## Using g-plugin-dragndrop

If you find interact.js too heavy, you can choose to use the simple drag-and-drop plugin we provide: [g-plugin-dragndrop](/en/docs/plugins/dragndrop).

This plugin is completely based on [PointerEvents](/en/docs/api/event#interaction events) to implement drag and drop functionality. In this [example](/en/examples/plugins#dragndrop), we listen to the drag event of the soccer ball to move it to the right position and the dragover event of the goal to change the transparency when the soccer ball crosses the goal area.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*A14uTY9_5UEAAAAAAAAAAAAAARQnAQ" alt="dragndrop">

## Implementing simple drag'n'drop

In addition to using the above off-the-shelf libraries, we can also implement simple drag-and-drop effects by combining PointerEvents listeners, which is what [g-plugin-dragndrop](/en/docs/plugins/dragndrop) does internally, as referenced in [Drag'n'Drop with mouse events](https://javascript.info/mouse-drag-and-drop).

```js
ball.addEventListener('pointerdown', function (event) {
    let shiftX = event.clientX - ball.getBoundingClientRect().left;
    let shiftY = event.clientY - ball.getBoundingClientRect().top;

    moveAt(event.canvasX, event.canvasY);

    function moveAt(canvasX, canvasY) {
        ball.style.x = canvasX - shiftX + 'px';
        ball.style.y = canvasY - shiftY + 'px';
    }

    async function onMouseMove(event) {
        moveAt(event.canvasX, event.canvasY);
    }

    canvas.document.addEventListener('pointermove', onMouseMove);

    ball.addEventListener(
        'pointerup',
        function () {
            canvas.document.removeEventListener('pointermove', onMouseMove);
        },
        { once: true },
    );
});
```

[Example](/en/examples/event#drag)

# Interaction with other plugins

## Event Binding/Unbinding Plugin

As mentioned before, event binding is not done in the core event system, it should be left to the corresponding rendering environment plugins. For example, [g-plugin-dom-interaction](/en/docs/plugins/dom-interaction) which uses DOM API to bind/unbind, other environments such as applets should write their own plugins.

In this class of plugins, we need to complete the binding in `init` and the unbinding in `destroy`. When implementing the binding, multiple (if any) native events in that rendering environment need to be mapped to G's standard event handlers.

```js
// g-plugin-dom-interaction

const onPointerDown = (ev: InteractivePointerEvent) => {
    renderingService.hooks.pointerDown.call(ev);
};

renderingService.hooks.init.tap(DOMInteractionPlugin.tag, () => {
    // using native DOM API
    $el.addEventListener(
        'pointerdown', // native event
        onPointerDown,
        true,
    );

    // If mobile support is required
    if (supportsTouchEvents) {
        $el.addEventListener('touchstart', onPointerDown, true);
    }
    // ...
});

renderingService.hooks.destroy.tap(DOMInteractionPlugin.tag, () => {});
```

## Picking Plugin

Different rendering environments use different pickup plugins for determining the EventTarget of native events.

-   [g-plugin-canvas-picker](/en/docs/plugins/canvas-picker) Use mainly mathematical operations.
-   [g-plugin-svg-picker](/en/docs/plugins/svg-picker) Use SVG API.
-   [g-plugin-device-renderer](/en/docs/plugins/device-renderer) Use GPU-based methods.

## A11y Plugin

In [g-plugin-a11y](/en/docs/plugins/a11y), we listen to keyboard events for navigation.

# Caveats

## The problem of 'this' within the event listener

Refer to https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#the_value_of_this_within_the_handler

Inside the event listener `this` should point to the same as `e.currentTarget`. However, if the arrow function is used, the context will be lost:

```js
circle.addEventListener('mouseenter', function (e) {
    console.log(this); // circle
    console.log(e.currentTarget === this); // true
});

circle.addEventListener('mouseleave', () => {
    console.log(this); // undefined
});
```

## mouseenter/leave won't bubble up

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/mouseenter_event

mouseenter does not bubble, while mouseover does. Similarly mouseleave does not bubble, while mouseout does.

## Hit testing

The event system only responds to events within the Canvas canvas. For example, when mousemove is listened to, moving outside of the canvas to other areas of the page does not trigger the event handler. The [target](/en/docs/api/event#target) property of the event object returns [Document](/en/docs/api/builtin-objects/document) when picking up a blank area of the canvas (without hitting any visible graphics).

```js
canvas.addEventListener('mousemove', (e) => {
    if (e.target.nodeName === 'document') {
        // move on empty area
    }
});
```

## Event Trigger Sequence

Some built-in events have an order of firing, for example, the click event will be fired after the pointerdown and pointerup events. In this process, it is possible that the target of the pointerdown and pointerup events may not match. For example, if you press the mouse on one graph, move to another graph and then lift the mouse, we will trigger the click event on an ancestor node that is common to both targets (e.g. the root of the scene graph [document.documentElement](/en/docs/api/canvas#document-1)).

This can be tried in [this example](/en/examples/event#delegate).

## Disable default page scrolling behavior in Chrome

Sometimes we need to disable the default scrolling behavior of a page, for example when implementing a zoom class. Disabling the default behavior can be done with [preventDefault](/en/docs/api/event#preventdefault), but the following code will not work in Chrome and the page will still scroll.

```
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
});
```

The reason for this problem is that G added the `passive: true` configuration item when listening to the wheel event of the canvas event.

```js
// $el is the DOM element, <canvas> in g-canvas/webgl while <svg> in g-svg
$el.addEventListener('wheel', onPointerWheel, {
    passive: true,
    capture: true,
});
```

For more information about Passive event handlers, please refer to this article from https://zhuanlan.zhihu.com/p/24555031. The short answer is that this option improves the browser's scrolling smoothness by telling the browser in advance that "I won't block your default scrolling behavior".

Now back to our question, if the user does need to disable the default scrolling behavior, a non-Passive event handler can be manually added to the DOM node of the canvas, [g-plugin-control](http://g-next.antv.vision/en/docs/plugins/control) plugin does this. How to get the DOM node of the canvas can be done using [getDomElement](/en/docs/api/renderer#getdomelement).

```js
canvas
    .getContextService()
    .getDomElement() // g-canvas/webgl 为 <canvas>，g-svg 为 <svg>
    .addEventListener(
        'wheel',
        (e) => {
            e.preventDefault();
        },
        { passive: false },
    );
```

## Other Events

Most of the other native events, especially keyboard and clipboard events that need to be bound to window/document, have no special usage in G. You can directly refer to the related events documentation.

### Disable right-click menu

Sometimes we want to disable the browser's default right-click menu, so we can disable the default behavior in the [contextmenu](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/contextmenu_event) event handler with the `preventDefault()` method to disable the default behavior. To get the DOM node of the canvas you can use [getDomElement](/en/docs/api/renderer#getdomelement).

```js
canvas
    .getContextService()
    .getDomElement() // g-canvas/webgl 为 <canvas>，g-svg 为 <svg>
    .addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
```

Note that since the default behavior of the rightup / down events is not to pop up the system menu, the following writeup is not valid.

```js
// wrong
canvas.addEventListener('rightup', (e) => {
    e.preventDefault();
});
```

### KeyboardEvent

Use [KeyboardEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent) directly.

```js
window.addEventListener('keydown', () => {}, false);
```

However, we have not yet implemented A11y-related features, such as using tabs to toggle selection between shapes within the canvas.

### ClipboardEvent

Use [ClipboardEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/ClipboardEvent) directly.

### FocusEvent

We don't have a built-in [focus event](https://developer.mozilla.org/zh-CN/docs/Web/API/FocusEvent) like focus/blur, so the following code is not valid.

```js
circle.addEventListener('focus', () => {});
circle.addEventListener('blur', () => {});
```

Focus-related functions can be implemented through events such as click/mouseenter/mouseleave. [example](/en/examples/event#circle)

### Doubleclick

Due to the need to be as compatible as possible with PC and mobile events, we do not listen to the native [dblclick](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/dblclick_event) event, but to the [pointerdown](/en/docs/api/event#detail) property by listening to pointerdown and pointerup, the number of clicks within a certain time interval (200ms) is recorded in the [detail](/en/docs/api/event#detail) attribute, so that it is possible to distinguish between a click and a double click.

```js
canvas.addEventListener('click', (e) => {
    if (e.detail === 2) {
        // dbclick
    } else if (e.detail === 1) {
        // click
    }
});
```

## Compatible API

The following way of writing delegates in event names is supported in older versions, in the format `[delegated-graphic name]:[event-name]`, [example](/en/examples/event#deprecated-delegate).

```js
// Listen for click events bubbling up on all graphs with the name node
graph.on('node:click', () => {});

// or
graph.addEventListener('click', (e) => {
    if (e.target.name === 'node') {
    }
});
```
