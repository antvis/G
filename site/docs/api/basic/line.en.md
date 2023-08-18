---
title: Line
order: 6
---

You can refer to the [\<line\>](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line) element of SVG.

The following [example](/en/examples/shape/line/#line) defines a line with two endpoints `[200, 100]` and `[400, 100]`, a line width of 2, and a dashed line.

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

## Inherited from

Inherits [style property](/en/api/basic/display-object#drawing-properties) from [DisplayObject](/en/api/basic/display-object).

### anchor

The default value is `[0, 0]`. For details, see [DisplayObject's anchor](/en/api/basic/display-object#anchor).

### transformOrigin

The default value is `left top`. For details, see [DisplayObject's transformOrigin](/en/api/basic/display-object#transformOrigin).

### lineWidth

Default value is `'1'`. See [DisplayObject's lineWidth](/en/api/basic/display-object#lineWidth) for details.

## Additional Properties

### x1

The x-axis coordinate of the first endpoint in the local coordinate system.

<https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/x1>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### y1

The y-axis coordinate of the first endpoint in the local coordinate system.

<https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/y1>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### z1

The z-axis coordinate of the first endpoint in the local coordinate system.

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### x2

The x-axis coordinate of the second endpoint in the local coordinate system.

<https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/x2>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### y2

The y-axis coordinate of the second endpoint in the local coordinate system.

<https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/y2>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### z2

The z-axis coordinate of the second endpoint in the local coordinate system.

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### isBillboard

Effective in 3D scenes, always facing the screen, so the line width is not affected by the perspective projection image. The default value is `false`. [example](/en/examples/3d#force-3d)

### markerStart

You can refer to the [attribute of the same name](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/marker-start) of SVG.

Add a marker graphic to the "start point" of the line, where the "start point" is the endpoint defined by [x1/y1](/en/api/basic/line#x1).

In the following [example](/en/examples/shape/line#line), we first created an arrow using [Path](/en/api/basic/path) and then added it to the start of the line with this property.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Ft0URoJ4joYAAAAAAAAAAAAAARQnAQ" width="200" alt="arrowhead">

```js
// Create a marker graphic
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
        markerStart: arrowMarker, // Placement on the "start point" of the line
    },
});
```

The marker graphic can be any graphic, and we will place it in the right place and adjust the orientation. When the definition of a line is changed, it will be adjusted automatically as well.

Of course you can also manually adjust its [anchor](/en/api/basic/display-object#anchor), [transformOrigin](/en/api/basic/display-object#transformorigin) and [transform](/en/api/basic/display-object#transform), for example in this [example](/en/examples/shape/line#line) we rotate [Image](/en/api/basic/image) as a marker graphic, manually rotated by 90 degrees.

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

If you want to unset the marker graphic, you can set it to null or the empty string.

```js
line.style.markerStart = null;
```

The relationship between the line and the marker graph in the implementation is parent-child.

```js
Line
  -> Path(#markerStart)
  -> Path(#markerEnd)
```

This can also be found using [childNodes](/en/api/builtin-objects/node#childnodes).

```js
line.style.markerStart = arrowHead;
line.childNodes; // [Path]
```

The "start point" and "end point" can be set to the same marker graph, and internally it will first use [cloneNode](/en/api/builtin-objects/node## clonenode) to generate a new graph. So once we specify a marker graph, subsequent attempts to modify its properties cannot operate on the original graph, but need to be obtained by [childNodes](/en/api/builtin-objects/node#childnodes).

```js
line.style.markerStart = arrowhead;
line.style.markerEnd = arrowhead;

// wrong
arrowhead.style.stroke = 'red';

// correct!
line.childNodes[0].style.stroke = 'red';
```

### markerEnd

Add a marker graphic to the "endpoint" of the line, where "endpoint" is the endpoint defined by [x2/y2](/en/api/basic/line#x2).

You can refer to the [attribute of the same name](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/marker-end) of SVG.

### markerStartOffset

Sometimes we want to adjust the position of the marker shape, so we provide the option to increase the offset along the line by a certain amount, positive offset inward and negative offset outward.

In [example](/en/examples/shape/line#line), we manipulate this property to give the line a "stretch effect".

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Uc-wSYP9sYUAAAAAAAAAAAAAARQnAQ">

It is worth noting that while the offset will make the line change visually, it does not affect the [x1/y1/x2/y2](/en/api/basic/line#x1) values of these attributes.

In [example](/en/examples/shape/line#marker), the endpoints of the line coincide with the center of the circle at both ends, but to avoid the arrows coinciding with the nodes at both ends, they need to be indented a certain distance inward.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*X5W_TYz-2SIAAAAAAAAAAAAAARQnAQ" alt="arrow marker" width="200">

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<length\>](/en/api/css/css-properties-values-api#length)             |

### markerEndOffset

Adjusts the position of the marker graphic at the "end point".

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<length\>](/en/api/css/css-properties-values-api#length)             |

## Methods

### getTotalLength

Get the length of the line.

<https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getTotalLength>

```js
line.getTotalLength(); // 200
```

### getPointAtLength

Returns the point along the path at a given distance, controlled by a second optional parameter in the local or world coordinate system.

The parameters are as follows.

-   `distance` mandatory, the distance value
-   `inWorldSpace` optional, indicates if the distance is calculated in the world coordinate system. The default value is `false`.

where `Point` has the format:

```ts
export type Point = {
    x: number;
    y: number;
};
```

<https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getPointAtLength>

For example, to obtain the coordinates of a point in the local coordinate system on a line at a distance of 100 from the starting point.

```js
line.getPointAtLength(100); // Point {x: 300, y: 100}
```

### getPoint

Get the coordinates of the point on the line in the local or world coordinate system according to the length scale (in the range `[0-1]`).

The parameters are as follows.

-   `ratio` mandatory, the length ratio
-   `inWorldSpace` optional, if or not it is calculated in the world coordinate system. The default value is `false`.

For example, to get the midpoint of the line defined above.

```js
line.getPoint(0.5); // Point {x: 300, y: 100}
```

## Lines in 3D scenes

Requires use with [g-webgl](/en/api/renderer/webgl) renderer and [g-plugin-3d](/en/plugins/3d) plug-in.

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

2D lines are guaranteed to have a consistent width under orthogonal projection, but not under perspective projection. In some 3D scenes where the line width needs to be consistent at all times, you can turn on [isBillboard](/en/api/basic/line#isbillboard), [example](/en/examples/3d#force-3d)
