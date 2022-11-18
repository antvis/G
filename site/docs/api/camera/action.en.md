---
title: Camera action
order: 9
---

The three axes of the camera in the camera coordinate system are `uvn`.

<img src="https://i.stack.imgur.com/ooEFp.png" width="200">

The camera movements we describe later are actually movement and rotation along these three axes.

The following picture is from Television Production Handbook p.97. The cameras used in the early years of television were moved by tracks.

<img src="https://gw.alipayobjects.com/mdn/rms_4be1e1/afts/img/A*Dm7cQZ6locEAAAAAAAAAAAAAARQnAQ" width="400">

Disregarding the crane and tongue movements, which rely on the rocker, the translations and rotations along the three uvn axes can be summarized as follows.

| Action   | Camera Position    | FocalPoint         | u      | v      | n      |
| -------- | ------------------ | ------------------ | ------ | ------ | ------ |
| dolly    |                    |                    |        |        | pan    |
| pedestal |                    |                    |        | pan    |        |
| truck    |                    |                    | pan    |        |        |
| cant     | Center of Rotation |                    |        |        | rotate |
| pan      | Center of Rotation |                    |        | rotate |        |
| tilt     | Center of Rotation |                    | rotate |        |        |
| arc      |                    | Center of Rotation |        | rotate |        |

Naturally, depending on the camera type, the same camera action is implemented differently. Let's take [dolly](/en/api/camera/action#dolly) action as an example, it's also an action to move the camera position forward and backward, for [Orbiting](/en/api/camera/intro#orbiting) / [Exploring](/en/api/camera/intro#exploring) mode the point of view remains the same. In [Tracking](/en/api/camera/intro#tracking) mode, the point of view is adjusted.

## pan

Pans the camera along the u / v axis, i.e., horizontally and vertically.

The method signature is as follows.

```
pan(tx: number, ty: number)
```

Parameters:

-   `tx` Positive translation along u-axis
-   `ty` Positive translation along v-axis

In this [example](/en/examples/camera/camera-action/#action), the following action will cause the object originally at the point of view to be displayed in the upper left corner.

```ts
camera.pan(200, 200);
```

In [g-plugin-control](/en/plugins/control) we respond to the mouse panning event by calling this method.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*QjQQRLA3w8sAAAAAAAAAAAAAARQnAQ">

## dolly

Move the camera along the n-axis. Fix the viewpoint and change the camera position to change the view distance. It will keep the view distance between [minDistance](/en/api/camera/params#setmindistance) and [maxDistance](/en/api/camera/params#setmaxdistance).

The method signature is as follows.

```
dolly(value: number)
```

Parameters:

-   `value` 以 `dollyingStep` 为单位，正向远离视点，负向靠近

Example:

```ts
camera.dolly(10); // Away from the point of view
camera.dolly(-10); // Close to the point of view
```

The effect in the pivot projection is as follows. In [g-plugin-control](/en/plugins/control) we respond to the mouse wheel event by calling this method.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Q-OJQ5cCbowAAAAAAAAAAAAAARQnAQ">

## rotate

Rotate by camera azimuth, counterclockwise is positive.

The method signature is as follows.

```
rotate(azimuth: number, elevation: number, roll: number)
```

2D scenes only need to specify rolls, e.g. for the camera to "tilt its head".

```js
camera.rotate(0, 0, 30);
```
