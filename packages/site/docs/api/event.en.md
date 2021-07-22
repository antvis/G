---
title: Event
order: -3
---

事件系统能提供丰富的交互，在设计时我们遵循两个原则：
* 尽可能和 DOM API 保持一致，除了能降低学习成本，最重要的是能接入已有生态（例如手势库）。
* 仅提供标准事件。拖拽、手势等高级事件通过扩展方式定义。

熟悉 [DOM 事件流](https://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-flow-h2) 的开发者对以下概念肯定不陌生：
* 事件对象上有一个指向 EventTarget 的引用，在 DOM 中自然是 DOM 元素，在 G 中是 [DisplayObject](/zh/docs/api/basic/display-object)
* 事件流包含捕获和冒泡阶段，可以通过事件对象上的某些方法介入它们
* 可以为某个事件添加一个或多个监听器，它们按照注册顺序依次触发

目前我们支持以下[基础事件](/zh/docs/api/event#type)，尽可能兼容了 DOM 事件流，因此在下面的很多 API 介绍中我们都附上了 DOM Event API 对应的参考链接。

# 事件监听

## addEventListener

为图形添加事件监听器，可以完全参考 DOM Event API：https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener


```js
// 二者等价
button.addEventListener('click', () => {});
button.addEventListener('click', {
  handleEvent(e): {}
});
```

注册仅在捕获阶段执行的监听器：
```js
circle.addEventListener('click', () => {}, { capture: true });
circle.addEventListener('click', () => {}, true);
```

注册仅执行一次的监听器：
```js
circle.addEventListener('click', () => {}, { once: true });
```

## removeEventListener

移除事件监听器
```js
circle.removeEventListener('click', handler);
```

# 事件对象

在事件监听器的回调函数中，我们可以取得事件对象并访问其上的属性和方法。这些属性和方法和 DOM Event API 保持一致，因此可以直接参考它们的文档。

我们会将原生事件规范化到 [PointerEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/PointerEvent) 事件对象后统一处理，可以在 [nativeEvent](/zh/docs/api/event#nativeevent) 上访问原生事件。

## 属性
事件对象上常用的属性包括事件类型、当前触发事件的图形、位置等。

### pointerType

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType

* pointer
* mouse
* touch

### type

事件类型，目前支持如下事件：

Pointer 系列：
* pointerdown
* pointerup
* pointerupoutside
* pointertap
* pointerover
* pointerenter
* pointerleave
* pointerout

Mouse 系列：
* mousedown
* rightdown
* mouseup
* mouseupoutside
* click
* mousemove
* mouseover
* mouseout
* mouseenter
* mouseleave
* wheel

Touch 系列：
* touchstart
* touchend
* touchendoutside
* touchmove
* tap

### target

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/target

当前触发事件的 [DisplayObject](/zh/docs/api/basic/display-object)。

在实现事件委托时很有用，例如有这样一个场景，类似 DOM 中的 `ul/li`：
```
Group(ul)
    - Rect(li)
    - Rect(li)
```

我们可以在 `ul` 上监听事件，当点击每一个 `li` 时都会触发：
```js
const ul = new Group();
const li1 = new Rect();
const li2 = new Rect();
ul.appendChild(li1);
ul.appendChild(li2);

ul.addEventListener('click', (e) => {
  e.target; // li1 或者 li2
  e.currentTarget; // ul
}, false);
```

[示例](/zh/examples/event/shape#delegate)

### currentTarget

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/currentTarget

总是指向事件绑定的元素。

### nativeEvent

原生事件对象。

### clientX/Y

<tag color="green" text="MouseEvent">MouseEvent</tag>

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/clientX

相对于 Canvas 的坐标，左上角为 `(0, 0)`

### screenX/Y

<tag color="green" text="MouseEvent">MouseEvent</tag>

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/screenX

鼠标在全局（屏幕）中的水平/垂直坐标（偏移量），屏幕左上角为 `(0, 0)`。

### pageX/Y

<tag color="green" text="MouseEvent">MouseEvent</tag>

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/pageX

相对于整个文档的水平/垂直坐标，考虑页面滚动。

### movementX/Y

<tag color="green" text="MouseEvent">MouseEvent</tag>

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/movementX

当前事件和上一个 `mousemove` 事件之间鼠标在水平方向上的移动值。
换句话说，这个值是这样计算的: `currentEvent.movementX = currentEvent.screenX - previousEvent.screenX`

### deltaX/Y/Z

<tag color="blue" text="WheelEvent">WheelEvent</tag>

https://developer.mozilla.org/zh-CN/docs/Web/API/WheelEvent

滚轮的横向/纵向/Z轴的滚动量。

## 方法
事件对象上的某些方法可以控制事件传播时的行为，例如阻止冒泡等。

### stopImmediatePropagation
阻止监听同一事件的其他事件监听器被调用，同时阻止冒泡。

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopImmediatePropagation

例如在图形上绑定了多个 click 监听器：
```js
// group -> circle

circle.on('click', () => {
  // 正常执行
}, false);

circle.on('click', (e) => {
  // 正常执行
  e.stopImmediatePropagation();
}, false);

circle.on('click', () => {
  // 之后注册的监听器，不会执行
}, false);

group.on('click', () => {
  // 由于阻止了向上冒泡，同样不会执行
}, false);
```

### stopPropagation

阻止捕获和冒泡阶段中当前事件的进一步传播。

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopPropagation

与 `stopImmediatePropagation` 的区别是并不会阻止监听同一事件的其他事件监听器被调用。

### preventDefault

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/preventDefault

阻止浏览器默认行为。

### composedPath

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/composedPath

返回事件路径，即一组 `DisplayObject`，类似旧版 G 中的 `propagationPath`。`target` 为数组的第一个元素。

仍然以类似 DOM `ul/li` 场景为例：
```
Group(ul)
    - Rect(li)
    - Rect(li)
```

在 `ul` 上监听事件，当点击每一个 `li` 时都会触发：
```js
const ul = new Group();
const li1 = new Rect();
const li2 = new Rect();
ul.appendChild(li1);
ul.appendChild(li2);

ul.addEventListener('click', (e) => {
  const path = e.composedPath(); // [li1, ul];
}, false);
```

[示例](/zh/examples/event/shape#delegate)

# 手势和拖拽

当我们想实现除基础事件之外的某些“高级事件”时，例如常见的手势和拖拽，可以通过组合这些基础事件实现。得益于场景图对于 DOM API 的兼容，我们也可以直接使用已有生态，让这些库以为仍然在操作 DOM。

## 直接使用 Hammer.js

以 [Hammer.js](https://github.com/hammerjs/hammer.js) 这样的手势库为例，我们可以直接把 `DisplayObject` 传入：
```js
import Hammer from 'hammerjs';

const hammer = new Hammer(circle);
hammer.on('press', (e) => {
  console.log('You\'re pressing me!');
  console.log(e.target); // circle
});
```

[示例](/zh/examples/event/shape#hammer)

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*i7SaRaYw0YcAAAAAAAAAAAAAARQnAQ)

## 直接使用 Interact.js

[Interact.js](https://interactjs.io/) 是一个包含了 Drag&Drop，Resize，手势等功能的交互库。

以拖拽为例：
```js
import interact from 'interactjs';

interact(
  circle, // 待拖拽对象
  {
    context: canvas.document, // 将画布 document 传入
  })
  .draggable({
    startAxis: 'xy', // 允许水平垂直两个方向的拖拽
    lockAxis: 'start', // 锁定拖拽方向为初始设定
    onmove: function (event) {
      const { dx, dy } = event; // interact.js 将 dx/dy 挂载在事件对象上
      circle.translateLocal(dx, dy); // 移动该对象
    }
  });
```

[示例](/zh/examples/event/shape#interact)

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*9YqIQo56RasAAAAAAAAAAAAAARQnAQ)

## 实现简单的拖拽

除了使用以上现成的库，我们还可以通过组合监听 `mousedown/up/move/ouside` 实现简单的拖拽效果：
```js
let dragging = false; // 拖拽状态
let lastPosition; // 保存上次位置
const onDragStart = (event) => {
  dragging = true;
  circle.attr('opacity', 0.5);
  lastPosition = [event.x, event.y];
  text.attr('text', 'Drag me');
};
const onDragEnd = () => {
  dragging = false;
  circle.attr('opacity', 1);
  text.attr('text', 'Drag me');
};
const onDragMove = (event) => {
  if (dragging) {
    circle.attr('opacity', 0.5);
    text.attr('text', 'Dragging...');

    const offset = [event.x - lastPosition[0], event.y - lastPosition[1]];
    const position = circle.getPosition();
    circle.setPosition(position[0] + offset[0], position[1] + offset[1]);
    lastPosition = [event.x, event.y];
  }
};

circle
  // events for drag start
  .on('mousedown', onDragStart)
  .on('touchstart', onDragStart)
  // events for drag end
  .on('mouseup', onDragEnd)
  .on('mouseupoutside', onDragEnd)
  .on('touchend', onDragEnd)
  .on('touchendoutside', onDragEnd)
  // events for drag move
  .on('mousemove', onDragMove)
  .on('touchmove', onDragMove);
```

[示例](/zh/examples/event/shape#drag)

# 与其他插件的交互

## 事件绑定/解绑插件

前面提到过，事件绑定不在核心事件系统中完成，应当交给对应渲染环境插件。
例如使用 DOM API 绑定/解绑的 [g-plugin-dom-interaction](/zh/docs/plugins/dom-interaction)，其他环境例如小程序应当自行编写插件。

在这一类插件中，我们需要在 `init` 中完成绑定，在 `destroy` 中完成解绑。
在实现绑定时，需要将该渲染环境下的多个（如有）原生事件映射到 G 的标准事件处理器上。
```js
// g-plugin-dom-interaction

const onPointerDown = (ev: InteractivePointerEvent) => {
  renderingService.hooks.pointerDown.call(ev);
};

renderingService.hooks.init.tap(DOMInteractionPlugin.tag, () => {
  // 事件绑定，使用 DOM API
  $el.addEventListener(
    'pointerdown', // 原生事件
    onPointerDown, // G 标准事件处理器
    true
  );
  
  // 如果需要支持移动端
  if (supportsTouchEvents) {
    $el.addEventListener('touchstart', onPointerDown, true);
  }
  // 省略其他
});

renderingService.hooks.destroy.tap(DOMInteractionPlugin.tag, () => {
  // 事件解绑
});
```

## 拾取插件

不同渲染环境使用不同的拾取插件，用于判定原生事件的 EventTarget：
* [g-plugin-canvas-picker](/zh/docs/plugins/canvas-picker) 主要使用数学运算
* [g-plugin-svg-picker](/zh/docs/plugins/svg-picker) 使用现成 SVG API
* [g-plugin-webgl-renderer](/zh/docs/plugins/webgl-renderer) 使用 GPU 颜色编码

## A11y 无障碍插件

# 注意事项

## mouseenter 冒泡

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/mouseenter_event

mouseenter 不会冒泡，而 mouseover 会。同理 mouseleave 不会冒泡，而 mouseout 会。