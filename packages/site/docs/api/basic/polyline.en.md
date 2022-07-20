---
title: Polyline
order: 7
---

You can refer to the [\<polyline\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/polyline) element of SVG.

The following [example](/en/examples/shape#polyline) defines a polyline with the following endpoints in order

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

# Inherited from

Inherits [style property](/en/docs/api/basic/display-object#drawing-properties) from [DisplayObject](/en/docs/api/basic/display-object).

## anchor

The default value is `[0, 0]`. For details, see [DisplayObject's anchor](/en/docs/api/basic/display-object#anchor).

## transformOrigin

The default value is `left top`. For details, see [DisplayObject's transformOrigin](/en/docs/api/basic/display-object#transformOrigin).

## lineWidth

Default value is `'1'`. See [DisplayObject's lineWidth](/en/docs/api/basic/display-object#lineWidth) for details.

## miterLimit

Default value is `'4'`. See [DisplayObject's miterLimit](/en/docs/api/basic/display-object#miterLimit)

# Additional Properties

## points

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

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/points

# Methods

## getTotalLength(): number

Get the length of the polyline.

https://developer.mozilla.org/zh-CN/docs/Web/API/SVGGeometryElement/getTotalLength

## getPoint(ratio: number): Point

Obtain the coordinates of a point in the local coordinate system on a line according to the length scale (in the range `[0-1]`), where `Point` is of the form :

```ts
export type Point = {
    x: number;
    y: number;
};
```

## getStartTangent(): number[][]

Get the tangent vector of the starting point, shaped as : `[[10, 10], [20, 20]]`

## getEndTangent(): number[][]

Get the tangent vector of the ending point, shaped as : `[[10, 10], [20, 20]]`
