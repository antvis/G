---
title: Frequently Asked Questions
order: 100
---

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

The event system only responds to events within the Canvas canvas. For example, when mousemove is listened to, moving outside of the canvas to other areas of the page does not trigger the event handler. The [target](/en/api/event#target) property of the event object returns [Document](/en/api/builtin-objects/document) when picking up a blank area of the canvas (without hitting any visible graphics).

```js
canvas.addEventListener('mousemove', (e) => {
    if (e.target.nodeName === 'document') {
        // move on empty area
    }
});
```

## Event Trigger Sequence

Some built-in events have an order of firing, for example, the click event will be fired after the pointerdown and pointerup events. In this process, it is possible that the target of the pointerdown and pointerup events may not match. For example, if you press the mouse on one graph, move to another graph and then lift the mouse, we will trigger the click event on an ancestor node that is common to both targets (e.g. the root of the scene graph [document.documentElement](/en/api/canvas#document-1)).

This can be tried in [this example](/en/examples/event#delegate).

## Disable default page scrolling behavior in Chrome

Sometimes we need to disable the default scrolling behavior of a page, for example when implementing a zoom class. Disabling the default behavior can be done with [preventDefault](/en/api/event#preventdefault), but the following code will not work in Chrome and the page will still scroll.

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

Now back to our question, if the user does need to disable the default scrolling behavior, a non-Passive event handler can be manually added to the DOM node of the canvas, [g-plugin-control](http://g-next.antv.vision/en/plugins/control) plugin does this. How to get the DOM node of the canvas can be done using [getDomElement](/en/api/renderer#getdomelement).

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

Sometimes we want to disable the browser's default right-click menu, so we can disable the default behavior in the [contextmenu](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/contextmenu_event) event handler with the `preventDefault()` method to disable the default behavior. To get the DOM node of the canvas you can use [getDomElement](/en/api/renderer#getdomelement).

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

Due to the need to be as compatible as possible with PC and mobile events, we do not listen to the native [dblclick](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/dblclick_event) event, but to the [pointerdown](/en/api/event#detail) property by listening to pointerdown and pointerup, the number of clicks within a certain time interval (200ms) is recorded in the [detail](/en/api/event#detail) attribute, so that it is possible to distinguish between a click and a double click.

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

## Interaction with other plugins

### Event Binding/Unbinding Plugin

As mentioned before, event binding is not done in the core event system, it should be left to the corresponding rendering environment plugins. For example, [g-plugin-dom-interaction](/en/plugins/dom-interaction) which uses DOM API to bind/unbind, other environments such as applets should write their own plugins.

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

### Picking Plugin

Different rendering environments use different pickup plugins for determining the EventTarget of native events.

-   [g-plugin-canvas-picker](/en/plugins/canvas-picker) Use mainly mathematical operations.
-   [g-plugin-svg-picker](/en/plugins/svg-picker) Use SVG API.
-   [g-plugin-device-renderer](/en/plugins/device-renderer) Use GPU-based methods.

### A11y Plugin

In [g-plugin-a11y](/en/plugins/a11y), we listen to keyboard events for navigation.
