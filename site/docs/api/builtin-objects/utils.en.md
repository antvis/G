---
title: Utils
order: 6
---

We provide a range of tool methods for use with the core as well as plug-ins, such as:

```js
import { convertToPath } from '@antv/g';
```

## Math

It mainly involves the conversion between different angle units.

### deg2rad

Angle conversion to radians.

```js
deg2rad(deg: number): number;
```

### rad2deg

Radians conversion to angle.

```js
rad2deg(rad: number): number;
```

### deg2turn

Angle conversion to turn.

```js
deg2turn(deg: number): number;
```

### turn2deg

Turn conversion to angle.

```js
turn2deg(turn: number): number;
```

## Matrix

In the vast majority of cases, we can use the graphics' own transformation capabilities, which are implemented internally via [gl-matrix](https://github.com/toji/gl-matrix).

### decompose

Decompose the 3x3 transformation matrix to obtain translation, scaling and rotation angles.

https://www.w3.org/TR/css-transforms-1/#decomposing-a-2d-matrix

```js
const [tx, ty, scalingX, scalingY, angle] = decompose(mat3);
```

### getEuler

Get the Euler angles from `quat` or `mat4`. The method signature is as follows.

```js
getEuler(out: vec3, quat: quat | mat4): vec3
```

来自：https://github.com/toji/gl-matrix/issues/329

### createVec3

Create `vec3` that accepts multiple types of arguments. The method signature is as follows.

```js
createVec3(x: number | vec2 | vec3 | vec4, y: number = 0, z: number = 0): vec3;
```

## Path

Most calculations involving paths rely on `@antv/util`.

### convertToPath

[Morph animation](/en/api/animation/waapi#morping) is implemented by interpolating the [path/d](/en/api/basic/path#d) property of [Path](/en/api/basic/path).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*qCHaTJUg_aEAAAAAAAAAAAAAARQnAQ">

The method signature is as follows.

```js
convertToPath(
    object: Circle | Ellipse | Rect | Line | Polyline | Polygon | Path,
    transform = object.getLocalTransform()
): string;
```

This method supports the following base graphics, not [Group](/en/api/basic/group) or other custom graphics.

-   [Circle](/en/api/basic/circle)
-   [Ellipse](/en/api/basic/ellipse)
-   [Rect](/en/api/basic/rect)
-   [Line](/en/api/basic/line)
-   [Polyline](/en/api/basic/polyline)
-   [Polygon](/en/api/basic/polygon)
-   [Path](/en/api/basic/path)

The result of the transformation is a third-order Bezier curve in the form of a string, which is easy to split, and the paths before and after the transformation are normalized to the same number of segments, and finally the control points in each segment are interpolated to achieve the animation effect.

The transformation process will consider the transformation of the input graphics in the local coordinate system (declarative transformation using [transform](/en/api/basic/display-object#transform) or [imperative transformation method](/en/api/basic/display- object#transform operation)), so the generated path definition already contains transformation information and you can create [Path](/en/api/basic/path) directly based on that path definition. [Example](/en/examples/animation#convert-to-path).

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

In some cases it is not necessary to consider the transformation in the local coordinate system, and the second parameter can be passed as `mat4.identity()`.
