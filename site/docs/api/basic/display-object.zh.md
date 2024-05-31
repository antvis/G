---
title: DisplayObject
order: 0
redirect_from:
  - /zh/api/basic
---

DisplayObject 是所有图形的基类，例如 [Group](/zh/api/basic/group) [Circle](/zh/api/basic/circle) [Text](/zh/api/basic/text) 等都会继承它。

我们尝试让它尽可能兼容 [DOM Element](https://developer.mozilla.org/en-US/docs/Web/API/Element)，除了能降低学习成本，还能将自身伪装成 DOM Element 来充分利用已有的 Web 生态，例如：

- 使用 CSS 选择器进行[高级查询](/zh/plugins/css-select)
- 使用 Hammer.js [扩展手势](/zh/api/event#直接使用-hammerjs)
- 使用 Interact.js [实现 Drag&Drop，Resize](/zh/api/event#直接使用-interactjs)
- 保留 D3 的数据处理，[替换渲染层](/zh/guide/diving-deeper/d3)
- 保留 Observable Plot 的数据处理，[替换渲染层](/zh/guide/diving-deeper/plot)

## 继承自

[Element](/zh/api/builtin-objects/element)

## id

https://developer.mozilla.org/en-US/docs/Web/API/Element/id

全局唯一的标识，可通过 [getElementById](/zh/api/display-object#高级查询) 查询。

```js
const circle = new Circle({
  id: 'my-circle-id',
  style: {
    r: 10,
  },
});
circle.id; // 'my-circle-id'
canvas.getElementById('my-circle-id'); // circle
```

## name

https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByName

图形名称，不要求全局唯一，可通过 [getElementsByName](/zh/api/display-object#高级查询) 查询。

```js
const circle = new Circle({
  name: 'my-circle-name',
  style: {
    r: 10,
  },
});
circle.name; // 'my-circle-name'
canvas.getElementsByName('my-circle-name'); // [circle]
```

## className

https://developer.mozilla.org/en-US/docs/Web/API/Element/className

图形拥有的类名，可通过它获取/设置图形的类名。后续可以使用 [getElementsByClassName](/zh/api/display-object#高级查询) 查询。

```js
const circle = new Circle({
  className: 'my-circle-classname',
  style: {
    r: 10,
  },
});
circle.className; // 'my-circle-classname'
canvas.getElementsByClassName('my-circle-classname'); // [circle]
```

可以使用空格隔开多个类名，随后使用 [classList](/zh/api/builtin-objects/element#classlist) 只读属性获取类名列表：

```js
circle.className = 'c1 c2';
circle.classList; // ['c1', 'c2']
```

未指定类名将返回空字符串：

```js
const group = new Group();
group.className; // ''
```

最后在设置时还可以使用 `class` 作为别名：

```js
const group = new Group({
  class: 'my-classname',
  // className: 'my-classname'
});

group.setAttribute('class', 'my-classname');

// 但不可以使用 class 属性，为保留字
group.class;
```

## interactive

是否支持响应[事件](/zh/api/event)，默认为 `true`。在某些不需要支持交互的图形上可以关闭。

例如我们不想让下面这个圆响应鼠标 `mouseenter/leave` 事件，[示例](/zh/examples/event#circle)

```js
// 初始化时禁止交互
const circle = new Circle({
  interactive: false,
  style: {
    r: 100,
  },
});

// 或者后续禁止
circle.interactive = false;
```

推荐使用 [pointerEvents](/zh/api/basic/display-object#pointerevents) 属性，因此上面禁止交互的操作等同于：

```js
circle.style.pointerEvents = 'none';
```

## 绘图属性

绘图属性通过 `style` 设置，通常包含了填充色、透明度等**通用属性**，不同类型的图形也有自己的**额外属性**，例如在下面的圆角矩形中，填充色 `fill`、描边色 `stroke` 就是通用属性，而矩形的左上角顶点位置`(x, y)`、尺寸 `width/height` 和圆角半径 `radius` 则是额外属性：

```javascript
const rect = new Rect({
  style: {
    // 或者使用 attrs
    x: 200,
    y: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    width: 300,
    height: 200,
    radius: 8,
  },
});
```

属性名也可以使用连字符形式，因此以下写法完全等同，完整用法详见[获取/设置属性值](/zh/api/basic/display-object#获取设置属性值)：

```js
const rect = new Rect({
  'line-width': 4,
  // lineWidth: 4,
});

rect.style.lineWidth = 4;
rect.style['line-width'] = 4;
rect.style.setProperty('lineWidth', 4);
rect.style.setProperty('line-width', 4);
```

### 位置

图形在局部坐标系下的初始位置，根据图形种类使用不同属性描述，后续也可以通过 [setLocalPosition](/zh/api/display-object#平移) 重新设置。

#### transform

我们提供了在局部坐标系下进行变换的快捷方式，同时与 [CSS Transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform) 保持一致，支持以下[transform-function 变换函数](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-function)：

- 缩放，无单位
  - scale(x, y)
  - scaleX(x)
  - scaleY(x)
  - scaleZ(z)
  - scale3d(x, y, z)
- 平移，0 可以不加单位，无单位当作 px 处理，百分比相对于当前图形包围盒
  - translate(0, 0) translate(0, 30px) translate(100%, 100%)
  - translateX(0)
  - translateY(0)
  - translateZ(0)
  - translate3d(0, 0, 0)
- 旋转，支持 deg rad turn 这些角度单位
  - rotate(0.5turn) rotate(30deg) rotate(1rad)
- 拉伸，支持 deg rad turn 这些角度单位
  - skew(ax, ay)
  - skewX(a)
  - skewY(a)
- 矩阵
  - matrix()
  - matrix3d()
- none 清除变换

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| `'none'`                                                      | 所有     | 否                                    | 是           | `<transform>`                                                  |

由于是在局部坐标系下进行变换，因此以下写法在视觉效果上一致：

```js
// 使用 transform 属性
const circle = new Circle({
  style: {
    transform: 'translate(100px, 100px)',
    r: 100,
  },
});

// 直接设置 cx/cy
const circle = new Circle({
  style: {
    cx: 100,
    cy: 100,
    r: 100,
  },
});

// 使用变换方法
const circle = new Circle({
  style: {
    r: 100,
  },
});
circle.translateLocal(100, 100);
```

#### transformOrigin

旋转与缩放中心，也称作变换中心，相对于 Bounds 定义。

和 CSS [transform-origin](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-origin) 类似，支持以下字符串写法，其中用空格分隔：

- 一个值
  - 单位为 px 的长度，例如 10px
  - 单位为 % 的长度，例如 50%
  - 关键词 left, center, right, top, bottom，等于用百分比表示，例如 left 等于 0%，center 等于 50%
- 两个值
  - 第一个是单位为 px 或 % 的长度，或 left, center, right 关键字中的一个
  - 第二个是单位为 px 或 % 的长度，或 top, center, bottom 关键字中的一个

因此以下写法等价：

```js
// r = 100
circle.style.transformOrigin = 'left';
circle.style.transformOrigin = 'left center'; // 包围盒水平方向左侧边缘，垂直方向中点
circle.style.transformOrigin = '0 50%'; // 包围盒水平方向左侧边缘距离为 0，垂直方向距离顶部 50% 高度
circle.style.transformOrigin = '0 100px'; // 包围盒水平方向左侧边缘距离为 0，垂直方向距离顶部 100px
```

⚠️ 暂不支持三个值的写法。

不同图形的默认值也不同：

- [Text](/zh/api/basic/text) 为文本锚点位置，应该使用 [textBaseline](http://localhost:8000/zh/api/basic/text#textbaseline) 与 [textAlign](/zh/api/basic/text#textalign) 这两个属性设置，因此设置此属性无效

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| 不同图形各异                                                  | 所有     | 否                                    | 否           | `<transform-origin>`                                           |

### 填充

#### opacity

图形整体透明度，取值范围为 `[0, 1]`，支持 `number` 与 `string` 两种类型，因此以下两种写法等价：

```js
circle.style.opacity = 0.5;
circle.style.opacity = '0.5';
```

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| '1'                                                           | 所有     | 否                                    | 是           | [\<number\>](/zh/api/css/css-properties-values-api#number)     |

#### fillOpacity

填充色透明度，取值范围为 `[0, 1]`，支持 `number` 与 `string` 两种类型，因此以下两种写法等价：

```js
circle.style.fillOpacity = 0.5;
circle.style.fillOpacity = '0.5';
```

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| '1'                                                           | 所有     | 是                                    | 是           | [\<number\>](/zh/api/css/css-properties-values-api#number)     |

#### fill

填充色，支持 `string` 类型，详见 [\<paint\>](/zh/api/css/css-properties-values-api#paint)：

```js
circle.style.fill = 'red';
circle.style.fill = 'rgb(255, 0, 0)';
```

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| 'none'                                                        | 所有     | 否                                    | 是           | [\<paint\>](/zh/api/css/css-properties-values-api#paint)       |

#### fillRule

该属性定义了用来确定一个多边形内部区域的算法，支持以下取值：

- `'nonzero'` 默认值 https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/fill-rule#nonzero
- `'evenodd'` https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/fill-rule#evenodd

该 [示例](/zh/examples/shape#polygon) 依次展示了 `'nonzero'` 和 `'evenodd'` 的填充效果：

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*LgwCQ7mL4GoAAAAAAAAAAAAAARQnAQ" alt="fill rule" width="200">

### 描边

#### strokeOpacity

描边透明度，取值范围为 `[0, 1]`，支持 `number` 与 `string` 两种类型，因此以下两种写法等价：

```js
circle.style.strokeOpacity = 0.5;
circle.style.strokeOpacity = '0.5';
```

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| '1'                                                           | 所有     | 是                                    | 是           | [\<number\>](/zh/api/css/css-properties-values-api#number)     |

#### stroke

描边色，支持 `string` 类型，详见 [\<paint\>](/zh/api/css/css-properties-values-api#paint)：

```js
circle.style.stroke = 'red';
circle.style.stroke = 'rgb(255, 0, 0)';
```

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| 'none'                                                        | 所有     | 否                                    | 是           | [\<paint\>](/zh/api/css/css-properties-values-api#paint)       |

#### lineWidth

描边宽度。与我们熟悉的 [CSS box model](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing) 不同，边框的一半宽度在图形内，一半在图形外。例如下面这个圆的包围盒宽度为：`r + lineWidth / 2 = 110`

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*f0-CTpClWkMAAAAAAAAAAAAAARQnAQ" width="300">

支持 `number` 和 `string` 类型，前者默认为以 `px` 为单位的长度值，以下写法等价：

```js
circle.style.lineWidth = 1;
circle.style.lineWidth = '1';
circle.style.lineWidth = '1px';
```

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| '1'                                                           | 所有     | 是                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

#### lineCap

端点样式，支持以下取值：

- 'butt' 默认值。线段末端以方形结束。
- 'round' 线段末端以圆形结束。
- 'square' 线段末端以方形结束，但是增加了一个宽度和线段相同，高度是线段厚度一半的矩形区域。

https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/lineCap

#### lineJoin

连接处样式，支持以下取值：

- 'miter' 默认值。通过延伸相连部分的外边缘，使其相交于一点，形成一个额外的菱形区域。这个设置可以通过 [miterLimit](/zh/api/basic/display-object#miterlimit) 属性看到效果。
- 'round' 通过填充一个额外的，圆心在相连部分末端的扇形，绘制拐角的形状。 圆角的半径是线段的宽度。
- 'bevel' 在相连部分的末端填充一个额外的以三角形为底的区域， 每个部分都有各自独立的矩形拐角。

https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/lineJoin

#### miterLimit

斜接面限制比例。SVG 和 Canvas2D 的默认值不同，前者为 4 而后者为 10。我们给 [Path](/zh/api/basic/path) [Polyline](/zh/api/basic/polyline) [Polygon](/zh/api/basic/polygon) 这三种图形设置为 4，其余图形设置为 10。

https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/miterLimit

#### lineDash

使用 `number[]` 描述交替绘制的线段和间距。可参考：https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/setLineDash

目前仅支持形如：`[dash, gap]` 的形式，如果数组中仅有一个元素，即 `[dash]` 等价于 `[dash, dash]`。

对它应用动画可以实现[笔迹动画效果](/zh/api/animation/waapi#笔迹动画)。

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8NOsQoWLm2IAAAAAAAAAAAAAARQnAQ)

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| 无                                                            | 所有     | 是                                    | 是           |                                                                |

#### lineDashOffset

虚线偏移量，`number` 类型，对它进行变换可以实现[蚂蚁线动画](/zh/api/animation/waapi#蚂蚁线)

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*TTyTTISXlKAAAAAAAAAAAAAAARQnAQ)

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                           | 所有     | 是                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### 阴影

在图形底部增加阴影效果，支持配置阴影颜色，模糊半径和水平/垂直偏移距离。[示例](/zh/examples/shape#circle)

阴影不会影响图形的 [Geometry Bounds](/zh/api/basic/concept#包围盒)，例如下图中给一个半径为 100 的圆添加阴影后，几何包围盒尺寸不变：

```js
circle.getBounds(); // { halfExtents: [100, 100] }
circle.style.shadowBlur = 20;
circle.getBounds(); // { halfExtents: [100, 100] }
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*shbSR55j_iQAAAAAAAAAAAAAARQnAQ" width="200" alt="outer shadow">

当然外阴影会使 [Render Bounds](/zh/api/basic/concept#包围盒) 增大，内阴影则不会。

最后，阴影会对渲染性能造成非常大影响。

#### shadowType

目前我们支持两种阴影：

- `'outer'` 外阴影，也是该属性的默认值。阴影出现在图形填充或者描边的外侧。
- `'inner'` 内阴影。顾名思义阴影在图形内部，如下图所示。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*0uHfQa00ZeYAAAAAAAAAAAAAARQnAQ" width="200" alt="inner shadow">

#### shadowColor

阴影色，支持 `string` 类型，例如 `'#1890FF'`。不支持渐变或者纹理写法。

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| 无                                                            | 所有     | 否                                    | 是           | [\<color\>](/zh/api/css/css-properties-values-api#color)       |

#### shadowBlur

阴影效果模糊程度，`number` 类型，不允许为负数。越大代表越模糊，为 0 时无模糊效果。

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| 无                                                            | 所有     | 否                                    | 是           | [\<number\>](/zh/api/css/css-properties-values-api#number)     |

#### shadowOffsetX

水平方向偏移量，支持 `number` 或 `string` 类型，例如负数让阴影往左移，正数向右

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 无                                                            | 所有     | 否                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

#### shadowOffsetY

垂直方向偏移量，例如负数让阴影往上移，正数向下

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 无                                                            | 所有     | 否                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### 滤镜

滤镜（Filter）可以对已生成的图像进行一些处理，例如模糊、高亮、提升对比度等。在 Web 端有以下实现：

- CSS Filter：https://developer.mozilla.org/en-US/docs/Web/CSS/filter
- Canvas Filter：https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/filter
- SVG Filter：https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/filter
- WebGL 中一般称作后处理

参考 CSS Filter 语法，我们支持对图形应用一个或多个滤镜效果，[示例](/zh/examples/shape#filter)：

```js
circle.style.filter = 'blur(5px)';
circle.style.filter = 'blur(5px) brightness(0.4)'; // 可叠加
```

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*3MxRTpAT77gAAAAAAAAAAAAAARQnAQ)

目前可以在 g-canvas/svg/webgl 渲染器中使用滤镜，有以下注意事项：

- 由于 Canvas Filter 支持度不佳，主要是 [Safari 不支持](https://caniuse.com/mdn-api_canvasrenderingcontext2d_filter)，因此使用 g-canvas 无法在 Safari 中正常展示滤镜
- g-canvas 和 g-svg 在部分 filter 效果上略有差异
- 可以施加在所有基础图形以及 Group 上
- 该属性暂不支持动画

#### blur

将高斯模糊应用于输入图像。其中 radius 定义了高斯函数的标准偏差值，或者屏幕上有多少像素相互融合，因此较大的值将产生更多的模糊，默认值为 0。该参数可以指定为 CSS 长度，但不接受百分比值。

和阴影一样，模糊同样不会影响图形的包围盒尺寸。

```js
circle.style.filter = 'blur(5px)';
```

下图依次展示了 2px 4px 和 10px 的模糊效果，[示例](/zh/examples/shape#filter)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*rYA_TLechgYAAAAAAAAAAAAAARQnAQ)

#### brightness

将线性乘法器应用于输入图像，让它变亮或变暗，默认值为 1。值为 0％ 将创建全黑图像。值为 100％ 会使输入保持不变。其他值是效果的线性乘数。如果值大于 100% 提供更明亮的结果。

```js
circle.style.filter = 'brightness(2)';
circle.style.filter = 'brightness(200%)';
```

下图依次展示了 0 100% 和 200% 的明亮效果，[示例](/zh/examples/shape#filter)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*LG_pQ6GzA3wAAAAAAAAAAAAAARQnAQ)

#### drop-shadow

在图像下展示阴影，可以设置阴影颜色、偏移量与模糊效果，依次传入以下参数：

- offset-x 描述阴影的水平偏移距离，单位 px
- offset-y 描述阴影的垂直偏移距离，单位 px
- blur-radius 数值越大越模糊，单位 px，不允许为负数
- color 阴影颜色

阴影不会影响图形的包围盒尺寸。

```js
circle.style.filter = 'drop-shadow(16px 16px 10px black)';
```

下图依次展示了上面配置的效果，[示例](/zh/examples/shape#filter)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*shbSR55j_iQAAAAAAAAAAAAAARQnAQ)

#### contrast

调节图像的对比度。当数值为 0% 时，图像会完全变黑。当数值为 100% 时，图像没有任何变化。

```js
circle.style.filter = 'contrast(2)';
circle.style.filter = 'contrast(200%)';
```

下图依次展示了 0 1 和 10 的对比度效果，[示例](/zh/examples/shape#filter)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*gc-1QJYr2awAAAAAAAAAAAAAARQnAQ)

#### grayscale

将图像转换成灰色的图片。当值为 100% 时，图像会完全变成灰色。 当值为 0% 时，图像没有任何变化。

```js
circle.style.filter = 'grayscale(1)';
circle.style.filter = 'grayscale(100%)';
```

下图依次展示了 0 50% 和 100% 的灰度效果，[示例](/zh/examples/shape#filter)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*OadOQLl_bH0AAAAAAAAAAAAAARQnAQ)

#### saturate

对图像进行饱和度的处理。当值为 0% 时，图像完全不饱和。当值为 100% 时，图像没有任何变化。

```js
circle.style.filter = 'saturate(1)';
circle.style.filter = 'saturate(100%)';
```

下图依次展示了 0 50% 和 100% 的饱和度效果，[示例](/zh/examples/shape#filter)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8J4IRJTJcVUAAAAAAAAAAAAAARQnAQ)

#### sepia

对图像进行深褐色处理（怀旧风格）。当值为 100% 时，图像完全变成深褐色。当值为 0% 时，图像没有任何变化。

```js
circle.style.filter = 'sepia(1)';
circle.style.filter = 'sepia(100%)';
```

下图依次展示了 0 50% 和 100% 的处理效果，[示例](/zh/examples/shape#filter)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*79UARqYrimcAAAAAAAAAAAAAARQnAQ)

#### hue-rotate

在输入图像上应用色相旋转，可设定图像会被调整的色环角度值。值为 0deg 时图像无变化。

```js
circle.style.filter = 'hue-rotate(30deg)';
circle.style.filter = 'hue-rotate(180deg)';
```

下图依次展示了 0 90deg 和 180deg 的处理效果，[示例](/zh/examples/shape#filter)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*k8rsSbW4WRwAAAAAAAAAAAAAARQnAQ)

#### invert

反转输入图像的颜色。amount 的值定义转换的比例，100% 代表完全反转，0% 则图像无变化。

```js
circle.style.filter = 'invert(1)';
circle.style.filter = 'invert(100%)';
```

下图依次展示了 0 50% 和 100% 的反转效果，[示例](/zh/examples/shape#filter)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N1OjR6pR0CMAAAAAAAAAAAAAARQnAQ)

### zIndex

类似 CSS 的 `zIndex` 属性，用于控制渲染次序，需要注意：

1. 只会影响渲染顺序，并不会改变场景图中的节点结构
2. 只在当前上下文内生效
3. 默认展示次序为场景图添加顺序，后添加的在之前添加的元素之上

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| '0'                                                           | 所有     | 否                                    | 否           | [\<number\>](/zh/api/css/css-properties-values-api#number)     |

例如下面的场景图中，由于 li2 在 li1 之后加入画布，因此 li2 默认会展示在 li1 之上。如果希望改变这种展示次序，可以修改 li1 的 zIndex：

```js
// ul1 -> li1
//     -> li2
// ul2 -> li3

li1.style.zIndex = 1; // li1 在 li2 之上
```

再比如尽管 li2 的 zIndex 比 ul2 大很多，但由于 ul1 比 ul2 小，它也只能处于 ul2 之下，[示例](/zh/examples/scenegraph#z-index)

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*FfZhRYJ_rogAAAAAAAAAAAAAARQnAQ" alt="">

为了兼容旧版本，我们也提供了额外的、在上下文中设置的方法：

| 名称      | 参数     | 返回值 | 备注          |
| --------- | -------- | ------ | ------------- |
| setZIndex | `number` | 无     | 设置 `zIndex` |
| toFront   | 无       | 无     | 置顶          |
| toBack    | 无       | 无     | 置底          |

```javascript
const group = new Group();

group.setZIndex(100);
// or group.setAttribute('zIndex', 100);
// or group.style.zIndex = 100;
```

### visibility

控制图形的可见性，可参考：https://developer.mozilla.org/en-US/docs/Web/CSS/visibility

为了兼容旧版本，我们也提供了以下方法：

| 名称 | 参数 | 返回值 | 备注     |
| ---- | ---- | ------ | -------- |
| hide | 无   | 无     | 隐藏节点 |
| show | 无   | 无     | 展示节点 |

因此以下写法等价：

```javascript
const group = new Group();

group.style.visibility = 'hidden';
// or group.setAttribute('visibility', 'hidden');
// or group.hide();

group.style.visibility = 'visible';
// or group.setAttribute('visibility', 'visible');
// or group.show();
```

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| 'visible'                                                     | 所有     | 是                                    | 否           | [\<keywords\>](/zh/api/css/css-properties-values-api#关键词)   |

关于可见性有两点需要注意：

1. 隐藏的图形仍然可以被拾取，此时需要配合 [pointerEvents](/zh/api/basic/display-object#pointerevents) 使用
2. 隐藏的元素仍然需要参与包围盒运算，即仍会占据空间。如果想完全移除元素，应该使用 [removeChild](/zh/api/basic/display-object#添加删除节点)

### 裁剪

#### clipPath

使用裁剪方式创建元素的可显示区域，区域内的部分显示，区域外的隐藏。可参考 CSS 的 [clip-path](https://developer.mozilla.org/zh-CN/docs/Web/CSS/clip-path)。该属性值可以是任意图形，例如 Circle、Rect 等等。同一个裁剪区域可以被多个图形共享使用。最后，裁剪区域也会影响图形的拾取区域，[示例](/zh/examples/event#shapes)。

例如我们想创建一个裁剪成圆形的图片，让裁剪区域刚好处于图片中心（尺寸为 200 \* 200），此时我们可以设置裁剪区域圆形的世界坐标为 `[100, 100]`。[示例](/zh/examples/shape#clip)：

```js
const image = new Image({
  style: {
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    clipPath: new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 50,
      },
    }),
  },
});
```

也可以在创建图形之后设置裁剪区域，因此以上写法等价于：

```js
const image = new Image({
  style: {
    //... 省略其他属性
  },
});

image.style.clipPath = new Circle({
  style: {
    cx: 100,
    cy: 100,
    r: 50,
  },
});
// 或者兼容旧版写法
image.setClip(
  new Circle({
    style: {
      cx: 100,
      cy: 100,
      r: 50,
    },
  }),
);
```

当我们想清除裁剪区域时，可以设置为 `null`：

```js
image.style.clipPath = null;
// 或者
image.setClip(null);
```

#### 注意事项

裁剪区域图形本身也是支持修改属性的，受它影响，被裁剪图形会立刻重绘。

配合[动画系统](/zh/api/animation/waapi)我们可以对已经添加到画布中的裁剪区域图形进行变换，实现以下效果，[示例](/zh/examples/shape#clip)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Iy4RQZgT3EUAAAAAAAAAAAAAARQnAQ)

```js
// 对裁剪区域应用动画
clipPathCircle.animate(
  [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }],
  {
    duration: 1500,
    iterations: Infinity,
  },
);
```

我们暂不支持复合的裁剪区域，例如自定义图形以及 Group.

### 运动轨迹

在[路径动画](/zh/api/animation/waapi#路径动画)中，我们可以使用 `offsetPath` 指定一个图形的运动轨迹，配合[动画系统](/zh/api/animation/waapi#路径动画)对 `offsetDistance` 属性应用变换：

```js
const circle = new Circle({
  style: {
    offsetPath: new Line({
      // 创建运动轨迹
      style: {
        // 不需要设置其他与轨迹无关的绘图属性
        x1: 100,
        y1: 100,
        x2: 300,
        y2: 100,
      },
    }),
    r: 10,
  },
});

const animation = circle.animate(
  [
    { offsetDistance: 0 }, // 变换
    { offsetDistance: 1 },
  ],
  {
    duration: 3000,
    easing: 'ease-in-out',
    iterations: Infinity,
  },
);
```

#### offsetPath

指定路径轨迹，目前支持 [Line](/zh/api/basic/line) [Path](/zh/api/basic/path) 和 [Polyline](/zh/api/basic/polyline) 这三种图形。

#### offsetDistance

从路径起点出发行进的距离，取值范围为 `[0-1]`，0 代表路径起点，1 代表终点。

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| '0'                                                           | 所有     | 否                                    | 是           | [\<number\>](/zh/api/css/css-properties-values-api#number)     |

### 鼠标样式

当鼠标悬停在图形上时，我们可以改变它的样式，通过修改容器的 CSS 样式实现。

`cursor` 属性支持的值可以参考：https://developer.mozilla.org/zh-CN/docs/Web/CSS/cursor

```js
const circle = new Circle({
  style: {
    //... 省略其他属性
    cursor: 'pointer',
  },
});
```

### 响应交互事件

我们可以设置图形如何响应交互事件，例如命中拾取时展示鼠标样式，或者增大拾取区域。

#### pointerEvents

设置图形如何响应交互事件，可参考：https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events

简而言之，[fill](/zh/api/basic/display-object#fill) [stroke](/zh/api/basic/display-object#stroke) 和 [visibility](/zh/api/basic/display-object#visibility) 都可以独立或组合影响拾取判定行为。目前支持以下关键词：

- `'auto'` 默认值，等同于 `'visiblepainted'`。
- `'none'` 永远不会成为响应事件的目标。
- `'visiblepainted'` 满足以下条件才会响应事件：
  - [visibility](/zh/api/basic/display-object#visibility) 设置为 `'visible'`，即图形为可见的。
  - 在图形填充区域触发同时 [fill](/zh/api/basic/display-object#fill) 取非 `'none'` 的值。或者在图形描边区域触发同时 [stroke](/zh/api/basic/display-object#stroke) 取非 `'none'` 的值。
- `'visiblefill'` 满足以下条件才会响应事件：
  - [visibility](/zh/api/basic/display-object#visibility) 设置为 `'visible'`，即图形为可见的。
  - 在图形填充区域触发，不受 [fill](/zh/api/basic/display-object#fill) 取值的影响。
- `'visiblestroke'` 满足以下条件才会响应事件：
  - [visibility](/zh/api/basic/display-object#visibility) 设置为 `'visible'`，即图形为可见的。
  - 在图形描边区域触发，不受 [stroke](/zh/api/basic/display-object#stroke) 取值的影响。
- `'visible'` 满足以下条件才会响应事件：
  - [visibility](/zh/api/basic/display-object#visibility) 设置为 `'visible'`，即图形为可见的。
  - 在图形填充或者描边区域触发，不受 [fill](/zh/api/basic/display-object#fill) 和 [stroke](/zh/api/basic/display-object#stroke) 取值的影响。
- `'painted'` 满足以下条件才会响应事件：
  - 在图形填充区域触发同时 [fill](/zh/api/basic/display-object#fill) 取非 `'none'` 的值。或者在图形描边区域触发同时 [stroke](/zh/api/basic/display-object#stroke) 取非 `'none'` 的值。不受 [visibility](/zh/api/basic/display-object#visibility) 取值的影响。
- `'fill'` 满足以下条件才会响应事件：
  - 在图形填充区域触发，不受 [fill](/zh/api/basic/display-object#fill) 取值的影响。不受 [visibility](/zh/api/basic/display-object#visibility) 取值的影响。
- `'stroke'` 满足以下条件才会响应事件：
  - 在图形描边区域触发，不受 [stroke](/zh/api/basic/display-object#stroke) 取值的影响。不受 [visibility](/zh/api/basic/display-object#visibility) 取值的影响。
- `'all'` 只要进入图形的填充和描边区域就会响应事件。因此不会受 [fill](/zh/api/basic/display-object#fill) [stroke](/zh/api/basic/display-object#stroke) [visibility](/zh/api/basic/display-object#visibility) 的取值影响。

在该 [示例](/zh/examples/shape#circle) 中，我们将该属性设置为 `stroke`，因此填充区域不会响应事件：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*2a6jSpYP0LoAAAAAAAAAAAAAARQnAQ" alt="pointer-events stroke">

在该 [示例](/zh/examples/style#inheritance) 中，基于继承机制我们能很方便的控制可交互性：

```js
// 整个画布不响应交互事件
canvas.document.documentElement.style.pointerEvents = 'none';
```

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| 'auto'                                                        | 所有     | 是                                    | 否           | [\<keywords\>](/zh/api/css/css-properties-values-api#关键词)   |

#### increasedLineWidthForHitTesting

当 [lineWidth](/zh/api/basic/display-object#linewidth) 较小时，可交互区域也随之变小，有时我们想增大这个区域，让“细线”更容易被拾取到。注意该属性并不会影响渲染效果。

在下面的 [示例](/zh/examples/shape#polyline) 中，我们设置该属性为 `50`，在进行拾取时线宽相当于 `50 + 原始线宽`，这样靠近时就更容易拾取到了： <img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*0ISzTIiefZ0AAAAAAAAAAAAAARQnAQ">

```js
line.style.increasedLineWidthForHitTesting = 50;
```

另外和 [lineWidth](/zh/api/basic/display-object#linewidth) 一样，该属性同样会向两侧延展，下图中无填充的 [Path](/zh/api/basic/path) 内部拾取区域也变大了：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*ude1Qo6PVNYAAAAAAAAAAAAAARQnAQ">

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                           | 所有     | 否                                    | 否           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

## 变换操作

我们提供了一系列变换方法。

### 平移

对于平移操作，我们提供了局部/世界坐标系下，移动绝对/相对距离的 API：

| 名称             | 参数                                                   | 返回值             | 备注                                   |
| ---------------- | ------------------------------------------------------ | ------------------ | -------------------------------------- |
| translate        | `[number, number]`<br />`number, number`<br />`number` | 无                 | 在 **世界坐标系** 下，相对当前位置移动 |
| translateLocal   | `[number, number]`<br />`number, number`<br />`number` | 无                 | 在 **局部坐标系** 下，相对当前位置移动 |
| setPosition      | `[number, number]`<br />`number, number`<br />`number` | 无                 | 设置 **世界坐标系** 下的位置           |
| setLocalPosition | `[number, number]`<br />`number, number`<br />`number` | 无                 | 设置 **局部坐标系** 下的位置           |
| getPosition      | 无                                                     | `[number, number]` | 获取 **世界坐标系** 下的位置           |
| getLocalPosition | 无                                                     | `[number, number]` | 获取 **局部坐标系** 下的位置           |

其中 translate/translateLocal/setPosition/setLocalPosition 支持以下入参形式，其中如果只想修改 X 轴方向，可以只传一个数字：

```js
circle.translate([100, 0]); // [number, number]
circle.translate(100, 0); // number, number
circle.translate(100); // number
```

### 缩放

和平移不同，我们无法提供 `setScale` 这样设置世界坐标系下缩放的方法，因此全局坐标系下缩放是只读的，这在 Unity 中称之为 [lossyScale](https://forum.unity.com/threads/solved-why-is-transform-lossyscale-readonly.363594/)。

| 名称          | 参数                                                   | 返回值             | 备注                                           |
| ------------- | ------------------------------------------------------ | ------------------ | ---------------------------------------------- |
| scaleLocal    | `[number, number]`<br />`number, number`<br />`number` | 无                 | 在 **局部坐标系** 下，相对当前缩放比例继续缩放 |
| setLocalScale | `[number, number]`<br />`number, number`<br />`number` | 无                 | 设置 **局部坐标系** 下的缩放比例               |
| getScale      | 无                                                     | `[number, number]` | 获取 **世界坐标系** 下的缩放比例               |
| getLocalScale | 无                                                     | `[number, number]` | 获取 **局部坐标系** 下的缩放比例               |

其中 scaleLocal/setLocalScale 支持以下入参形式，其中如果水平/垂直方向缩放比例相等时，可以只传一个数字：

```js
circle.scaleLocal([2, 2]); // [number, number]
circle.scaleLocal(2, 2); // number, number
circle.scaleLocal(2); // number
```

如果想实现沿 X / Y 轴翻转，可以传入负值，例如沿 Y 轴翻转：

```js
circle.setLocalScale(-1, 1);
```

### 旋转

在 3D 场景中，旋转可以用矩阵、轴角、欧拉角和四元数表示，它们彼此之间可以互相转换。虽然考虑到未来的扩展性，在 G 内部实现中我们使用了四元数。

| 名称                | 参数     | 返回值   | 备注                                                                    |
| ------------------- | -------- | -------- | ----------------------------------------------------------------------- |
| rotateLocal         | `number` | 无       | 在 **局部坐标系** 下，旋转一定的欧拉角，顺时针方向为正，单位为 `degree` |
| rotate              | `number` | 无       | 在 **世界坐标系** 下，旋转一定的欧拉角                                  |
| setEulerAngles      | `number` | 无       | 设置 **世界坐标系** 下的欧拉角                                          |
| setLocalEulerAngles | `number` | 无       | 设置 **局部坐标系** 下的欧拉角                                          |
| setLocalRotation    | `quat`   | 无       | 设置 **局部坐标系** 下的四元数                                          |
| setRotation         | `quat`   | 无       | 设置 **世界坐标系** 下的四元数                                          |
| getEulerAngles      | 无       | `number` | 获取 **世界坐标系** 下的欧拉角                                          |
| getLocalEulerAngles | 无       | `number` | 获取 **局部坐标系** 下的欧拉角                                          |
| getLocalRotation    | 无       | `quat`   | 获取 **局部坐标系** 下的四元数                                          |
| getRotation         | 无       | `quat`   | 获取 **世界坐标系** 下的四元数                                          |

### 拉伸

在 2D 场景中，可以进行拉伸，在一定方向上以一定角度扭曲元素上的每个点。可参考 [CSS 同名变换函数](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-function#skew)。

| 名称         | 参数   | 返回值 | 备注                                                            |
| ------------ | ------ | ------ | --------------------------------------------------------------- |
| setLocalSkew | `vec2` | 无     | 在 **局部坐标系** 下，沿着横/纵坐标扭曲元素的角度，单位为 `rad` |
| getLocalSkew | 无     | `vec2` | 获取 **局部坐标系** 下的扭曲角度，单位为 `rad`                  |

### 设置缩放和旋转中心

除了使用 [transformOrigin](/zh/api/basic/display-object#transformorigin) 属性，还可以通过 `setOrigin` 重新设置变换中心。

| 名称      | 参数                                                                                             | 返回值 | 备注                             |
| --------- | ------------------------------------------------------------------------------------------------ | ------ | -------------------------------- |
| setOrigin | `[number, number]` 或 `[number, number, number]` 或 `number, number` 或 `number, number, number` | 无     | 设置局部坐标系下的缩放和旋转中心 |
| getOrigin | `[number, number, number]`                                                                       | 无     | 获取局部坐标系下的缩放和旋转中心 |

设置局部坐标系下的缩放和旋转中心，[示例](/zh/examples/scenegraph#origin)

默认值为 `[0, 0]`。

在下面的例子中，我们在 `[100, 100]` 处放置了一个半径为 100 的圆：

```js
const circle = new Circle({
  style: {
    cx: 100,
    cy: 100,
    r: 100,
  },
});
```

如果我们想让圆以圆心作为变换中心进行缩放，发生变化的是包围盒：

```js
circle.setOrigin(100, 100);
circle.scale(0.5);
circle.getBounds(); // { center: [100, 100], halfExtents: [50, 50] }
```

但假如我们想让这个圆以自身包围盒左上角进行缩放：

```js
circle.setOrigin(0, 0);
circle.scale(0.5);
circle.getBounds(); // { center: [50, 50], halfExtents: [50, 50] }
```

在下面的[示例](/zh/examples/scenegraph#origin)中，我们创建了一个矩形，它的默认锚点为局部坐标系下包围盒的左上角。如果我们想让它以包围盒中心进行旋转，就需要设置变换中心相对于锚点偏移长宽各一半，即 `[150, 100]`：

```js
const rect = new Rect({
  id: 'rect',
  style: {
    width: 300,
    height: 200,
  },
});
rect.setOrigin(150, 100); // 设置旋转与缩放中心为自身包围盒中心点
```

例如我们想修改一个圆的变换中心到左上角而非圆心，可以这样做：

```js
const circle = new Circle({
  style: {
    cx: 100,
    cy: 100,
    r: 100,
  },
});

circle.setOrigin(0, 0);
// 或者
circle.style.transformOrigin = 'left top'; // 包围盒左上角
// 或者
circle.style.transformOrigin = '0px 0px';
// 或者
circle.style.transformOrigin = '0% 0%';
```

## 获取包围盒

基于不同的[包围盒定义](/zh/api/basic/display-object#包围盒)，我们提供了以下获取方法。

### getGeometryBounds(): AABB | null

获取基础图形的几何包围盒，除了定义所需的样式属性（例如 Circle 的 r，Rect 的 width/height），它不受其他绘图属性（例如 lineWidth，fitler，shadowBlur 等）影响：

```js
const circle = new Circle({
  style: {
    cx: 100, // 局部坐标系下的坐标不会影响 Geometry Bounds
    cy: 100, // 局部坐标系下的坐标不会影响 Geometry Bounds
    r: 100,
    lineWidth: 20, // 样式属性不会影响 Geometry Bounds
    shadowBlur: 10, // 样式属性不会影响 Geometry Bounds
  },
});
circle.getGeometryBounds(); // { center: [0, 0], halfExtents: [100, 100] }
```

Group 由于没有几何定义，因此会返回 null：

```js
const group = new Group();
group.getGeometryBounds(); // null
```

### getBounds(): AABB | null

合并自身以及子节点在世界坐标系下的 Geometry Bounds。这应当是最常用的计算方式：

```js
const circle = new Circle({
  style: {
    cx: 100, // 应用世界坐标系下的变换
    cy: 100,
    r: 100,
  },
});
circle.getBounds(); // { center: [100, 100], halfExtents: [100, 100] }
```

### getRenderBounds(): AABB | null

合并自身以及子节点在世界坐标系下的 Render Bounds，在 Geometry Bounds 基础上，受以下样式属性影响： lineWidth，shadowBlur，filter：

```js
const circle = new Circle({
  style: {
    cx: 100, // 应用世界坐标系下的变换
    cy: 100,
    r: 100,
    lineWidth: 20, // 考虑样式属性
  },
});
// r + lineWidth / 2
circle.getRenderBounds(); // { center: [100, 100], halfExtents: [110, 110] }
```

### getLocalBounds(): AABB | null

getBounds 的唯一区别是在父节点的局部坐标系下计算。

### getBBox(): Rect

兼容 [SVG 同名方法](https://developer.mozilla.org/en-US/docs/Web/API/SVGGraphicsElement/getBBox)，计算方式等同于 getBounds，区别仅在于返回值类型不同，后者返回的是 AABB，而该方法返回一个 [DOMRect](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMRect)：

```js
interface DOMRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}
```

### getBoundingClientRect(): DOMRect

获取浏览器坐标系下的 Geometry Bounds，应用世界坐标系下的变换后，再加上画布相对于浏览器的偏移量。

## 节点操作

在场景图中，我们需要构建父子关系，快速获取父子节点，有时还需要在子树中查询某一类型的节点列表。基于继承关系，每个 DisplayObject 都拥有 [Node](/zh/api/builtin-objects/node) 和 [Element](/zh/api/builtin-objects/element) 能力。

### 简单节点查询

| 名称            | 属性/方法 | 返回值                  | 备注                                 |
| --------------- | --------- | ----------------------- | ------------------------------------ |
| parentNode      | 属性      | `DisplayObject \| null` | 父节点（如有）                       |
| parentElement   | 属性      | `DisplayObject \| null` | 父节点（如有）                       |
| childNodes      | 属性      | `DisplayObject[]`       | 子节点列表                           |
| children        | 属性      | `DisplayObject[]`       | 子节点列表                           |
| firstChild      | 属性      | `DisplayObject \| null` | 返回子节点列表中第一个节点（如有）   |
| lastChild       | 属性      | `DisplayObject \| null` | 返回子节点列表中最后一个节点（如有） |
| nextSibling     | 属性      | `DisplayObject \| null` | 返回后一个兄弟节点（如有）           |
| previousSibling | 属性      | `DisplayObject \| null` | 返回前一个兄弟节点（如有）           |
| contains        | 方法      | `boolean`               | 子树中是否包含某个节点（入参）       |
| getRootNode     | 方法      | `Node`                  | 返回当前节点的根节点                 |
| ownerDocument   | 属性      | `Document`              | 返回画布入口 Document                |
| isConnected     | 属性      | `boolean`               | 节点是否被添加到画布中               |

### 高级查询

参考 CSS 选择器，我们提供了以下查询方法，查询范围是当前节点的**整棵子树**，并不仅仅是直接的子节点列表，而是所有子孙节点。

| 名称                   | 参数                  | 返回值                  | 备注                            |
| ---------------------- | --------------------- | ----------------------- | ------------------------------- |
| getElementById         | `(id: string)`        | `DisplayObject \| null` | 通过 `id` 查询子节点            |
| getElementsByName      | `(name: string)`      | `DisplayObject[]`       | 通过 `name` 查询子节点列表      |
| getElementsByClassName | `(className: string)` | `DisplayObject[]`       | 通过 `className` 查询子节点列表 |
| getElementsByTagName   | `(tagName: string)`   | `DisplayObject[]`       | 通过 `tagName` 查询子节点列表   |
| querySelector          | `(selector: string)`  | `DisplayObject \| null` | 查询满足条件的第一个子节点      |
| querySelectorAll       | `(selector: string)`  | `DisplayObject[]`       | 查询满足条件的所有子节点列表    |
| find                   | `(filter: Function)`  | `DisplayObject \| null` | 查询满足条件的第一个子节点      |
| findAll                | `(filter: Function)`  | `DisplayObject[]`       | 查询满足条件的所有子节点列表    |

下面我们以上面太阳系的例子，演示如何使用这些查询方法。

```javascript
solarSystem.getElementsByName('sun');
// sun

solarSystem.getElementsByTagName('circle');
solarSystem.getElementsByTagName(Shape.CIRCLE);
// [sun, earth, moon]

solarSystem.querySelector('[name=sun]');
// sun

solarSystem.querySelectorAll('[r=25]');
// [moon]
```

有时查询条件不好用 CSS 选择器描述，此时可以使用自定义查询方法：find/findAll。它们可以类比成 querySelector/querySelectorAll。不同之处在于前者需要传入一个 filter，例如以下写法等价：

```js
solarSystem.querySelector('[name=sun]');
solarSystem.find((element) => element.name === 'sun');

solarSystem.querySelectorAll('[r=25]');
solarSystem.findAll((element) => element.style.r === 25);
```

### 添加/删除节点

以下添加/删除节点能力来自继承的 [Element](/zh/api/builtin-objects/element) 基类。

| 名称            | 参数                                                   | 返回值          | 备注                                                         |
| --------------- | ------------------------------------------------------ | --------------- | ------------------------------------------------------------ |
| appendChild     | `child: DisplayObject`                                 | `DisplayObject` | 添加子节点，返回添加的节点                                   |
| insertBefore    | `child: DisplayObject`<br/>`reference?: DisplayObject` | `DisplayObject` | 添加子节点，在某个子节点之前（如有），返回添加的节点         |
| append          | `...nodes: DisplayObject[]`                            |                 | 在当前节点的子节点列表末尾批量添加一组节点                   |
| prepend         | `...nodes: DisplayObject[]`                            |                 | 在当前节点的子节点列表头部批量添加一组节点                   |
| after           | `...nodes: DisplayObject[]`                            |                 | 在当前节点之后批量添加一些兄弟节点                           |
| before          | `...nodes: DisplayObject[]`                            |                 | 在当前节点之前批量添加一些兄弟节点                           |
| removeChild     | `child: DisplayObject`                                 | `DisplayObject` | 删除子节点，返回被删除的节点。                               |
| removeChildren  |                                                        |                 | 删除全部子节点。                                             |
| remove          | `destroy = true`                                       | `DisplayObject` | 从父节点（如有）中移除自身，`destroy` 表示是否要销毁         |
| replaceChild    | `child: DisplayObject`                                 | `DisplayObject` | 用指定的节点替换当前节点的一个子节点，并返回被替换掉的节点   |
| replaceWith     | `...nodes: DisplayObject[]`                            |                 | 在父节点的子节点列表中，用传入的节点列表替换该节点           |
| replaceChildren | `...nodes: DisplayObject[]`                            |                 | 替换该节点的所有子节点。不传参数时则会清空该节点的所有子节点 |

从父节点中删除子节点并销毁有以下两种方式：

```js
// parent -> child
parent.removeChild(child);

// 等价于
child.remove();
```

删除所有子节点有以下三种方式：

```js
parent.removeChildren();

// 等价于
[...parent.children].forEach((child) => parent.removeChild(child));
[...parent.children].forEach((child) => child.remove());

// 等价于
parent.replaceChildren();
```

在添加/删除节点时有以下注意点：

1. 添加节点时会依次触发 ChildInserted 和 Inserted 事件
2. 删除节点时会依次触发 Removed 和 ChildRemoved 事件，默认会调用 [destroy](/zh/api/basic/display-object#销毁) 销毁自身。如果只是暂时从场景图中移除，后续还可能继续添加回来，可以使用 `remove(false)`

### 克隆节点

方法签名为 `cloneNode(deep?: boolean): this`，可选参数为是否需要深拷贝，返回克隆得到的新节点。

在下面的例子中，我们创建了一个圆，设置了它的半径与位置。拷贝得到的新节点拥有同样的样式属性与位置：

```js
circle.style.r = 20;
circle.setPosition(10, 20);

const clonedCircle = circle.cloneNode();
clonedCircle instanceof Circle; // true
clonedCircle.style.r; // 20
clonedCircle.getPosition(); // [10, 20]
```

注意事项：

- 支持深拷贝，即自身以及整棵子树
- 克隆的新节点不会保留原始节点的父子关系，需要使用 `appendChild` 将其加入画布才会被渲染
- 与 [DOM API](https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode#notes) 保持一致，不会拷贝原图形上的事件监听器

在这个[示例](/zh/examples/scenegraph#clone)中，我们展示了以上特性：

- 可以随时更改原始节点的样式属性，得到的拷贝都会是最新的，新节点同样需要被加入到场景图中才会被渲染
- 但由于不会拷贝事件监听器，因此只有原始节点可以进行拖拽
- 非深拷贝模式下，Text（Drag me 文本） 作为 Circle 的子节点不会被拷贝

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*PwEYSI_ijPEAAAAAAAAAAAAAARQnAQ)

### 获取/设置属性值

| 名称         | 参数                         | 返回值        | 备注                 |
| ------------ | ---------------------------- | ------------- | -------------------- |
| getAttribute | `(name: string)`             | `null \| any` | 根据属性名获取属性值 |
| setAttribute | `(name: string, value: any)` | 无            | 设置属性值           |

⚠️ 兼容旧版 `attr(name: string, value?: any)`，获取以及设置属性值。

⚠️ 兼容 [HTMLElement Style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style)，因此可以使用以下方法：

- style.[getPropertyValue](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/getPropertyValue)
- style.[setProperty](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty)
- style.[removeProperty](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/removeProperty)

以下用法等价：

```js
const circle = new Circle({
  style: {
    // 或者使用 attrs
    r: 10,
    fill: 'red',
  },
});

// 获取属性值
circle.getAttribute('fill'); // red
circle.attr('fill'); // red
circle.style.fill; // red
circle.style.getPropertyValue('fill');

// 设置属性值
circle.setAttribute('r', 20);
circle.attr('r', 20);
circle.style.r = 20;
circle.style.setProperty('r', 20);
```

### 获取解析后的属性值

部分属性例如 [Rect](/zh/api/basic/rect) 的 width / height 是支持单位的，如果想获取[计算后的值](/zh/api/css/css-typed-om#cssunitvalue)，可以使用 `parsedStyle`：

```js
rect.style.width = '100px';
rect.parsedStyle.width; // CSSUnitValue { unit: 'px', value: 100 }
```

需要注意的是，目前在使用[动画](/zh/api/animation/waapi)时，我们也会将待插值的属性值进行转换，因此如果想获取以 px 为单位的绝对值，需要使用 `parsedStyle` [示例](/zh/examples/animation#onframe)：

```js
animation.onframe = () => {
  rect.style.width; // '100px'
  rect.parsedStyle.width; // CSSUnitValue { unit: 'px', value: 100 }
};
```

### 销毁

调用 `destroy()` 将销毁节点。被销毁的节点将无法被再次加入画布渲染。通过 [destroyed](/zh/api/basic/display-object#destroyed) 属性可以判断一个节点是否已经被销毁。

```js
circle.destroy();
```

在调用用该方法时，会依次执行以下操作：

1. 触发 Destroy 事件
2. 调用 `remove()` 将自身从场景图中移除，因此会触发 Removed 和 ChildRemoved 事件
3. 移除该节点上的所有事件监听器和动画对象
4. 将 [destroyed](/zh/api/basic/display-object#destroyed) 标志置为 true

### 状态

通过以下属性可以判断图形当前的状态，例如是否被加入到画布中，是否已经被销毁等。

#### isConnected

用于判断一个图形是否已经被加入到画布中。

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/isConnected

```js
circle.isConnected; // false
canvas.appendChild(circle); // add to canvas
circle.isConnected; // true
```

#### ownerDocument

指向画布的入口 Document。如果还未加入到画布中，返回 null。

https://developer.mozilla.org/en-US/docs/Web/API/Node/ownerDocument

```js
circle.ownerDocument; // null
canvas.appendChild(circle); // add to canvas
circle.ownerDocument; // canvas.document
```

#### destroyed

用于判断一个图形是否已经被销毁。

通过调用 `destroy()` 主动销毁自身，或者父节点通过 `destroyChildren()` 主动移除并销毁所有子节点等：

```js
circle.destroyed; // false
circle.destroy();
circle.destroyed; // true
```

### 生命周期事件监听

在[事件系统](/zh/api/event)中，我们可以使用类似 DOM Event API 的方式给添加到画布中的节点增加事件监听器。

除了例如 click、mouseenter 这样的交互事件，我们还提供了一系列内置的节点生命周期事件，例如可以监听节点的添加和删除事件，这些事件同样有完整的传播路径（冒泡、捕获），[示例](/zh/examples/event#builtin)：

```js
import { ElementEvent, MutationEvent } from '@antv/g';

child.on(ElementEvent.INSERTED, (e: MutationEvent) => {
  e.target; // child
  e.relatedNode; // parent
});
child.on(ElementEvent.REMOVED, (e) => {
  e.target; // child
  e.relatedNode; // parent
});
child.on(ElementEvent.ATTR_MODIFIED, (e) => {
  e.target; // child
  e.attrName; // 属性名
  e.prevValue; // 旧值
  e.newValue; // 新值
});

parent.appendChild(child);
```

目前我们支持如下场景图相关事件：

- INSERTED 作为子节点被添加时触发
- REMOVED 作为子节点被移除时触发
- MOUNTED 首次进入画布时触发
- UNMOUNTED 从画布中移除时触发
- ATTR_MODIFIED 修改属性时触发
- DESTROY 销毁时触发

## 动画

参考 Web Animations API，可以使用 animate 完成 keyframe 动画，下面是一个 ScaleIn 动画效果：

```js
circle.animate(
  [
    {
      transform: 'scale(0)',
    },
    {
      transform: 'scale(1)',
    },
  ],
  {
    duration: 500,
    easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
    iterations: Infinity,
  },
);
```

更多用法详见[动画系统](/zh/api/animation/waapi)

## Dataset API

https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Howto/Use_data_attributes

提供 `data-*` 属性用于存储额外信息。

```js
group.dataset.type = 'a';
group.getAttribute('data-type'); // 'a'
```

需要注意的是，`data-` 前缀之后的部分通过 `dataset` 访问时需要使用驼峰形式：

```js
group.setAttribute('data-a-b-c');
group.dataset.aBC;

// Wrong
group.dataset.abc;
group.dataset.abC;
```
