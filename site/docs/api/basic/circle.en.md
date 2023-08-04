---
title: Circle
order: 2
---

You can refer to the [\<circle\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/circle) element of SVG.

The following [example](/en/examples/shape/circle/#circle) draws a circle with a center of `[100, 100]` and a radius of `100`.

```js
const circle = new Circle({
    style: {
        cx: 100,
        cy: 100,
        r: 100,
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

[https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/cx](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/cx)

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### cy

The y-axis coordinates of the center of the circle in the local coordinate system.

[https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/cy](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/cy)

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### r

The radius of the circle.

[https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/r](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/r)

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |
