---
title: Polygon
order: 7
---

You can refer to the [\<polygon\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/polygon) element of SVG.

The following [example](/en/examples/shape/polygon#polygon) defines a polygon.

```javascript
const polygon = new Polygon({
    style: {
        points: [
            [0, 0],
            [100, 0],
            [100, 100],
            [0, 100],
        ],
        stroke: '#1890FF',
        lineWidth: 2,
    },
});
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
polygon.style.points = '100,10 250,150 200,110';
polygon.style.points = [
    [100, 10],
    [250, 150],
    [200, 110],
];
```

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/points>

### markerStart

See [markerStart](/en/api/basic/polyline#markerstart) property of [Polyline](/en/api/basic/polyline).

But unlike Polyline, since polygons are **closed**, the positions of the "start" and "end" points coincide exactly, as determined by the first point in [points](/en/api/basic/polygon#points). This is also consistent with the native SVG implementation, and the following figure shows the overlap effect after defining both markerStart and markerEnd.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*mXYATLithEUAAAAAAAAAAAAAARQnAQ" alt="polygon end/start overlap" width="400">

In this [example](/en/examples/shape/polygon#polygon), we have placed an arrow at the start of the polygon.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*RRPTRIpZoUIAAAAAAAAAAAAAARQnAQ" alt="polygon marker" width="200">

```js
const arrowMarker = new Path({
    style: {
        path: 'M 10,10 L -10,0 L 10,-10 Z',
        stroke: '#1890FF',
        anchor: '0.5 0.5',
        transformOrigin: 'center',
    },
});

polygon.style.markerStart = arrowMarker;
```

### markerEnd

See [markerEnd](/en/api/basic/polyline#markerend) property of [Polyline](/en/api/basic/polyline).

However, unlike Polyline, since polygons are **closed**, the positions of the "start point" and "end point" coincide exactly. The "end point" is determined by the first point in [points](/en/api/basic/polygon#points).

In this [example](/en/examples/shape/polygon#polygon), we have placed a picture at the termination point of the polygon.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*eZHETJ0B3lkAAAAAAAAAAAAAARQnAQ" alt="polygon marker" width="200">

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

polygon.style.markerEnd = imageMarker;
```

### markerMid

You can refer to the [attribute of the same name](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/marker-mid) of SVG.

Place markers on each vertex of the polygon except for the "start" and "end" points.

For example, in the following figure, a [Circle](/en/api/basic/circle) is placed on each vertex of the polygon except for the beginning and end.

```js
const circleMarker = new Circle({
    style: {
        r: 10,
        stroke: '#1890FF',
    },
});

polygon.style.markerMid = circleMarker;
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*jaFPRbpzpJwAAAAAAAAAAAAAARQnAQ" alt="marker mid" width="200">

### markerStartOffset

See the [markerStartOffset](/en/api/basic/polyline#markerstartoffset) property of [Polyline](/en/api/basic/polyline).

Moving the marker graphic in the direction of the first line segment of the polygon will change the shape of the original polygon at the same time.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*4l7xQoYcXngAAAAAAAAAAAAAARQnAQ" alt="marker start offset">

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<length\>](/en/api/css/css-properties-values-api#length)             |

### markerEndOffset

See the [markerEndOffset](/en/api/basic/polyline#markerendoffset) property of [Polyline](/en/api/basic/polyline).

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<length\>](/en/api/css/css-properties-values-api#length)             |
