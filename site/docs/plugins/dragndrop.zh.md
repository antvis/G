---
title: g-plugin-dragndrop
order: 7
---

基于 [PointerEvents](/zh/api/event#交互事件) 实现拖放功能。在该[示例](/zh/examples/plugins#dragndrop)中，我们监听了足球的 drag 事件，用以移动它到正确的位置，同时监听了球门的 dragover 事件，当足球划过球门区域时改变透明度：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*A14uTY9_5UEAAAAAAAAAAAAAARQnAQ" alt="dragndrop">

## 安装方式

```js
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Plugin } from '@antv/g-plugin-dragndrop';

const canvasRenderer = new CanvasRenderer();
canvasRenderer.registerPlugin(new Plugin());
```

## 插件配置项

我们提供了以下配置项，可以在创建插件时传入，例如 [overlap](/zh/plugins/dragndrop#overlap)：

```js
new Plugin({
    overlap: 'center',
});
```

### isDocumentDraggable

由于 [Document](/zh/api/builtin-objects/document) 上并没有“样式”，因此当我们想在画布的空白区域进行拖拽时，并不能这么做：

```js
// wrong
canvas.document.style.draggable = true;

// correct
const plugin = new Plugin({
    // we can drag the whole document from empty space now!
    isDocumentDraggable: true,
});
```

在该[示例](/zh/examples/plugins#dragndrop)中，在空白区域进行拖拽可以通过 [camera.pan()](/zh/api/camera#pan) 平移相机，以达到整个画布发生移动的视觉效果：

```js
const camera = canvas.getCamera();
canvas.addEventListener('drag', function (e) {
    if (e.target === canvas.document) {
        camera.pan(-e.movementX, -e.movementY);
    }
});
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*sF1WQr4zrsQAAAAAAAAAAAAAARQnAQ" width="300" alt="drag document">

在上面的例子中我们有 `e.target === canvas.document` 这样的判断，是为了避免移动“足球”等非 [Document](/zh/api/builtin-objects/document) 元素也造成相机移动。

### isDocumentDroppable

同样的，如果我们想让 [Document](/zh/api/builtin-objects/document) 也成为“可放置区域”，可以使用该配置项：

```js
// wrong
canvas.document.style.droppable = true;

// correct
const plugin = new Plugin({
    isDocumentDroppable: true,
});
```

在该[示例](/zh/examples/plugins#dragndrop)中，当我们拖动足球到空白区域时，控制台会打印如下信息：

```js
canvas.addEventListener('drop', function (e) {
    if (e.target === canvas.document) {
        console.log('drop on document');
    }
});
```

### dragstartDistanceThreshold

对于满足何种条件判定“开始拖拽”，我们提供了以下配置项：分别基于拖拽距离和时间。只有这些判定条件全部满足，才会触发 `dragstart` 等一系列拖放事件。

该配置项用于配置拖放距离的检测阈值，单位为像素，只有 **大于** 该值才会判定通过。默认值为 0。

在该[示例](/zh/examples/plugins#dragndrop)中，我们配置了该选项为 10，即只有拖动超过 10 像素距离才会触发拖动事件：

```js
const plugin = new Plugin({
    dragstartDistanceThreshold: 10,
});
```

### dragstartTimeThreshold

该配置项用于配置拖放时间的检测阈值，单位为毫秒，只有 **大于** 该值才会判定通过。默认值为 0。

在该[示例](/zh/examples/plugins#dragndrop)中，我们配置了该选项为 100，即只有拖动超过 100 毫秒才会触发拖动事件：

```js
const plugin = new Plugin({
    dragstartTimeThreshold: 100,
});
```

### overlap

用以判断拖拽中的图形是否进入 `dropzone`，支持以下两个取值：

-   `'pointer'` 默认值。鼠标位置进入 `dropzone` 区域则通过判定
-   `'center'` 拖拽中图形包围盒中心进入 `dropzone` 区域则通过判定

### 修改配置项

除了在插件初始化时传入，还可以在后续任意时刻使用 `setOptions` 对以上配置项进行修改：

```js
plugin.setOptions({
    dragstartTimeThreshold: 200,
});
```

## 使用方式

通过配置图形支持 Drag（拖拽）、Drop（放置），我们可以监听相关的事件。Drag 和 Drop 相关的事件都是可冒泡的。

### Drag

注册插件完毕之后，为了让图形支持拖拽，需要设置 `draggable` 属性为 `true`。例如上面的足球：

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

此时就可以监听该图形的 drag 相关事件，包括以下三类事件，事件对象的 [target](/zh/api/event#target) 都是被拖拽的图形：

-   dragstart 在开始拖拽时触发 <https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragstart_event>
-   drag 在拖拽中频繁触发 <https://developer.mozilla.org/zh-CN/docs/Web/API/Document/drag_event>
-   dragend 在拖拽结束后触发 <https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragend_event>

drag 相关事件都是 [PointerEvents](/zh/api/event#交互事件)，因此可以在事件监听器中访问事件对象上的属性。

例如开始拖拽时，我们记录下鼠标位置到被拖拽元素位置的偏移量 `shiftX/Y`，两者都在[Canvas/世界坐标系](/zh/api/canvas/coordinates#canvas)下。在 `drag` 事件中我们调用 [setPosition](/zh/api/basic/display-object#平移) 完成被拖拽图形的平移。

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

同样，我们可以为支持放置的图形开启 `droppable`：

```js
const gate = new Image({
    style: {
        droppable: true, // 表示该图形支持放置
        x: 50,
        y: 100,
        width: 200,
        height: 100,
        src: 'https://en.js.cx/clipart/soccer-gate.svg',
    },
});
```

此时就可以监听放置区域的 drag/drop 相关事件，包括以下三类事件，事件对象的 [target](/zh/api/event#target) 都是放置区域的图形：

-   dragenter 有图形被拖入该区域 <https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragenter_event>
-   dragleave 有图形被拖离该区域 <https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragleave_event>
-   dragover 有图形正在划过该区域 <https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragover_event>
-   drop 有图形放置在该区域 <https://developer.mozilla.org/zh-CN/docs/Web/API/Document/drop_event>

例如我们让球门监听相关事件：

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

## 注意事项

### 事件触发顺序

`drag` 系列事件与其它交互事件存在先后触发的顺序问题，以 `pointer` 系列事件为例，在一个典型的拖拽过程中，会依次触发以下事件：

-   `pointerdown` 按下
-   `pointermove * n` 拖动一定距离后判定通过，进入拖拽流程
-   `dragstart` 开始拖拽
-   `drag` 拖拽中
-   `pointermove`
-   `drag` 拖拽中
-   `pointermove`
-   `drag` 拖拽中
-   `pointermove`
-   `dragend` 拖拽结束
-   `pointerup` 抬起

### 与 Click 事件的关系

在 HTML 的 Drag'n'drop 实现中，`click` 和 `drag` 事件同时只会触发一个：<https://plnkr.co/edit/5mdl7oTg0dPWXIip>

我们在实现中也保留了这一设定，在触发 `dragend` 事件之后不会再触发 `click`。
