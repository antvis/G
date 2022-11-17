---
title: 手势和拖放
order: 99
---

当我们想实现除基础事件之外的某些“高级事件”时，例如常见的手势和拖拽，可以通过组合这些基础事件实现。得益于场景图对于 DOM API 的兼容，我们也可以直接使用已有生态，让这些库以为仍然在操作 DOM。

## 直接使用 Hammer.js

以 [Hammer.js](https://github.com/hammerjs/hammer.js) 这样的手势库为例，由于完全兼容 DOM API，我们可以直接把 `DisplayObject` 传入。另外需要通过 [inputClass](https://hammerjs.github.io/jsdoc/Hammer.defaults.html#.inputClass) 告知 Hammer.js 我们的输入事件为 PointerEvent，无需考虑例如 TouchEvent 等交互事件，[示例](/zh/examples/event#hammer)：

```js
import Hammer from 'hammerjs';

const hammer = new Hammer(circle, {
    inputClass: Hammer.PointerEventInput, // 告知 Hammer.js 我们的输入事件为 PointerEvent
});
hammer.on('press', (e) => {
    console.log("You're pressing me!");
    console.log(e.target); // circle
});
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*i7SaRaYw0YcAAAAAAAAAAAAAARQnAQ" width="400">

## 使用 PointerEvents 实现 Pinch 手势

在该[示例](/zh/examples/event#pinch-with-pointer)中实现了 Pinch 手势，参考 https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*MkM3TYXZsHsAAAAAAAAAAAAAARQnAQ" width="300">

核心思路是无需关心 Mouse/TouchEvent，通过监听 PointerEvents 根据事件对象上的 [pointerId](/zh/api/event#pointerid) 跟踪管理屏幕上的触控点。

## 直接使用 Interact.js

[Interact.js](https://interactjs.io/) 是一个包含了 Drag&Drop，Resize，手势等功能的交互库。

以拖拽为例：

```js
import interact from 'interactjs';

interact(
    circle, // 待拖拽对象
    {
        context: canvas.document, // 将画布 document 传入
    },
).draggable({
    startAxis: 'xy', // 允许水平垂直两个方向的拖拽
    lockAxis: 'start', // 锁定拖拽方向为初始设定
    onmove: function (event) {
        const { dx, dy } = event; // interact.js 将 dx/dy 挂载在事件对象上
        circle.translateLocal(dx, dy); // 移动该对象
    },
});
```

[示例](/zh/examples/event#interact)

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*9YqIQo56RasAAAAAAAAAAAAAARQnAQ" width="400">

## 使用 g-plugin-dragndrop

如果觉得 interact.js 太重，可以选择使用我们提供的简单拖放插件：[g-plugin-dragndrop](/zh/plugins/dragndrop)。

该插件完全基于 [PointerEvents](/zh/api/event#交互事件) 实现拖放功能。在该[示例](/zh/examples/plugins#dragndrop)中，我们监听了足球的 drag 事件，用以移动它到正确的位置，同时监听了球门的 dragover 事件，当足球划过球门区域时改变透明度：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*A14uTY9_5UEAAAAAAAAAAAAAARQnAQ" alt="dragndrop">

## 实现简单的拖拽

除了使用以上现成的库，我们还可以通过组合监听 PointerEvents 实现简单的拖拽效果，[g-plugin-dragndrop](/zh/plugins/dragndrop) 内部就是这么实现的，参考了 [Drag'n'Drop with mouse events](https://javascript.info/mouse-drag-and-drop)：

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

[示例](/zh/examples/event#drag)
