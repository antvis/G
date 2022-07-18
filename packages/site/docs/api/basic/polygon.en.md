---
title: Polygon
order: 7
---

You can refer to the [\<polygon\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/polygon) element of SVG.

The following [example](/en/examples/shape#polygon) defines a polygon.

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
polygon.style.points = '100,10 250,150 200,110';
polygon.style.points = [
    [100, 10],
    [250, 150],
    [200, 110],
];
```

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/points
