---
title: Polyline 折线
order: 7
---

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

-   [DisplayObject](/zh/docs/api/basic/display-object)

默认锚点定义的位置为包围盒左上角顶点，可以通过 [anchor](/zh/docs/api/display-object#anchor) 改变。

# 额外属性

## points

**类型**： `[number, number][]`

**默认值**：无

**是否必须**：`true`

## lineJoin

**类型**： `string`

**默认值**：`miter`

**是否必须**：`false`

相邻两个线段的接头样式，支持以下取值：

-   'miter' 默认值
-   'bevel'
-   'round'

效果可参考 Canvas2D [同名属性](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/lineJoin)。

## lineCap

**类型**： `string`

**默认值**：`miter`

**是否必须**：`false`

端点样式，支持以下取值：

-   'butt' 默认值
-   'round'
-   'square'

可参考 Canvas2D [同名属性](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/lineCap)。

## miterLimit

**类型**： `number`

**默认值**：`4`

**是否必须**：`false`

miter 接头斜接面限制比例，SVG 和 Canvas2D 的默认值不同，前者为 4 而后者为 10。

可参考 Canvas2D [同名属性](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/miterLimit)。

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
