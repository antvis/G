---
title: Path 路径
order: 8
---

使用 Path 可以定义直线、折线、圆弧、贝塞尔曲线等。路径中包含一组命令与参数，这些命令有不同的语义，具体用法可以参考：https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths

如下 [示例](/zh/examples/shape#path) 定义了一条直线：

```javascript
const line = new Path({
    style: {
        path: [
            ['M', 100, 100],
            ['L', 200, 200],
        ],
        stroke: '#F04864',
    },
});
```

# 继承自

-   [DisplayObject](/zh/docs/api/basic/display-object)

默认锚点定义的位置为包围盒左上角顶点，可以通过 [anchor](/zh/docs/api/display-object#anchor) 改变。

关于这一点我们参考了 SVG 的实际表现，以下图为例我们以 `[100, 100]` 为起点定义了一段圆弧，显然它的包围盒左上角顶点并不是 `[0, 0]` 或者 `[100, 100]`，而是需要根据 path 的真实形状计算得出，我们将把这个计算结果作为默认锚点位置，也是局部坐标系下的坐标：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*nLVmQ4nZc1oAAAAAAAAAAAAAARQnAQ" width="600px">

再比如这条直线路径 `[ ['M', 100, 100], ['L', 200, 200] ]` 在局部坐标系下的 “位置” 为 `[100, 100]`：

```js
const line = new Path({
    style: {
        path: [
            ['M', 100, 100],
            ['L', 200, 200],
        ],
        stroke: '#F04864',
    },
});

line.getLocalPosition(); // [100, 100];
line.getBounds(); // 包围盒 { min: [100, 100], max: [200, 200] }
line.translateLocal(100, 0); // 沿 X 轴平移
```

# 额外属性

## path

路径，支持 `字符串`和 `数组` 两种形式，可参考 [SVG path](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths)：

-   字符串形式: `M 100,100 L 200,200`
-   数组形式: `[ [ 'M', 100, 100 ], [ 'L', 200, 200 ] ]`

**类型**： `string | [string, number, number][]`

**默认值**：无

**是否必须**：`true`

## d

[path](/zh/docs/api/basic/path#path) 属性的别名，与 SVG 中的 `<path>` 命名保持一致。

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

获取路径长度。

https://developer.mozilla.org/zh-CN/docs/Web/API/SVGGeometryElement/getTotalLength

例如获取如下直线的长度：

```js
const path = new Path({
    style: {
        path: [
            ['M', 100, 100],
            ['L', 100, 200],
        ],
        stroke: '#F04864',
    },
});

path.getTotalLength(); // 100
```

如果是一个不合法的路径，返回 0：

```js
const path = new Path({
    style: {
        path: [['XXXX', 100, 100]],
        stroke: '#F04864',
    },
});

path.getTotalLength(); // 0
```

## getPoint(ratio: number): Point

根据长度比例（取值范围 `[0-1]`）获取点，其中 `Point` 的格式为:

```ts
export type Point = {
    x: number;
    y: number;
};
```

例如获取如下直线的中点坐标：

```js
const path = new Path({
    style: {
        path: [
            ['M', 100, 100],
            ['L', 100, 200],
        ],
        stroke: '#F04864',
    },
});

path.getPoint(0.5); // Point {x: 100, y: 150}
```

## getStartTangent(): number[][]

获取起点的切向量，形如: `[[10, 10], [20, 20]]`

## getEndTangent(): number[][]

获取终点的切向量，形如: `[[10, 10], [20, 20]]`
