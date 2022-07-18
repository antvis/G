---
title: Path
order: 8
---

Use Path to define lines, dashes, arcs, Bezier curves, etc. The path contains a set of commands and arguments with different semantics, which can be found at: https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths

The following [example](/en/examples/shape#path) defines a line from `[100, 100]` to `[200, 200]` in the local coordinate system.

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

# Inherited from

Inherits [style property](/en/docs/api/basic/display-object#drawing-properties) from [DisplayObject](/en/docs/api/basic/display-object).

The default anchor definition is the top-left corner of the enclosing box, which can be changed by [anchor](/en/docs/api/display-object#anchor).

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

## anchor

The default value is `[0, 0]`. For details, see [DisplayObject's anchor](/en/docs/api/basic/display-object#anchor).

## transformOrigin

The default value is `left top`. For details, see [DisplayObject's transformOrigin](/en/docs/api/basic/display-object#transformOrigin).

## lineWidth

Default value is `'1'`. See [DisplayObject's lineWidth](/en/docs/api/basic/display-object#lineWidth) for details.

## miterLimit

Default value is `'4'`. See [DisplayObject's miterLimit](/en/docs/api/basic/display-object#miterLimit)

# Additional Properties

## path

Paths, both `string` and `Array` forms are supported, see [SVG path](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths).

-   String form: `M 100,100 L 200,200`
-   Array form: `[ [ 'M', 100, 100 ], [ 'L', 200, 200 ]]`

https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/path

## d

Alias for the [path](/en/docs/api/basic/path#path) attribute, consistent with the `<path>` naming in SVG.

# Methods

## getTotalLength(): number

https://developer.mozilla.org/zh-CN/docs/Web/API/SVGGeometryElement/getTotalLength

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

## getPoint(ratio: number): Point

Get the coordinates of a point in the local coordinate system according to the length scale (in the range `[0-1]`), where `Point` has the format :

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

Also the transformations applied on the original path, in the local coordinate system, will be applied to the returned points. For example, in this [example](/en/examples/shape#path), the path itself is translated and scaled by.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*fOKWRIq_IWsAAAAAAAAAAAAAARQnAQ" width="300" alt="get point of a path">

## getStartTangent(): number[][]

Get the tangent vector of the starting point, shaped as : `[[10, 10], [20, 20]]`

## getEndTangent(): number[][]

Get the tangent vector of the ending point, shaped as : `[[10, 10], [20, 20]]`
