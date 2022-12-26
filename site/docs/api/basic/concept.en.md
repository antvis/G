---
title: Basic Concepts
order: -1
---

First, you need to clarify some concepts, such as bounding boxes, coordinates, anchor points, transform centers, etc. Understanding them helps to better use the specific API. Understanding them helps to better use the specific API.

## Hierarchy

In [scene graph](/en/guide/diving-deeper/scenegraph) we learned that it is possible to construct parent-child relationships between graphs, and that such parent-child relationships can sometimes be counter-intuitive, for example adding a child node text ([Text](/en/api/basic/text)) to a line ([Line](/en/api/basic/line)).

```js
line.appendChild(text);
```

But essentially this hierarchy just defines a parent-child relationship that is taken into account when computing the transformation. For example, we don't need to move the line and the text separately anymore, based on this parent-child relationship, we can just move the line and the text will follow it. During the transformation, the position of the text relative to the line remains unchanged, i.e., the coordinates of the text in the local coordinate system of the parent line remain unchanged.

## Bounding Box

To simplify the calculation, we need to wrap the figure in a regular geometry, usually using [axis-aligned bounding boxes](https://developer.mozilla.org/zh-CN/docs/Games/Techniques/3D_collision_detection#axis- aligned_bounding_boxes%EF%BC%88aabb%E5%8C%85%E5%9B%B4%E7%9B%92%EF%BC%89) (Axis Aligned Bounding Box), which is a non-rotating cube, and the following figure from

https://developer.mozilla.org/zh-CN/docs/Games/Techniques/3D_collision_detection#axis-aligned_bounding_boxes%EF%BC%88aabb%E5%8C%85%E5%9B%B4%E7%9B%92%EF%BC%89

<img src="https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection/screen_shot_2015-10-16_at_15.11.21.png" width="300" alt="AABB">

We use the following definitions.

```js
interface AABB {
    center: [number, number, number]; // 中心坐标
    halfExtents: [number, number, number]; // 长宽高的一半
    min: [number, number, number]; // 左上角坐标
    max: [number, number, number]; // 右下角坐标
}
```

AABB boxes have different meanings in different situations. Let's first look at what a wraparound box represents for a single figure. The figure below shows a circle with a radius of 100 and a border width of 20. For better illustration we have set the border to be translucent and it also has a shadow effect.

For the user, it is often desirable to use the geometric definition of the shape, e.g. the size of the circle is `100 * 100`, and we don't want the circle to be picked up even if the mouse slides over the shaded area.

And for rendering pipelines, these style properties obviously need to be taken into account, e.g.

-   Correctly erasing the drawn area in the dirty rectangle rendering will result in a poorly erased "shadow" once the increase in the size of the enclosing box due to the shadow is not taken into account
-   Culling plug-ins also needs to be considered, for example a drawing should not be rejected even if only the shaded part appears in the viewport

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*f0-CTpClWkMAAAAAAAAAAAAAARQnAQ" width="300">

It is easy to define geometric enclosing boxes based on different types of graphs.

-   **Geometry Bounds**。Determined only by the geometric definition of the figure, disregard most of the drawing properties(like radius of [Circle](/en/api/basic/circle) , width/height of [Rect](/en/api/basic/rect), path definition of [Path](/en/api/basic/path)) and transformation. We can use [getGeometryBounds](/en/api/basic/display-object#getgeometrybounds-aabb) to get them.

Once a node has child nodes, it should be considered in the calculation of the enclosing box. For example, if we want to rotate it as a whole, we need to find the center of the enclosing box as the center of rotation. Therefore, the following enclosing boxes are considered for the hierarchy.

-   **Bounds**。It is calculated in the world coordinate system and obtained by merging the Geometry Bounds of itself and all its children. Users usually use this wrapping box most often. We can use [getBounds](/en/api/basic/display-object#getbounds-aabb) to get them.
-   **Local Bounds**。The only difference with Bounds is that it is calculated in the local coordinate system of the parent node. We can use [getLocalBounds](/en/api/basic/display-object#getlocalbounds-aabb) to get them.
-   **Render Bounds**。Calculated in the world coordinate system, based on Bounds, influenced by some rendering properties, such as border width, shadows, some filters, etc., while merging the Render Bounds of all child nodes. We can use [getRenderBounds](/en/api/basic/display-object#getrenderbounds-aabb) to get them.

In the figure below, ul1 has two word nodes, li1 and li2, which are not considered in the calculation of its own Geometry Bounds, but are needed in the calculation of Bounds. Since ul1 also has shadows, its Render Bounds are one turn larger.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*RjRuQ7iMtwgAAAAAAAAAAAAAARQnAQ" width="300" alt="bounds">

## Anchor

How should the anchor point (origin) of a graph be defined? We can define it based on Geometry Bounds, with the value range `[0, 0] ~ [1, 1]`, where `[0, 0]` represents the upper left corner of Geometry Bounds and `[1, 1]` represents the lower right corner. And the default anchor points for different shapes due to different geometry definitions are as follows.

-   The center of [Circle](/en/api/basic/circle) and [Ellipse](/en/api/ellipse) is `[0.5, 0.5]`
-   The top left corner of [Rect](/en/api/rect), [Image](/en/api/image), [Line](/en/api/basic/line), [Polyline](/en/api/polyline), [Polygon](/en/api/polygon) and [Path](/en/api/path) is `[0, 0]`.
-   We should always use [textBaseline](/en/api/basic/text#textbaseline) and [textAlign](/en/api/basic/text#textalign) to set the anchor of [Text](/en/api/basic/text).
-   Since [Group](/en/api/basic/text) has no geometry bounds, so its anchor is `[0, 0]`.

Sometimes we want to change the definition of the origin of a base graph, for example by defining the anchor of Rect as the center instead of the top left corner, [example](/en/examples/shape#rect)：

```js
rect.style.anchor = [0.5, 0.5];
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*PamuTYmdbsQAAAAAAAAAAAAAARQnAQ" alt="anchor" width="300">

Does that anchor point change affect the coordinates of the drawing in the local/world coordinate system? The answer is no. We just put the origin of the graph in these coordinates, and no matter how the definition of the origin is changed, the "location" coordinates remain unchanged.

```js
rect.getPosition(); // [200, 200]
rect.style.anchor = [0.5, 0.5];
rect.getPosition(); // [200, 200]
```

## Transform Origin

When scaling or rotating a drawing, you need to specify a transformation center. For example, if you use `scale(2)` as the center of a circle, you will get a completely different result than if you use the upper left corner of the Geometry Bounds of a circle as the center of the transformation. In a library like `gl-matrix`, the RTS transformation matrix is usually obtained by specifying the transformation center.

```js
mat4.fromRotationTranslationScaleOrigin();
```

In some scenarios, it is easier to use some literal or percentage definitions. CSS, for example, provides the `transform-origin` property, which is defined exactly relative to Bounds. The image below is from: https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_1WJQLRobtgAAAAAAAAAAAAAARQnAQ" width="600" alt="transform origin">

When we want to achieve "rotation around the center", we only need to use literal amounts or percentages, so that we can avoid having to do Bounds fetching.

```js
group.style.transformOrigin = 'center';
group.style.transformOrigin = 'center center';
group.style.transformOrigin = '50% 50%';
```

<!-- 在这个[示例](/en/examples/scenegraph#origin)中，每次向 Group 添加子元素后，我们都会重新设置 transformOrigin，因此这个 Group 会始终绕中心旋转：

```js
group.appendChild(cloned);
group.style.transformOrigin = 'center';
```

我们之所以无法做成根据 Bounds 自动计算，是因为导致 Bounds 发生变化的情况实在太多，甚至目标图形自身进行旋转时，Bounds 都在实时改变。试想一个图形正在绕变换中心进行旋转，Bounds 时时刻刻都在改变，如果根据 Bounds 实时计算变换中心，会导致旋转中心不稳定，出现旋转抖动问题： -->
