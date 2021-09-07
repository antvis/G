---
title: HTML 内容
order: 9
---

有时我们需要在画布上增加一些 HUD（Head-Up Display），例如 Tooltip。此时用 HTML + CSS 展现相比使用基础图形绘制有以下优势：

-   很多原生 HTML 组件难以绘制，例如一些输入类组件 `<input>` `<select>`
-   部分 HTML 原生特性难以实现，例如使用 g-canvas/webgl 绘制文本后无法选中，而如果用 HTML 展示文本就可以，下图展示了文本选中效果

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*qGIRSaeHsTQAAAAAAAAAAAAAARQnAQ)

HTML 内容以及宽高为必填项，其中 HTML 内容可以为字符串或者 HTMLElement：

```js
const html = new HTML({
    style: {
        width: 100,
        height: 100,
        innerHTML: '<h1>This is Title</h1>',
    },
});
canvas.appendChild(html);
```

# DOM 结构

在实现中 g-canvas/webgl 会将 HTML 内容包裹在 `<div>` 中，以 `<canvas>` 的兄弟节点放在容器内。而在 g-svg 中使用 `<foreignObject>` 包裹内容：

```html
// g-canvas/webgl 的 DOM 结构
<div id="container">
    <canvas></canvas>
    <div name="容器元素">
        <!-- content -->
    </div>
</div>

// g-svg 的 DOM 结构
<div id="container">
    <svg>
        <foreignObject name="容器元素">
            <!-- content -->
        </foreignObject>
    </svg>
</div>
```

# 继承自

-   [DisplayObject](/zh/docs/api/basic/display-object)

# 额外属性

## innerHTML

**类型**： `string | HTMLElement`

**默认值**：无

**是否必须**：`true`

**说明**：HTML 内容，可以为字符串或者 HTMLElement

```js
const html = new HTML({
    style: {
        width: 100,
        height: 100,
        innerHTML: '<h1>This is Title</h1>',
        // innerHTML: 'content',
        // innerHTML: document.createElement('div'),
    },
});

html.style.innerHTML = '<h1>This is Title</h1>';
```

## width

**类型**： `number`

**默认值**：无

**是否必须**：`true`

**说明**：内容宽度

## height

**类型**： `number`

**默认值**：无

**是否必须**：`true`

**说明**：内容高度

## className

**类型**： `string | string[]`

**默认值**：无

**是否必须**：`false`

**说明**：给容器元素增加 CSS 类

```js
html.style.className = 'my-class';
html.style.className = ['my-class1', 'my-class2'];
```

## style

**类型**： `string`

**默认值**：无

**是否必须**：`false`

**说明**：给容器元素增加样式

```js
html.style.style = 'color:black;';
```

## getDomElement()

获取容器元素，例如在 g-canvas/webgl 中会得到 `<div>`，而在 g-svg 中会得到 `<foreignObject>`：

```js
// g-canvas/webgl
const $div = html.getDomElement(); // HTMLDivElement

// g-svg
const $foreignObject = html.getDomElement(); // <foreignObject>
```

# 注意事项

## 场景图能力

### 变换

绝大部分场景图能力都可以在 HTML 上使用，例如[变换操作](/zh/docs/api/basic/display-object#变换操作)：

```js
html.translate(100, 0); // 平移
html.scale(2); // 缩放
html.rotate(30); // 旋转
```

在获取包围盒时，我们会使用原生 DOM API [getBoundingClientRect](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect)，因此在首次渲染完成之前调用会得到不正确的结果。

### 节点操作

对于 HTML 元素，添加其他基础图形作为它的子元素意义不大。此时可以使用 [getDomElement](/zh/docs/api/basic/html#getdomelement) 获取容器元素后再进行后续的 DOM 操作，例如添加子节点：

```js
const $div = document.createElement('div');

// wrong
html.appendChild($div);

// correct
html.getDomElement().appendChild($div);
```

### 可见性与渲染次序

隐藏展示都可以正常使用：

```js
html.show();
html.style.visibility = 'visible';

html.hide();
html.style.visibility = 'hidden';
```

但是在通过 [z-index](/zh/docs/api/basic/display-object#zindex) 指定渲染顺序时，受限于具体实现，仅在各个 HTML 内容间生效。在下面的例子中，html1 无法在 circle1 和 circle2 之间展示：

```js
// 在 <canvas> 中渲染的两个 circle
circle1.style.zIndex = 1;
circle2.style.zIndex = 3;

html1.style.zIndex = 2;
html2.style.zIndex = 100;
```

## 指定宽高

由于 [foreignObject](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/foreignObject) 需要指定宽高才能渲染，在创建时指定后也可以进行修改：

```js
html.style.width = 100;
html.style.height = 100;
```

## 动画

目前其他基础图形动画都是通过 Keyframe 插值后重绘完成。对于 HTML 图形，理想状况显然是直接使用 CSS Animation。
