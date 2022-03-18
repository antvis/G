---
title: Polygon 多边形
order: 7
---

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
