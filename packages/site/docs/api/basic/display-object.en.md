---
title: DisplayObject
order: 0
redirect_from:
    - /en/docs/api/basic
---

DisplayObject 是所有图形的基类，例如 `Group` `Circle` `Text` 等都会继承它。

我们尝试让它尽可能兼容 [DOM Element](https://developer.mozilla.org/en-US/docs/Web/API/Element)，除了能降低学习成本，还能将自身伪装成 DOM Element 来充分利用已有的 Web 生态，例如：

-   使用 CSS 选择器进行[高级查询](/zh/docs/plugins/css-select)
-   使用 Hammer.js [扩展手势](/zh/docs/api/event#直接使用-hammerjs)

# id

https://developer.mozilla.org/en-US/docs/Web/API/Element/id

全局唯一的标识，可通过 [getElementById](/zh/docs/api/display-object#高级查询) 查询。

# name

https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByName

可通过 [getElementsByName](/zh/docs/api/display-object#高级查询) 查询

# className

https://developer.mozilla.org/en-US/docs/Web/API/Element/className

可通过 [getElementsByClassName](/zh/docs/api/display-object#高级查询) 查询

# interactive

是否支持响应[事件](/zh/docs/api/event)，默认为 `true`。在某些不需要支持交互的图形上可以关闭。

例如我们不想让下面这个圆响应鼠标 `mouseenter/leave` 事件，[示例](/zh/examples/event/shape#circle)

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

# 绘图属性

绘图属性通过 `attrs/style` 设置，通常包含了图形的位置、填充色、透明度等**通用属性**，不同类型的图形也有自己的**额外属性**，例如在下面的圆角矩形中，位置`(x, y)`、填充色 `fill`、描边色 `stroke` 就是通用属性，而矩形的尺寸 `width/height` 和圆角半径 `radius` 则是额外属性：

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

⚠️ 熟悉 DOM API 的开发者可以参考 [HTMLElement Style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) 使用。

## 位置

图形在局部坐标系下的初始位置通过 `(x, y)` 描述，后续也可以通过 [setLocalPosition](/zh/docs/api/display-object#平移) 重新设置。

对于不同的图形，“位置”的几何意义也不同，例如：

-   [Circle](/zh/docs/api/circle)，[Ellipse](/zh/docs/api/ellipse) 为圆心位置
-   [Rect](/zh/docs/api/rect)，[Image](/zh/docs/api/image) 为左上角顶点位置
-   [Text](/zh/docs/api/text) 为文本锚点位置
-   [Line](/zh/docs/api/line)，[Polyline](/zh/docs/api/polyline)，[Polygon](/zh/docs/api/polygon)，[Path](/zh/docs/api/path) 为包围盒左上角顶点位置

有时我们需要更改这个 “位置” 的几何意义，例如将 Rect 的中心而非左上角设置成 “锚点”，此时我们可以使用 [anchor](/zh/docs/api/display-object#anchor)，将它设置成 `[0.5, 0.5]`。需要注意的是，修改前后图形在局部坐标系下的坐标并不会改变。

举例来说，我们定义了一个半径为 100 的圆，由于 anchor 默认值为 `[0.5, 0.5]`，此时获取这个圆在局部坐标系的坐标为 `[100, 100]`，即圆心所在的位置：

```js
const circle = new Cirle({
    style: {
        x: 100,
        y: 100,
        r: 100,
    },
});
circle.getLocalPosition(); // [100, 100]，此时为圆心所在位置
```

如果我们此时修改锚点为 `[0, 0]`，这个圆局部坐标系下位置依然不变，还是 `[100, 100]`，只是此时这个坐标不再是圆心，而是圆的包围盒左上角，因此从视觉上看，这个圆向右下方平移了 `[100, 100]` 的距离：

```js
circle.style.anchor = [0, 0];
circle.getLocalPosition(); // [100, 100]，此时为圆包围盒左上角位置
```

### x

**类型**： `number`

**默认值**：0

**是否必须**：`false`

**说明** 局部坐标系下 x 轴坐标

### y

**类型**： `number`

**默认值**：0

**是否必须**：`false`

**说明** 局部坐标系下 y 轴坐标

### anchor

**类型**： `[number, number]`

**是否必须**：`false`

**说明** 锚点位置，取值范围 `(0, 0) ~ (1, 1)`，修改它同时会改变图形的包围盒（尺寸不变，中心点发生偏移）

不同图形的默认锚点如下，[示例](/zh/examples/shape#rect)：

-   [Circle](/zh/docs/api/circle)，[Ellipse](/zh/docs/api/ellipse) 为圆心位置 `[0.5, 0.5]`
-   [Rect](/zh/docs/api/rect)，[Image](/zh/docs/api/image)，[Line](/zh/docs/api/line)，[Polyline](/zh/docs/api/polyline)，[Polygon](/zh/docs/api/polygon)，[Path](/zh/docs/api/path) 为包围盒左上角顶点位置 `[0, 0]`
-   [Text](/zh/docs/api/text) 为文本锚点位置，应该使用 [textBaseline](http://localhost:8000/zh/docs/api/basic/text#textbaseline) 与 [textAlign](/zh/docs/api/basic/text#textalign) 这两个属性设置

### origin

**类型**： `[number, number]`

**默认值**：`[0, 0]`

**是否必须**：`false`

**说明** 旋转与缩放中心，也称作变换中心，基于自身包围盒表示，包围盒左上角为 `[0, 0]`

[示例](/zh/examples/scenegraph#origin)

```js
const rect = new Rect({
    id: 'rect',
    style: {
        width: 300,
        height: 200,
        origin: [150, 100], // 设置旋转与缩放中心为自身包围盒中心点
    },
});

rect.style.origin = [0, 0]; // 设置为左上角
// 或者
rect.style.transformOrigin = 'top left';
rect.style.transformOrigin = '0px 0px';
// 或者
rect.setOrigin(0, 0);
```

也可以使用 [transformOrigin](/zh/docs/api/basic/display-object#transformorigin) 表示。两者都相对于图形自身包围盒定义，但 transformOrigin 可以使用百分比或者关键字描述位置，例如我们想修改一个圆的变换中心到左上角而非圆心，可以这样做：

```js
const circle = new Circle({
    style: {
        x: 200,
        y: 200,
        r: 100,
    },
});

circle.style.origin = [100, 100]; // 左上角在局部坐标系下坐标为 [100, 100]
// 或者
circle.style.transformOrigin = 'left top'; // 包围盒左上角
// 或者
circle.style.transformOrigin = '0px 0px';
// 或者
circle.style.transformOrigin = '0% 0%';
```

### transform

<tag color="green" text="可应用动画">可应用动画</tag>

我们提供了在局部坐标系下进行变换的快捷方式，同时与[CSS Transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform) 保持一致，支持以下属性值：

-   缩放，无单位
    -   scale(x, y)
    -   scaleX(x)
    -   scaleY(x)
    -   scaleZ(z)
    -   scale3d(x, y, z)
-   平移，0 可以不加单位，无单位当作 px 处理，百分比相对于当前图形包围盒
    -   translate(0, 0) translate(0, 30px) translate(100%, 100%)
    -   translateX(0)
    -   translateY(0)
    -   translateZ(0)
    -   translate3d(0, 0, 0)
-   旋转，支持 deg rad turn 这些单位
    -   rotate(0.5turn) rotate(30deg) rotate(1rad)
-   none 清除变换

由于是在局部坐标系下进行变换，因此以下写法等价：

```js
const circle = new Circle({
    style: {
        transform: 'translate(100px, 100px)',
        r: 100,
    },
});

const circle = new Circle({
    style: {
        x: 100,
        y: 100,
        r: 100,
    },
});

const circle = new Circle({
    style: {
        r: 100,
    },
});
circle.translateLocal(100, 100);
```

### transformOrigin

**类型**： `string`

**默认值**：`center`

**是否必须**：`false`

**说明** 旋转与缩放中心，也称作变换中心，相对于自身包围盒定义。

和 CSS [transform-origin](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-origin) 类似，支持以下字符串写法，其中用空格分隔：

-   一个值
    -   单位为 px 的长度，例如 10px
    -   单位为 % 的长度，例如 50%
    -   关键词 left, center, right, top, bottom，等于用百分比表示，例如 left 等于 0%，center 等于 50%
-   两个值
    -   第一个是单位为 px 或 % 的长度，或 left, center, right 关键字中的一个
    -   第二个是单位为 px 或 % 的长度，或 top, center, bottom 关键字中的一个

因此以下写法等价：

```js
// r = 100
circle.style.transformOrigin = 'left';
circle.style.transformOrigin = 'left center'; // 包围盒水平方向左侧边缘，垂直方向中点
circle.style.transformOrigin = '0 50%'; // 包围盒水平方向左侧边缘距离为 0，垂直方向距离顶部 50% 高度
circle.style.transformOrigin = '0 100px'; // 包围盒水平方向左侧边缘距离为 0，垂直方向距离顶部 100px
```

⚠️ 暂不支持三个值的写法。

## 填充

### opacity

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：1

**是否必须**：`false`

**说明**：透明度，取值范围为 `[0, 1]`

### fill

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `String`

**默认值**：无

**是否必须**：`false`

**说明**：填充色

支持以下格式的颜色值：

-   `'red'`
-   `'#1890FF'`
-   `'rgba(r, g, b, a)'`
-   `'transparent'` 完全透明，等价于 `'rgba(0,0,0,0)'`

除此之外，支持以下渐变色写法。[示例](/zh/examples/shape#gradient)

### 线性渐变

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Z5gpQL9ia9kAAAAAAAAAAABkARQnAQ)

-   `l` 表示使用线性渐变，绿色的字体为可变量，由用户自己填写。

```js
// example
// 使用渐变色描边，渐变角度为 0，渐变的起始点颜色 #ffffff，中点的渐变色为 #7ec2f3，结束的渐变色为 #1890ff
stroke: 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff';
```

### 放射状/环形渐变

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*9sc1SY2d_0AAAAAAAAAAAABkARQnAQ)

-   `r` 表示使用放射状渐变，绿色的字体为可变量，由用户自己填写，开始圆的 `x`、`y`、`r` 值均为相对值(0 至 1 范围)。

```js
// example
// 使用渐变色填充，渐变起始圆的圆心坐标为被填充物体的包围盒中心点，半径为(包围盒对角线长度 / 2) 的 0.1 倍，渐变的起始点颜色 #ffffff，中点的渐变色为 #7ec2f3，结束的渐变色为 #1890ff
fill: 'r(0.5, 0.5, 0.1) 0:#ffffff 1:#1890ff';
```

### 纹理

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8FjsSoqE1mYAAAAAAAAAAABkARQnAQ)

-   `p`: 表示使用纹理，绿色的字体为可变量，由用户自己填写。
-   `a`: 该模式在水平和垂直方向重复；
-   `x`: 该模式只在水平方向重复；
-   `y`: 该模式只在垂直方向重复；
-   `n`: 该模式只显示一次（不重复）。
-   纹理的内容可以直接是图片或者 [Data URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)。

```js
// example
// 使用纹理填充，在水平和垂直方向重复图片
fill: 'p(a)https://gw.alipayobjects.com/zos/rmsportal/ibtwzHXSxomqbZCPMLqS.png';
```

## 描边

### strokeOpacity

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：1

**是否必须**：`false`

**说明**：描边透明度，取值范围为 `[0, 1]`

### stroke

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `String`

**默认值**：无

**是否必须**：`false`

**说明**：描边色，例如 `'#1890FF'`

### lineWidth

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：1

**是否必须**：`false`

**说明**：描边宽度

### lineDash

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number[]`

**默认值**：无

**是否必须**：`false`

**说明**：一个数组，描述交替绘制的线段和间距。可参考：https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/setLineDash

对它应用动画可以实现[笔迹动画效果](/zh/docs/api/animation#笔迹动画)。

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8NOsQoWLm2IAAAAAAAAAAAAAARQnAQ)

### lineDashOffset

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：0

**是否必须**：`false`

**说明**：虚线偏移量，对它进行变换可以实现[蚂蚁线动画](/zh/docs/api/animation#蚂蚁线)

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*TTyTTISXlKAAAAAAAAAAAAAAARQnAQ)

## 阴影

在图形底部增加阴影效果，支持配置阴影颜色，模糊半径和水平/垂直偏移距离。[示例](/zh/examples/shape#circle)

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*shbSR55j_iQAAAAAAAAAAAAAARQnAQ)

⚠️ 暂不支持内阴影。

### shadowColor

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `String`

**默认值**：无

**是否必须**：`false`

**说明**：阴影色，例如 `'#1890FF'`。不支持渐变或者纹理写法。

### shadowBlur

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：无

**是否必须**：`false`

**说明**：阴影效果模糊程度，不允许为负数。越大代表越模糊，为 0 时不展示阴影。

### shadowOffsetX

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：无

**是否必须**：`false`

**说明**：水平方向偏移量，例如负数让阴影往左移，正数向右

### shadowOffsetY

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：无

**是否必须**：`false`

**说明**：垂直方向偏移量，例如负数让阴影往上移，正数向下

## 渲染次序

### zIndex

**类型**： `number`

**默认值**：0

**是否必须**：`false`

**说明**：类似 CSS 的 `zIndex` 属性，用于控制渲染次序，需要注意：

1. 只会影响渲染顺序，并不会改变场景图中的节点结构
2. 只在当前上下文内生效
3. 默认展示次序为场景图添加顺序，后添加的在之前添加的元素之上

例如下面的场景图中，由于 li2 在 li1 之后加入画布，因此 li2 默认会展示在 li1 之上。如果希望改变这种展示次序，可以修改 li1 的 zIndex：

```js
// ul1 -> li1
//     -> li2
// ul2 -> li3

li1.style.zIndex = 1; // li1 在 li2 之上
```

再比如尽管 li2 的 zIndex 比 ul2 大很多，但由于 ul1 比 ul2 小，它也只能处于 ul2 之下，[示例](/zh/examples/scenegraph#z-index)

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*FfZhRYJ_rogAAAAAAAAAAAAAARQnAQ)

## 裁剪

### clipPath

使用裁剪方式创建元素的可显示区域，区域内的部分显示，区域外的隐藏。可参考 CSS 的 [clip-path](https://developer.mozilla.org/zh-CN/docs/Web/CSS/clip-path)。该属性值可以是任意图形，例如 Circle、Rect 等等。同一个裁剪区域可以被多个图形共享使用。最后，裁剪区域也会影响图形的拾取区域，[示例](/zh/examples/event/shape#shapes)。

例如我们想创建一个裁剪成圆形的图片，让裁剪区域刚好处于图片中心（尺寸为 200 \* 200），此时我们可以设置裁剪区域圆形的局部坐标为 `[100, 100]`。[示例](/zh/examples/shape#clip)：

```js
const image = new Image({
    style: {
        width: 200,
        height: 200,
        clipPath: new Circle({
            style: {
                x: 100, // 处于被裁剪图形局部坐标系下
                y: 100,
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
        x: 100, // 处于被裁剪图形局部坐标系下
        y: 100,
        r: 50,
    },
});
// 或者兼容旧版写法
image.setClip(
    new Circle({
        style: {
            x: 100, // 处于被裁剪图形局部坐标系下
            y: 100,
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

### 注意事项

裁剪区域图形本身也是支持修改属性的，受它影响，被裁剪图形会立刻重绘。例如，配合[动画系统](/zh/docs/api/animation)我们可以对裁剪区域图形进行变换，实现以下效果，[示例](/zh/examples/shape#clip)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Iy4RQZgT3EUAAAAAAAAAAAAAARQnAQ)

```js
// 对裁剪区域应用动画
clipPathCircle.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }], {
    duration: 1500,
    iterations: Infinity,
});
```

我们暂不支持复合的裁剪区域，例如自定义图形以及 Group.

## 运动轨迹

在[路径动画](/zh/docs/api/animation#路径动画)中，我们可以使用 `offsetPath` 指定一个图形的运动轨迹，配合[动画系统](/zh/docs/api/animation#路径动画)对 `offsetDistance` 属性应用变换：

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

### offsetPath

指定路径轨迹，目前支持 [Line](/zh/docs/api/basic/line) [Path](/zh/docs/api/basic/path) 和 [Polyline](/zh/docs/api/basic/polyline) 这三种图形。

### offsetDistance

<tag color="green" text="可应用动画">可应用动画</tag>

从路径起点出发行进的距离，取值范围为 `[0-1]`，0 代表路径起点，1 代表终点。

# 变换操作

我们提供了一系列变换方法。

## 平移

对于平移操作，我们提供了局部/世界坐标系下，移动绝对/相对距离的 API：

| 名称 | 参数 | 返回值 | 备注 |
| --- | --- | --- | --- |
| translate | `[number, number]` | 无 | 在 **世界坐标系** 下，相对当前位置移动 |
| translateLocal | `[number, number]` | 无 | 在 **局部坐标系** 下，相对当前位置移动 |
| setPosition | `[number, number]` | 无 | 设置 **世界坐标系** 下的位置 |
| setLocalPosition | `[number, number]` | 无 | 设置 **局部坐标系** 下的位置 |
| getPosition | 无 | `[number, number]` | 获取 **世界坐标系** 下的位置 |
| getLocalPosition | 无 | `[number, number]` | 获取 **局部坐标系** 下的位置 |

## 缩放

和平移不同，我们无法提供 `setScale` 这样设置世界坐标系下缩放的方法，因此全局坐标系下缩放是只读的，这在 Unity 中称之为 [lossyScale](https://forum.unity.com/threads/solved-why-is-transform-lossyscale-readonly.363594/)。

| 名称 | 参数 | 返回值 | 备注 |
| --- | --- | --- | --- |
| scaleLocal | `[number, number]` | 无 | 在 **局部坐标系** 下，相对当前缩放比例继续缩放 |
| setLocalScale | `[number, number]` | 无 | 设置 **局部坐标系** 下的缩放比例 |
| getScale | 无 | `[number, number]` | 获取 **世界坐标系** 下的缩放比例 |
| getLocalScale | 无 | `[number, number]` | 获取 **局部坐标系** 下的缩放比例 |

## 旋转

在 3D 场景中，旋转可以用矩阵、轴角、欧拉角和四元数表示，它们彼此之间可以互相转换。虽然考虑到未来的扩展性，在 G 内部实现中我们使用了四元数，但目前我们仅提供欧拉角的 API。

| 名称 | 参数 | 返回值 | 备注 |
| --- | --- | --- | --- |
| rotateLocal | `number` | 无 | 在 **局部坐标系** 下，旋转一定的欧拉角，顺时针方向为正，单位为 `degree` |
| rotate | `number` | 无 | 在 **世界坐标系** 下，旋转一定的欧拉角 |
| setEulerAngles | `number` | 无 | 设置 **世界坐标系** 下的欧拉角 |
| setLocalEulerAngles | `number` | 无 | 设置 **局部坐标系** 下的欧拉角 |
| getEulerAngles | 无 | `number` | 获取 **世界坐标系** 下的欧拉角 |
| getLocalEulerAngles | 无 | `number` | 获取 **局部坐标系** 下的欧拉角 |

## 设置缩放和旋转中心

| 名称      | 参数               | 返回值 | 备注                             |
| --------- | ------------------ | ------ | -------------------------------- |
| setOrigin | `[number, number]` | 无     | 设置局部坐标系下的缩放和旋转中心 |

设置局部坐标系下的缩放和旋转中心，[示例](/zh/examples/scenegraph#origin)

```js
const rect = new Rect({
    id: 'rect',
    style: {
        width: 300,
        height: 200,
        origin: [150, 100], // 设置旋转与缩放中心，局部坐标系下的中点
    },
});

rect.style.origin = [0, 0]; // 设置为左上角
// 或者 rect.setOrigin(0, 0);
```

## 获取包围盒

| 名称 | 参数 | 返回值 | 备注 |
| --- | --- | --- | --- |
| getBounds | 无 | AABB | 获取世界坐标系下的轴对齐包围盒 |
| getLocalBounds | 无 | AABB | 获取局部坐标系下的包围盒 |
| getBoundingClientRect | 无 | Rect | 获取世界坐标系下的包围矩形，不考虑子元素，同时加上画布相对于浏览器的偏移量 |

其中轴对齐包围盒 `AABB` 结构为：

```js
interface AABB {
    center: [number, number, number];
    halfExtents: [number, number, number];
    min: [number, number, number];
    max: [number, number, number];
}
```

2 维矩形 `Rect` 和 [DOMRect](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMRect) 保持一致，结构为：

```js
interface Rect {
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
}
```

`getBounds` 和 `getBoundingClientRect` 有以下区别：

-   返回值的结构不同，前者返回一个 3 维的轴对齐包围盒，后者返回一个 2 维矩形
-   前者会考虑子元素，把它们的包围盒合并起来。后者仅考虑自身，不考虑子元素，另外会加上画布相对于浏览器的偏移量

# 节点操作

在场景图中，我们需要构建父子关系，快速获取父子节点，有时还需要在子树中查询某一类型的节点列表。为此，我们参考 DOM API 中的 [Node 接口](https://developer.mozilla.org/en-US/docs/Web/API/Node) 在节点上定义了一系列属性与方法，同时提供了类似 CSS 选择器的节点查询方法，最大程度减少学习成本。

## 简单节点查询

| 名称            | 属性/方法 | 返回值            | 备注                           |
| --------------- | --------- | ----------------- | ------------------------------ | ------------------------------------ |
| parentNode      | 属性      | `DisplayObject    | null`                          | 父节点（如有）                       |
| children        | 属性      | `DisplayObject[]` | 子节点列表                     |
| firstChild      | 属性      | `DisplayObject    | null`                          | 返回子节点列表中第一个节点（如有）   |
| lastChild       | 属性      | `DisplayObject    | null`                          | 返回子节点列表中最后一个节点（如有） |
| nextSibling     | 属性      | `DisplayObject    | null`                          | 返回后一个兄弟节点（如有）           |
| previousSibling | 属性      | `DisplayObject    | null`                          | 返回前一个兄弟节点（如有）           |
| contains        | 方法      | `boolean`         | 子树中是否包含某个节点（入参） |
| isConnected     | 属性      | `boolean`         | 节点是否被添加到画布中         |

## 高级查询

参考 CSS 选择器，我们提供了以下查询方法，查询范围是当前节点的**整棵子树**，并不仅仅是直接的子节点列表，而是所有子孙节点。

| 名称 | 参数 | 返回值 | 备注 |
| --- | --- | --- | --- | --- |
| getElementById | `(id: string)` | `DisplayObject | null` | 通过 `id` 查询子节点 |
| getElementsByName | `(name: string)` | `DisplayObject[]` | 通过 `name` 查询子节点列表 |
| getElementsByClassName | `(className: string)` | `DisplayObject[]` | 通过 `className` 查询子节点列表 |
| getElementsByTagName | `(tagName: string)` | `DisplayObject[]` | 通过 `tagName` 查询子节点列表 |
| querySelector | `(selector: string)` | `DisplayObject ｜ null` | 查询满足条件的第一个子节点 |
| querySelectorAll | `(selector: string)` | `DisplayObject[]` | 查询满足条件的所有子节点列表 |

下面我们以上面太阳系的例子，演示如何使用这些查询方法。

```javascript
solarSystem.getElementsByName('sun');
// sun

solarSystem.getElementsByTagName('circle');
solarSystem.getElementsByTagName(SHAPE.Circle);
// [sun, earth, moon]

solarSystem.querySelector('[name=sun]');
// sun

solarSystem.querySelectorAll('[r=25]');
// [moon]
```

## 添加/删除节点

| 名称 | 参数 | 返回值 | 备注 |
| --- | --- | --- | --- |
| appendChild | `(child: DisplayObject)` | `DisplayObject` | 添加子节点，返回添加的节点 |
| insertBefore | `(child: DisplayObject, reference?: DisplayObject)` | `DisplayObject` | 添加子节点，在某个子节点之前（如有），返回添加的节点 |
| removeChild | `(child: DisplayObject, destroy = true)` | `DisplayObject` | 删除子节点，返回被删除的节点。`destroy` 表示是否要销毁 |
| removeChildren | `(destroy = true)` |  | 删除全部子节点。`destroy` 表示是否要销毁 |
| remove | `(destroy = true)` | `DisplayObject` | 从父节点（如有）中移除自身，`destroy` 表示是否要销毁 |

从父节点中删除子节点并销毁有以下两种方式：

```js
// parent -> child
parent.removeChild(child);

// 等价于
child.remove();
```

删除所有子节点有以下两种方式：

```js
parent.removeChildren();

// 等价于
[...parent.children].forEach((child) => parent.removeChild(child));
[...parent.children].forEach((child) => child.remove());
```

## 获取/设置属性值

| 名称         | 参数                         | 返回值 | 备注       |
| ------------ | ---------------------------- | ------ | ---------- | -------------------- |
| getAttribute | `(name: string)`             | `null  | any`       | 根据属性名获取属性值 |
| setAttribute | `(name: string, value: any)` | 无     | 设置属性值 |

⚠️ 兼容旧版 `attr(name: string, value?: any)`，获取以及设置属性值。

⚠️ 兼容 [HTMLElement Style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style)

因此以下用法等价：

```js
const circle = new Circle({
    style: {
        // 或者使用 style
        r: 10,
        fill: 'red',
    },
});

// 获取属性值
circle.getAttribute('fill'); // red
circle.attr('fill'); // red
circle.style.fill; // red

// 设置属性值
circle.setAttribute('r', 20);
circle.attr('r', 20);
circle.style.r = 20;
```

## 销毁

调用 `destroy()` 将销毁节点。

## 生命周期事件监听

可以监听节点添加和删除事件：

```js
import { DISPLAY_OBJECT_EVENT } from '@antv/g';

// 监听子节点添加事件
parent.on(DISPLAY_OBJECT_EVENT.ChildInserted, (childNode) => {
    console.log(childNode); // child
});
child.on(DISPLAY_OBJECT_EVENT.Inserted, (parentNode) => {
    console.log(parentNode); // parent
});

parent.appendChild(child);
```

支持以下事件：

-   `ChildInserted` 作为父节点有子节点添加时触发
-   `Inserted` 作为子节点被添加时触发
-   `ChildRemoved` 作为父节点有子节点移除时触发
-   `Removed` 作为子节点被移除时触发
-   `AttributeChanged` 调用 `setAttribute()` 修改属性时触发
-   `Destroy` 调用 `destroy()` 时触发

# 可见性与渲染次序

## 隐藏/显示

| 名称 | 参数 | 返回值 | 备注     |
| ---- | ---- | ------ | -------- |
| hide | 无   | 无     | 隐藏节点 |
| show | 无   | 无     | 展示节点 |

另外我们也可以通过 `visibility` 属性控制：

```javascript
const group = new Group();

group.hide();
// or group.setAttribute('visibility', 'hidden');

group.show();
// or group.setAttribute('visibility', 'visible');
```

## 渲染次序

类似 CSS，我们可以通过 `zIndex` 属性控制渲染次序，有两点需要注意：

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

# 动画

参考 Web Animation API，可以使用 animate 完成 keyframe 动画，下面是一个 ScaleIn 动画效果：

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

更多用法详见[动画系统](/zh/docs/api/animation)
