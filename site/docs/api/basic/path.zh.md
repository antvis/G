---
title: Path 路径
order: 8
---

使用 Path 可以定义直线、折线、圆弧、贝塞尔曲线等。路径中包含一组命令与参数，这些命令有不同的语义，具体用法可以参考：<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths>

如下 [示例](/zh/examples/shape/path#path) 定义了一条直线，在局部坐标系下从 `[100, 100]` 到 `[200, 200]`：

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

## 继承自

继承了 [DisplayObject](/zh/api/basic/display-object) 的 [样式属性](/zh/api/basic/display-object#绘图属性)。

默认锚点定义的位置为包围盒左上角顶点，可以通过 [anchor](/zh/api/display-object#anchor) 改变。

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

### anchor

默认值为 `[0, 0]`。详见 [DisplayObject anchor](/zh/api/basic/display-object#anchor)

### transformOrigin

默认值为 `left top`。详见 [DisplayObject transformOrigin](/zh/api/basic/display-object#transformOrigin)

### lineWidth

默认值为 `'1'`。详见 [DisplayObject lineWidth](/zh/api/basic/display-object#lineWidth)

### miterLimit

默认值 `4`。详见 [DisplayObject miterLimit](/zh/api/basic/display-object#miterLimit)

## 额外属性

### path

路径，支持 `字符串`和 `数组` 两种形式，可参考 [SVG path](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths)：

-   字符串形式: `M 100,100 L 200,200`
-   数组形式: `[ [ 'M', 100, 100 ], [ 'L', 200, 200 ] ]`

<https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/path>

### d

[path](/zh/api/basic/path#path) 属性的别名，与 SVG 中的 `<path>` 命名保持一致。

### markerStart

由于 Path 可通过 `Z` 命令闭合，因此对于 “起始点” 的定义在两种情况下有差别：

-   如果未闭合，可以参考 [Polyline](/zh/api/basic/polyline) 的 [markerStart](/zh/api/basic/polyline#markerstart) 属性。
-   如果已闭合，可以参考 [Polygon](/zh/api/basic/polygon) 的 [markerStart](/zh/api/basic/polygon#markerstart) 属性。

例如下图中，同样指定了 markerStart 和 markerEnd 为“箭头”，左侧展示了一个未闭合路径的效果，右侧展示了闭合路径的效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*2Pi6SpcqPwAAAAAAAAAAAAAAARQnAQ" alt="unclosed path marker" width="200"><img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*HEpoQbRiRowAAAAAAAAAAAAAARQnAQ" alt="closed path marker" width="200">

在该[示例](/zh/examples/shape/path#path)中，我们在 Path 的起始点上放置了一个箭头：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*-ooIS5IePf4AAAAAAAAAAAAAARQnAQ" alt="path start marker" width="400">

```js
const arrowMarker = new Path({
    style: {
        path: 'M 10,10 L -10,0 L 10,-10 Z',
        stroke: '#1890FF',
        anchor: '0.5 0.5',
        transformOrigin: 'center',
    },
});

path.style.markerStart = arrowMarker;
```

### markerEnd

可以参考 [Polyline](/zh/api/basic/polyline) 的 [markerEnd](/zh/api/basic/polyline#markerend) 属性。

由于 Path 可通过 `Z` 命令闭合，因此对于 “终止点” 的定义在两种情况下有差别：

-   如果未闭合，可以参考 [Polyline](/zh/api/basic/polyline) 的 [markerEnd](/zh/api/basic/polyline#markerend) 属性。
-   如果已闭合，可以参考 [Polygon](/zh/api/basic/polygon) 的 [markerEnd](/zh/api/basic/polygon#markerend) 属性。

在该[示例](/zh/examples/shape/path#path)中，我们在多边形的终止点上放置了一个图片：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*4bYtTKQxOrQAAAAAAAAAAAAAARQnAQ" alt="polygon marker" width="200">

```js
const imageMarker = new Image({
    style: {
        width: 50,
        height: 50,
        anchor: [0.5, 0.5],
        transformOrigin: 'center',
        transform: 'rotate(90deg)',
        img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    },
});

path.style.markerEnd = imageMarker;
```

### markerMid

可以参考 SVG 的[同名属性](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/marker-mid)。

在路径除了 “起始点” 和 “终止点” 之外的每一个顶点上放置标记图形。在内部实现中，由于我们会把路径中部分命令转换成 C 命令，因此这些顶点实际是三阶贝塞尔曲线的控制点。

例如下图中在路径上除首尾的每个顶点上都放置了一个 [Circle](/en/api/basic/circle)：

```js
const circleMarker = new Circle({
    style: {
        r: 10,
        stroke: '#1890FF',
    },
});

path.style.markerMid = circleMarker;
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Vg1OQ5mGaG4AAAAAAAAAAAAAARQnAQ" alt="marker mid" width="400">

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*2Pi6SpcqPwAAAAAAAAAAAAAAARQnAQ" alt="unclosed path marker" width="200">

### markerStartOffset

可以参考 [Polyline](/zh/api/basic/polyline) 的 [markerStartOffset](/zh/api/basic/polyline#markerstartoffset) 属性。marker 会沿路径中第一段的切线方向移动，同时主体路径也会进行相应延长或缩短。需要注意的是主体路径的伸缩距离也是有限的，当超过了第一段的长度，会产生“拐弯”的效果，如下图所示：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*2DI5TpGasHcAAAAAAAAAAAAAARQnAQ" alt="marker start offset" width="200">

因此该属性适合“微调”，而非大幅改变路径定义。

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<length\>](/zh/api/css/css-properties-values-api#length)     |

### markerEndOffset

可以参考 [Polyline](/zh/api/basic/polyline) 的 [markerEndOffset](/zh/api/basic/polyline#markerendoffset) 属性。marker 会沿路径中最后一段的切线方向移动，同时主体路径也会进行相应延长或缩短。

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<length\>](/zh/api/css/css-properties-values-api#length)     |

### isBillboard

3D 场景中生效，始终朝向屏幕，因此线宽不受透视投影影像。默认值为 `false`。

### isSizeAttenuation

开启 isBillboard 后，在透视投影下，是否进行尺寸衰减。在透视投影中遵循“近大远小”的视觉效果，如果希望保持大小始终一致不受深度影响，可以开启该选项。

## 方法

### getTotalLength

获取路径长度。

<https://developer.mozilla.org/zh-CN/docs/Web/API/SVGGeometryElement/getTotalLength>

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

### getPoint

根据长度比例（取值范围 `[0-1]`）获取局部或世界坐标系下点的坐标。

参数如下：

-   `ratio` 必填，长度比例
-   `inWorldSpace` 可选，表示是否在世界坐标系下计算。默认值为 `false`

其中 `Point` 的格式为:

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

值得注意的是，如果超出取值范围 `[0-1]`，会返回路径头尾的点坐标。对于非法路径，该方法会返回 `Point {x: NaN, y: NaN}`

另外在原路径上应用的，在局部坐标系下的变换也会应用到返回的点上。例如在该[示例](/zh/examples/shape/path#path)中，路径本身经过了平移和缩放：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*fOKWRIq_IWsAAAAAAAAAAAAAARQnAQ" width="300" alt="get point of a path">

### getPointAtLength

沿路径返回给定距离的点。

参数如下：

-   `distance` 必填，从起点出发的距离值
-   `inWorldSpace` 可选，表示是否在世界坐标系下计算。默认值为 `false`

<https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getPointAtLength>

```js
path.getPointAtLength(100); // Point {x: 300, y: 100}
```

### getStartTangent

获取起点的切向量 `number[][]`，形如: `[[10, 10], [20, 20]]`

### getEndTangent

获取终点的切向量 `number[][]`，形如: `[[10, 10], [20, 20]]`
