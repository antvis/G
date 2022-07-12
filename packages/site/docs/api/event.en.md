---
title: 事件
order: -3
---

事件系统能提供丰富的交互，在设计时我们遵循两个原则：

-   尽可能和 DOM API 保持一致，除了能降低学习成本，最重要的是能接入已有生态（例如手势库）。
-   仅提供标准事件。拖拽、手势等高级事件通过扩展方式定义。

熟悉 [DOM 事件流](https://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-flow-h2) 的开发者对以下概念肯定不陌生：

-   事件对象上有一个指向 EventTarget 的引用，在 DOM 中自然是 DOM 元素，在 G 中是 [EventTarget](/zh/docs/api/builtin-objects/event-target)
-   事件流包含捕获和冒泡阶段，可以通过事件对象上的某些方法介入它们
-   可以为某个事件添加一个或多个监听器，它们按照注册顺序依次触发

下图展示了事件传播的三个阶段，在捕获阶段自顶向下依次触发监听器，到达目标节点后向上冒泡。在监听器中可以通过 [eventPhase](/zh/docs/api/event#eventphase) 获取当前所处的阶段。下图来自 https://javascript.info/bubbling-and-capturing#capturing

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*zJBbSL2D5mkAAAAAAAAAAAAAARQnAQ" width="500" alt="event capture">

目前我们支持以下[基础事件](/zh/docs/api/event#type)，尽可能兼容了 DOM 事件流，因此在下面的很多 API 介绍中我们都附上了 DOM Event API 对应的参考链接。

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

# 可监听事件

目前我们支持对于以下两类事件的监听：交互事件和场景图事件。前者和 DOM Event API 中提供的大部分鼠标、触屏事件相同，后者则是基于场景图在节点添加、删除、属性变换时触发。

## 交互事件

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
-   click 单击 & 双击 [如何区分?](/zh/docs/api/event#鼠标双击事件)
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

## 场景图事件

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

# 事件监听

## addEventListener

为图形添加事件监听器，可以完全参考 DOM Event API：https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener

方法签名：

```js
target.addEventListener(type, listener, options);
target.addEventListener(type, listener, useCapture);
```

其中参数为：

-   type 事件名称，[内置标准事件](/zh/docs/api/event#type) 或[自定义事件名]()
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

关于监听器内 this 的指向问题可以参考[该小节](/zh/docs/api/event#事件监听器内-this-指向问题)。

## removeEventListener

移除事件监听器

```js
circle.removeEventListener('click', handler);
```

为了兼容旧版 G API，也支持使用 `off`，因此以下写法等价：

```js
circle.removeEventListener('mouseenter', () => {});
circle.off('mouseenter', () => {});
```

## removeAllEventListeners

移除所有事件监听器。

为了兼容旧版 G API，也支持使用 `off`，因此以下写法等价：

```js
circle.removeAllEventListeners();
circle.off();
```

## dispatchEvent

手动触发事件，和交互触发的事件一样会经历完整的事件传播流程。

https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent

⚠️ 在一个图形上手动触发事件前，必须保证该元素已经添加到画布上

### 自定义事件

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

# 事件对象

在事件监听器的回调函数中，我们可以取得事件对象并访问其上的属性和方法。这些属性和方法和 DOM Event API 保持一致，因此可以直接参考它们的文档。

我们会尽量将原生事件规范化到 [PointerEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/PointerEvent) 事件对象后统一处理，可以在 [nativeEvent](/zh/docs/api/event#nativeevent) 上访问原生事件。

对于特殊的 [TouchEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/TouchEvent)，由于多个触控点的存在，一些重要的属性例如 [target]() [canvasX/Y]() 都存储在 [Touch]() 对象上，可以通过 [changedTouches](https://developer.mozilla.org/zh-CN/docs/Web/API/TouchEvent/changedTouches)，[touches](https://developer.mozilla.org/zh-CN/docs/Web/API/TouchEvent/touches) 访问触点列表。

## 通用属性

事件对象上常用的属性包括事件类型、当前触发事件的图形、位置等，其中位置和[坐标系](/zh/docs/api/canvas#坐标系)相关。

### type

事件类型：

-   pointerup
-   pointerdown
-   pointerupoutside
-   pointermove
-   pointercancel

https://developer.mozilla.org/en-US/docs/Web/API/Event/type

### nativeEvent

原生事件对象。当我们调用 [preventDefault](/zh/docs/api/event#preventdefault) 方法时，会调用原生事件对象上的同名方法。

### view

指向 [Canvas](/zh/docs/api/canvas)。

https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/view

### altKey

事件触发时是否伴随 `alt` 的按下。

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/altKey

### metaKey

事件触发时是否伴随 `meta` 的按下。

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/metaKey

### ctrlKey

事件触发时是否伴随 `ctrl` 的按下。

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/ctrlKey

### shiftKey

事件触发时是否伴随 `shift` 的按下。

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/shiftKey

### timeStamp

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/timeStamp

事件创建时的时间戳

### eventPhase

当前所处的事件阶段。有以下三个枚举值：

```
CAPTURING_PHASE = 1;
AT_TARGET = 2;
BUBBLING_PHASE = 3;
```

例如配合 `capture` 配置项，仅在捕获阶段处理事件：

```js
circle.addEventListener(
    'click',
    (e: FederatedEvent) => {
        console.log(e.eventPhase); // e.CAPTURING_PHASE
    },
    { capture: true },
);
```

### detail

事件对象携带的数据对象。例如在触发 click 时，会带上点击次数。

https://developer.mozilla.org/zh-CN/docs/Web/API/CustomEvent/detail

### target

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/target

当前触发事件的 [EventTarget](/zh/docs/api/builtin-objects/event-target)。

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

ul.addEventListener(
    'click',
    (e) => {
        e.target; // li1 或者 li2
        e.currentTarget; // ul
    },
    false,
);
```

[示例](/zh/examples/event#delegate)

### currentTarget

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/currentTarget

总是指向事件绑定的元素。

```js
ul.addEventListener(
    'click',
    (e) => {
        e.currentTarget; // ul
    },
    false,
);
```

### canvasX/Y

在 [Canvas 坐标系/世界坐标系](/zh/docs/api/canvas#canvas)下，以画布 DOM 元素的左上角为原点，X 轴正向指向屏幕右侧，Y 轴正向指向屏幕下方。可以与 [viewportX/Y](/zh/docs/api/event#viewportxy) 互相转换，[详见](/zh/docs/api/canvas#canvas---viewport)：

```js
canvas.canvas2Viewport({ x: e.canvasX, y: e.canvasY }); // Point { x: 100, y: 100 }
canvas.viewport2Canvas({ x: e.viewportX, y: e.viewportY }); // Point { x: 0, y: 0 }
```

别名为 x/y，因此以下写法等价：

```js
e.canvasX;
e.x;

e.canvasY;
e.y;
```

### viewportX/Y

在 [Viewport 坐标系](/zh/docs/api/canvas#viewport)下，考虑相机变换。

可以与 [canvasX/Y](/zh/docs/api/event#canvasxy) 互相转换，[详见](/zh/docs/api/canvas#canvas---viewport)：

```js
canvas.canvas2Viewport({ x: e.canvasX, y: e.canvasY }); // Point { x: 100, y: 100 }
canvas.viewport2Canvas({ x: e.viewportX, y: e.viewportY }); // Point { x: 0, y: 0 }
```

可以与 [clientX/Y](/zh/docs/api/event#clientxy) 互相转换，[详见](/zh/docs/api/canvas#client---viewport)：

```js
canvas.viewport2Client({ x: 0, y: 0 }); // Point { x: 100, y: 100 }
canvas.client2Viewport({ x: 100, y: 100 }); // Point { x: 0, y: 0 }
```

### clientX/Y

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/clientX

在[浏览器坐标系](/zh/docs/api/canvas#client)下，左上角为 `(0, 0)`。G 不会修改原生事件上的该属性，因此两者完全相同：

```js
e.clientX;
e.nativeEvent.clientX;
```

可以与 [viewportX/Y](/zh/docs/api/event#viewportxy) 互相转换，[详见](/zh/docs/api/canvas#client---viewport)：

```js
canvas.viewport2Client({ x: 0, y: 0 }); // Point { x: 100, y: 100 }
canvas.client2Viewport({ x: 100, y: 100 }); // Point { x: 0, y: 0 }
```

### screenX/Y

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/screenX

在[屏幕坐标系](/zh/docs/api/canvas#screen)下，不考虑页面滚动。G 不会修改原生事件上的该属性，因此两者完全相同：

```js
e.screenX;
e.nativeEvent.screenX;
```

### pageX/Y

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/pageX

在[文档坐标系](/zh/docs/api/canvas#page)下，考虑页面滚动。G 不会修改原生事件上的该属性，因此两者完全相同：

```js
e.pageX;
e.nativeEvent.pageX;
```

### movementX/Y

https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/movementX

当前事件和上一个 `mousemove` 事件之间鼠标在水平方向上的移动值。换句话说，这个值是这样计算的: `currentEvent.movementX = currentEvent.screenX - previousEvent.screenX`

## PointerEvent 属性

### pointerType

返回事件的设备类型，返回值如下：

-   pointer 代表 [PointerEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/PointerEvent)
-   mouse 代表 [MouseEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent)
-   touch 代表 [TouchEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/TouchEvent)

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType

### pointerId

返回一个可以唯一地识别和触摸平面接触的点的值。这个值在这根手指（或触摸笔等）所引发的所有事件中保持一致，直到它离开触摸平面。

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerId

### isPrimary

是否是 primary pointer。在多指触控场景下，代表当前事件由主触点产生。

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/isPrimary

### button

标识鼠标事件哪个按键被点击。0 为左键，1 为右键。

https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button

### buttons

https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons

### width

接触面积宽度。如果原生事件为 MouseEvent，返回 1。

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/width

### height

接触面积高度。如果原生事件为 MouseEvent，返回 1。

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/height

### tiltX

触点与屏幕在 Y-Z 平面上的角度。如果原生事件为 MouseEvent 返回固定值 `0`。

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltX

### tiltY

触点与屏幕在 X-Z 平面上的角度。如果原生事件为 MouseEvent 返回固定值 `0`。

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltY

### pressure

返回对应的手指挤压触摸平面的压力大小，从 `0.0` (没有压力)到 `1.0` (最大压力)的浮点数。如果原生事件为 MouseEvent 返回固定值 `0.5`。

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure

### tangentialPressure

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tangentialPressure

### twist

顺时针旋转角度。如果原生事件为 MouseEvent 返回固定值 `0`。

https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/twist

## WheelEvent 属性

在鼠标滚轮事件中，可以获取滚动量。

### deltaX/Y/Z

<tag color="blue" text="WheelEvent">WheelEvent</tag>

https://developer.mozilla.org/zh-CN/docs/Web/API/WheelEvent

滚轮的横向/纵向/Z 轴的滚动量。

## 方法

事件对象上的某些方法可以控制事件传播时的行为，例如阻止冒泡等。

### stopImmediatePropagation

阻止监听同一事件的其他事件监听器被调用，同时阻止冒泡。

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopImmediatePropagation

例如在图形上绑定了多个 click 监听器：

```js
// group -> circle

circle.on(
    'click',
    () => {
        // 正常执行
    },
    false,
);

circle.on(
    'click',
    (e) => {
        // 正常执行
        e.stopImmediatePropagation();
    },
    false,
);

circle.on(
    'click',
    () => {
        // 之后注册的监听器，不会执行
    },
    false,
);

group.on(
    'click',
    () => {
        // 由于阻止了向上冒泡，同样不会执行
    },
    false,
);
```

### stopPropagation

阻止捕获和冒泡阶段中当前事件的进一步传播。

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopPropagation

与 `stopImmediatePropagation` 的区别是并不会阻止监听同一事件的其他事件监听器被调用。

### preventDefault

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/preventDefault

阻止浏览器默认行为。对于 Passive 事件调用该方法无效，并且会抛出警告。

关于 wheel 事件的解决方案可以参考：[在 Chrome 中禁止页面默认滚动行为](/zh/docs/api/event#在-chrome-中禁止页面默认滚动行为)。

### composedPath

https://developer.mozilla.org/zh-CN/docs/Web/API/Event/composedPath

返回事件路径，是包含 [EventTarget](/zh/docs/api/builtin-objects/event-target) 的数组，类似旧版 G 中的 `propagationPath`。在这个数组中，`event.target` 为数组的第一个元素，[场景图根节点](/zh/docs/api/canvas#入口与根节点)、[Document](/zh/docs/api/canvas#入口与根节点) 和 [Canvas](/zh/docs/api/canvas) 为数组末尾的三个元素。

仍然以类似 DOM `ul/li` 场景为例：

```
Group(ul)
    - Rect(li)
    - Rect(li)
```

在 `ul` 上监听事件，当点击每一个 `li` 时都会触发，事件传播路径为 `[li1, ul, Group, Document, Canvas]`：

```js
const ul = new Group();
const li1 = new Rect();
const li2 = new Rect();
ul.appendChild(li1);
ul.appendChild(li2);

ul.addEventListener(
    'click',
    (e) => {
        const path = e.composedPath(); // [li1, ul, Group, Document, Canvas];
    },
    false,
);
```

[示例](/zh/examples/event#delegate)

# 手势和拖拽

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

核心思路是无需关心 Mouse/TouchEvent，通过监听 PointerEvents 根据事件对象上的 [pointerId](/zh/docs/api/event#pointerid) 跟踪管理屏幕上的触控点。

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

如果觉得 interact.js 太重，可以选择使用我们提供的简单拖放插件：[g-plugin-dragndrop](/zh/docs/plugins/dragndrop)。

该插件完全基于 [PointerEvents](/zh/docs/api/event#交互事件) 实现拖放功能。在该[示例](/zh/examples/plugins#dragndrop)中，我们监听了足球的 drag 事件，用以移动它到正确的位置，同时监听了球门的 dragover 事件，当足球划过球门区域时改变透明度：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*A14uTY9_5UEAAAAAAAAAAAAAARQnAQ" alt="dragndrop">

## 实现简单的拖拽

除了使用以上现成的库，我们还可以通过组合监听 PointerEvents 实现简单的拖拽效果，[g-plugin-dragndrop](/zh/docs/plugins/dragndrop) 内部就是这么实现的，参考了 [Drag'n'Drop with mouse events](https://javascript.info/mouse-drag-and-drop)：

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

# 与其他插件的交互

## 事件绑定/解绑插件

前面提到过，事件绑定不在核心事件系统中完成，应当交给对应渲染环境插件。例如使用 DOM API 绑定/解绑的 [g-plugin-dom-interaction](/zh/docs/plugins/dom-interaction)，其他环境例如小程序应当自行编写插件。

在这一类插件中，我们需要在 `init` 中完成绑定，在 `destroy` 中完成解绑。在实现绑定时，需要将该渲染环境下的多个（如有）原生事件映射到 G 的标准事件处理器上。

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
        true,
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

-   [g-plugin-canvas-picker](/zh/docs/plugins/canvas-picker) 主要使用数学运算
-   [g-plugin-svg-picker](/zh/docs/plugins/svg-picker) 使用现成 SVG API
-   [g-plugin-device-renderer](/zh/docs/plugins/device-renderer) 使用 GPU 颜色编码

## A11y 无障碍插件

在 [g-plugin-a11y](/zh/docs/plugins/a11y) 中，我们监听了键盘事件用于导航。

# 注意事项

## 事件监听器内 this 指向问题

参考 https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#the_value_of_this_within_the_handler

在事件监听器内部 `this` 指向应该与 `e.currentTarget` 相同。但如果使用了箭头函数，将丢失上下文：

```js
circle.addEventListener('mouseenter', function (e) {
    console.log(this); // circle
    console.log(e.currentTarget === this); // true
});

circle.addEventListener('mouseleave', () => {
    console.log(this); // undefined
});
```

## mouseenter/leave 冒泡问题

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/mouseenter_event

mouseenter 不会冒泡，而 mouseover 会。同理 mouseleave 不会冒泡，而 mouseout 会。

## 拾取判定

事件系统只会响应 Canvas 画布范围之内的事件，例如监听了 mousemove 时，在画布之外的其他页面区域移动并不会触发该事件处理器。当拾取到画布空白区域（未命中任何可见图形）时，事件对象的 [target](/zh/docs/api/event#target) 属性会返回 [Document](/zh/docs/api/builtin-objects/document)：

```js
canvas.addEventListener('mousemove', (e) => {
    if (e.target.nodeName === 'document') {
        // 在空白区域移动
    }
});
```

## 事件触发顺序

一些内置事件有触发顺序，例如 click 事件会在 pointerdown 和 pointerup 触发之后。在这个过程中，有可能出现 pointerdown 和 pointerup 事件 target 不一致的情况。例如在一个图形上按下鼠标，移动到另一个图形上再抬起鼠标，此时我们会在这两个 target 共同的祖先节点上（例如场景图的根节点 [document.documentElement](/zh/docs/api/canvas#入口与根节点)）触发 click 事件。

可以在[这个例子](/zh/examples/event#delegate)中尝试。

## 在 Chrome 中禁止页面默认滚动行为

有时我们需要禁止掉页面默认的滚动行为，例如实现缩放类的需求时。禁用默认行为可以使用 [preventDefault](/zh/docs/api/event#preventdefault)，但以下代码在 Chrome 中执行并不会生效，页面依然可以滚动：

```
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
});
```

造成这个问题的原因是 G 在监听画布事件的 wheel 事件时，添加了 `passive: true` 这个配置项：

```js
// $el 为画布的 DOM 元素，g-canvas/webgl 为 <canvas>，g-svg 为 <svg>
$el.addEventListener('wheel', onPointerWheel, {
    passive: true,
    capture: true,
});
```

关于 Passive 事件处理器，可以参考知乎的这篇文章：https://zhuanlan.zhihu.com/p/24555031 。简而言之是通过这个选项可以提升浏览器的滚动流畅度，相当于提前告知浏览器“我不会阻止你的默认滚动行为”。

现在回到我们的问题，如果用户确实需要禁止默认滚动行为，可以在画布的 DOM 节点上手动添加一个非 Passive 的事件处理器，[g-plugin-control](http://g-next.antv.vision/zh/docs/plugins/control) 插件就是这么做的。如何获取画布的 DOM 节点可以使用 [getDomElement](/zh/docs/api/renderer#getdomelement)：

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

## 其他事件

其他绝大部分原生事件，尤其是需要绑定在 window/document 上的键盘、剪切板事件用法在 G 中并没有特殊之处，可以直接参考相关事件文档。

### 键盘事件

可以直接使用 [KeyboardEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent)：

```js
window.addEventListener('keydown', () => {}, false);
```

但目前我们还没有实现 A11y 相关的功能，例如使用 tab 在画布内图形间切换选中。

### 剪切板事件

可以直接使用 [ClipboardEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/ClipboardEvent)

### 焦点相关事件

我们并没有内置 focus/blur 这样的[焦点事件](https://developer.mozilla.org/zh-CN/docs/Web/API/FocusEvent)，因此以下代码无效：

```js
circle.addEventListener('focus', () => {});
circle.addEventListener('blur', () => {});
```

可以通过 click/mouseenter/mouseleave 等事件实现焦点相关功能。[示例](/zh/examples/event#circle)

### 鼠标双击事件

由于需要尽可能兼容 PC 和移动端事件，我们并没有监听原生的 [dblclick](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/dblclick_event) 事件，而是通过监听 pointerdown 与 pointerup，将一定时间间隔（200ms）内的点击次数记录在 [detail](/zh/docs/api/event#detail) 属性中，这样就可以区分单击与双击：

```js
canvas.addEventListener('click', (e) => {
    if (e.detail === 2) {
        // 双击
    } else if (e.detail === 1) {
        // 单击
    }
});
```

## 旧版兼容

在旧版中支持以下在事件名中表示委托的写法，格式为 `[被委托图形 name]:[事件名]`，[示例](/zh/examples/event#deprecated-delegate)：

```js
// 监听所有 name 为 node 的图形上冒泡上来的 click 事件
graph.on('node:click', () => {});

// 等价于
graph.addEventListener('click', (e) => {
    if (e.target.name === 'node') {
    }
});
```
