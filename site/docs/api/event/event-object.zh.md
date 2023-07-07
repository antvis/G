---
title: 事件对象
order: 50
---

在事件监听器的回调函数中，我们可以取得事件对象并访问其上的属性和方法。这些属性和方法和 DOM Event API 保持一致，因此可以直接参考它们的文档。

我们会尽量将原生事件规范化到 [PointerEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/PointerEvent) 事件对象后统一处理，可以在 [nativeEvent](/zh/api/event#nativeevent) 上访问原生事件。

## 通用属性

事件对象上常用的属性包括事件类型、当前触发事件的图形、位置等，其中位置和[坐标系](/zh/api/canvas#坐标系)相关。

### type

事件类型：

-   pointerup
-   pointerdown
-   pointerupoutside
-   pointermove
-   pointercancel

<https://developer.mozilla.org/en-US/docs/Web/API/Event/type>

### nativeEvent

原生事件对象。当我们调用 [preventDefault](/zh/api/event#preventdefault) 方法时，会调用原生事件对象上的同名方法。

### view

指向 [Canvas](/zh/api/canvas)。

<https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/view>

### altKey

事件触发时是否伴随 `alt` 的按下。

<https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/altKey>

### metaKey

事件触发时是否伴随 `meta` 的按下。

<https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/metaKey>

### ctrlKey

事件触发时是否伴随 `ctrl` 的按下。

<https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/ctrlKey>

### shiftKey

事件触发时是否伴随 `shift` 的按下。

<https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/shiftKey>

### timeStamp

<https://developer.mozilla.org/zh-CN/docs/Web/API/Event/timeStamp>

事件创建时的时间戳

### eventPhase

当前所处的事件阶段。有以下三个枚举值：

```js
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

<https://developer.mozilla.org/zh-CN/docs/Web/API/CustomEvent/detail>

### target

<https://developer.mozilla.org/zh-CN/docs/Web/API/Event/target>

当前触发事件的 [EventTarget](/zh/api/builtin-objects/event-target)。

在实现事件委托时很有用，例如有这样一个场景，类似 DOM 中的 `ul/li`：

```js
Group(ul) - Rect(li) - Rect(li);
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

<https://developer.mozilla.org/zh-CN/docs/Web/API/Event/currentTarget>

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

在 [Canvas 坐标系/世界坐标系](/zh/api/canvas#canvas)下，以画布 DOM 元素的左上角为原点，X 轴正向指向屏幕右侧，Y 轴正向指向屏幕下方。可以与 [viewportX/Y](/zh/api/event#viewportxy) 互相转换，[详见](/zh/api/canvas#canvas---viewport)：

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

在 [Viewport 坐标系](/zh/api/canvas#viewport)下，考虑相机变换。

可以与 [canvasX/Y](/zh/api/event#canvasxy) 互相转换，[详见](/zh/api/canvas#canvas---viewport)：

```js
canvas.canvas2Viewport({ x: e.canvasX, y: e.canvasY }); // Point { x: 100, y: 100 }
canvas.viewport2Canvas({ x: e.viewportX, y: e.viewportY }); // Point { x: 0, y: 0 }
```

可以与 [clientX/Y](/zh/api/event#clientxy) 互相转换，[详见](/zh/api/canvas#client---viewport)：

```js
canvas.viewport2Client({ x: 0, y: 0 }); // Point { x: 100, y: 100 }
canvas.client2Viewport({ x: 100, y: 100 }); // Point { x: 0, y: 0 }
```

### clientX/Y

<https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/clientX>

在[浏览器坐标系](/zh/api/canvas#client)下，左上角为 `(0, 0)`。G 不会修改原生事件上的该属性，因此两者完全相同：

```js
e.clientX;
e.nativeEvent.clientX;
```

可以与 [viewportX/Y](/zh/api/event#viewportxy) 互相转换，[详见](/zh/api/canvas#client---viewport)：

```js
canvas.viewport2Client({ x: 0, y: 0 }); // Point { x: 100, y: 100 }
canvas.client2Viewport({ x: 100, y: 100 }); // Point { x: 0, y: 0 }
```

### screenX/Y

<https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/screenX>

在[屏幕坐标系](/zh/api/canvas#screen)下，不考虑页面滚动。G 不会修改原生事件上的该属性，因此两者完全相同：

```js
e.screenX;
e.nativeEvent.screenX;
```

### pageX/Y

<https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/pageX>

在[文档坐标系](/zh/api/canvas#page)下，考虑页面滚动。G 不会修改原生事件上的该属性，因此两者完全相同：

```js
e.pageX;
e.nativeEvent.pageX;
```

### movementX/Y

<https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/movementX>

当前事件和上一个 `mousemove` 事件之间鼠标在水平方向上的移动值。换句话说，这个值是这样计算的: `currentEvent.movementX = currentEvent.screenX - previousEvent.screenX`

## PointerEvent 属性

### pointerType

返回事件的设备类型，返回值如下：

-   pointer 代表 [PointerEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/PointerEvent)
-   mouse 代表 [MouseEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent)
-   touch 代表 [TouchEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/TouchEvent)

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType>

### pointerId

返回一个可以唯一地识别和触摸平面接触的点的值。这个值在这根手指（或触摸笔等）所引发的所有事件中保持一致，直到它离开触摸平面。

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerId>

### isPrimary

是否是 primary pointer。在多指触控场景下，代表当前事件由主触点产生。

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/isPrimary>

### button

标识鼠标事件哪个按键被点击。0 为左键，1 为鼠标滚轮，2 为右键。

<https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button>

### buttons

<https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons>

### width

接触面积宽度。如果原生事件为 MouseEvent，返回 1。

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/width>

### height

接触面积高度。如果原生事件为 MouseEvent，返回 1。

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/height>

### tiltX

触点与屏幕在 Y-Z 平面上的角度。如果原生事件为 MouseEvent 返回固定值 `0`。

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltX>

### tiltY

触点与屏幕在 X-Z 平面上的角度。如果原生事件为 MouseEvent 返回固定值 `0`。

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltY>

### pressure

返回对应的手指挤压触摸平面的压力大小，从 `0.0` (没有压力)到 `1.0` (最大压力)的浮点数。如果原生事件为 MouseEvent 返回固定值 `0.5`。

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure>

### tangentialPressure

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tangentialPressure>

### twist

顺时针旋转角度。如果原生事件为 MouseEvent 返回固定值 `0`。

<https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/twist>

## WheelEvent 属性

在鼠标滚轮事件中，可以获取滚动量。

### deltaX/Y/Z

<tag color="blue" text="WheelEvent">WheelEvent</tag>

<https://developer.mozilla.org/zh-CN/docs/Web/API/WheelEvent>

滚轮的横向/纵向/Z 轴的滚动量。

## 方法

事件对象上的某些方法可以控制事件传播时的行为，例如阻止冒泡等。

### stopImmediatePropagation

阻止监听同一事件的其他事件监听器被调用，同时阻止冒泡。

<https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopImmediatePropagation>

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

<https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopPropagation>

与 `stopImmediatePropagation` 的区别是并不会阻止监听同一事件的其他事件监听器被调用。

### preventDefault

<https://developer.mozilla.org/zh-CN/docs/Web/API/Event/preventDefault>

阻止浏览器默认行为。对于 Passive 事件调用该方法无效，并且会抛出警告。

关于 wheel 事件的解决方案可以参考：[在 Chrome 中禁止页面默认滚动行为](/zh/api/event#在-chrome-中禁止页面默认滚动行为)。

### composedPath

<https://developer.mozilla.org/zh-CN/docs/Web/API/Event/composedPath>

返回事件路径，是包含 [EventTarget](/zh/api/builtin-objects/event-target) 的数组，类似旧版 G 中的 `propagationPath`。在这个数组中，`event.target` 为数组的第一个元素，[场景图根节点](/zh/api/canvas#入口与根节点)、[Document](/zh/api/canvas#入口与根节点) 和 [Canvas](/zh/api/canvas) 为数组末尾的三个元素。

仍然以类似 DOM `ul/li` 场景为例：

```js
Group(ul) - Rect(li) - Rect(li);
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

### clone

目前在事件系统中会重复使用事件对象，避免大量事件对象的创建。被重复使用的对象仅用于携带不同的数据，例如坐标信息、原生事件对象等，因此生命周期限定在事件处理器内，一旦试图缓存整个事件对象并在事件处理器之外使用，就会导致意料之外的结果。因此推荐缓存事件对象上携带的数据而非对象本身。

在保留上述性能考虑的基础上，我们也提供了一个 clone 方法，当用户真的想缓存时会创建新的事件对象，例如：

```js
circle.addEventListener('click', (e) => {
    const newEvent = e.clone();
});
```

克隆后的事件对象将保留原事件对象上的一切属性。

目前我们暂时只支持交互事件，即 [PointerEvent](/zh/api/event#pointerevent-属性) 和 [WheelEvent](/zh/api/event#wheelevent-属性)。其他事件例如 AnimationEvent 和 CustomEvent 暂不支持。
