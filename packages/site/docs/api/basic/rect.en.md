---
title: Rect 矩形
order: 4
---

可以参考 SVG 的 [\<rect\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/rect) 元素。

如下 [示例](/zh/examples/shape#rect) 定义了一个圆角矩形，左上角顶点位置为 `(200, 100)`：

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

# 继承自

继承了 [DisplayObject](/zh/docs/api/basic/display-object) 的 [样式属性](/zh/docs/api/basic/display-object#绘图属性)。

## anchor

默认值为 `[0, 0]`。详见 [DisplayObject anchor](/zh/docs/api/basic/display-object#anchor)

## transformOrigin

默认值为 `left top`。详见 [DisplayObject transformOrigin](/zh/docs/api/basic/display-object#transformOrigin)

# 额外属性

## x

局部坐标系下，矩形左上角顶点的 x 轴坐标。

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/x

| [初始值](/zh/docs/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/docs/api/css/inheritance) | 是否支持动画 | [计算值](/zh/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | 否 | 是 | [\<percentage\>](/zh/docs/api/css/css-properties-values-api#percentage) [\<length\>](/zh/docs/api/css/css-properties-values-api#length) |

## y

局部坐标系下，矩形左上角顶点的 y 轴坐标。

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/y

| [初始值](/zh/docs/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/docs/api/css/inheritance) | 是否支持动画 | [计算值](/zh/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | 否 | 是 | [\<percentage\>](/zh/docs/api/css/css-properties-values-api#percentage) [\<length\>](/zh/docs/api/css/css-properties-values-api#length) |

## width

矩形宽度。

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/width

| [初始值](/zh/docs/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/docs/api/css/inheritance) | 是否支持动画 | [计算值](/zh/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | 否 | 是 | [\<percentage\>](/zh/docs/api/css/css-properties-values-api#percentage) [\<length\>](/zh/docs/api/css/css-properties-values-api#length) |

## height

矩形高度。

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/height

| [初始值](/zh/docs/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/docs/api/css/inheritance) | 是否支持动画 | [计算值](/zh/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | 否 | 是 | [\<percentage\>](/zh/docs/api/css/css-properties-values-api#percentage) [\<length\>](/zh/docs/api/css/css-properties-values-api#length) |

## radius

圆角半径

| [初始值](/zh/docs/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/docs/api/css/inheritance) | 是否支持动画 | [计算值](/zh/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | 否 | 是 | [\<percentage\>](/zh/docs/api/css/css-properties-values-api#percentage) [\<length\>](/zh/docs/api/css/css-properties-values-api#length) |
