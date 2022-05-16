---
title: Polyline 折线
order: 7
---

可以参考 SVG 的 [\<polyline\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/polyline) 元素。

如下 [示例](/zh/examples/shape#polyline) 定义了一条折线，各个端点依次为：

```javascript
const polyline = new Polyline({
    style: {
        points: [
            [50, 50],
            [100, 50],
            [100, 100],
            [150, 100],
            [150, 150],
            [200, 150],
            [200, 200],
            [250, 200],
            [250, 250],
            [300, 250],
            [300, 300],
            [350, 300],
            [350, 350],
            [400, 350],
            [400, 400],
            [450, 400],
        ],
        stroke: '#1890FF',
        lineWidth: 2,
    },
});
```

对于折线，默认锚点定义的位置为包围盒左上角顶点，其中各个端点坐标均定义在局部坐标系下。因此如果此时获取上面折线在局部坐标系的坐标，会得到包围盒左上角的坐标，也恰巧是第一个顶点的坐标，即 `[50, 50]`：

```js
polyline.getLocalPosition(); // [50, 50]
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
polyline.style.points = '100,10 250,150 200,110';
polyline.style.points = [
    [100, 10],
    [250, 150],
    [200, 110],
];
```

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/points

# 方法

## getTotalLength(): number

获取折线长度。

https://developer.mozilla.org/zh-CN/docs/Web/API/SVGGeometryElement/getTotalLength

## getPoint(ratio: number): Point

根据长度比例（取值范围 `[0-1]`）获取点，其中 `Point` 的格式为:

```ts
export type Point = {
    x: number;
    y: number;
};
```

## getStartTangent(): number[][]

获取起点的切向量，形如: `[[10, 10], [20, 20]]`

## getEndTangent(): number[][]

获取终点的切向量，形如: `[[10, 10], [20, 20]]`
