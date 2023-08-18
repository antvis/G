---
title: HTML
order: 9
---

Sometimes we need to add some HUDs to the canvas, e.g. Tooltip. In this case, the HTML + CSS presentation has the following advantages over using basic graphics.

-   Many native HTML components are difficult to draw, such as some input components: `<input>`, `<select>` etc.
-   Some of the HTML native features are difficult to implement, for example, text cannot be selected after drawing it using `g-canvas/webgl`, while it can be if it is displayed in HTML, the following image shows the text selection effect, [example](/en/examples/shape/html#html).

![Text selection effect](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*qGIRSaeHsTQAAAAAAAAAAAAAARQnAQ)

HTML content and width are required, where HTML content can be a string or HTMLElement.

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

The reason why you must specify the width and height (or at least the initial width and height) is that the [\<foreignObject\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/foreignObject) element of the SVG must be specified or it will not be displayed. .

## DOM structure

In the implementation `g-canvas/webgl` wraps the HTML content in `<div>`, placing it inside the container as a sibling node of `<canvas>`. And in `g-svg` the content is wrapped using `<foreignObject>`.

```html
// the DOM in g-canvas/webgl
<div id="container">
    <canvas></canvas>
    <div name="容器元素">
        <!-- content -->
    </div>
</div>

// the DOM in g-svg
<div id="container">
    <svg>
        <foreignObject name="容器元素">
            <!-- content -->
        </foreignObject>
    </svg>
</div>
```

## Inherited from

-   [DisplayObject](/en/api/basic/display-object)

Where [id](/en/api/basic/display-object#id), [name](/en/api/basic/display-object#name), [className](/en/api/basic/ display-object#classname) are applied to the container element if passed in, so there are two ways to get to the container element.

-   Get it through a DOM API like `getElementById`
-   using [getDomElement()](/en/api/basic/html#getdomelement)

Other style attributes are applied via CSS.

### fill

Corresponds to the CSS [background](https://developer.mozilla.org/zh-CN/docs/Web/CSS/background) property.

### stroke

Corresponds to the CSS [border-color](https://developer.mozilla.org/zh-CN/docs/Web/CSS/border-color) property.

### lineWidth

Corresponds to the CSS [border-width](https://developer.mozilla.org/zh-CN/docs/Web/CSS/border-width) property.

### lineDash

Corresponds to the CSS [border-style](https://developer.mozilla.org/zh-CN/docs/Web/CSS/border-style) property.

Use the `dashed` value, but there is no precise control over the length of `dash` and `gap`.

### opacity

Corresponds to the CSS [opacity](https://developer.mozilla.org/zh-CN/docs/Web/CSS/opacity) property.

### visibility

Corresponds to the CSS [visibility](https://developer.mozilla.org/zh-CN/docs/Web/CSS/visibility) property.

### pointerEvents

Corresponds to the CSS [pointer-events](https://developer.mozilla.org/zh-CN/docs/Web/CSS/pointer-events) property.

When we implement a requirement like tooltip, we can have mouse events penetrate it, [example](/en/examples/shape/html#html).

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
        pointerEvents: 'none', // Let the event penetrate it
        visibility: 'hidden',
    },
});
```

### transform

Corresponds to the [transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform) property.

Use to generate the matrix string form in the global coordinate system.

### transformOrigin

Corresponds to the [transform-origin](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-origin) property.

## Additional Properties

### x

The x-axis coordinate of the top-left vertex of the container in the local coordinate system.

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/x>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### y

The y-axis coordinate of the top-left vertex of the container in the local coordinate system.

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/y>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### innerHTML

HTML content, either as a string or as an HTMLElement.

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- | ------------ |
| -                                                                    | -                   | no                                     | no         | `string                                                                | HTMLElement` |

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

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/width>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 'auto'                                                               | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### height

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 'auto'                                                               | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### Other CSS Properties

CSS properties will be passthrough and applied directly to the style of the DOM container. In the following [example](/en/examples/shape/html/#override-css), CSS attributes such as `fontSize` `textAlign` `color` will be directly reflected in the style:

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

## Methods

### getDomElement()

Gets the container element, e.g. `<div>` in `g-canvas/webgl`, and `<foreignObject>` in `g-svg`.

```js
// g-canvas/webgl
const $div = html.getDomElement(); // HTMLDivElement

// g-svg
const $foreignObject = html.getDomElement(); // <foreignObject>
```

## Caveats

### Scenegraph capability

#### Transformation

Most of the scenegraph capabilities are available on HTML, such as [transform operations](/en/api/basic/display-object#transformation-operations).

```js
html.translate(100, 0); // 平移
html.scale(2); // 缩放
html.rotate(30); // 旋转
```

When getting the enclosing box, we will use the native DOM API [getBoundingClientRect](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect), so calling it before the first call before the rendering is done will give incorrect results.

#### Node Operations

For HTML elements, it does not make much sense to add other base graphics as its child elements. In this case, you can use [getDomElement](/en/api/basic/html#getdomelement) to get the container element and then perform subsequent DOM operations, such as adding child nodes.

```js
const $div = document.createElement('div');

// wrong
html.appendChild($div);

// correct
html.getDomElement().appendChild($div);
```

#### Visibility and rendering order

The hidden displays all work properly.

```js
html.show();
html.style.visibility = 'visible';

html.hide();
html.style.visibility = 'hidden';
```

However, when specifying the rendering order by [z-index](/en/api/basic/display-object#zindex), it is limited by the specific implementation and only works between individual HTML contents. In the following example, html1 cannot be displayed between circle1 and circle2.

```js
// 在 <canvas> 中渲染的两个 circle
circle1.style.zIndex = 1;
circle2.style.zIndex = 3;

html1.style.zIndex = 2;
html2.style.zIndex = 100;
```

### Specify width and height

Since [foreignObject](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/foreignObject) requires a specified width and height to be rendered, it can also be modified after being specified at creation time.

```js
html.style.width = 100;
html.style.height = 100;
```

### Animation

Currently, all other basic graphics animations are redrawn after interpolation by Keyframe. For HTML graphics, the ideal situation is obviously to use CSS Animation directly.
