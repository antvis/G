---
title: Circle 圆形
order: 2
---

可以参考 SVG 的 [\<circle\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/circle) 元素。

如下 [示例](/zh/examples/shape/circle/#circle) 绘制了一个圆心在 `[100, 100]`，半径为 `100` 的圆：

```js
const circle = new Circle({
    style: {
        cx: 100,
        cy: 100,
        r: 100,
    },
});
```

## 继承自

继承了 [DisplayObject](/zh/api/basic/display-object) 的 [样式属性](/zh/api/basic/display-object#绘图属性)。

### anchor

默认值为 `[0.5, 0.5]`。详见 [DisplayObject anchor](/zh/api/basic/display-object#anchor)

### transformOrigin

默认值为 `center`。详见 [DisplayObject transformOrigin](/zh/api/basic/display-object#transformOrigin)

## 额外属性

### cx

圆心在局部坐标系下的 x 轴坐标。

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/cx>

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### cy

圆心在局部坐标系下的 y 轴坐标。

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/cy>

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### r

圆的半径。

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/r>

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |
