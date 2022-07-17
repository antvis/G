---
title: Line
order: 6
---

You can refer to the [\<line\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/line) element of SVG.

The following [example](/en/examples/shape#line) defines a line with two endpoints `[200, 100]` and `[400, 100]`, a line width of 2, and a dashed line.

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

For a straight line, the default anchor point is defined at the top left vertex of the enclosing box, where the two endpoint coordinates `[x1, y1]` `[x2, y2]` are defined under the local coordinate system, so if you get the coordinates of the line in the local coordinate system at this point, you will get the coordinates of `[x1, y1]`, i.e. `[200, 100]`.

```js
line1.getLocalPosition(); // [200, 100]
```

For the above line as `(200, 100)`. When we want to move this line 100 distance to the right along the X-axis, we can do three things:

-   Use [translate]() to translate a relative distance in the world coordinate system
-   Use [setPosition]() to set the absolute coordinates in the world coordinate system
-   Directly modify the x1/x2 property in the line definition

```javascript
// 平移相对距离，此时 x1/x2 不变
line1.translate(100, 0);
// 或者，直接设置锚点位置
line1.setPosition(200 + 100, 0);
// 或者，直接移动两个端点
line1.style.x1 = 200 + 100;
line1.style.x2 = 400 + 100;
```

If you want to change the default anchor position, you can do so by using the `anchor` property, for example, by using the midpoint of the line as the anchor point, where the coordinates in the line's local coordinate system remain the same, but the anchor point is moved to `[200, 100]`, so the display will change.

```js
line.style.anchor = [0.5, 0.5];
line.getLocalPosition(); // [200, 100]
```

# Inherited from

Inherits [style property](/en/docs/api/basic/display-object#drawing-properties) from [DisplayObject](/en/docs/api/basic/display-object).

## anchor

The default value is `[0, 0]`. For details, see [DisplayObject's anchor](/en/docs/api/basic/display-object#anchor).

## transformOrigin

The default value is `left top`. For details, see [DisplayObject's transformOrigin](/en/docs/api/basic/display-object#transformOrigin).

## lineWidth

Default value is `'1'`. See [DisplayObject's lineWidth](/en/docs/api/basic/display-object#lineWidth) for details.

# Additional Properties

## x1

The x-axis coordinate of the first endpoint in the local coordinate system.

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/x1

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | no | yes | [\<percentage\>](/en/docs/api/css/css-properties-values-api#percentage) [\<length\>](/en/docs/api/css/css-properties-values-api#length) |

## y1

The y-axis coordinate of the first endpoint in the local coordinate system.

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/y1

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | no | yes | [\<percentage\>](/en/docs/api/css/css-properties-values-api#percentage) [\<length\>](/en/docs/api/css/css-properties-values-api#length) |

## z1

The z-axis coordinate of the first endpoint in the local coordinate system.

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | no | yes | [\<percentage\>](/en/docs/api/css/css-properties-values-api#percentage) [\<length\>](/en/docs/api/css/css-properties-values-api#length) |

## x2

The x-axis coordinate of the second endpoint in the local coordinate system.

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/x2

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | no | yes | [\<percentage\>](/en/docs/api/css/css-properties-values-api#percentage) [\<length\>](/en/docs/api/css/css-properties-values-api#length) |

## y2

The y-axis coordinate of the second endpoint in the local coordinate system.

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/y2

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | no | yes | [\<percentage\>](/en/docs/api/css/css-properties-values-api#percentage) [\<length\>](/en/docs/api/css/css-properties-values-api#length) |

## z2

The z-axis coordinate of the second endpoint in the local coordinate system.

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | no | yes | [\<percentage\>](/en/docs/api/css/css-properties-values-api#percentage) [\<length\>](/en/docs/api/css/css-properties-values-api#length) |

## isBillboard

Effective in 3D scenes, always facing the screen, so the line width is not affected by the perspective projection image. The default value is `false`. [example](/en/examples/3d#force-3d)

# Methods

## getTotalLength(): number

Get the length of the line.

https://developer.mozilla.org/zh-CN/docs/Web/API/SVGGeometryElement/getTotalLength

```js
line.getTotalLength(); // 200
```

## getPoint(ratio: number): Point

Obtain the coordinates of a point in the local coordinate system on a line according to the length scale (in the range `[0-1]`), where `Point` is of the form :

```ts
export type Point = {
    x: number;
    y: number;
};
```

For example, to obtain the midpoint of the line defined above.

```js
line.getPoint(0.5); // Point {x: 300, y: 100}
```

# Lines in 3D scenes

Requires use with [g-webgl](/en/docs/api/renderer/webgl) renderer and [g-plugin-3d](/en/docs/plugins/3d) plug-in.

Extending endpoint coordinates to 3D.

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

2D lines are guaranteed to have a consistent width under orthogonal projection, but not under perspective projection. In some 3D scenes where the line width needs to be consistent at all times, you can turn on [isBillboard](/en/docs/api/basic/line#isbillboard), [example](/en/examples/3d#force-3d)
