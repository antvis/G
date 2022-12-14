---
title: 基础概念
order: -1
---

首先需要明确一些概念，例如包围盒、坐标、锚点、变换中心等。了解它们有助于更好地使用具体的 API。

## 层次结构

在[场景图](/zh/guide/diving-deeper/scenegraph)中我们了解到可以在图形之间构建父子关系，这种父子关系有时会与我们的直觉相悖，例如给一根直线（[Line](/zh/api/basic/line)）添加一个子节点文本（[Text](/zh/api/basic/text)）：

```js
line.appendChild(text);
```

但本质上这种层次结构只是定义了一种父子关系，在计算变换时把它考虑进去。例如我们不需要再单独移动直线以及文本，基于这种父子关系，移动直线即可，文本会跟随它移动。在变换过程中，文本相对于直线的位置始终并没有变，即文本在父节点直线的局部坐标系下的坐标没有变。

## 包围盒

为了简化计算，我们需要用一个规则的几何体包裹住图形，通常使用[轴对齐包围盒](https://developer.mozilla.org/zh-CN/docs/Games/Techniques/3D_collision_detection#axis-aligned_bounding_boxes%EF%BC%88aabb%E5%8C%85%E5%9B%B4%E7%9B%92%EF%BC%89)（Axis Aligned Bounding Box），它是一个非旋转的立方体，下图来自：https://developer.mozilla.org/zh-CN/docs/Games/Techniques/3D_collision_detection#axis-aligned_bounding_boxes%EF%BC%88aabb%E5%8C%85%E5%9B%B4%E7%9B%92%EF%BC%89 ![](https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection/screen_shot_2015-10-16_at_15.11.21.png)

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

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*f0-CTpClWkMAAAAAAAAAAAAAARQnAQ" width="300">

我们很容易根据不同类型的图形定义几何包围盒：

-   **Geometry Bounds**。仅由图形的几何定义决定（因此 [Group](/zh/api/basic/group) 会返回 null），不考虑绝大部分绘图属性（几何定义必须的除外，例如 [Circle](/zh/api/basic/circle) 的半径、[Rect](/zh/api/basic/rect) 的宽高、[Path](/zh/api/basic/path) 的路径定义等），也不考虑变换（例如放大缩小并不会改变）。可通过 [getGeometryBounds](/zh/api/basic/display-object#getgeometrybounds-aabb) 获取

前面介绍过基于场景图的层次结构，一旦一个图形拥有了子节点，它在计算包围盒时也应当考虑，例如我们想对它做整体旋转时，需要找到这个包围盒的中心作为旋转中心。因此以下包围盒都是会考虑层次结构的：

-   **Bounds**。在世界坐标系下计算，合并自身以及所有子节点的 Geometry Bounds 得到。用户通常最常用这个包围盒。可通过 [getBounds](/zh/api/basic/display-object#getbounds-aabb) 获取
-   **Local Bounds**。和 Bounds 的唯一区别是在父节点的局部坐标系下计算。可通过 [getLocalBounds](/zh/api/basic/display-object#getlocalbounds-aabb) 获取
-   **Render Bounds**。在世界坐标系下计算，在 Bounds 的基础上，受部分绘图属性影响，例如边框宽度，阴影，部分滤镜等，同时合并所有子节点的 Render Bounds。可通过 [getRenderBounds](/zh/api/basic/display-object#getrenderbounds-aabb) 获取。用户通常不关心这个包围盒。

在下图中，ul1 拥有两个字节点 li1 和 li2，在计算自身的 Geometry Bounds 时不会考虑它们，而在计算 Bounds 时需要。由于 ul1 还有阴影，因此它的 Render Bounds 要大一圈：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*RjRuQ7iMtwgAAAAAAAAAAAAAARQnAQ)

## 锚点

一个图形的锚点（原点）应该如何定义呢？我们可以基于 [Geometry Bounds](/zh/api/basic/display-object#包围盒) 定义，取值范围 `[0, 0] ~ [1, 1]`，其中 `[0, 0]` 代表 Geometry Bounds 左上角，`[1, 1]` 代表右下角。而不同图形由于几何定义不同，默认锚点如下：

-   [Circle](/zh/api/basic/circle)，[Ellipse](/zh/api/ellipse) 为圆心位置 `[0.5, 0.5]`
-   [Rect](/zh/api/rect)，[Image](/zh/api/image)，[Line](/zh/api/basic/line)，[Polyline](/zh/api/polyline)，[Polygon](/zh/api/polygon)，[Path](/zh/api/path) 为包围盒左上角顶点位置 `[0, 0]`
-   [Text](/zh/api/basic/text) 为文本锚点位置，应该使用 [textBaseline](http://localhost:8000/zh/api/basic/text#textbaseline) 与 [textAlign](/zh/api/basic/text#textalign) 这两个属性设置，因此设置此属性无效
-   [Group](/zh/api/basic/text) 无几何定义，因此锚点始终为 `[0, 0]`，设置此属性也无效

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

在某些场景下，用一些字面量或者百分比定义会更方便。例如 CSS 就提供了 `transform-origin` 属性，它正是相对于 Bounds 进行定义的，下图来自：https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_1WJQLRobtgAAAAAAAAAAAAAARQnAQ)

当我们想实现“绕中心点旋转”时，只需要使用字面量或者百分比，这样就能避免进行 Bounds 的获取：

```js
group.style.transformOrigin = 'center';
group.style.transformOrigin = 'center center';
group.style.transformOrigin = '50% 50%';
```

<!-- 在这个[示例](/zh/examples/scenegraph#origin)中，每次向 Group 添加子元素后，我们都会重新设置 transformOrigin，因此这个 Group 会始终绕中心旋转：

```js
group.appendChild(cloned);
group.style.transformOrigin = 'center';
```

我们之所以无法做成根据 Bounds 自动计算，是因为导致 Bounds 发生变化的情况实在太多，甚至目标图形自身进行旋转时，Bounds 都在实时改变。试想一个图形正在绕变换中心进行旋转，Bounds 时时刻刻都在改变，如果根据 Bounds 实时计算变换中心，会导致旋转中心不稳定，出现旋转抖动问题： -->
