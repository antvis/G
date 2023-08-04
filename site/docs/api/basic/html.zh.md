---
title: HTML 内容
order: 9
---

有时我们需要在画布上增加一些 HUD（Head-Up Display），例如 Tooltip。此时用 HTML + CSS 展现相比使用基础图形绘制有以下优势：

-   很多原生 HTML 组件难以绘制，例如一些输入类组件 `<input>` `<select>`
-   部分 HTML 原生特性难以实现，例如使用 g-canvas/webgl 绘制文本后无法选中，而如果用 HTML 展示文本就可以，下图展示了文本选中效果，[示例](/zh/examples/shape/html#html)：

![Text selection effect](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*qGIRSaeHsTQAAAAAAAAAAAAAARQnAQ)

HTML 内容以及宽高为必填项，其中 HTML 内容可以为字符串或者 HTMLElement：

```js
const html = new HTML({
    style: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        innerHTML: '<h1>This is Title</h1>',
    },
});
canvas.appendChild(html);
```

之所以一定要指定宽高（至少是初始宽高），是由于 SVG 的 [\<foreignObject\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/foreignObject) 元素必须指定否则无法显示。

## DOM 结构

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

## 继承自

-   [DisplayObject](/zh/api/basic/display-object)

其中的 [id](/zh/api/basic/display-object#id)，[name](/zh/api/basic/display-object#name)，[className](/zh/api/basic/display-object#classname) 如果传入都会被应用在容器元素上，因此有两种方式获取到容器元素：

-   通过类似 `getElementById` 这样的 DOM API 获取
-   使用 [getDomElement()](/zh/api/basic/html#getdomelement)

其他样式属性通过 CSS 应用。

### fill

对应 CSS [background](https://developer.mozilla.org/zh-CN/docs/Web/CSS/background) 属性。

### stroke

对应 CSS [border-color](https://developer.mozilla.org/zh-CN/docs/Web/CSS/border-color) 属性。

### lineWidth

对应 CSS [border-width](https://developer.mozilla.org/zh-CN/docs/Web/CSS/border-width) 属性。

### lineDash

对应 CSS [border-style](https://developer.mozilla.org/zh-CN/docs/Web/CSS/border-style) 属性。

使用 `dashed` 值，但无法精确控制 `dash` 和 `gap` 的长度。

### opacity

对应 CSS [opacity](https://developer.mozilla.org/zh-CN/docs/Web/CSS/opacity) 属性。

### visibility

对应 CSS [visibility](https://developer.mozilla.org/zh-CN/docs/Web/CSS/visibility) 属性。

### pointerEvents

对应 CSS [pointer-events](https://developer.mozilla.org/zh-CN/docs/Web/CSS/pointer-events) 属性。

当我们在实现类似 tooltip 这样的需求时，可以让鼠标事件穿透它，[示例](/zh/examples/shape/html#html)：

```js
const tooltip = new HTML({
    style: {
        x: 0,
        y: 0,
        innerHTML: 'Tooltip',
        fill: 'white',
        stroke: 'black',
        lineWidth: 6,
        width: 100,
        height: 30,
        pointerEvents: 'none', // 让事件穿透它
        visibility: 'hidden',
    },
});
```

### transform

对应 CSS [transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform) 属性。

使用生成全局坐标系下的 matrix 字符串形式。

### transformOrigin

对应 CSS [transform-origin](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-origin) 属性。

## 额外属性

### x

局部坐标系下，容器左上角顶点的 x 轴坐标。

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/x>

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### y

局部坐标系下，容器左上角顶点的 y 轴坐标。

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/y>

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### innerHTML

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

### width

容器宽度，默认值为 `'auto'`。

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/width>

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### height

容器宽度，默认值为 `'auto'`。

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/height>

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### 其他 CSS 属性

CSS 属性将被透传并直接应用到 DOM 容器的 style 上，在下面的[示例](/zh/examples/shape/html/#override-css)中，`fontSize` `textAlign` `color` 等 CSS 属性将直接体现在样式上：

```js
const html = new HTML({
    style: {
        x: 200,
        y: 100,
        width: 200,
        height: 200,
        innerHTML: 'p1',
        // The followin will override the CSS properties.
        fontSize: '20px',
        textAlign: 'center',
        color: 'red',
    },
});
```

![override CSS properties](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*A5kuQbb3_YUAAAAAAAAAAAAADmJ7AQ/original)

## 额外方法

### getDomElement()

获取容器元素，例如在 g-canvas/webgl 中会得到 `<div>`，而在 g-svg 中会得到 `<foreignObject>`：

```js
// g-canvas/webgl
const $div = html.getDomElement(); // HTMLDivElement

// g-svg
const $foreignObject = html.getDomElement(); // <foreignObject>
```

## 注意事项

### 场景图能力

#### 变换

绝大部分场景图能力都可以在 HTML 上使用，例如[变换操作](/zh/api/basic/display-object#变换操作)：

```js
html.translate(100, 0); // 平移
html.scale(2); // 缩放
html.rotate(30); // 旋转
```

在获取包围盒时，我们会使用原生 DOM API [getBoundingClientRect](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect)，因此在首次渲染完成之前调用会得到不正确的结果。

#### 节点操作

对于 HTML 元素，添加其他基础图形作为它的子元素意义不大。此时可以使用 [getDomElement](/zh/api/basic/html#getdomelement) 获取容器元素后再进行后续的 DOM 操作，例如添加子节点：

```js
const $div = document.createElement('div');

// wrong
html.appendChild($div);

// correct
html.getDomElement().appendChild($div);
```

#### 可见性与渲染次序

隐藏展示都可以正常使用：

```js
html.show();
html.style.visibility = 'visible';

html.hide();
html.style.visibility = 'hidden';
```

但是在通过 [z-index](/zh/api/basic/display-object#zindex) 指定渲染顺序时，受限于具体实现，仅在各个 HTML 内容间生效。在下面的例子中，html1 无法在 circle1 和 circle2 之间展示：

```js
// 在 <canvas> 中渲染的两个 circle
circle1.style.zIndex = 1;
circle2.style.zIndex = 3;

html1.style.zIndex = 2;
html2.style.zIndex = 100;
```

### 指定宽高

由于 [foreignObject](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/foreignObject) 需要指定宽高才能渲染，在创建时指定后也可以进行修改：

```js
html.style.width = 100;
html.style.height = 100;
```

### 动画

目前其他基础图形动画都是通过 Keyframe 插值后重绘完成。对于 HTML 图形，理想状况显然是直接使用 CSS Animation。
