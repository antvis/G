---
title: 常见问题
order: 100
---

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

事件系统只会响应 Canvas 画布范围之内的事件，例如监听了 mousemove 时，在画布之外的其他页面区域移动并不会触发该事件处理器。当拾取到画布空白区域（未命中任何可见图形）时，事件对象的 [target](/zh/api/event#target) 属性会返回 [Document](/zh/api/builtin-objects/document)：

```js
canvas.addEventListener('mousemove', (e) => {
    if (e.target.nodeName === 'document') {
        // 在空白区域移动
    }
});
```

## 事件触发顺序

一些内置事件有触发顺序，例如 click 事件会在 pointerdown 和 pointerup 触发之后。在这个过程中，有可能出现 pointerdown 和 pointerup 事件 target 不一致的情况。例如在一个图形上按下鼠标，移动到另一个图形上再抬起鼠标，此时我们会在这两个 target 共同的祖先节点上（例如场景图的根节点 [document.documentElement](/zh/api/canvas#入口与根节点)）触发 click 事件。

可以在[这个例子](/zh/examples/event#delegate)中尝试。

## 在 Chrome 中禁止页面默认滚动行为

有时我们需要禁止掉页面默认的滚动行为，例如实现缩放类的需求时。禁用默认行为可以使用 [preventDefault](/zh/api/event#preventdefault)，但以下代码在 Chrome 中执行并不会生效，页面依然可以滚动：

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

现在回到我们的问题，如果用户确实需要禁止默认滚动行为，可以在画布的 DOM 节点上手动添加一个非 Passive 的事件处理器，[g-plugin-control](http://g-next.antv.vision/zh/plugins/control) 插件就是这么做的。如何获取画布的 DOM 节点可以使用 [getDomElement](/zh/api/renderer#getdomelement)：

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

### 禁用右键菜单

有时我们想禁用掉浏览器默认的右键菜单，此时可以在 [contextmenu](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/contextmenu_event) 事件处理函数中通过 `preventDefault()` 方法禁用默认行为。如何获取画布的 DOM 节点可以使用 [getDomElement](/zh/api/renderer#getdomelement)：

```js
canvas
    .getContextService()
    .getDomElement() // g-canvas/webgl 为 <canvas>，g-svg 为 <svg>
    .addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
```

需要注意的是，由于 rightup / down 事件的默认行为并不是弹出系统菜单，因此以下写法无效：

```js
// wrong
canvas.addEventListener('rightup', (e) => {
    e.preventDefault();
});
```

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

由于需要尽可能兼容 PC 和移动端事件，我们并没有监听原生的 [dblclick](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/dblclick_event) 事件，而是通过监听 pointerdown 与 pointerup，将一定时间间隔（200ms）内的点击次数记录在 [detail](/zh/api/event#detail) 属性中，这样就可以区分单击与双击：

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

## 与其他插件的交互

### 事件绑定/解绑插件

前面提到过，事件绑定不在核心事件系统中完成，应当交给对应渲染环境插件。例如使用 DOM API 绑定/解绑的 [g-plugin-dom-interaction](/zh/plugins/dom-interaction)，其他环境例如小程序应当自行编写插件。

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

### 拾取插件

不同渲染环境使用不同的拾取插件，用于判定原生事件的 EventTarget：

-   [g-plugin-canvas-picker](/zh/plugins/canvas-picker) 主要使用数学运算
-   [g-plugin-svg-picker](/zh/plugins/svg-picker) 使用现成 SVG API
-   [g-plugin-device-renderer](/zh/plugins/device-renderer) 使用 GPU 颜色编码

### A11y 无障碍插件

在 [g-plugin-a11y](/zh/plugins/a11y) 中，我们监听了键盘事件用于导航。
