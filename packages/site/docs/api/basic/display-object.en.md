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
-   使用 Interact.js [实现 Drag&Drop，Resize](/zh/docs/api/event#直接使用-interactjs)

# 继承自

[Element](/zh/docs/api/builtin-objects/element)

# 基础概念

首先需要明确一些概念，例如包围盒、坐标、锚点、变换中心等。了解它们有助于更好地使用具体的 API。

## 层次结构

在[场景图](/zh/docs/guide/diving-deeper/scenegraph)中我们了解到可以在图形之间构建父子关系，这种父子关系有时会与我们的直觉相悖，例如给一根直线（Line）添加一个子节点文本（Text）：

```js
line.appendChild(text);
```

但本质上这种层次结构只是定义了一种父子关系，在计算变换时把它考虑进去。例如我们不需要再单独移动直线以及文本，基于这种父子关系，移动直线即可，文本会跟随它移动。在变换过程中，文本相对于直线的位置始终并没有变，即文本在父节点直线的局部坐标系下的坐标没有变。

## 包围盒

为了简化计算，我们需要用一个规则的几何体包裹住图形，通常使用[轴对齐包围盒](https://developer.mozilla.org/zh-CN/docs/Games/Techniques/3D_collision_detection#axis-aligned_bounding_boxes%EF%BC%88aabb%E5%8C%85%E5%9B%B4%E7%9B%92%EF%BC%89)（Axis Aligned Bounding Box），它是一个非旋转的立方体，下图来自：https://developer.mozilla.org/zh-CN/docs/Games/Techniques/3D_collision_detection#axis-aligned_bounding_boxes%EF%BC%88aabb%E5%8C%85%E5%9B%B4%E7%9B%92%EF%BC%89 ![](https://mdn.mozillademos.org/files/11797/Screen%20Shot%202015-10-16%20at%2015.11.21.png)

我们使用如下定义：

```js
interface AABB {
    center: [number, number, number]; // 中心坐标
    halfExtents: [number, number, number]; // 长宽高的一半
    min: [number, number, number]; // 左上角坐标
    max: [number, number, number]; // 右下角坐标
}
```

在不同情况下，包围盒有不同的含义。我们先看针对单一图形的包围盒代表什么。下图展示了一个半径为 100，边框宽度为 20 的圆，为了更好的说明我们把边框设置成了半透明，同时它还带有阴影效果。

对于用户而言，通常希望使用图形的几何定义，例如这个圆的尺寸就是 `100 * 100`，我们不希望鼠标滑过阴影区域也判定拾取到这个圆。

而对于渲染管线而言，这些样式属性显然都需要考虑进去，例如：

-   在脏矩形渲染中正确的擦除绘制区域，一旦不考虑阴影带来的包围盒尺寸增加，就会出现擦除不干净的“残影”
-   剔除插件也需要考虑，例如一个图形即使只有阴影部分出现在视口中，它也不应被剔除

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*f0-CTpClWkMAAAAAAAAAAAAAARQnAQ)

我们很容易根据不同类型的图形定义几何包围盒：

-   Geometry Bounds。仅由图形的几何定义决定（因此 Group 会返回 null），不考虑绝大部分绘图属性（几何定义必须的除外，例如 Circle 的半径、Rect 的宽高、Path 的路径等），也不考虑变换（例如放大缩小并不会改变）。可通过 [getGeometryBounds](/zh/docs/api/basic/display-object#getgeometrybounds-aabb) 获取

前面介绍过基于场景图的层次结构，一旦一个图形拥有了子节点，它在计算包围盒时也应当考虑，例如我们想对它做整体旋转时，需要找到这个包围盒的中心作为旋转中心。因此以下包围盒都是会考虑层次结构的：

-   Bounds。在世界坐标系下计算，合并自身以及所有子节点的 Geometry Bounds 得到。用户通常最常用这个包围盒。可通过 [getBounds](/zh/docs/api/basic/display-object#getbounds-aabb) 获取
-   Local Bounds。和 Bounds 的唯一区别是在父节点的局部坐标系下计算。可通过 [getLocalBounds](/zh/docs/api/basic/display-object#getlocalbounds-aabb) 获取
-   Render Bounds。在世界坐标系下计算，在 Bounds 的基础上，受部分绘图属性影响，例如边框宽度，阴影，部分滤镜等，同时合并所有子节点的 Render Bounds。可通过 [getRenderBounds](/zh/docs/api/basic/display-object#getrenderbounds-aabb) 获取。用户通常不关心这个包围盒。

在下图中，ul1 拥有两个字节点 li1 和 li2，在计算自身的 Geometry Bounds 时不会考虑它们，而在计算 Bounds 时需要。由于 ul1 还有阴影，因此它的 Render Bounds 要大一圈：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*RjRuQ7iMtwgAAAAAAAAAAAAAARQnAQ)

## 锚点

一个图形的锚点（原点）应该如何定义呢？我们可以基于 [Geometry Bounds](/zh/docs/api/basic/display-object#包围盒) 定义，取值范围 `[0, 0] ~ [1, 1]`，其中 `[0, 0]` 代表 Geometry Bounds 左上角，`[1, 1]` 代表右下角。而不同图形由于几何定义不同，默认锚点如下：

-   [Circle](/zh/docs/api/circle)，[Ellipse](/zh/docs/api/ellipse) 为圆心位置 `[0.5, 0.5]`
-   [Rect](/zh/docs/api/rect)，[Image](/zh/docs/api/image)，[Line](/zh/docs/api/line)，[Polyline](/zh/docs/api/polyline)，[Polygon](/zh/docs/api/polygon)，[Path](/zh/docs/api/path) 为包围盒左上角顶点位置 `[0, 0]`
-   [Text](/zh/docs/api/text) 为文本锚点位置，应该使用 [textBaseline](http://localhost:8000/zh/docs/api/basic/text#textbaseline) 与 [textAlign](/zh/docs/api/basic/text#textalign) 这两个属性设置，因此设置此属性无效
-   [Group](/zh/docs/api/text) 无几何定义，因此锚点始终为 `[0, 0]`，设置此属性也无效

有时我们希望改变一个基础图形的原点定义，例如将 Rect 的原点定义为中心而非左上角，[示例](/zh/examples/shape#rect)：

```js
rect.style.anchor = [0.5, 0.5];
```

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*PamuTYmdbsQAAAAAAAAAAAAAARQnAQ)

那锚点的改变会影响图形在局部/世界坐标系下的坐标吗？答案是不会。我们只是把图形的原点放在这个坐标下而已，无论原点的定义如何修改，这个“位置”坐标始终不会改变：

```js
rect.getPosition(); // [200, 200]
rect.style.anchor = [0.5, 0.5];
rect.getPosition(); // [200, 200]
```

## 变换中心

对图形进行缩放、旋转变换时，需要指定一个变换中心。例如同样是 `scale(2)`，以圆心作为变换中心与圆的 Geometry Bounds 左上角为变换中心，最终得到的效果完全不一样。在 `gl-matrix` 这样的库中，得到 RTS 变换矩阵通常也需要指定变换中心：

```js
mat4.fromRotationTranslationScaleOrigin();
```

### origin

默认情况下 origin（变换中心）与 anchor（锚点）重合。在这个[示例](/zh/examples/scenegraph#origin)中，一个圆（世界坐标系下位置为 `[100, 100]`）以圆心作为变换中心进行缩放，如果我们想让它以 Geometry Bounds 左上角进行缩放，就可以重新设置 origin，让它相对于 anchor 进行偏移：

```js
const circle = new Circle({
    style: {
        r: 100,
        fill: '#1890FF',
    },
});
circle.setPosition(100, 100);
circle.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.5)' }], {
    duration: 500,
});

// 相对于锚点进行偏移
circle.style.origin = [-100, -100];
```

或者我们可以直接设置 anchor 为 `[0, 0]`，这样就无需设置 origin，因为默认两者就是重合的，但是由于 anchor 定义发生了变化，为了让圆心在世界坐标系下不变（`[100, 100]`），需要重新设置圆的位置。因此以下两种写法等价：

```js
// 让 origin 相对于 anchor 偏移
circle.setPosition(100, 100);
circle.style.origin = [-100, -100];

// 或者直接设置 anchor
circle.setPosition(0, 0);
circle.style.anchor = [0, 0];
```

### transformOrigin

相对于 anchor 描述 origin 固然直观，但这需要我们计算出偏移距离。例如我们想让一个包含了很多子元素的 Group 绕中心点旋转，就需要先计算这个 Group 的 Bounds：

```js
group.appendChild(child1);
group.appendChild(child2);
group.appendChild(child3);

// 计算 Bounds，考虑所有子元素
const { halfExtents } = group.getBounds();
// 设置 origin 从 [0, 0] 偏移 halfExtents 到中心点
group.style.origin = halfExtents;
```

另一个问题是，当图形的 Bounds 发生变化后，我们不得不重新设置它。例如我们在设置了 origin 之后，又向 Group 中添加了子元素，这会造成 Group 的 Bounds 发生变化，基于它计算的 origin 就不是最新的了，为了保持 Group “绕中心点旋转”，我们还得手动重新设置一次 origin：

```js
const { halfExtents } = group.getBounds(); // [100, 100, 0]
group.style.origin = halfExtents;

// 添加了新的子元素，此时 group 的 Bounds 发生了变化，但 origin 还是 [100, 100, 0]
group.appendChild(child4);

const { halfExtents } = group.getBounds(); // [200, 200, 0]
group.style.origin = halfExtents;
```

因此在某些场景下，用一些字面量或者百分比定义会更方便。例如 CSS 就提供了 transform-origin 属性，它正是相对于 Bounds 进行定义的，下图来自：https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_1WJQLRobtgAAAAAAAAAAAAAARQnAQ)

当我们想实现“绕中心点旋转”时，只需要使用字面量或者百分比，这样就能避免进行 Bounds 的获取：

```js
group.style.transformOrigin = 'center';
group.style.transformOrigin = 'center center';
group.style.transformOrigin = '50% 50%';
```

在这个[示例](/zh/examples/scenegraph#origin)中，每次向 Group 添加子元素后，我们都会重新设置 transformOrigin，因此这个 Group 会始终绕中心旋转：

```js
group.appendChild(cloned);
group.style.transformOrigin = 'center';
```

我们之所以无法做成根据 Bounds 自动计算，是因为导致 Bounds 发生变化的情况实在太多，甚至目标图形自身进行旋转时，Bounds 都在实时改变。试想一个图形正在绕变换中心进行旋转，Bounds 时时刻刻都在改变，如果根据 Bounds 实时计算变换中心，会导致旋转中心不稳定，出现旋转抖动问题：

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

属性名也可以使用连字符形式，因此以下写法完全等同，完整用法详见[获取/设置属性值](/zh/docs/api/basic/display-object#获取设置属性值)：

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

**说明** 图形的原点（锚点）位置，基于 [Geometry Bounds](/zh/docs/api/basic/display-object#包围盒) 定义，取值范围 `[0, 0] ~ [1, 1]`，其中 `[0, 0]` 代表 Geometry Bounds 左上角，`[1, 1]` 代表右下角。

不同图形的默认锚点如下，[示例](/zh/examples/shape#rect)：

-   [Circle](/zh/docs/api/circle)，[Ellipse](/zh/docs/api/ellipse) 为圆心位置 `[0.5, 0.5]`
-   [Rect](/zh/docs/api/rect)，[Image](/zh/docs/api/image)，[Line](/zh/docs/api/line)，[Polyline](/zh/docs/api/polyline)，[Polygon](/zh/docs/api/polygon)，[Path](/zh/docs/api/path) 为包围盒左上角顶点位置 `[0, 0]`
-   [Text](/zh/docs/api/text) 为文本锚点位置，应该使用 [textBaseline](http://localhost:8000/zh/docs/api/basic/text#textbaseline) 与 [textAlign](/zh/docs/api/basic/text#textalign) 这两个属性设置，因此设置此属性无效
-   [Group](/zh/docs/api/text) 无几何定义，因此设置此属性无效

### origin

**类型**： `[number, number]`

**默认值**：`[0, 0]`

**是否必须**：`false`

**说明** 旋转与缩放中心，也称作变换中心，数值为相对于[锚点](/zh/docs/api/basic/display-object#anchor)的偏移量，默认值为 `[0, 0]`，因此就是锚点位置。

在下面的例子中，我们在 `[100, 100]` 处放置了一个半径为 100 的圆：

```js
const circle = new Circle({
    style: {
        x: 100,
        y: 100,
        r: 100,
    },
});
```

如果我们想让圆以圆心作为变换中心进行缩放，由于此时锚点就是圆心，因此缩放前后锚点在世界坐标系下位置不变，发生变化的是包围盒：

```js
circle.style.origin = [0, 0];
circle.scale(0.5);
circle.getPosition(); // [100, 100]
circle.getBounds(); // { center: [100, 100], halfExtents: [50, 50] }
```

但假如我们想让这个圆以自身包围盒左上角进行缩放，即相对于当前锚点（圆心）偏移 `[-100, -100]`。缩放之后锚点也会发生偏移，圆在世界坐标系下的位置自然也来到了 `[50, 50]`。同理，包围盒的中心点发生了移动：

```js
circle.style.origin = [-100, -100];
circle.scale(0.5);
circle.getPosition(); // [50, 50]
circle.getBounds(); // { center: [50, 50], halfExtents: [50, 50] }
```

在下面的[示例](/zh/examples/scenegraph#origin)中，我们创建了一个矩形，它的默认锚点为局部坐标系下包围盒的左上角。如果我们想让它以包围盒中心进行旋转，就需要设置变换中心相对于锚点偏移长宽各一半，即 `[150, 100]`：

```js
const rect = new Rect({
    id: 'rect',
    style: {
        width: 300,
        height: 200,
        origin: [150, 100], // 设置旋转与缩放中心为自身包围盒中心点
    },
});
```

需要注意的是，变换中心描述的是相对于当前锚点的偏移量，既然是绝对值有时就需要先计算出图形的包围盒，有些基础图形例如 Circle、Rect 可能不需要计算，但如果是一个复杂组合后的图形，例如包含了一大堆自元素的 Group：

```js
const { halfExtents } = myShape.getBounds();
myShape.style.origin = halfExtents;
```

如果可以使用百分比或者字面量表示就会更方便，此时就可以使用 [transformOrigin](/zh/docs/api/basic/display-object#transformorigin) 表示。例如我们想修改一个圆的变换中心到左上角而非圆心，可以这样做：

```js
const circle = new Circle({
    style: {
        x: 100,
        y: 100,
        r: 100,
    },
});

circle.style.origin = [-100, -100]; // 相对于锚点（圆心）偏移 [-100, -100]
// 或者
circle.style.transformOrigin = 'left top'; // 包围盒左上角
// 或者
circle.style.transformOrigin = '0px 0px';
// 或者
circle.style.transformOrigin = '0% 0%';
```

两者的区别在于 origin 相对于锚点定义，而 transformOrigin 相对于包围盒定义。

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

**说明** 旋转与缩放中心，也称作变换中心，相对于 Bounds 定义。

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

⚠️ 暂不支持三个值的写法。与 origin 的区别在于，origin 相对于锚点定义，而 transformOrigin 相对于包围盒定义。

## 填充

### opacity

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：1

**是否必须**：`false`

**说明**：图形整体透明度，取值范围为 `[0, 1]`

### fillOpacity

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：1

**是否必须**：`false`

**说明**：填充色透明度，取值范围为 `[0, 1]`

### fill

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `string`

**默认值**：无

**是否必须**：`false`

**说明**：填充色

支持以下格式的颜色值：

-   `'red'`
-   `'#1890FF'`
-   `'rgba(r, g, b, a)'`
-   `'transparent'` 完全透明，等价于 `'rgba(0,0,0,0)'`
-   `'currentColor'` Canvas / WebGL 渲染环境中等同于 `black`，SVG 中为[同名属性](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/color)效果

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

**类型**： `string`

**默认值**：无

**是否必须**：`false`

**说明**：描边色，例如 `'#1890FF'`

### strokeWidth

[lineWidth](/zh/docs/api/basic/display-object#linewidth) 的别名，和 [SVG 属性名](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke-width)保持一致。

### strokeDasharray

[lineDash](/zh/docs/api/basic/display-object#linedash) 的别名，和 [SVG 属性名](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke-dasharray)保持一致。

### strokeDashoffset

[lineDashOffset](/zh/docs/api/basic/display-object#linedash) 的别名，和 [SVG 属性名](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/stroke-dashoffset)保持一致。

### lineWidth

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：1

**是否必须**：`false`

**说明**：描边宽度。与我们熟悉的 [CSS box model](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing) 不同，边框的一半宽度在图形内，一半在图形外。例如下面这个圆的包围盒宽度为：`r + lineWidth / 2 = 110`

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*f0-CTpClWkMAAAAAAAAAAAAAARQnAQ)

### lineDash

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number[]`

**默认值**：无

**是否必须**：`false`

**说明**：一个数组，描述交替绘制的线段和间距。可参考：https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/setLineDash

目前仅支持形如：`[dash, gap]` 的形式，如果数组中仅有一个元素，即 `[dash]` 等价于 `[dash, dash]`。

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

阴影不会影响图形的包围盒，例如下图中给一个半径为 100 的圆添加阴影后，包围盒尺寸不变：

```js
circle.getBounds(); // { halfExtents: [100, 100] }
circle.style.shadowBlur = 20;
circle.getBounds(); // { halfExtents: [100, 100] }
```

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*shbSR55j_iQAAAAAAAAAAAAAARQnAQ)

⚠️ 暂不支持内阴影。

### shadowColor

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `string`

**默认值**：无

**是否必须**：`false`

**说明**：阴影色，例如 `'#1890FF'`。不支持渐变或者纹理写法。

### shadowBlur

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：无

**是否必须**：`false`

**说明**：阴影效果模糊程度，不允许为负数。越大代表越模糊，为 0 时无模糊效果。

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

## 滤镜

滤镜（Filter）可以对已生成的图像进行一些处理，例如模糊、高亮、提升对比度等。在 Web 端有以下实现：

-   CSS Filter：https://developer.mozilla.org/en-US/docs/Web/CSS/filter
-   Canvas Filter：https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/filter
-   SVG Filter：https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/filter
-   WebGL 中一般称作后处理

参考 CSS Filter 语法，我们支持对图形应用一个或多个滤镜效果，[示例](/zh/examples/shape#filter)：

```js
circle.style.filter = 'blur(5px)';
circle.style.filter = 'blur(5px) brightness(0.4)'; // 可叠加
```

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*3MxRTpAT77gAAAAAAAAAAAAAARQnAQ)

目前可以在 g-canvas/svg/webgl 渲染器中使用滤镜，有以下注意事项：

-   由于 Canvas Filter 支持度不佳，主要是 [Safari 不支持](https://caniuse.com/mdn-api_canvasrenderingcontext2d_filter)，因此使用 g-canvas 无法在 Safari 中正常展示滤镜
-   g-canvas 和 g-svg 在部分 filter 效果上略有差异
-   可以施加在所有基础图形以及 Group 上
-   该属性暂不支持动画

### blur

将高斯模糊应用于输入图像。其中 radius 定义了高斯函数的标准偏差值，或者屏幕上有多少像素相互融合，因此较大的值将产生更多的模糊，默认值为 0。该参数可以指定为 CSS 长度，但不接受百分比值。

和阴影一样，模糊同样不会影响图形的包围盒尺寸。

```js
circle.style.filter = 'blur(5px)';
```

下图依次展示了 2px 4px 和 10px 的模糊效果，[示例](/zh/examples/shape#filter)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*rYA_TLechgYAAAAAAAAAAAAAARQnAQ)

### brightness

将线性乘法器应用于输入图像，让它变亮或变暗，默认值为 1。值为 0％ 将创建全黑图像。值为 100％ 会使输入保持不变。其他值是效果的线性乘数。如果值大于 100% 提供更明亮的结果。

```js
circle.style.filter = 'brightness(2)';
circle.style.filter = 'brightness(200%)';
```

下图依次展示了 0 100% 和 200% 的明亮效果，[示例](/zh/examples/shape#filter)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*LG_pQ6GzA3wAAAAAAAAAAAAAARQnAQ)

### drop-shadow

在图像下展示阴影，可以设置阴影颜色、偏移量与模糊效果，依次传入以下参数：

-   offset-x 描述阴影的水平偏移距离，单位 px
-   offset-y 描述阴影的垂直偏移距离，单位 px
-   blur-radius 数值越大越模糊，单位 px，不允许为负数
-   color 阴影颜色

阴影不会影响图形的包围盒尺寸。

```js
circle.style.filter = 'drop-shadow(16px 16px 10px black)';
```

下图依次展示了上面配置的效果，[示例](/zh/examples/shape#filter)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*shbSR55j_iQAAAAAAAAAAAAAARQnAQ)

### contrast

调节图像的对比度。当数值为 0% 时，图像会完全变黑。当数值为 100% 时，图像没有任何变化。

```js
circle.style.filter = 'contrast(2)';
circle.style.filter = 'contrast(200%)';
```

下图依次展示了 0 1 和 10 的对比度效果，[示例](/zh/examples/shape#filter)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*gc-1QJYr2awAAAAAAAAAAAAAARQnAQ)

### grayscale

将图像转换成灰色的图片。当值为 100% 时，图像会完全变成灰色。 当值为 0% 时，图像没有任何变化。

```js
circle.style.filter = 'grayscale(1)';
circle.style.filter = 'grayscale(100%)';
```

下图依次展示了 0 50% 和 100% 的灰度效果，[示例](/zh/examples/shape#filter)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*OadOQLl_bH0AAAAAAAAAAAAAARQnAQ)

### saturate

对图像进行饱和度的处理。当值为 0% 时，图像完全不饱和。当值为 100% 时，图像没有任何变化。

```js
circle.style.filter = 'saturate(1)';
circle.style.filter = 'saturate(100%)';
```

下图依次展示了 0 50% 和 100% 的饱和度效果，[示例](/zh/examples/shape#filter)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8J4IRJTJcVUAAAAAAAAAAAAAARQnAQ)

### sepia

对图像进行深褐色处理（怀旧风格）。当值为 100% 时，图像完全变成深褐色。当值为 0% 时，图像没有任何变化。

```js
circle.style.filter = 'sepia(1)';
circle.style.filter = 'sepia(100%)';
```

下图依次展示了 0 50% 和 100% 的处理效果，[示例](/zh/examples/shape#filter)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*79UARqYrimcAAAAAAAAAAAAAARQnAQ)

### hue-rotate

在输入图像上应用色相旋转，可设定图像会被调整的色环角度值。值为 0deg 时图像无变化。

```js
circle.style.filter = 'hue-rotate(30deg)';
circle.style.filter = 'hue-rotate(180deg)';
```

下图依次展示了 0 90deg 和 180deg 的处理效果，[示例](/zh/examples/shape#filter)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*k8rsSbW4WRwAAAAAAAAAAAAAARQnAQ)

### invert

反转输入图像的颜色。amount 的值定义转换的比例，100% 代表完全反转，0% 则图像无变化。

```js
circle.style.filter = 'invert(1)';
circle.style.filter = 'invert(100%)';
```

下图依次展示了 0 50% 和 100% 的反转效果，[示例](/zh/examples/shape#filter)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N1OjR6pR0CMAAAAAAAAAAAAAARQnAQ)

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

使用裁剪方式创建元素的可显示区域，区域内的部分显示，区域外的隐藏。可参考 CSS 的 [clip-path](https://developer.mozilla.org/zh-CN/docs/Web/CSS/clip-path)。该属性值可以是任意图形，例如 Circle、Rect 等等。同一个裁剪区域可以被多个图形共享使用。最后，裁剪区域也会影响图形的拾取区域，[示例](/zh/examples/event#shapes)。

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

## 鼠标样式

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

# 变换操作

我们提供了一系列变换方法。

## 平移

对于平移操作，我们提供了局部/世界坐标系下，移动绝对/相对距离的 API：

| 名称 | 参数 | 返回值 | 备注 |
| --- | --- | --- | --- |
| translate | `[number, number]`<br />`number, number`<br />`number` | 无 | 在 **世界坐标系** 下，相对当前位置移动 |
| translateLocal | `[number, number]`<br />`number, number`<br />`number` | 无 | 在 **局部坐标系** 下，相对当前位置移动 |
| setPosition | `[number, number]`<br />`number, number`<br />`number` | 无 | 设置 **世界坐标系** 下的位置 |
| setLocalPosition | `[number, number]`<br />`number, number`<br />`number` | 无 | 设置 **局部坐标系** 下的位置 |
| getPosition | 无 | `[number, number]` | 获取 **世界坐标系** 下的位置 |
| getLocalPosition | 无 | `[number, number]` | 获取 **局部坐标系** 下的位置 |

其中 translate/translateLocal/setPosition/setLocalPosition 支持以下入参形式，其中如果只想修改 X 轴方向，可以只传一个数字：

```js
circle.translate([100, 0]); // [number, number]
circle.translate(100, 0); // number, number
circle.translate(100); // number
```

## 缩放

和平移不同，我们无法提供 `setScale` 这样设置世界坐标系下缩放的方法，因此全局坐标系下缩放是只读的，这在 Unity 中称之为 [lossyScale](https://forum.unity.com/threads/solved-why-is-transform-lossyscale-readonly.363594/)。

| 名称 | 参数 | 返回值 | 备注 |
| --- | --- | --- | --- |
| scaleLocal | `[number, number]`<br />`number, number`<br />`number` | 无 | 在 **局部坐标系** 下，相对当前缩放比例继续缩放 |
| setLocalScale | `[number, number]`<br />`number, number`<br />`number` | 无 | 设置 **局部坐标系** 下的缩放比例 |
| getScale | 无 | `[number, number]` | 获取 **世界坐标系** 下的缩放比例 |
| getLocalScale | 无 | `[number, number]` | 获取 **局部坐标系** 下的缩放比例 |

其中 scaleLocal/setLocalScale 支持以下入参形式，其中如果水平/垂直方向缩放比例相等时，可以只传一个数字：

```js
circle.scaleLocal([2, 2]); // [number, number]
circle.scaleLocal(2, 2); // number, number
circle.scaleLocal(2); // number
```

## 旋转

在 3D 场景中，旋转可以用矩阵、轴角、欧拉角和四元数表示，它们彼此之间可以互相转换。虽然考虑到未来的扩展性，在 G 内部实现中我们使用了四元数。

| 名称 | 参数 | 返回值 | 备注 |
| --- | --- | --- | --- |
| rotateLocal | `number` | 无 | 在 **局部坐标系** 下，旋转一定的欧拉角，顺时针方向为正，单位为 `degree` |
| rotate | `number` | 无 | 在 **世界坐标系** 下，旋转一定的欧拉角 |
| setEulerAngles | `number` | 无 | 设置 **世界坐标系** 下的欧拉角 |
| setLocalEulerAngles | `number` | 无 | 设置 **局部坐标系** 下的欧拉角 |
| setLocalRotation | `quat` | 无 | 设置 **局部坐标系** 下的四元数 |
| setRotation | `quat` | 无 | 设置 **世界坐标系** 下的四元数 |
| getEulerAngles | 无 | `number` | 获取 **世界坐标系** 下的欧拉角 |
| getLocalEulerAngles | 无 | `number` | 获取 **局部坐标系** 下的欧拉角 |
| getLocalRotation | 无 | `quat` | 获取 **局部坐标系** 下的四元数 |
| getRotation | 无 | `quat` | 获取 **世界坐标系** 下的四元数 |

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

# 获取包围盒

基于不同的[包围盒定义](/zh/docs/api/basic/display-object#包围盒)，我们提供了以下获取方法。

## getGeometryBounds(): AABB | null

获取基础图形的几何包围盒，除了定义所需的样式属性（例如 Circle 的 r，Rect 的 width/height），它不受其他绘图属性（例如 lineWidth，fitler，shadowBlur 等）影响：

```js
const circle = new Circle({
    style: {
        x: 100, // 局部坐标系下的坐标不会影响 Geometry Bounds
        y: 100, // 局部坐标系下的坐标不会影响 Geometry Bounds
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

## getBounds(): AABB | null

合并自身以及子节点在世界坐标系下的 Geometry Bounds。这应当是最常用的计算方式：

```js
const circle = new Circle({
    style: {
        x: 100, // 应用世界坐标系下的变换
        y: 100,
        r: 100,
    },
});
circle.getBounds(); // { center: [100, 100], halfExtents: [100, 100] }
```

## getRenderBounds(): AABB | null

合并自身以及子节点在世界坐标系下的 Render Bounds，在 Geometry Bounds 基础上，受以下样式属性影响： lineWidth，shadowBlur，filter：

```js
const circle = new Circle({
    style: {
        x: 100, // 应用世界坐标系下的变换
        y: 100,
        r: 100,
        lineWidth: 20, // 考虑样式属性
    },
});
// r + lineWidth / 2
circle.getRenderBounds(); // { center: [100, 100], halfExtents: [110, 110] }
```

## getLocalBounds(): AABB | null

getBounds 的唯一区别是在父节点的局部坐标系下计算。

## getBoundingClientRect(): Rect

获取浏览器坐标系下的 Geometry Bounds，应用世界坐标系下的变换后，再加上画布相对于浏览器的偏移量。

返回的 2 维矩形 `Rect` 和 [DOMRect](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMRect) 保持一致，结构为：

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

# 节点操作

在场景图中，我们需要构建父子关系，快速获取父子节点，有时还需要在子树中查询某一类型的节点列表。基于继承关系，每个 DisplayObject 都拥有 [Node](/zh/docs/api/builtin-objects/node) 和 [Element](/zh/docs/api/builtin-objects/element) 能力。

## 简单节点查询

| 名称            | 属性/方法 | 返回值            | 备注                           |
| --------------- | --------- | ----------------- | ------------------------------ | ------------------------------------ |
| parentNode      | 属性      | `DisplayObject    | null`                          | 父节点（如有）                       |
| parentElement   | 属性      | `DisplayObject    | null`                          | 父节点（如有）                       |
| childNodes      | 属性      | `DisplayObject[]` | 子节点列表                     |
| children        | 属性      | `DisplayObject[]` | 子节点列表                     |
| firstChild      | 属性      | `DisplayObject    | null`                          | 返回子节点列表中第一个节点（如有）   |
| lastChild       | 属性      | `DisplayObject    | null`                          | 返回子节点列表中最后一个节点（如有） |
| nextSibling     | 属性      | `DisplayObject    | null`                          | 返回后一个兄弟节点（如有）           |
| previousSibling | 属性      | `DisplayObject    | null`                          | 返回前一个兄弟节点（如有）           |
| contains        | 方法      | `boolean`         | 子树中是否包含某个节点（入参） |
| getRootNode     | 方法      | `Node`            | 返回当前节点的根节点           |
| ownerDocument   | 属性      | `Document`        | 返回画布入口 Document          |
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
| find | `(filter: Function)` | `DisplayObject ｜ null` | 查询满足条件的第一个子节点 |
| findAll | `(filter: Function)` | `DisplayObject[]` | 查询满足条件的所有子节点列表 |

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

有时查询条件不好用 CSS 选择器描述，此时可以使用自定义查询方法：find/findAll。它们可以类比成 querySelector/querySelectorAll。不同之处在于前者需要传入一个 filter，例如以下写法等价：

```js
solarSystem.querySelector('[name=sun]');
solarSystem.find((element) => element.name === 'sun');

solarSystem.querySelectorAll('[r=25]');
solarSystem.findAll((element) => element.style.r === 25);
```

## 添加/删除节点

以下添加/删除节点能力来自继承的 [Element](/zh/docs/api/builtin-objects/element) 基类。

| 名称 | 参数 | 返回值 | 备注 |
| --- | --- | --- | --- |
| appendChild | `child: DisplayObject` | `DisplayObject` | 添加子节点，返回添加的节点 |
| insertBefore | `child: DisplayObject`<br/>`reference?: DisplayObject` | `DisplayObject` | 添加子节点，在某个子节点之前（如有），返回添加的节点 |
| append | `...nodes: DisplayObject[]` |  | 在当前节点的子节点列表末尾批量添加一组节点 |
| prepend | `...nodes: DisplayObject[]` |  | 在当前节点的子节点列表头部批量添加一组节点 |
| after | `...nodes: DisplayObject[]` |  | 在当前节点之后批量添加一些兄弟节点 |
| before | `...nodes: DisplayObject[]` |  | 在当前节点之前批量添加一些兄弟节点 |
| removeChild | `child: DisplayObject`<br/>`destroy = true` | `DisplayObject` | 删除子节点，返回被删除的节点。`destroy` 表示是否要销毁 |
| removeChildren | `destroy = true` |  | 删除全部子节点。`destroy` 表示是否要销毁 |
| remove | `destroy = true` | `DisplayObject` | 从父节点（如有）中移除自身，`destroy` 表示是否要销毁 |
| replaceChild | `child: DisplayObject` | `DisplayObject` | 用指定的节点替换当前节点的一个子节点，并返回被替换掉的节点 |
| replaceWith | `...nodes: DisplayObject[]` |  | 在父节点的子节点列表中，用传入的节点列表替换该节点 |
| replaceChildren | `...nodes: DisplayObject[]` |  | 替换该节点的所有子节点。不传参数时则会清空该节点的所有子节点 |

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
2. 删除节点时会依次触发 Removed 和 ChildRemoved 事件，默认会调用 [destroy](/zh/docs/api/basic/display-object#销毁) 销毁自身。如果只是暂时从场景图中移除，后续还可能继续添加回来，可以使用 `remove(false)`

## 克隆节点

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

-   支持深拷贝，即自身以及整棵子树
-   克隆的新节点不会保留原始节点的父子关系，需要使用 `appendChild` 将其加入画布才会被渲染
-   与 [DOM API](https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode#notes) 保持一致，不会拷贝原图形上的事件监听器

在这个[示例](/zh/examples/scenegraph#clone)中，我们展示了以上特性：

-   可以随时更改原始节点的样式属性，得到的拷贝都会是最新的，新节点同样需要被加入到场景图中才会被渲染
-   但由于不会拷贝事件监听器，因此只有原始节点可以进行拖拽
-   非深拷贝模式下，Text（Drag me 文本） 作为 Circle 的子节点不会被拷贝

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*PwEYSI_ijPEAAAAAAAAAAAAAARQnAQ)

## 获取/设置属性值

| 名称         | 参数                         | 返回值 | 备注       |
| ------------ | ---------------------------- | ------ | ---------- | -------------------- |
| getAttribute | `(name: string)`             | `null  | any`       | 根据属性名获取属性值 |
| setAttribute | `(name: string, value: any)` | 无     | 设置属性值 |

⚠️ 兼容旧版 `attr(name: string, value?: any)`，获取以及设置属性值。

⚠️ 兼容 [HTMLElement Style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style)，因此可以使用以下方法：

-   style.[getPropertyValue](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/getPropertyValue)
-   style.[setProperty](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty)
-   style.[removeProperty](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/removeProperty)

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

## 销毁

调用 `destroy()` 将销毁节点。被销毁的节点将无法被再次加入画布渲染。通过 [destroyed](/zh/docs/api/basic/display-object#destroyed) 属性可以判断一个节点是否已经被销毁。

```js
circle.destroy();
```

在调用用该方法时，会依次执行以下操作：

1. 触发 Destroy 事件
2. 调用 `remove()` 将自身从场景图中移除，因此会触发 Removed 和 ChildRemoved 事件
3. 移除该节点上的所有事件监听器
4. 将 [destroyed](/zh/docs/api/basic/display-object#destroyed) 标志置为 true

## 状态

通过以下属性可以判断图形当前的状态，例如是否被加入到画布中，是否已经被销毁等。

### isConnected

用于判断一个图形是否已经被加入到画布中。

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/isConnected

```js
circle.isConnected; // false
canvas.appendChild(circle); // add to canvas
circle.isConnected; // true
```

### ownerDocument

指向画布的入口 Document。如果还未加入到画布中，返回 null。

https://developer.mozilla.org/en-US/docs/Web/API/Node/ownerDocument

```js
circle.ownerDocument; // null
canvas.appendChild(circle); // add to canvas
circle.ownerDocument; // canvas.document
```

### destroyed

用于判断一个图形是否已经被销毁。

通过调用 `destroy()` 主动销毁自身，或者父节点通过 `removeChildren()` 主动移除并销毁所有子节点等：

```js
circle.destroyed; // false
circle.destroy();
circle.destroyed; // true
```

## 生命周期事件监听

在[事件系统](/zh/docs/api/event)中，我们可以使用类似 DOM Event API 的方式给添加到画布中的节点增加事件监听器。

除了例如 click、mouseenter 这样的交互事件，我们还提供了一系列内置的节点生命周期事件，例如可以监听节点的添加和删除事件，这些事件同样有完整的传播路径（冒泡、捕获），[示例](/zh/examples/event#builtin)：

```js
import { ElementEvent } from '@antv/g';

// 监听子节点添加事件
parent.on(ElementEvent.CHILD_INSERTED, (e) => {
    e.target; // parent
    e.detail.child; // child
});
child.on(ElementEvent.INSERTED, (e) => {
    e.target; // child
    e.detail.parent; // parent
});
parent.on(ElementEvent.CHILD_REMOVED, (e) => {
    e.target; // parent
    e.detail.child; // child
});
child.on(ElementEvent.REMOVED, (e) => {
    e.target; // child
    e.detail.parent; // parent
});
child.on(ElementEvent.ATTR_MODIFIED, (e) => {
    e.target; // child
    e.detail.attributeName; // 属性名
    e.detail.oldValue; // 旧值
    e.detail.newValue; // 新值
});

parent.appendChild(child);
```

目前我们支持如下场景图相关事件：

-   CHILD_INSERTED 作为父节点有子节点添加时触发
-   INSERTED 作为子节点被添加时触发
-   CHILD_REMOVED 作为父节点有子节点移除时触发
-   REMOVED 作为子节点被移除时触发
-   MOUNTED 首次进入画布时触发
-   UNMOUNTED 从画布中移除时触发
-   ATTR_MODIFIED 修改属性时触发
-   DESTROY 销毁时触发

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

⚠️ 当图形隐藏时不会被拾取。

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
