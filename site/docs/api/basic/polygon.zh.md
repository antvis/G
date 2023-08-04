---
title: Polygon 多边形
order: 7
---

可以参考 SVG 的 [\<polygon\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/polygon) 元素。

如下 [示例](/zh/examples/shape/polygon#polygon) 定义了一个多边形：

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

## 继承自

继承了 [DisplayObject](/zh/api/basic/display-object) 的 [样式属性](/zh/api/basic/display-object#绘图属性)。

### anchor

默认值为 `[0, 0]`。详见 [DisplayObject anchor](/zh/api/basic/display-object#anchor)

### transformOrigin

默认值为 `left top`。详见 [DisplayObject transformOrigin](/zh/api/basic/display-object#transformOrigin)

### lineWidth

默认值为 `'1'`。详见 [DisplayObject lineWidth](/zh/api/basic/display-object#lineWidth)

### miterLimit

默认值 `4`。详见 [DisplayObject miterLimit](/zh/api/basic/display-object#miterLimit)

## 额外属性

### points

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

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/points>

### markerStart

可以参考 [Polyline](/zh/api/basic/polyline) 的 [markerStart](/zh/api/basic/polyline#markerstart) 属性。

但和 Polyline 不同的是，由于多边形是**闭合**的，因此 “起始点” 和 “终止点” 的位置是完全重合的，由 [points](/zh/api/basic/polygon#points) 中的第一个点决定。这也与 SVG 原生实现保持一致，下图展示了同时定义 markerStart 和 markerEnd 后的重合效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*mXYATLithEUAAAAAAAAAAAAAARQnAQ" alt="polygon end/start overlap" width="400">

在该[示例](/zh/examples/shape/polygon#polygon)中，我们在多边形的“起始点”上放置了一个箭头：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*RRPTRIpZoUIAAAAAAAAAAAAAARQnAQ" alt="polygon marker" width="200">

```js
const arrowMarker = new Path({
    style: {
        path: 'M 10,10 L -10,0 L 10,-10 Z',
        stroke: '#1890FF',
        anchor: '0.5 0.5',
        transformOrigin: 'center',
    },
});

polygon.style.markerStart = arrowMarker;
```

### markerEnd

可以参考 [Polyline](/zh/api/basic/polyline) 的 [markerEnd](/zh/api/basic/polyline#markerend) 属性。

但和 Polyline 不同的是，由于多边形是**闭合**的，因此 “起始点” 和 “终止点” 的位置是完全重合的。“终止点” 由 [points](/zh/api/basic/polygon#points) 中的第一个点决定。

在该[示例](/zh/examples/shape/polygon#polygon)中，我们在多边形的终止点上放置了一个图片：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*eZHETJ0B3lkAAAAAAAAAAAAAARQnAQ" alt="polygon marker" width="200">

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

polygon.style.markerEnd = imageMarker;
```

### markerMid

可以参考 SVG 的[同名属性](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/marker-mid)。

在多边形除了 “起始点” / “终止点” 之外的每一个顶点上放置标记图形。

例如下图中在多边形上除首尾的每个顶点上都放置了一个 [Circle](/zh/api/basic/circle)：

```js
const circleMarker = new Circle({
    style: {
        r: 10,
        stroke: '#1890FF',
    },
});

polygon.style.markerMid = circleMarker;
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*jaFPRbpzpJwAAAAAAAAAAAAAARQnAQ" alt="marker mid" width="200">

### markerStartOffset

可以参考 [Polyline](/zh/api/basic/polyline) 的 [markerStartOffset](/zh/api/basic/polyline#markerstartoffset) 属性。

沿多边形的第一个线段方向移动标记图形，同时会改变原始多边形的形状。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*4l7xQoYcXngAAAAAAAAAAAAAARQnAQ" alt="marker start offset">

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<length\>](/zh/api/css/css-properties-values-api#length)     |

### markerEndOffset

可以参考 [Polyline](/zh/api/basic/polyline) 的 [markerEndOffset](/zh/api/basic/polyline#markerendoffset) 属性。

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<length\>](/zh/api/css/css-properties-values-api#length)     |
