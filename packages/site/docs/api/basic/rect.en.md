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

圆角半径，不同于 SVG `<rect>` 仅支持 `cx/cy` 统一设置，这里可以分别指定四个角的圆角半径，[示例](/zh/examples/shape#rect)：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_pegTqJKe54AAAAAAAAAAAAAARQnAQ" alt="rounded rect">

```js
rect.style.radius = [0, 4, 8, 16];
rect.style.radius = '0 4px 8px 16px';
```

支持以下取值，设置顺序依次为 左上，右上，右下，左下：

-   `number` 统一设置四个圆角半径
-   `number[]` 分别设置四个圆角半径，会补足缺省的分量：
    -   `[ 1 ]` 相当于 `[ 1, 1, 1, 1 ]`
    -   `[ 1, 2 ]` 相当于 `[ 1, 2, 1, 2 ]`
    -   `[ 1, 2, 3 ]` 相当于 `[ 1, 2, 3, 2 ]`
    -   `[ 1, 2, 3, 4 ]`
-   `string` 与 CSS [padding](https://developer.mozilla.org/zh-CN/docs/Web/CSS/padding) 属性类似，使用空格分隔

| [初始值](/zh/docs/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/docs/api/css/inheritance) | 是否支持动画 | [计算值](/zh/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | 否 | 是 | ([\<percentage\>](/zh/docs/api/css/css-properties-values-api#percentage) [\<length\>](/zh/docs/api/css/css-properties-values-api#length)) {1, 4} |
