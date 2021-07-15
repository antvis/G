---
title: Event
order: -3
---

事件系统能提供丰富的交互，在设计时我们遵循两个原则：
* 尽可能和 DOM API 保持一致，除了能降低学习成本，最重要的是能接入已有生态（例如手势库）。
* 仅提供标准事件。拖拽、手势等高级事件通过扩展方式定义。

目前我们支持以下[基础事件](/zh/docs/api/event#type)。

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

## dispatchEvent

在图形上显式触发事件：
```js
const circle = new Circle();

circle.dispatchEvent(new PointerEvent('click', {
  pointerType: 'mouse',
  clientX: 1,
  clientY: 1,
  isPrimary: true,
}));
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

返回事件路径，即一组 `DisplayObject`，类似旧版 G 中的 `propagationPath`。`target` 在数组的末尾。

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