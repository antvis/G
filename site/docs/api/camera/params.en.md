---
title: Camera Parameters
order: 1
---

We provide the following methods to obtain or modify the camera position, viewpoint and other common camera parameters.

The picture below shows the camera `position` and the `focalPoint`:

<img src="http://voxelent.com/wp-content/uploads/2014/03/camera_position_focalpoint.png" alt="position and focal position" width="300">

## getPosition

Get the position of the camera in the world coordinate system which has the following type `[number, number, number]`.

```js
camera.getPosition(); // [300, 200, 500]
```

## setPosition

Sets the camera's position in the world coordinate system.

The method signature is as follows.

```
setPosition(x: number | vec2 | vec3, y?: number, z?: number)
```

In G's built-in orthogonal projection camera, the default setting is `[width / 2, height / 2, 500]`, where `width/height` is the size of the [Canvas](/en/api/canvas). So if we want to reset the `x/y` coordinates of the camera, while keeping the `z` coordinates the same, we can do this.

```js
// Keep the Z-coordinate constant.
camera.setPosition(300, 250);
camera.setPosition([300, 250]);
// Or set the Z-coordinate to the default value of 500.
camera.setPosition(300, 250, 500);
camera.setPosition([300, 250, 500]);
```

Note that in 2D scenes when we set the camera position, we usually need to set the viewpoint position as well, otherwise we will have an unintended effect.

```js
camera.setPosition(100, 100, 500);
camera.setFocalPoint(100, 100, 0);
```

## getFocalPoint

Get the position of the viewpoint in the world coordinate system, type `[number, number, number]`.

```js
camera.getFocalPoint(); // [300, 200, 0]
```

## setFocalPoint

Set the position of the viewpoint in the world coordinate system.

The method signature is as follows.

```
setFocalPoint(x: number | vec2 | vec3, y?: number, z?: number)
```

In G's built-in orthogonal projection camera, the default setting is `[width / 2, height / 2, 0]`, where `width/height` is the size of the [Canvas](/en/api/canvas). So if we want to reset the `x/y` coordinates of the camera viewpoint while keeping the `z` coordinates the same, we can do this.

```js
// Keep the Z-coordinate constant.
camera.setFocalPoint(300, 250);
camera.setFocalPoint([300, 250]);
// Or set the Z-coordinate to the default value of 0.
camera.setFocalPoint(300, 250, 0);
// Or set the Z-coordinate to the default value of 0.
camera.setFocalPoint([300, 250, 0]);
```

## getDistance

Get the distance from the camera position to the viewpoint.

For example, in the default camera.

```js
camera.getDistance(); // 500
```

## setDistance

Fix the viewpoint and move the camera position along the `forward` direction.

For example, move the default camera, fix the viewpoint position, and change the view distance from `500` to `400`.

```js
camera.setDistance(400);
```

## getNear

Get the near-plane. Graphics in the near-plane will be rejected.

The default camera setting for G is `0.1`.

```js
camera.getNear(); // 0.1
```

## setNear

Set up near plane.

The method signature is as follows.

```
setNear(near: number)
```

## getFar

Get the far plane. Graphics outside the far plane will be excluded.

The default camera setting for G is `1000`.

```js
camera.getFar(); // 1000
```

## setFar

Set the far plane.

The method signature is as follows.

```
setFar(far: number)
```

## getZoom

Gets the scaling. Although visually increasing the camera's scale is the same as calling [setScale]() on the root node, it is clear that the former does not cause any change to the graphics in the scene.

The default scaling is `1`.

```js
camera.getZoom(); // 1
```

## setZoom

