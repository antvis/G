---
title: Rect
order: 4
---

You can refer to the [\<rect\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/rect) element of SVG.

The following [example](/en/examples/shape/rect/#rect) defines a rounded rectangle with the top left vertex at `(200, 100)`.

```javascript
const rect = new Rect({
    style: {
        x: 200,
        y: 100,
        width: 300,
        height: 200,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 4,
        radius: 8,
    },
});
```

## Inherited from

Inherits [style property](/en/api/basic/display-object#drawing-properties) from [DisplayObject](/en/api/basic/display-object).

### anchor

The default value is `[0, 0]`. For details, see [DisplayObject's anchor](/en/api/basic/display-object#anchor).

### transformOrigin

The default value is `left top`. For details, see [DisplayObject's transformOrigin](/en/api/basic/display-object#transformOrigin).

## Additional Properties

### x

The x-axis coordinate of the top-left vertex of the rectangle in the local coordinate system.

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/x>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### y

The y-axis coordinate of the top-left vertex of the rectangle in the local coordinate system.

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/y>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### width

The width of the rectangle. Supports taking **negative numbers** with the effect of reversing along the Y-axis, [example](/en/examples/shape/rect/#rect).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_sVnRJmw7m8AAAAAAAAAAAAAARQnAQ" width="300" alt="negative width of rect">

This is consistent with the Canvas2D API, [see](https://stackoverflow.com/a/15598760). In the SVG spec, it is noted that the `<rect>` width and height attribute is not displayed when it is negative, for example, in Chrome this results in the following error: `Error: <rect> attribute height: A negative value is not valid. ("-100")`：

> The width and height properties define the overall width and height of the rectangle. A negative value for either property is illegal and must be ignored as a parsing error. A computed value of zero for either dimension disables rendering of the element.

We circumvent this problem by using `<path>` instead of `<rect>` for drawing in [g-svg](/en/api/renderer/svg).

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/width>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### height

The height of the rectangle. Supports taking **negative numbers** with the effect of reversing along the X-axis, [example](/en/examples/shape/rect/#rect).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*gPkGR56c5QgAAAAAAAAAAAAAARQnAQ" width="300" alt="negative height of rect">

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/height>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### radius

Corner radius, unlike SVG `<rect>` which only supports `cx/cy` uniform settings, here you can specify the radius of each of the four corners, [example](/en/examples/shape#rect).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_pegTqJKe54AAAAAAAAAAAAAARQnAQ" alt="rounded rect">

```js
rect.style.radius = [0, 4, 8, 16];
rect.style.radius = '0 4px 8px 16px';
```

The following values are supported, set in the order of top left, top right, bottom right, bottom left.

-   `number` Uniform setting of four rounded corner radii
-   `number[]` Setting the four corner radii separately will make up the default fraction of.
    -   `[ 1 ]` equals `[ 1, 1, 1, 1 ]`
    -   `[ 1, 2 ]` equals `[ 1, 2, 1, 2 ]`
    -   `[ 1, 2, 3 ]` equals `[ 1, 2, 3, 2 ]`
    -   `[ 1, 2, 3, 4 ]`
-   `string` Similar to the CSS [padding](https://developer.mozilla.org/zh-CN/docs/Web/CSS/padding) property, using spaces to separate

When actually drawn, the maximum value of the radius of the rounded corners is limited to half the maximum value of the width and height of the rectangle.

```js
const [tlr, trr, brr, blr] = radius.map((r) =>
    clamp(
        r.value,
        0,
        Math.min(Math.abs(width.value) / 2, Math.abs(height.value) / 2),
    ),
);
```

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |
