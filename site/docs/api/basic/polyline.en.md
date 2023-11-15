---
title: Polyline
order: 7
---

You can refer to the [\<polyline\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/polyline) element of SVG.

The following [example](/en/examples/shape/polyline#polyline) defines a polyline with the following endpoints in order

```javascript
const polyline = new Polyline({
    style: {
        points: [
            [50, 50],
            [100, 50],
            [100, 100],
            [150, 100],
            [150, 150],
            [200, 150],
            [200, 200],
            [250, 200],
            [250, 250],
            [300, 250],
            [300, 300],
            [350, 300],
            [350, 350],
            [400, 350],
            [400, 400],
            [450, 400],
        ],
        stroke: '#1890FF',
        lineWidth: 2,
    },
});
```

For the line, the default anchor point is defined at the top left vertex of the enclosing box, where the coordinates of each endpoint are defined in the local coordinate system. So if we get the coordinates of the above line in the local coordinate system, we will get the coordinates of the upper left corner of the enclosing box, which also happens to be the coordinates of the first vertex, i.e. `[50, 50]`.

```js
polyline.getLocalPosition(); // [50, 50]
```

## Inherited from

Inherits [style property](/en/api/basic/display-object#drawing-properties) from [DisplayObject](/en/api/basic/display-object).

### anchor

The default value is `[0, 0]`. For details, see [DisplayObject's anchor](/en/api/basic/display-object#anchor).

### transformOrigin

The default value is `left top`. For details, see [DisplayObject's transformOrigin](/en/api/basic/display-object#transformOrigin).

### lineWidth

Default value is `'1'`. See [DisplayObject's lineWidth](/en/api/basic/display-object#lineWidth) for details.

### miterLimit

Default value is `'4'`. See [DisplayObject's miterLimit](/en/api/basic/display-object#miterLimit)

## Additional Properties

### points

The following two writing methods are supported.

-   `[number, number][]` an array of points
-   `string` points are separated by spaces, e.g., `'100,10 250,150 200,110'`

Thus the following two ways of writing are equivalent.

```js
polyline.style.points = '100,10 250,150 200,110';
polyline.style.points = [
    [100, 10],
    [250, 150],
    [200, 110],
];
```

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/points>

### markerStart

See the [markerStart](/en/api/basic/line) property of [Line](/en/api/basic/line#markerstart).

The "start point" is determined by the first point in [points](/en/api/basic/polyline#points).

In this [example](/en/examples/shape/polyline#polyline), we have placed an arrow at the start of the line.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*jPJnTJ9VANYAAAAAAAAAAAAAARQnAQ" alt="polyline marker" width="120">

```js
const arrowMarker = new Path({
    style: {
        path: 'M 10,10 L -10,0 L 10,-10 Z',
        stroke: '#1890FF',
        anchor: '0.5 0.5',
        transformOrigin: 'center',
    },
});

polyline.style.markerStart = arrowMarker;
```

### markerEnd

See the [markerEnd](/en/api/basic/line) attribute of [Line](/en/api/basic/line#markerend).

The "end point" is determined by the last point in [points](/en/api/basic/polyline#points).

In this [example](/en/examples/shape/polyline#polyline), we have placed an image at the termination point of the line.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*aXEMQIPzPVYAAAAAAAAAAAAAARQnAQ" alt="polyline marker" width="120">

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

polyline.style.markerEnd = imageMarker;
```

### markerMid

You can refer to the SVG's [attribute of the same name](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/marker-mid).

Place markers on each vertex of the line except for the "start" and "end" points.

For example, in the following figure, a [Circle] (/en/api/basic/circle) is placed on each vertex of the line except for the beginning and end.

```js
const circleMarker = new Circle({
    style: {
        r: 10,
        stroke: '#1890FF',
    },
});

polyline.style.markerMid = circleMarker;
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Rsd9R7U4zdcAAAAAAAAAAAAAARQnAQ" alt="marker mid" width="200">

### markerStartOffset

You can refer to the [markerStartOffset](/en/api/basic/line#markerstartoffset) property of [Line](/en/api/basic/line).

Moves the marker graphic in the direction of the first line segment of the fold. Note that if the offset distance exceeds the length of the original line segment, it will extend in the opposite direction.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*M8ibT6pBNjYAAAAAAAAAAAAAARQnAQ" alt="marker start offset" width="200">

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<length\>](/en/api/css/css-properties-values-api#length)             |

### markerEndOffset

You can refer to the [markerEndOffset](/en/api/basic/line#markerendoffset) property of [Line](/en/api/basic/line).

Moves the marker graphic in the direction of the last line segment of the fold. Note that if the offset distance exceeds the length of the original line segment, it will extend in the opposite direction. In this [example](/en/examples/shape#polyline), we use this property to move the marker graphic.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*lUB7SYL6zK0AAAAAAAAAAAAAARQnAQ" alt="use offset on marker">

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<length\>](/en/api/css/css-properties-values-api#length)             |

### isBillboard

Effective in 3D scenes, always facing the screen, so the line width is not affected by the perspective projection image. The default value is `false`.

## Methods

### getTotalLength

Get the length of the polyline.

<https://developer.mozilla.org/zh-CN/docs/Web/API/SVGGeometryElement/getTotalLength>

### getPoint

Get the coordinates of the point on the line in the local or world coordinate system according to the length scale (in the range `[0-1]`).

The parameters are as follows.

-   `ratio` mandatory, the length ratio
-   `inWorldSpace` optional, if or not it is calculated in the world coordinate system. The default value is `false`.

where `Point` has the format :

```ts
export type Point = {
    x: number;
    y: number;
};
```

### getPointAtLength

Returns the point along the path at a given distance, controlled by a second optional parameter in the local or world coordinate system.

The parameters are as follows.

-   `distance` mandatory, the distance value
-   `inWorldSpace` optional, indicates if the distance is calculated in the world coordinate system. The default value is `false`.

<https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getPointAtLength>

```js
polyline.getPointAtLength(100); // Point {x: 300, y: 100}
```

### getStartTangent

Get the tangent vector of the starting point, shaped as : `[[10, 10], [20, 20]]`

### getEndTangent

Get the tangent vector of the ending point, shaped as : `[[10, 10], [20, 20]]`

## 3D Polyline

Same as Line, Polyline can also be defined under 3D space:

```js
const polyline = new Polyline({
    style: {
        stroke: '#1890FF',
        lineWidth: 10,
        lineCap: 'round',
        lineJoin: 'round',
        points: [
            [50, 50, 0],
            [100, 50, 100],
            [100, 100, 0],
            [150, 100, 100],
            [150, 150, 0],
            [200, 150, 0],
            [200, 200, 0],
            [250, 200, 0],
        ],
    },
});
```

![3D polyline](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*-ZNXQIWU2SkAAAAAAAAAAAAADmJ7AQ/original)

[Example](/en/examples/3d/3d-basic/#billboard)
