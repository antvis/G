---
title: Ellipse
order: 3
---

You can refer to the [\<ellipse\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/ellipse) element of SVG.

The following [example](/en/examples/shape/ellipse/#ellipse) draws an ellipse with a center of `[100, 100]` and a radius of `100`.

```js
const ellipse = new Ellipse({
    style: {
        cx: 100,
        cy: 100,
        rx: 100,
        ry: 100,
    },
});
```

## Inherited from

Inherits [style property](/en/api/basic/display-object#drawing-properties) from [DisplayObject](/en/api/basic/display-object).

### anchor

The default value is `[0.5, 0.5]`. For details, see [DisplayObject's anchor](/en/api/basic/display-object#anchor).

### transformOrigin

The default value is `center`. For details, see [DisplayObject's transformOrigin](/en/api/basic/display-object#transformOrigin).

## Additional Properties

### cx

The x-axis coordinates of the center of the circle in the local coordinate system.

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/cx>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### cy

The y-axis coordinates of the center of the circle in the local coordinate system.

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/cy>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### rx

Horizontal radius of the ellipse

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/rx>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### ry

The vertical radius of the ellipse

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/ry>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |
