---
title: Introduction
order: -3
---

The event system can provide rich interactions and we follow two principles in its design.

-   Keeping it as consistent as possible with the DOM API, besides reducing learning costs, is most important to be able to access existing ecologies (e.g. gesture libraries).
-   Only standard events are provided. Advanced events such as drag and drop, gestures, etc. are defined by extension.

Developers familiar with [DOM Event Stream](https://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-flow-h2) will be familiar with the following concepts.

-   Event objects have a reference to the EventTarget, which is naturally a DOM element in the DOM and [EventTarget](/en/api/builtin-objects/event-target) in G.
-   The event stream contains capture and bubble phases, and you can intervene in them through certain methods on the event object.
-   One or more listeners can be added to an event, and they are triggered sequentially in the order in which they are registered.

The following diagram shows the three phases of event propagation, the listener is triggered from top to bottom in the capture phase, and bubbles up after reaching the target node. In the listener, you can get the current phase by [eventPhase](/en/api/event#eventphase). The following image is from https://javascript.info/bubbling-and-capturing#capturing

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*zJBbSL2D5mkAAAAAAAAAAAAAARQnAQ" width="500" alt="event capture">

We currently support the following [base events](/en/api/event#type), which are compatible with DOM event streams as much as possible, so we have included reference links to the corresponding DOM Event APIs in many of the API introductions below.

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

## Listenable events

We currently support listening to two types of events: interaction events and scene graph events. The former is the same as most of the mouse and touch screen events provided in the DOM Event API, while the latter is based on the scene graph triggered when nodes are added, deleted, or property transformed.

### Interaction events

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
-   `click` Click & double click [how to distinguish?](/en/api/event#doubleclick)
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

### SceneGraph Events

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

## Event Listeners

### addEventListener

Adding event listeners to graphics is fully referenced in the DOM Event API: https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener

Method signature.

```js
target.addEventListener(type, listener, options);
target.addEventListener(type, listener, useCapture);
```

Parameters:

-   type 事件名称，[内置标准事件](/en/api/event#type) 或[自定义事件名](/en/api/event#custom-events)
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

You can refer to [this section](/en/api/event#the-problem-of-this-within-the-event-listener) for more information about the pointing of this in the listener.

### removeEventListener

Removing the event listener.

```js
circle.removeEventListener('click', handler);
```

The use of `off` is also supported for compatibility with older versions of the G API, so the following writeup is equivalent.

```js
circle.removeEventListener('mouseenter', () => {});
circle.off('mouseenter', () => {});
```

### removeAllEventListeners

Removes all event listeners.

The use of `off` is also supported for compatibility with older versions of the G API, so the following writeup is equivalent.

```js
circle.removeAllEventListeners();
circle.off();
```

### dispatchEvent

Manually triggered events, like interactively triggered events, go through the full event propagation process.

https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent

⚠️ Before manually firing an event on a drawing, you must ensure that the element has been added to the canvas.

#### Custom Events

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
