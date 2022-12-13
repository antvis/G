---
title: g-plugin-annotation
order: -1
---

In addition to rendering the drawing out, sometimes we want to perform transformations such as scaling on the drawing in an interactive form, for example [Fabric.js](http://fabricjs.com/) and [Konva.js](https://konvajs.org/) provide the ability to do so. As an example, in the following figure, after selecting the graph with the mouse, controls for auxiliary operations appear, allowing the target graph to be moved by dragging and dropping the mask, and the graph to be scaled by dragging and dropping the anchor point.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*zXxcR4O7aHQAAAAAAAAAAAAAARQnAQ" alt="selectable UI" width="200">

[Example](/en/examples/plugins#annotation)

## Installation

This plugin relies on [g-plugin-dragndrop](/en/plugins/dragndrop) for drag-and-drop capabilities, so it needs to be used with the following registration.

```js
import { Plugin as PluginDragndrop } from '@antv/g-plugin-dragndrop';
import { Plugin as PluginAnnotation } from '@antv/g-plugin-annotation';

renderer.registerPlugin(new PluginDragndrop());
renderer.registerPlugin(new PluginAnnotation());
```

## Usage

The plugin provides two modes which can be switched via [setDrawingMode](/en/plugins/annotation#setdrawingmode).

-   Drawing mode. This mode allows drawing graphics in preset steps.
-   Edit mode. In this mode, select `selectable` graphics and the corresponding editing component will appear, so you can finish editing operations such as panning and resizing the graphics through component interaction.

### Drawing mode

After entering drawing mode, use [setDrawer](/en/plugins/annotation#setdrawer) to set the drawing tool for the corresponding graph and start drawing. For example, we want to draw a line.

```js
plugin.setDrawingMode(true);
plugin.setDrawer(DrawerTool.Polyline);
// or
plugin.setDrawer('polyline');
```

We currently offer the following drawing tools.

```js
export enum DrawerTool {
  Circle = 'circle',
  Rect = 'rect',
  Polygon = 'polygon',
  Polyline = 'polyline',
}
```

A series of events will be triggered during the drawing process. In Fabric.js, you need to set the brush before you can draw. When using this plugin, you need to listen to the Draw Finished event and use the draw point data carried in the event object to create the base drawing and add it to the canvas.

```js
annotationPlugin.addEventListener('draw:complete', ({ type, path }) => {
    // use any brush you preferred
    const brush = {
        stroke: 'black',
        strokeWidth: 10,
        selectable: true,
    };
});
```

#### Drawing keypoint

Press the mouse to determine the position of the point, which can then be used to draw any figure such as [Circle](/en/api/basic/circle).

#### Drawing rectangles

Press the mouse, drag and drop and then lift to finish drawing.

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*AdchSpfkON0AAAAAAAAAAAAAARQnAQ" alt="draw a rect" width="400" />

The following keyboard shortcuts are supported.

-   `esc` to cancel drawing

#### Drawing polyline

Press the mouse in sequence to determine the vertices, double-click the mouse or successive vertices close to each other is considered to be the end of the drawing, the line between the vertices form the final fold line.

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*cWBbT54Ym9cAAAAAAAAAAAAAARQnAQ" alt="draw a polyline" width="400" />

The following keyboard shortcuts are supported.

-   `esc` to cancel drawing
-   `shift` + `Z` to undo the latest line segment
-   `space` to finish drawing

#### Drawing polygon

Press the mouse in sequence to determine the vertices and close them to form a polygon.

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*XO54RqJPp7AAAAAAAAAAAAAAARQnAQ" alt="draw a polygon" width="400" />

The following keyboard shortcuts are supported.

-   `esc` to cancel drawing
-   `shift` + `Z` to undo the latest line segment
-   `space` to finish drawing

### Edit mode

The base graph can be made interactive by turning on `selectable`.

```js
circle.style.selectable = true;
```

We currently support the following **basic graphics**: [Circle](/en/api/basic/circle)、[Ellipse](/en/api/basic/ellipse)、[Rect](/en/api/basic/rect)、[Image](/en/api/basic/image)、[Line](/en/api/basic/line)、[Polyline](/en/api/basic/polyline)

In addition `anchorsVisibility` can control anchor visibility. `maskDraggable` can control whether the mask is draggable or not.

#### Select graphics

We support selecting single or multiple graphics either interactively or via API.

To select a graphic via API, you can call the [selectDisplayObject](/en/plugins/annotation#selectdisplayobject) method. When the graphic is selected, a mask will appear on top of it, which contains several anchor points.

Clicking on the graphic will complete a single selection, which is the most common way. We support the following two ways to complete multiple selections.

-   Hold down `shift` and click to add a selection while keeping the selected shape
-   Hold down `shift` and drag a rectangle to complete a region swipe

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*kf-wR5_SY4YAAAAAAAAAAAAAARQnAQ" alt="multi-select" width="300">

#### Deselect graphics

As opposed to selecting a graphic, there are two ways to unselect it.

-   Click on a blank area of the canvas or another graphic.
-   To unselect a graphic via API, call [deselectDisplayObject](/en/plugins/annotation#deselectdisplayobject) method.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*gLusRqf4zmQAAAAAAAAAAAAAARQnAQ" alt="deselect target" width="200">

#### Move graphics

After selecting the shape, drag and drop it on the mask to move it.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*rC-ERaSSrmcAAAAAAAAAAAAAARQnAQ" alt="move target">

The corresponding [event]() will be triggered during and after the movement.

You can also use the keyboard up/down/left/right arrow keys to move the drawing after it is selected, and the step length can be configured by [arrowKeyStepLength](/en/plugins/annotation#arrowkeysteplength).

#### Resize graphics

Dragging the anchor point can change the size of the graphic. Take the following figure as an example, when dragging the anchor point in the bottom right corner, it actually fixes the top left corner first, and then modifies the width and height of the image.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*gmraRLDxW_kAAAAAAAAAAAAAARQnAQ" alt="resize target">

## Plugin initialization configuration

When creating a plugin, you can pass in some initialization configuration.

### isDrawingMode

If or not draw mode, the default value is `true`.

### enableAutoSwitchDrawingMode

Automatically switch in some scenes, the default value is `false`.

-   Clicking on an interactive drawing in drawing mode will automatically switch to editing mode.
-   Clicking on a blank area in edit mode will automatically switch to draw mode.

### enableDeleteTargetWithShortcuts

The default value is `false` to delete the selected interactive graphics using keyboard shortcuts.

When enabled, you can use the `Delete` / `Esc` / `Backspace` keys to delete the selected interactive graphics.

### enableContinuousBrush

Whether to support continuous pressing of `shift` for frame selection, the default value is `true`.

After closing, each frame selection will clear the previous result and re-select.

### arrowKeyStepLength

In edit mode, use the keyboard up, down, left and right arrow keys to move the graph in steps, the default value is `4`.

### selectableStyle

Some of the styles of the auxiliary actions component support customization, so you can pass in style configurations during initialization, for example to make the fill color of the mask black.

```js
const plugin = new PluginAnnotation({
    selectableStyle: {
        selectionFill: 'black',
    },
});
```

We currently support the following style configurations.

```js
export interface SelectableStyle {
    /**
     * Mask
     */
    selectionFill: string;
    selectionFillOpacity: number;
    selectionStroke: string;
    selectionStrokeOpacity: number;
    selectionStrokeWidth: number;
    /**
     * Anchors
     */
    anchorFill: string;
    anchorStroke: string;
    anchorSize: string | number;
    anchorFillOpacity: number;
    anchorStrokeOpacity: number;
}
```

In addition to specifying it when initializing the plugin, it can be modified at any time later using the [updateSelectableStyle](/en/plugins/annotation#updateselectablestyle) method.

#### selectionFill

For the mask fill color, you can refer to [fill](/en/api/basic/display-object#fill) for the value, e.g.

```js
const plugin = new PluginAnnotation({
    selectableStyle: {
        selectionFill: 'rgba(0, 0, 0, 0.5)',
    },
});
```

#### selectionFillOpacity

For the opacity of the mask fill color, you can refer to [fillOpacity](/en/api/basic/display-object#fillopacity) for the value.

#### selectionStroke

Stroke color of the mask. You can refer to [stroke](/en/api/basic/display-object#stroke) for the value.

```js
const plugin = new PluginAnnotation({
    selectableStyle: {
        selectionStroke: 'rgba(0, 0, 0, 0.5)',
    },
});
```

#### selectionStrokeOpacity

Mask stroke opacity, you can refer to [strokeOpacity](/en/api/basic/display-object#strokeopacity) for the value.

#### selectionStrokeWidth

Stroke width of the mask. You can refer to [strokeWidth](/en/api/basic/display-object#strokewidth) for the value.

#### selectionLineDash

The mask stroke dashed line. You can refer to [lineDash](/en/api/basic/display-object#linedash) for the value.

#### anchorFill

The anchor fill color.

#### anchorFillOpacity

The opacity of the anchor fill color.

#### anchorStroke

The anchor stroke color.

#### anchorStrokeOpacity

The opacity of the anchor stroke color.

#### anchorStrokeWidth

The width of the anchor stroke line.

#### anchorSize

The size of the anchor point. For now we only support circular anchors, so this property is equivalent to the radius of a circle.

### drawerStyle

Auxiliary drawing style for the component. The initial value is specified by the constructor `drawStyle` parameter and can be updated by [updateDrawerStyle](/en/plugins/annotation#updatedrawerstyle).

For example, if we want to specify the stroke color of a rectangular drawing component.

```js
const annotationPlugin = new AnnotationPlugin({
    drawerStyle: {
        rectStroke: 'red',
    },
});
```

#### rectFill

See [fill](/en/api/basic/display-object#fill), the default value is `'none'`.

#### rectFillOpacity

See [fillOpacity](/en/api/basic/display-object#fillopacity), the default value is `1`.

#### rectStroke

See [stroke](/en/api/basic/display-object#stroke), the default value is `'#FAAD14'`.

#### rectStrokeOpacity

See [strokeOpacity](/en/api/basic/display-object#strokeopacity), the default value is `1`.

#### rectStrokeWidth

See [strokeWidth](/en/api/basic/display-object#strokewidth), the default value is `2.5`.

#### rectLineDash

You can refer to [lineDash](/en/api/basic/display-object#linedash), the default value is `6`.

#### polylineVertexSize

The size of the drawn vertex of the folded line. For now, we only support circular vertices, so this property is equivalent to the radius of a circle, and the default value is `6`.

In the following figure, the hollow circle is the drawn vertex and the solid line is the drawn line segment; the solid circle is the vertex being drawn and the dashed line is the line segment being drawn.

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*RDKsRIgEAqIAAAAAAAAAAAAAARQnAQ" alt="draw polyline" width="300">

#### polylineVertexFill

See [fill](/en/api/basic/display-object#fill), the default value is `'#FFFFFF'`.

#### polylineVertexFillOpacity

See [fillOpacity](/en/api/basic/display-object#fillopacity), the default value is `1`.

#### polylineVertexStroke

See [stroke](/en/api/basic/display-object#stroke), the default value is `'#FAAD14'`.

#### polylineVertexStrokeOpacity

See [strokeOpacity](/en/api/basic/display-object#strokeopacity), the default value is `1`.

#### polylineVertexStrokeWidth

See [strokeWidth](/en/api/basic/display-object#strokewidth), the default value is `2`.

#### polylineSegmentStroke

The color of the drawn line segment of the fold line, see [stroke](/en/api/basic/display-object#stroke), the default value is `'#FAAD14'`.

#### polylineSegmentStrokeWidth

The line width of the drawn line segment of the folded line, refer to [strokeWidth](/en/api/basic/display-object#strokewidth), the default value is `2`.

#### polylineActiveVertexSize

The size of the vertex being drawn by the fold. For now we only support circular vertices, so this property is equivalent to the radius of a circle, and the default value is `6`.

#### polylineActiveVertexFill

See [fill](/en/api/basic/display-object#fill), the default value is `'#FFFFFF'`.

#### polylineActiveVertexFillOpacity

See [fillOpacity](/en/api/basic/display-object#fillopacity), the default value is `1`.

#### polylineActiveVertexStroke

See [stroke](/en/api/basic/display-object#stroke), the default value is `'#FAAD14'`.

#### polylineActiveVertexStrokeOpacity

See [strokeOpacity](/en/api/basic/display-object#strokeopacity), the default value is `0.2`.

#### polylineActiveVertexStrokeWidth

See [strokeWidth](/en/api/basic/display-object#strokewidth), the default value is `2`.

#### polylineActiveSegmentStroke

The fold line is drawing line color, see [stroke](/en/api/basic/display-object#stroke), the default value is `'#FAAD14'`.

#### polylineActiveSegmentStrokeWidth

The line width of the line segment being drawn, refer to [strokeWidth](/en/api/basic/display-object#strokewidth), the default value is `2.5`.

## API

The following APIs can be called through plugin instances, e.g.

```js
const plugin = new PluginAnnotation();

circle.style.selectable = true;
plugin.selectDisplayObject(circle);
```

### setDrawingMode

Sets whether draw mode is enabled.

```js
// 进入绘制模式
plugin.setDrawingMode(true);

// 进入编辑模式
plugin.setDrawingMode(false);
```

### setDrawer

In drawing mode, we provide the ability to draw the following graphics.

-   `circle`
-   `rect`
-   `polyline`
-   `polygon`

For example, to draw a rectangle.

```js
plugin.setDrawingMode(true);
plugin.setDrawer('rect');
```

### selectDisplayObject

Selects a graphic. Does not apply the cancel operation to other selected graphs.

```js
plugin.selectedDisplayObject(circle);
```

### deselectDisplayObject

Deselects a graphic.

```js
plugin.deselectedDisplayObject(circle);
```

### getSelectedDisplayObjects

Get the list of currently selected graphs.

```js
plugin.getSelectedDisplayObjects(); // [circle, path]
```

### updateSelectableStyle

Update the [style](/en/plugins/annotation#assist manipulation component style) of the interactive component in real time, e.g. modify the mask fill color in [example](/en/examples/plugins#annotation).

```js
plugin.updateSelectableStyle({
    selectionFill: 'red',
});
```

### updateDrawerStyle

Update the style of the auxiliary drawing component, e.g.

```js
plugin.updateDrawerStyle({
    rectStroke: 'red',
});
```

### markSelectableUIAsDirty

Sometimes the definition of the target graph is modified and needs to be sensed and regenerated by the auxiliary operation component, in which case the method can be called manually.

```js
circle.style.cx = 100;
circle.style.cy = 100;

plugin.markSelectableUIAsDirty(circle);
```

## Events

Different events will be triggered in different modes, for example, drawing mode will trigger on plug-ins, while editing mode will trigger on graphics.

### Drawing mode

Unlike the "free drawing" mode of Fabric.js, the plugin listens for events triggered at different drawing stages, gets the geometry information contained in the event object, creates the corresponding shapes and applies custom styles to complete the drawing.

The following events are supported.

```js
export enum DrawerEvent {
  START = 'draw:start',
  MOVE = 'draw:move',
  MODIFIED = 'draw:modify',
  COMPLETE = 'draw:complete',
  CANCEL = 'draw:cancel',
}
```

The event object contains the following data, where the key properties are

-   `type` The type of graph to draw. Currently supports `rect` `polyline` `polygon`
-   `path` draws a list of graph vertices, like: `[{ x: 0, y: 0 }, { x: 100, y: 100 }...] `

```js
plugin.addEventListener(DrawerEvent.COMPLETE, ({ type, path }) => {});
```

#### Start drawing

#### Drawing

#### Cancel drawing

#### Complete drawing

At the end of the drawing, the auxiliary drawing UI is automatically hidden and we can use the vertex data to draw the final shape.

```js
plugin.addEventListener(DrawerEvent.COMPLETE, ({ type, path }) => {
    // use any brush you preferred
    const brush = {
        stroke: 'black',
        strokeWidth: 10,
        selectable: true,
    };

    if (type === 'polyline') {
        const polyline = new Polyline({
            style: {
                ...brush,
                points: path.map(({ x, y }) => [x, y]),
            },
        });
        canvas.appendChild(polyline);
    }
});
```

### Edit mode

When a drawing is selected, unselected, moved, or changed in size, the corresponding event is triggered.

```js
export enum SelectableEvent {
  SELECTED = 'selected',
  DESELECTED = 'deselected',
  MODIFIED = 'modified',
  MOVED = 'moved',
  MOVING = 'moving',
}
```

#### Selected Event

Triggered when the target graphic is selected. In [example](/en/examples/plugins#annotation), we listen to the selected event of the image.

```js
import { SelectableEvent } from '@antv/g-plugin-annotation';

image.addEventListener('selected', () => {});
// or
image.addEventListener(SelectableEvent.SELECTED, () => {});
```

#### Deselected Event

Triggered when the target graphic is deselected. In [example](/en/examples/plugins#annotation), we listen to the deselected event of the image.

```js
import { SelectableEvent } from '@antv/g-plugin-annotation';

image.addEventListener('deselected', () => {});
// or
image.addEventListener(SelectableEvent.DESELECTED, () => {});
```

#### Moving Event

When dragging a mask, the target graphic will move with it, and this process will continue to trigger in-motion events, similar to `dragging` in [g-plugin-dragndrop](/en/plugins/dragndrop).

```js
import { SelectableEvent } from '@antv/g-plugin-annotation';

image.addEventListener('moving', () => {});
// or
image.addEventListener(SelectableEvent.MOVING, () => {});
```

The following information is carried on this event object.

```js
image.addEventListener('moving', (e) => {
    const { movingX, movingY, dx, dy } = e.detail;
});
```

#### Moved Event

This event is triggered when the dragging is finished, similar to `dragend` in [g-plugin-dragndrop](/en/plugins/dragndrop).

```js
import { SelectableEvent } from '@antv/g-plugin-annotation';

image.addEventListener('moved', () => {});
// or
image.addEventListener(SelectableEvent.MOVED, () => {});
```

#### Modified Event

Dragging and dropping on the anchor point scales the drawing, and this process also continuously triggers modification events.

```js
import { SelectableEvent } from '@antv/g-plugin-annotation';

image.addEventListener('modified', () => {});
// or
image.addEventListener(SelectableEvent.MODIFED, () => {});
```
