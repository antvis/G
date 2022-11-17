---
title: Gesture & Drag'n'Drop
order: 99
---

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

The core idea is to manage the touch points on the screen by listening to PointerEvents based on the [pointerId](/en/api/event#pointerid) on the event object without caring about Mouse/TouchEvent.

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

If you find interact.js too heavy, you can choose to use the simple drag-and-drop plugin we provide: [g-plugin-dragndrop](/en/plugins/dragndrop).

This plugin is completely based on [PointerEvents](/en/api/event#interaction events) to implement drag and drop functionality. In this [example](/en/examples/plugins#dragndrop), we listen to the drag event of the soccer ball to move it to the right position and the dragover event of the goal to change the transparency when the soccer ball crosses the goal area.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*A14uTY9_5UEAAAAAAAAAAAAAARQnAQ" alt="dragndrop">

## Implementing simple drag'n'drop

In addition to using the above off-the-shelf libraries, we can also implement simple drag-and-drop effects by combining PointerEvents listeners, which is what [g-plugin-dragndrop](/en/plugins/dragndrop) does internally, as referenced in [Drag'n'Drop with mouse events](https://javascript.info/mouse-drag-and-drop).

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