`zoom` greater than 1 means zoom in, and vice versa means zoom out, [example](/en/examples/camera/projection-mode/#ortho).

The method signature is as follows.

```
setZoom(zoom: number)
```

## setZoomByViewportPoint

[setZoom](/en/api/camera/params#setzoom) will scale at the center of the camera's position under the world coordinate system. However, sometimes we want to fix the viewpoint, i.e. to scale at the point under [viewport coordinate system](/en/api/canvas/coordinates#viewport).

In the following [example](/en/examples/camera/camera-action/#zoom-by-point), we listen to the `wheel` event to scale at the position of the event object under the client coordinate system.

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*cIK-RL1MHtYAAAAAAAAAAAAAARQnAQ" alt="zoom by viewport point" width="200">

```js
// Convert the clientX/Y of the wheel event to the viewport coordinate system
const { x, y } = canvas.client2Viewport({ x: e.clientX, y: e.clientY });
camera.setZoomByViewportPoint(zoom, [x, y]);
```

The method signature is as follows.

-   `zoom` greater than 1 means zoom in, vice versa means zoom out.
-   `viewportPoint` is the point coordinate under [viewport coordinate system](/en/api/canvas/coordinates#viewport).

```
setZoomByViewportPoint(zoom: number, viewportPoint: vec2)
```

## setFov

Only works in perspective projection, the larger the perspective is the more objects it can hold. [example](/en/examples/camera/projection-mode/#perspective)

The method signature is as follows.

```
setFov(fov: number)
```

## setAspect

Only works under perspective projection. Most of the time there is no need to set it manually, it can be updated automatically when the canvas size changes by calling `canvas.resize()`.

The method signature is as follows.

```
setAspect(aspect: number)
```

## setMinDistance

Set the minimum view distance. It will not be smaller than this distance when [dolly](/en/api/camera/action#dolly) operation is performed.

The default value is `-Infinity`.

## setMaxDistance

Set the maximum view distance. It will not be greater than this distance when [dolly](/en/api/camera/action#dolly) operation is performed.

The default value is `Infinity`.

## setViewOffset

Set the offset of the viewport and immediately recalculate the projection matrix.

The method signature is as follows.

```
setViewOffset(
  fullWidth: number,
  fullHeight: number,
  x: number,
  y: number,
  width: number,
  height: number,
)
```

where `fullWidth/fullHeight` is the original viewport size, `x/y` is the viewport offset coordinate, and `width/height` is the offset viewport size.

In this [example](/en/examples/camera/camera-action/#view-offset), [Cube](/en/api/3d/geometry#cubegeometry) is originally in the center of the viewport, by setting the `x/y` offset to the center of the viewport.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*U6ELSY2EVNIAAAAAAAAAAAAAARQnAQ" alt="setViewOffset" width="300">

When picking up in [g-plugin-device-renderer](/en/plugins/device-renderer), we use this method to set the offset (aligning the camera to the pickup area) and render only the pickup area instead of the whole screen to improve performance.

## clearViewOffset

Clear the previously set viewport offset and immediately recalculate the projection matrix.

In this [example](/en/examples/camera/camera-action/#view-offset), the set offset can be removed at any time by clicking the button.

## Set azimuth

When describing rotation, sometimes Euler angles are more intuitive to understand because they are more closely related to what we describe in everyday life, such as camera motion, latitude and longitude in a horizontal coordinate system (also known as a geocentric coordinate system), and so on. In some GIS-like visualization projects (e.g. Mapbox), pitch/yaw/roll is often used to describe the rotation of itself. An example is an airplane in the picture below.

To set the camera azimuth, you need to recalculate the camera position or viewpoint position in different camera modes.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*tLc3R7rerqsAAAAAAAAAAAAAARQnAQ" alt="azimuth" width="400">

### setRoll

Sets the angle of rotation around the `forward` axis in `deg`, with the following method signature.

```
setRoll(roll: number)
```

Note the different effects of fixed camera position and fixed viewpoint position rotation under different [camera types](/en/api/camera#camera type).

```js
camera.setRoll(30);
```

### setElevation

Sets the `elevation` angle in `deg`, with the following method signature.

```
setElevation(angle: number)
```

Note the different effects of fixed camera position and fixed viewpoint position rotation under different [camera types](/en/api/camera#camera type).

```js
camera.setElevation(30);
```

### setAzimuth

Set the angle around `azimuth` in `deg`, with the following method signature.

```
setAzimuth(angle: number)
```

Note the different effects of fixed camera position and fixed viewpoint position rotation under different [camera types](/en/api/camera/intro#camera-types).

```js
camera.setAzimuth(30);
```
