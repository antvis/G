---
title: Line 直线
order: 6
---

可以参考 SVG 的 [\<line\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/line) 元素。

如下 [示例](/zh/examples/shape/line/#line) 定义了一条直线，两个端点分别为 `[200, 100]` 和 `[400, 100]`，线宽为 2，而且是一条虚线：

```javascript
const line1 = new Line({
    style: {
        x1: 200,
        y1: 100,
        x2: 400,
        y2: 100,
        stroke: '#1890FF',
        lineWidth: 2,
        lineDash: [10, 10],
    },
});
```

对于直线，默认锚点定义的位置为包围盒左上角顶点，其中两个端点坐标 `[x1, y1]` `[x2, y2]` 定义在局部坐标系下，因此如果此时获取该直线在局部坐标系的坐标，会得到 `[x1, y1]` 的坐标，即 `[200, 100]`：

```js
line1.getLocalPosition(); // [200, 100]
```

对于上面的直线为 `(200, 100)`。当我们想沿 X 轴向右移动该直线 100 距离时，可以有以下三种做法：

-   使用 translate 在世界坐标系下平移一段相对距离
-   使用 setPosition 设置世界坐标系下的绝对坐标
-   直接修改直线定义中的 x1/x2 属性

```javascript
// 平移相对距离，此时 x1/x2 不变
line1.translate(100, 0);
// 或者，直接设置锚点位置
line1.setPosition(200 + 100, 0);
// 或者，直接移动两个端点
line1.style.x1 = 200 + 100;
line1.style.x2 = 400 + 100;
```

如果想更改默认的锚点位置，可以通过 `anchor` 属性修改，例如把直线的中点作为锚点，此时直线局部坐标系下的坐标不变，但会把锚点移动到 `[200, 100]`，因此展示效果会发生改变：

```js
line.style.anchor = [0.5, 0.5];
line.getLocalPosition(); // [200, 100]
```

## 继承自

继承了 [DisplayObject](/zh/api/basic/display-object) 的 [样式属性](/zh/api/basic/display-object#绘图属性)。

### anchor

默认值为 `[0, 0]`。详见 [DisplayObject anchor](/zh/api/basic/display-object#anchor)

### transformOrigin

默认值为 `left top`。详见 [DisplayObject transformOrigin](/zh/api/basic/display-object#transformOrigin)

### lineWidth

默认值为 `'1'`。详见 [DisplayObject lineWidth](/zh/api/basic/display-object#lineWidth)

## 额外属性

### x1

局部坐标系下，第一个端点的 x 轴坐标。

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/x1>

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### y1

局部坐标系下，第一个端点的 y 轴坐标。

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/y1>

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### z1

局部坐标系下，第一个端点的 z 轴坐标。

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### x2

局部坐标系下，第二个端点的 x 轴坐标。

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/x2>

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### y2

局部坐标系下，第二个端点的 y 轴坐标。

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/y2>

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### z2

局部坐标系下，第二个端点的 z 轴坐标。

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### isBillboard

3D 场景中生效，始终朝向屏幕，因此线宽不受透视投影影像。默认值为 `false`。[示例](/zh/examples/3d#force-3d)

### markerStart

可以参考 SVG 的 [同名属性](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/marker-start)。

在直线的 “起始点” 处添加一个标记图形，其中 “起始点” 为 [x1/y1](/zh/api/basic/line#x1) 定义的端点。

在下面的 [示例](/zh/examples/shape/line#line) 中，我们首先使用 [Path](/zh/api/basic/path) 创建了一个箭头，然后通过该属性把它添加到了直线的起点上：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Ft0URoJ4joYAAAAAAAAAAAAAARQnAQ" width="200" alt="arrowhead">

```js
// 创建一个标记图形
const arrowMarker = new Path({
    style: {
        path: 'M 10,10 L -10,0 L 10,-10 Z',
        stroke: '#1890FF',
        anchor: '0.5 0.5',
        transformOrigin: 'center',
    },
});

const arrowLine = new Line({
    style: {
        x1: 200,
        y1: 250,
        x2: 400,
        y2: 250,
        stroke: '#1890FF',
        lineWidth: 2,
        markerStart: arrowMarker, // 放置在直线的 “起始点” 上
    },
});
```

标记图形可以是任意图形，我们会将它放置在合适的位置并调整好朝向。当直线的定义改变时，也会随之自动调整。

当然你也可以手动调整它的 [anchor](/zh/api/basic/display-object#anchor), [transformOrigin](/zh/api/basic/display-object#transformorigin) 和 [transform](/zh/api/basic/display-object#transform)，例如在该 [示例](/zh/examples/shape/line#line) 中，我们将 [Image](/zh/api/basic/image) 作为标记图形，手动旋转了 90 度：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*fWUrQKbwGngAAAAAAAAAAAAAARQnAQ" width="200" alt="image arrowhead">

```js
const imageMarker = new Image({
    style: {
        width: 50,
        height: 50,
        img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
        anchor: [0.5, 0.5],
        transformOrigin: 'center',
        transform: 'rotate(90deg)',
    },
});
```

如果想取消设置标记图形，可以设置为 null 或者空字符串：

```js
line.style.markerStart = null;
```

在实现中直线和标记图形的关系为父子关系：

```js
Line
  -> Path(#markerStart)
  -> Path(#markerEnd)
```

使用 [childNodes](/zh/api/builtin-objects/node#childnodes) 也能发现这一点：

```js
line.style.markerStart = arrowHead;
line.childNodes; // [Path]
```

“起始点” 和 “终止点” 可以设置为同一个标记图形，内部首先会使用 [cloneNode](/zh/api/builtin-objects/node#clonenode) 生成新的图形。因此一旦我们指定了标记图形，后续想修改它的属性就不能在原始图形上操作，需要通过 [childNodes](/zh/api/builtin-objects/node#childnodes) 获取：

```js
line.style.markerStart = arrowhead;
line.style.markerEnd = arrowhead;

// wrong
arrowhead.style.stroke = 'red';

// correct!
line.childNodes[0].style.stroke = 'red';
```

### markerEnd

可以参考 SVG 的 [同名属性](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/marker-end)。

在直线的 “终止点” 处添加一个标记图形，其中 “终止点” 为 [x2/y2](/zh/api/basic/line#x2) 定义的端点。

### markerStartOffset

有时我们想调整标记图形的位置，为此我们提供了该选项沿直线方向增加一定偏移量，正偏移量向内，负偏移量向外。

在 [示例](/zh/examples/shape/line#line) 中，我们通过操作该属性让直线实现“伸缩效果”：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Uc-wSYP9sYUAAAAAAAAAAAAAARQnAQ">

值得注意的是，虽然偏移量会让直线在视觉效果上发生变化，但并不会影响 [x1/y1/x2/y2](/zh/api/basic/line#x1) 这些属性值。

在 [示例](/zh/examples/shape/line#marker) 中，直线端点与两端的圆心重合，但为了避免箭头与两端的节点重合，需要向内缩进一定距离：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*X5W_TYz-2SIAAAAAAAAAAAAAARQnAQ" alt="arrow marker" width="200">

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<length\>](/zh/api/css/css-properties-values-api#length)     |

### markerEndOffset

调整 “终止点” 处标记图形的位置，正偏移量向内，负偏移量向外。

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<length\>](/zh/api/css/css-properties-values-api#length)     |

## 方法

### getTotalLength

获取直线长度。

<https://developer.mozilla.org/zh-CN/docs/Web/API/SVGGeometryElement/getTotalLength>

```js
line.getTotalLength(); // 200
```

### getPointAtLength

沿路径返回给定距离的点，通过第二个可选参数控制在局部还是世界坐标系下：

参数如下：

-   `distance` 必填，距离值
-   `inWorldSpace` 可选，表示是否在世界坐标系下计算。默认值为 `false`

其中 `Point` 的格式为:

```ts
export type Point = {
    x: number;
    y: number;
};
```

<https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getPointAtLength>

例如获取直线上局部坐标系下从起点出发 100 距离的点坐标：

```js
line.getPointAtLength(100); // Point {x: 300, y: 100}
```

### getPoint

根据长度比例（取值范围 `[0-1]`）获取直线上局部或世界坐标系下的点坐标。

参数如下：

-   `ratio` 必填，长度比例
-   `inWorldSpace` 可选，表示是否在世界坐标系下计算。默认值为 `false`

例如获取上面定义直线的中点：

```js
line.getPoint(0.5); // Point {x: 300, y: 100}
```

## 3D 场景中的线

需要配合 `g-webgl` 渲染器与 `g-plugin-3d` 插件使用。

将端点坐标拓展到三维：

```js
new Line({
    style: {
        x1: 200,
        y1: 100,
        z1: 0, // Z 轴坐标
        x2: 400,
        y2: 100,
        z2: 100, // Z 轴坐标
    },
});
```

2D 的线在正交投影下可以保证一致的宽度，但是在透视投影下就无法保证了。在某些需要时刻保持线宽一致的 3D 场景下，可以开启 [isBillboard](/zh/api/basic/line#isbillboard)，[示例](/zh/examples/3d#force-3d)
