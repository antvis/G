---
title: 简介
order: -3
---

事件系统能提供丰富的交互，在设计时我们遵循两个原则：

-   尽可能和 DOM API 保持一致，除了能降低学习成本，最重要的是能接入已有生态（例如手势库）。
-   仅提供标准事件。拖拽、手势等高级事件通过扩展方式定义。

熟悉 [DOM 事件流](https://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-flow-h2) 的开发者对以下概念肯定不陌生：

-   事件对象上有一个指向 EventTarget 的引用，在 DOM 中自然是 DOM 元素，在 G 中是 [EventTarget](/zh/api/builtin-objects/event-target)
-   事件流包含捕获和冒泡阶段，可以通过事件对象上的某些方法介入它们
-   可以为某个事件添加一个或多个监听器，它们按照注册顺序依次触发

下图展示了事件传播的三个阶段，在捕获阶段自顶向下依次触发监听器，到达目标节点后向上冒泡。在监听器中可以通过 [eventPhase](/zh/api/event#eventphase) 获取当前所处的阶段。下图来自 https://javascript.info/bubbling-and-capturing#capturing

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*zJBbSL2D5mkAAAAAAAAAAAAAARQnAQ" width="500" alt="event capture">

目前我们支持以下[基础事件](/zh/api/event#type)，尽可能兼容了 DOM 事件流，因此在下面的很多 API 介绍中我们都附上了 DOM Event API 对应的参考链接。

例如我们想给这个圆形增加简单的鼠标移入/移出的交互效果，[示例](/zh/examples/event#shapes)

```js
circle.addEventListener('mouseenter', () => {
    circle.attr('fill', '#2FC25B');
});
circle.addEventListener('mouseleave', () => {
    circle.attr('fill', '#1890FF');
});
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*D7xLQp4L4VoAAAAAAAAAAAAAARQnAQ" width="300" alt="interactive event">

## 可监听事件

目前我们支持对于以下两类事件的监听：交互事件和场景图事件。前者和 DOM Event API 中提供的大部分鼠标、触屏事件相同，后者则是基于场景图在节点添加、删除、属性变换时触发。

### 交互事件

浏览器对于交互事件的支持历经了以下阶段，详见：https://javascript.info/pointer-events#the-brief-history

-   最早支持的是 [MouseEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent)
-   随着移动设备普及，[TouchEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/TouchEvent) 出现，同时也触发 [MouseEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent)
-   再后来新的设备又出现了，比如 pen，这样一来各种事件结构各异，使用起来非常痛苦（例如 hammer.js 为了[兼容性的处理](https://github.com/hammerjs/hammer.js/tree/master/src/input)）
-   新的标准被提出，[PointerEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/PointerEvent) 希望涵盖以上所有输入设备

下图来自：https://w3c.github.io/pointerevents/

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*FtyaTL5gzv4AAAAAAAAAAAAAARQnAQ" width="200" alt="pointer event">

于是如今 Level 2 的 PointerEvent 已经被所有主流浏览器支持：https://www.w3.org/TR/pointerevents2/

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Doz_TbygcIIAAAAAAAAAAAAAARQnAQ" width="100%" alt="can i use pointer event">

新的运行环境也都使用 PointerEvent 这样的统一定义，不再有 Touch / Mouse / PenEvent，例如：

-   Flutter：https://api.flutter.dev/flutter/gestures/PointerEvent-class.html
-   Kraken：https://zhuanlan.zhihu.com/p/371640453

因此我们推荐直接使用 PointerEvent。多指触控的手势也完全可以实现，例如：

-   Pinch 的实现：https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures

目前支持监听如下交互事件：

Pointer 系列：

-   pointerdown
-   pointerup
-   pointerupoutside
-   pointertap
-   pointerover
-   pointerenter
-   pointerleave
-   pointerout

Mouse 系列：

-   mousedown 鼠标左键按下
-   rightdown 鼠标右键按下
-   mouseup 鼠标左键抬起
-   rightup 鼠标右键抬起
-   mouseupoutside 鼠标左键抬起时与按下时图形不同
-   rightupoutside 鼠标右键抬起与按下时图形不同
-   click 单击 & 双击 [如何区分?](/zh/api/event#鼠标双击事件)
-   mousemove 鼠标持续在该图形上移动
-   mouseover 鼠标从该图形上移入，会冒泡
-   mouseout 鼠标从该图形上移出，会冒泡
-   mouseenter 鼠标从该图形上移入，不会冒泡
-   mouseleave 鼠标从该图形上移出，不会冒泡
-   wheel 滚轮

Touch 系列：

-   touchstart
-   touchend
-   touchendoutside
-   touchmove
-   touchcancel

### 场景图事件

除了交互事件，我们还可以监听一些场景图相关的事件，例如在画布上监听每一个节点的首次加载（g-svg 会在此时创建当前图形相关的 DOM），[示例](/zh/examples/event#builtin)

```js
import { ElementEvent } from '@antv/g';

canvas.addEventListener(ElementEvent.MOUNTED, (e) => {
    e.target;
});
```

目前我们支持如下场景图相关事件：

-   CHILD_INSERTED 作为父节点有子节点添加时触发
-   INSERTED 作为子节点被添加时触发
-   CHILD_REMOVED 作为父节点有子节点移除时触发
-   REMOVED 作为子节点被移除时触发
-   MOUNTED 首次进入画布时触发
-   UNMOUNTED 从画布中移除时触发
-   ATTR_MODIFIED 修改属性时触发
-   DESTROY 销毁时触发

在下面的例子中，画布监听 INSERTED REMOVED MOUNTED 和 UNMOUNTED 事件。在加入、移除场景图时，以下事件会依次触发：

```js
canvas.addEventListener(ElementEvent.INSERTED, (e) => {
    console.log(ElementEvent.INSERTED, e.target);
});
// 省略其他事件监听器

parent.appendChild(child); // 构建父子关系
canvas.appendChild(parent); // 加入场景图
canvas.removeChild(parent, false); // 从场景图中移除，但不销毁

// MOUNTED parent 父节点载入
// MOUNTED child 子节点载入
// INSERTED parent 父节点加入场景图
// REMOVED parent 父节点被移除场景图
// UNMOUNTED child 子节点卸载
// UNMOUNTED parent 父节点卸载
```

## 事件监听

### addEventListener

为图形添加事件监听器，可以完全参考 DOM Event API：https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener

方法签名：

```js
target.addEventListener(type, listener, options);
target.addEventListener(type, listener, useCapture);
```

其中参数为：

-   type 事件名称，[内置标准事件](/zh/api/event#type) 或[自定义事件名]()
-   listener 事件监听器，支持以下两种写法：
    -   处理函数 `Function`
    -   [EventListener](https://developer.mozilla.org/zh-CN/docs/Web/API/EventListener/handleEvent) 对象，形如 `{ handleEvent: Function }`
-   options `可选`
    -   capture `boolean`，表示 listener 会在该类型的事件捕获阶段传播到该 EventTarget 时触发。
    -   once `boolean`，表示 listener 在添加之后最多只调用一次。如果是 `true`， listener 会在其被调用之后自动移除。
-   useCapture `可选` `boolean` 默认为 `false`。如果是 `true`，向上冒泡的事件不会触发 listener。

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

为了兼容旧版 G API，也支持使用 `on`，因此以下写法等价：

```js
circle.addEventListener('mouseenter', () => {});
circle.on('mouseenter', () => {});
```

关于监听器内 this 的指向问题可以参考[该小节](/zh/api/event#事件监听器内-this-指向问题)。

### removeEventListener

移除事件监听器

```js
circle.removeEventListener('click', handler);
```

为了兼容旧版 G API，也支持使用 `off`，因此以下写法等价：

```js
circle.removeEventListener('mouseenter', () => {});
circle.off('mouseenter', () => {});
```

### removeAllEventListeners

移除所有事件监听器。

为了兼容旧版 G API，也支持使用 `off`，因此以下写法等价：

```js
circle.removeAllEventListeners();
circle.off();
```

### dispatchEvent

手动触发事件，和交互触发的事件一样会经历完整的事件传播流程。

https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent

⚠️ 在一个图形上手动触发事件前，必须保证该元素已经添加到画布上

#### 自定义事件

除了内置标准事件，有时我们也需要触发一些自定义事件，参考 [Web CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)，我们也支持如下写法，[示例](/zh/examples/event#custom)：

```js
import { CustomEvent } from '@antv/g';

const event = new CustomEvent('build', { detail: { prop1: 'xx' } });
circle.addEventListener('build', (e) => {
    e.target; // circle
    e.detail; // { prop1: 'xx' }
});

circle.dispatchEvent(event);
```

其中 CustomEvent 构造函数参数如下：

-   eventName 事件名 `string` `必填`
-   eventObject 事件对象 `选填` 包含以下属性：
    -   detail 自定义数据 `any`

为了兼容旧版 G API，也支持使用 `emit`：

```js
circle.on('build', (e) => {
    e.target; // circle
    e.detail; // { prop1: 'xx' }
});
circle.emit('build', { prop1: 'xx' });
```
