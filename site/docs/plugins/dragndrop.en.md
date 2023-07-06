---
title: g-plugin-dragndrop
order: 7
---

Drag and drop based on [PointerEvents](/en/api/event#interaction events). In this [example](/en/examples/plugins#dragndrop), we listen to the drag event of the soccer ball to move it to the right position and the dragover event of the goal to change the transparency when the soccer ball crosses the goal area.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*A14uTY9_5UEAAAAAAAAAAAAAARQnAQ" alt="dragndrop">

## Usage

```js
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Plugin } from '@antv/g-plugin-dragndrop';

const canvasRenderer = new CanvasRenderer();
canvasRenderer.registerPlugin(new Plugin());
```

## Plugin configuration items

We provide the following configuration items that can be passed in when creating plugins, for example [overlap](/en/plugins/dragndrop#overlap).

```js
new Plugin({
    overlap: 'center',
});
```

### isDocumentDraggable

Since there is no "style" on [Document](/en/api/builtin-objects/document), when we want to drag and drop on a blank area of the canvas, we cannot do so.

```js
// wrong
canvas.document.style.draggable = true;

// correct
const plugin = new Plugin({
    // we can drag the whole document from empty space now!
    isDocumentDraggable: true,
});
```

In this [example](/en/examples/plugins#dragndrop), dragging in a blank area pans the camera with [camera.pan()](/en/api/camera#pan) to achieve the visual effect of the entire canvas moving.

```js
const camera = canvas.getCamera();
canvas.addEventListener('drag', function (e) {
    if (e.target === canvas.document) {
        camera.pan(-e.movementX, -e.movementY);
    }
});
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*sF1WQr4zrsQAAAAAAAAAAAAAARQnAQ" width="300" alt="drag document">

In the above example we have `e.target === canvas.document` to avoid moving non-[Document](/en/api/builtin-objects/document) elements like "soccer". element also causes the camera to move.

### isDocumentDroppable

Similarly, if we want to make [Document](/en/api/builtin-objects/document) a "placeable area", we can use this configuration item.

```js
// wrong
canvas.document.style.droppable = true;

// correct
const plugin = new Plugin({
    isDocumentDroppable: true,
});
```

In this [example](/en/examples/plugins#dragndrop), when we drag the soccer to a blank area, the console prints the following message.

```js
canvas.addEventListener('drop', function (e) {
    if (e.target === canvas.document) {
        console.log('drop on document');
    }
});
```

### dragstartDistanceThreshold

We provide the following configurations for what conditions are met to determine `dragstart`: based on drag distance and time, respectively. Only if all these conditions are met, a series of drag events such as `dragstart` will be triggered.

This configuration item is used to configure the detection threshold of the drag distance in pixels, and only **greater than** this value will be passed. The default value is 0.

In this [example](/en/examples/plugins#dragndrop), we have configured this option to 10, i.e. only dragging more than 10 pixels will trigger a drag event.

```js
const plugin = new Plugin({
    dragstartDistanceThreshold: 10,
});
```

### dragstartTimeThreshold

This configuration item is used to configure the detection threshold of drag and drop time in milliseconds, and only **greater than** this value will be passed. The default value is 0.

In this [example](/en/examples/plugins#dragndrop), we have configured this option to 100, i.e. the drag event will only be triggered if the drag exceeds 100 milliseconds.

```js
const plugin = new Plugin({
    dragstartTimeThreshold: 100,
});
```

### overlap

Used to determine if the graph in the drag is in the `dropzone`, supports the following two values.

-   `'pointer'` Default value. The mouse position enters the `dropzone` area by determining
-   `'center'` The center of the dropzone is determined if the center of the dropzone is in the dropzone.

### Modify configuration items

In addition to passing in when the plugin is initialized, you can also use `setOptions` to modify the above configuration items at any time later:

```js
plugin.setOptions({
    dragstartTimeThreshold: 200,
});
```

## Usage

Drag and Drop related events are both bubbly.

### Drag

After registering the plugin, you need to set the `draggable` property to `true` in order to make the graphics support drag and drop. For example, for the soccer ball above.

```js
const ball = new Image({
    style: {
        draggable: true, // 表示该图形支持拖拽
        x: 300,
        y: 200,
        width: 100,
        height: 100,
        src: 'https://en.js.cx/clipart/ball.svg',
        cursor: 'pointer',
    },
});
```

At this point, you can listen to drag-related events for the graph, including the following three types of events, the [target](/en/api/event#target) of the event object are the graph being dragged.

-   dragstart triggered at the start of dragging <https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragstart_event>
-   drag Triggered frequently during dragging <https://developer.mozilla.org/zh-CN/docs/Web/API/Document/drag_event>
-   dragend Triggered at the end of the drag <https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragend_event>

drag The related events are all [PointerEvents](/en/api/event#interaction events), so you can access the properties on the event object in the event listener.

For example, when we start dragging, we record the offset from mouse position to the position of the dragged element `shiftX/Y`, both under [Canvas/world coordinate system](/en/api/canvas/coordinates#canvas). In the `drag` event we call [setPosition](/en/api/basic/display-object#panning) to finish the panning of the dragged drawing.

<https://javascript.info/mouse-drag-and-drop#correct-positioning>

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*1121Q7T2TDAAAAAAAAAAAAAAARQnAQ" width="200">

```js
let shiftX = 0;
let shiftY = 0;
function moveAt(target, canvasX, canvasY) {
    target.setPosition(canvasX - shiftX, canvasY - shiftY);
}

ball.addEventListener('dragstart', function (e) {
    e.target.style.opacity = 0.5;
    ballText.style.text = 'ball dragstart';

    const [x, y] = e.target.getPosition();
    shiftX = e.canvasX - x;
    shiftY = e.canvasY - y;

    moveAt(e.target, e.canvasX, e.canvasY);
});
ball.addEventListener('drag', function (e) {
    moveAt(e.target, e.canvasX, e.canvasY);
    ballText.style.text = `ball drag movement: ${e.movementX}, ${e.movementY}`;
});
ball.addEventListener('dragend', function (e) {
    e.target.style.opacity = 1;
    ballText.style.text = 'ball dragend';
});
```

### Drop

Similarly, we can enable `droppable` for graphics that support placement.

```js
const gate = new Image({
    style: {
        droppable: true, // Indicates that the graph supports the placement of
        x: 50,
        y: 100,
        width: 200,
        height: 100,
        src: 'https://en.js.cx/clipart/soccer-gate.svg',
    },
});
```

At this point you can listen to drag/drop related events in the placement area, including the following three types of events, the [target](/en/api/event#target) of the event object are the graphics of the placement area.

-   dragenter has the graphic being dragged into the area <https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragenter_event>
-   dragleave has graphics being dragged out of the area <https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragleave_event>
-   dragover has the graphic being drawn over the area <https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragover_event>
-   drop has the graphic placed in the area <https://developer.mozilla.org/zh-CN/docs/Web/API/Document/drop_event>

For example, let's have the goal listen for events related to.

```js
gate.addEventListener('dragenter', function (e) {
    e.target.style.opacity = 0.6;
    gateText.style.text = 'gate dragenter';
});
gate.addEventListener('dragleave', function (e) {
    e.target.style.opacity = 1;
    gateText.style.text = 'gate dragleave';
});
gate.addEventListener('dragover', function (e) {
    e.target.style.opacity = 0.6;
    gateText.style.text = 'gate dragover';
});
gate.addEventListener('drop', function (e) {
    e.target.style.opacity = 1;
    gateText.style.text = 'gate drop';
});
```

## Cautions

### Event triggering sequence

The `drag` series of events has a sequential triggering order with other interaction events. Take the `pointer` series of events as an example, in a typical drag and drop process, the following events are triggered in sequence.

-   `pointerdown` press
-   `pointermove * n` dragging a certain distance, and then the dragging process will be decided
-   `dragstart` Start dragging
-   `drag` Dragging in progress
-   `pointermove`
-   `drag` dragging
-   `pointermove`
-   `drag` dragging
-   `pointermove`
-   `dragend` end of drag
-   `pointerup` lifting

### Relationship to Click events

In the Drag'n'drop implementation of HTML, only one `click` and `drag` event will be triggered at the same time: <https://plnkr.co/edit/5mdl7oTg0dPWXIip>

We have also kept this setting in our implementation, so that `click` is not triggered after the `dragend` event is fired.
