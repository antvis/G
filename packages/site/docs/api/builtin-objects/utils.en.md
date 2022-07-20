---
title: Utils
order: 6
---

We provide a range of tool methods for use with the core as well as plug-ins, such as:

```js
import { isUndefined } from '@antv/g';
```

# Type judgment

Most of the following methods are from: https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore Type determination of incoming parameters.

## isUndefined

Determine if the parameter is `undefined`.

## isNil

Determine if the parameter is `undefined` or `null`.

## isNumber

Determine if the parameter is `number`.

## isFunction

Determine if the parameter is `Function`.

## isBoolean

Determine if the parameter is `boolean`.

## isObject

Determines if it is an `object`. This is a simple determination, not as complicated as in lodash:

```js
function isObject(value: any): value is object {
  return Object.prototype.toString.call(value) === '[object Object]';
}
```

# Assertion

Throws an error if the assertion condition is not met, and aborts the program execution early.

## DCHECK

Abort when `false`.

```js
DCHECK(true);
```

## DCHECK_EQ

Abort when the two are not equal.

```js
DCHECK_EQ(1, 1);
```

## DCHECK_NE

Abort when the two are equal.

```js
DCHECK_NE(1, 2);
```

# Matrix

In the vast majority of cases, we can use the graphics' own transformation capabilities, which are implemented internally via [gl-matrix](https://github.com/toji/gl-matrix).

## decompose

Decompose the 3x3 transformation matrix to obtain translation, scaling and rotation angles.

https://www.w3.org/TR/css-transforms-1/#decomposing-a-2d-matrix

```js
const [tx, ty, scalingX, scalingY, angle] = decompose(mat3);
```

## getEuler

Get the Euler angles from `quat` or `mat4`. The method signature is as follows.

```js
getEuler(out: vec3, quat: quat | mat4): vec3
```

来自：https://github.com/toji/gl-matrix/issues/329

# Path

Most calculations involving paths rely on `@antv/util`.

## convertToPath

[Morph animation](/en/docs/api/animation#morping) is implemented by interpolating the [path/d](/en/docs/api/basic/path#d) property of [Path](/en/docs/api/basic/path).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*qCHaTJUg_aEAAAAAAAAAAAAAARQnAQ">

The method signature is as follows.

```js
convertToPath(
    object: Circle | Ellipse | Rect | Line | Polyline | Polygon | Path,
    applyLocalTransformation = true
): string;
```

This method supports the following base graphics, not [Group](/en/docs/api/basic/group) or other custom graphics.

-   [Circle](/en/docs/api/basic/circle)
-   [Ellipse](/en/docs/api/basic/ellipse)
-   [Rect](/en/docs/api/basic/rect)
-   [Line](/en/docs/api/basic/line)
-   [Polyline](/en/docs/api/basic/polyline)
-   [Polygon](/en/docs/api/basic/polygon)
-   [Path](/en/docs/api/basic/path)

The result of the transformation is a third-order Bezier curve in the form of a string, which is easy to split, and the paths before and after the transformation are normalized to the same number of segments, and finally the control points in each segment are interpolated to achieve the animation effect.

The transformation process will consider the transformation of the input graphics in the local coordinate system (declarative transformation using [transform](/en/docs/api/basic/display-object#transform) or [imperative transformation method](/en/docs/api/basic/display- object#transform operation)), so the generated path definition already contains transformation information and you can create [Path](/en/docs/api/basic/path) directly based on that path definition. [Example](/en/examples/animation#convert-to-path).

```js
const circle = new Circle({
    style: {
        cx: 100,
        cy: 100,
        r: 100,
        transform: 'translate(20px, 20px)', // Declarative transformations
    },
});
// Apply a transformation to the source graph, imperative
circle.translate(100, 0);
circle.scale(0.5);

// Convert to a path that already contains all the transformation information
const pathStr = convertToPath(circle);

// Create new graphics
const circlePath = new Path({
    style: {
        d: pathStr,
        fill: 'red',
    },
});

// The following transformations are no longer required
// circlePath.translate(100, 0);
```

In some cases it is not necessary to consider the transformation in the local coordinate system, and the second parameter can be passed as `false`.
