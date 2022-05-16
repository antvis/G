---
title: Polygon 多边形
order: 7
---

可以参考 SVG 的 [\<polygon\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/polygon) 元素。

如下 [示例](/zh/examples/shape#polygon) 定义了一个多边形：

```javascript
const polygon = new Polygon({
    style: {
        points: [
            [0, 0],
            [100, 0],
            [100, 100],
            [0, 100],
        ],
        stroke: '#1890FF',
        lineWidth: 2,
    },
});
```

# 继承自

继承了 [DisplayObject](/zh/docs/api/basic/display-object) 的 [样式属性](/zh/docs/api/basic/display-object#绘图属性)。

## anchor

默认值为 `[0, 0]`。详见 [DisplayObject anchor](/zh/docs/api/basic/display-object#anchor)

## transformOrigin

默认值为 `left top`。详见 [DisplayObject transformOrigin](/zh/docs/api/basic/display-object#transformOrigin)

## lineWidth

默认值为 `'1'`。详见 [DisplayObject lineWidth](/zh/docs/api/basic/display-object#lineWidth)

## miterLimit

默认值 `4`。详见 [DisplayObject miterLimit](/zh/docs/api/basic/display-object#miterLimit)

# 额外属性

## points

支持以下两种写法：

-   `[number, number][]` 点数组
-   `string` 点之间使用空格分隔，形如：`'100,10 250,150 200,110'`

因此以下两种写法等价：

```js
polygon.style.points = '100,10 250,150 200,110';
polygon.style.points = [
    [100, 10],
    [250, 150],
    [200, 110],
];
```

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/points
