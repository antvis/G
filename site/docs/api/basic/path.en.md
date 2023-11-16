---
title: Path
order: 8
---

Use Path to define lines, dashes, arcs, Bezier curves, etc. The path contains a set of commands and arguments with different semantics, which can be found at: <https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths>

The following [example](/en/examples/shape/path#path) defines a line from `[100, 100]` to `[200, 200]` in the local coordinate system.

```javascript
const line = new Path({
    style: {
        path: [
            ['M', 100, 100],
            ['L', 200, 200],
        ],
        stroke: '#F04864',
    },
});
```

## Inherited from

Inherits [style property](/en/api/basic/display-object#drawing-properties) from [DisplayObject](/en/api/basic/display-object).

The default anchor definition is the top-left corner of the enclosing box, which can be changed by [anchor](/en/api/display-object#anchor).

On this point we refer to the actual performance of SVG, the following figure as an example we defined a segment of arc with `[100, 100]` as the starting point, obviously its top left corner of the enclosing box vertex is not `[0, 0]` or `[100, 100]`, but needs to be calculated according to the real shape of the path, we will use this calculation as the default anchor position, but also the coordinates of the local coordinate system: `[0, 0]`.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*nLVmQ4nZc1oAAAAAAAAAAAAAARQnAQ" width="600px">

And let's say this linear path `[['M', 100, 100], ['L', 200, 200]]` has a "location" of `[100, 100]` in the local coordinate system.

```js
const line = new Path({
    style: {
        path: [
            ['M', 100, 100],
            ['L', 200, 200],
        ],
        stroke: '#F04864',
    },
});

line.getLocalPosition(); // [100, 100];
line.getBounds(); // 包围盒 { min: [100, 100], max: [200, 200] }
line.translateLocal(100, 0); // 沿 X 轴平移
```

### anchor

The default value is `[0, 0]`. For details, see [DisplayObject's anchor](/en/api/basic/display-object#anchor).

### transformOrigin

The default value is `left top`. For details, see [DisplayObject's transformOrigin](/en/api/basic/display-object#transformOrigin).

### lineWidth

Default value is `'1'`. See [DisplayObject's lineWidth](/en/api/basic/display-object#lineWidth) for details.

### miterLimit

Default value is `'4'`. See [DisplayObject's miterLimit](/en/api/basic/display-object#miterLimit)

### isBillboard

Effective in 3D scenes, always facing the screen, so the line width is not affected by the perspective projection image. The default value is `false`.

### isSizeAttenuation

When isBillboard is enabled, whether or not to apply size attenuation in perspective projection. This option can be turned on if you want to keep the size consistent regardless of depth, following the "near big, far small" visual effect in perspective projection.

## Additional Properties

### path

Paths, both `string` and `Array` forms are supported, see [SVG path](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths).

-   String form: `M 100,100 L 200,200`
-   Array form: `[ [ 'M', 100, 100 ], [ 'L', 200, 200 ]]`

<https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/path>

### d

Alias for the [path](/en/api/basic/path#path) attribute, consistent with the `<path>` naming in SVG.

### markerStart

Since Path can be closed by `Z` command, the definition of "start point" differs in two cases.

-   If it is not closed, you can refer to the [markerStart](/en/api/basic/polyline#markerstart) attribute of [Polyline](/en/api/basic/polyline).
-   If it is closed, you can refer to the [markerStart](/en/api/basic/polygon#markerstart) property of [Polygon](/en/api/basic/polygon).

For example, in the following figure, where markerStart and markerEnd are also specified as "arrows", the effect of an unclosed path is shown on the left, and the effect of a closed path is shown on the right.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*2Pi6SpcqPwAAAAAAAAAAAAAAARQnAQ" alt="unclosed path marker" width="200"><img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*HEpoQbRiRowAAAAAAAAAAAAAARQnAQ" alt="closed path marker" width="200">

In this [example](/en/examples/shape/path#path), we have placed an arrow at the beginning of the Path.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*-ooIS5IePf4AAAAAAAAAAAAAARQnAQ" alt="path start marker" width="400">

```js
const arrowMarker = new Path({
    style: {
        path: 'M 10,10 L -10,0 L 10,-10 Z',
        stroke: '#1890FF',
        anchor: '0.5 0.5',
        transformOrigin: 'center',
    },
});

path.style.markerStart = arrowMarker;
```

### markerEnd

See the [markerEnd](/en/api/basic/polyline#markerend) attribute of [Polyline](/en/api/basic/polyline).

Since Path can be closed by the `Z` command, the definition of the "end point" differs in two cases.

-   If it is not closed, you can refer to the [markerEnd](/en/api/basic/polyline#markerend) attribute of [Polyline](/en/api/basic/polyline).
-   If closed, see the [markerEnd](/en/api/basic/polygon#markerend) property of [Polygon](/en/api/basic/polygon).

In this [example](/en/examples/shape/path#path), we have placed an image at the termination point of the polygon.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*4bYtTKQxOrQAAAAAAAAAAAAAARQnAQ" alt="polygon marker" width="200">

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

path.style.markerEnd = imageMarker;
```

### markerMid

You can refer to SVG's [attribute of the same name](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/marker-mid).

Place marker graphics on each vertex of the path except for the "start" and "end" points. In the internal implementation, these vertices are actually control points for the third-order Bessel curve, since we convert some of the commands in the path to C commands.

For example, in the following figure, a [Circle](/en/api/basic/circle) is placed on each vertex of the path except the first and last.

```js
const circleMarker = new Circle({
    style: {
        r: 10,
        stroke: '#1890FF',
    },
});

path.style.markerMid = circleMarker;
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Vg1OQ5mGaG4AAAAAAAAAAAAAARQnAQ" alt="marker mid" width="400">

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*2Pi6SpcqPwAAAAAAAAAAAAAAARQnAQ" alt="unclosed path marker" width="200">

### markerStartOffset

See the [markerStartOffset](/en/api/basic/polyline) property of [Polyline](/en/api/basic/polyline#markerstartoffset). marker will move along the tangent of the first segment in the path. The marker will be moved in the direction of the first segment of the path, and the body path will be lengthened or shortened accordingly.

See the [markerStartOffset](/en/api/basic/polyline) property of [Polyline](/en/api/basic/polyline#markerstartoffset). marker will move along the tangent of the first section of the path. The marker will move in the direction of the tangent of the first segment in the path, and the body path will be extended or shortened accordingly. Note that the stretching distance of the body path is also limited, and when it exceeds the length of the first segment, a "bend" effect will occur, as shown in the following figure.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*2DI5TpGasHcAAAAAAAAAAAAAARQnAQ" alt="marker start offset" width="200">

This property is therefore suitable for "fine-tuning", rather than drastically changing the path definition.

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<length\>](/en/api/css/css-properties-values-api#length)             |

### markerEndOffset

See the [markerEndOffset](/en/api/basic/polyline) property of [Polyline](/en/api/basic/polyline#markerendoffset). marker will move along the tangent direction of the last section of the path. The marker will move in the direction of the tangent of the last section of the path, and the body path will be extended or shortened accordingly.

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<length\>](/en/api/css/css-properties-values-api#length)             |

## Methods

### getTotalLength

<https://developer.mozilla.org/zh-CN/docs/Web/API/SVGGeometryElement/getTotalLength>

For example, get the length of the following line.

```js
const path = new Path({
    style: {
        path: [
            ['M', 100, 100],
            ['L', 100, 200],
        ],
        stroke: '#F04864',
    },
});

path.getTotalLength(); // 100
```

If it is an illegal path, return 0.

```js
const path = new Path({
    style: {
        path: [['XXXX', 100, 100]],
        stroke: '#F04864',
    },
});

path.getTotalLength(); // 0
```

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

For example, get the coordinates of the midpoint of the following line.

```js
const path = new Path({
    style: {
        path: [
            ['M', 100, 100],
            ['L', 100, 200],
        ],
        stroke: '#F04864',
    },
});

path.getPoint(0.5); // Point {x: 100, y: 150}
```

It is worth noting that if the value range `[0-1]` is exceeded, the coordinates of the point at the beginning and end of the path will be returned. For illegal paths, the method returns `Point {x: NaN, y: NaN}`.

Also the transformations applied on the original path, in the local coordinate system, will be applied to the returned points. For example, in this [example](/en/examples/shape/path#path), the path itself is translated and scaled by.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*fOKWRIq_IWsAAAAAAAAAAAAAARQnAQ" width="300" alt="get point of a path">

### getPointAtLength

Returns the point along the path at a given distance, controlled by a second optional parameter in the local or world coordinate system.

The parameters are as follows.

-   `distance` mandatory, the distance value
-   `inWorldSpace` optional, indicates if the distance is calculated in the world coordinate system. The default value is `false`.

<https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getPointAtLength>

```js
path.getPointAtLength(100); // Point {x: 300, y: 100}
```

### getStartTangent

Get the tangent vector of the starting point, shaped as : `[[10, 10], [20, 20]]`

### getEndTangent

Get the tangent vector of the ending point, shaped as : `[[10, 10], [20, 20]]`
