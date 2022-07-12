---
title: Camera
order: -98
---

The camera describes the angle from which we view the world. The viewpoint and camera position all affect the final image. When creating the [Canvas](/en/docs/api/canvas) canvas, there is already a built-in camera that uses orthogonal projection by default. So we don't need to create it manually, we can get it as follows.

```js
const camera = canvas.getCamera();
```

By manipulating the camera we can easily achieve many effects, such as panning and zooming the entire canvas. This will be a big improvement in rendering performance.

The camera currently supports the following features.

-   Two projection modes: Orthographic [Orthogonal](/en/docs/api/camera#projection mode) and Perspective [Perspective](/en/docs/api/camera#projection mode), the former is used by default.
-   Three camera types: [Exploring](/en/docs/api/camera#exploring), [Orbiting](/en/docs/api/camera#orbiting) and [Tracking](/en/docs/api/camera#tracking), Exploring is used by default.
-   Camera action. For example [pan](/en/docs/api/camera#pan), [dolly](/en/docs/api/camera#dolly), [rotate](/en/docs/api/camera#rotate)
-   Customize [camera animation](/en/docs/api/camera#camera animation) to create/save the current camera state as a Landmark and smoothly switch between multiple Landmarks.

## Projection Mode

The orthogonal projection (left) is commonly used in CAD software and strategy games (Sims). The perspective projection (right) follows our perception of "large near and small far".

<img src="https://www.scratchapixel.com/images/upload/perspective-matrix/projectionsexample.png" width="400" alt="projection mode">

We offer the above two projection modes.

```js
enum CameraProjectionMode {
  ORTHOGRAPHIC,
  PERSPECTIVE,
}
```

### getProjectionMode()

We use `CameraProjectionMode.ORTHOGRAPHIC` by default.

```js
canvas.getCamera().getProjectionMode(); // CameraProjectionMode.ORTHOGRAPHIC
```

In 2D scenes the orthogonal projection is used, so this is the default projection mode of G. In 3D scenes, sometimes we need to switch to perspective projection, so we provide the following two APIs to set the projection mode.

### setOrthographic()

Set the camera projection mode to orthogonal projection `CameraProjectionMode.ORTHOGRAPHIC`

The method signature is as follows.

```
setOrthographic(left: number, right: number,
                top: number, bottom: number,
                near: number, far: number)
```

The list of parameters is as follows.

-   `left` Maximum distance in the negative direction of x-axis
-   `right` Maximum distance in the forward direction of x-axis
-   `top` Maximum distance in the forward direction of y-axis
-   `bottom` Maximum distance in the negative direction of y-axis
-   `near` Near plane
-   `far` Far plane

The default camera settings for G are as follows, where `width/height` is the size of [Canvas](/en/docs/api/canvas) and [usage example](/en/examples/camera#ortho).

```js
const camera = new Camera()
    .setPosition(width / 2, height / 2, 500)
    .setFocalPoint(width / 2, height / 2, 0)
    .setOrthographic(width / -2, width / 2, height / 2, height / -2, 0.1, 1000);
```

### setPerspective()

Set the camera projection mode to Perspective Projection `CameraProjectionMode.PERSPECTIVE`

The method signature is as follows.

```
setPerspective(near: number, far: number, fov: number, aspect: number)
```

Parameters:

-   `near` Near plane
-   `far` Far plane
-   `fov` Viewing angle, larger means more objects in the scene can be accommodated
-   `aspect` Width-to-Height Ratio

[Example](/en/examples/camera#perspective)：

```js
camera
    .setPosition(300, 100, 500)
    .setFocalPoint(300, 250, 0)
    .setPerspective(0.1, 1000, 75, 600 / 500);
```

## Camera Parameters

We provide the following methods to obtain or modify the camera position, viewpoint and other common camera parameters.

The picture below shows the camera `position` and the `focalPoint`:

<img src="http://voxelent.com/wp-content/uploads/2014/03/camera_position_focalpoint.png" alt="position and focal position" width="300">

### getPosition()

Get the position of the camera in the world coordinate system which has the following type `[number, number, number]`.

```js
camera.getPosition(); // [300, 200, 500]
```

### setPosition()

Sets the camera's position in the world coordinate system.

The method signature is as follows.

```
setPosition(x: number | vec2 | vec3, y?: number, z?: number)
```

In G's built-in orthogonal projection camera, the default setting is `[width / 2, height / 2, 500]`, where `width/height` is the size of the [Canvas](/en/docs/api/canvas). So if we want to reset the `x/y` coordinates of the camera, while keeping the `z` coordinates the same, we can do this.

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

### getFocalPoint()

Get the position of the viewpoint in the world coordinate system, type `[number, number, number]`.

```js
camera.getFocalPoint(); // [300, 200, 0]
```

### setFocalPoint()

Set the position of the viewpoint in the world coordinate system.

The method signature is as follows.

```
setFocalPoint(x: number | vec2 | vec3, y?: number, z?: number)
```

In G's built-in orthogonal projection camera, the default setting is `[width / 2, height / 2, 0]`, where `width/height` is the size of the [Canvas](/en/docs/api/canvas). So if we want to reset the `x/y` coordinates of the camera viewpoint while keeping the `z` coordinates the same, we can do this.

```js
// Keep the Z-coordinate constant.
camera.setFocalPoint(300, 250);
camera.setFocalPoint([300, 250]);
// Or set the Z-coordinate to the default value of 0.
camera.setFocalPoint(300, 250, 0);
// Or set the Z-coordinate to the default value of 0.
camera.setFocalPoint([300, 250, 0]);
```

### getDistance()

Get the distance from the camera position to the viewpoint.

For example, in the default camera.

```js
camera.getDistance(); // 500
```

### setDistance()

Fix the viewpoint and move the camera position along the `forward` direction.

For example, move the default camera, fix the viewpoint position, and change the view distance from `500` to `400`.

```js
camera.setDistance(400);
```

### getNear()

Get the near-plane. Graphics in the near-plane will be rejected.

The default camera setting for G is `0.1`.

```js
camera.getNear(); // 0.1
```

### setNear()

Set up near plane.

The method signature is as follows.

```
setNear(near: number)
```

### getFar()

Get the far plane. Graphics outside the far plane will be excluded.

The default camera setting for G is `1000`.

```js
camera.getFar(); // 1000
```

### setFar()

Set the far plane.

The method signature is as follows.

```
setFar(far: number)
```

### getZoom()

Gets the scaling. Although visually increasing the camera's scale is the same as calling [setScale]() on the root node, it is clear that the former does not cause any change to the graphics in the scene.

The default scaling is `1`.

```js
camera.getZoom(); // 1
```

### setZoom()

`zoom` greater than 1 means zoom in, and vice versa means zoom out, [example](/en/examples/camera#ortho).

The method signature is as follows.

```
setZoom(zoom: number)
```

### setFov()

Only works in perspective projection, the larger the perspective is the more objects it can hold. [example](/en/examples/camera#perspective)

The method signature is as follows.

```
setFov(fov: number)
```

### setAspect()

Only works under perspective projection. Most of the time there is no need to set it manually, it can be updated automatically when the canvas size changes by calling `canvas.resize()`.

The method signature is as follows.

```
setAspect(aspect: number)
```

### setMinDistance()

Set the minimum view distance. It will not be smaller than this distance when [dolly](/en/docs/api/camera#dolly) operation is performed.

The default value is `-Infinity`.

### setMaxDistance()

Set the maximum view distance. It will not be greater than this distance when [dolly](/en/docs/api/camera#dolly) operation is performed.

The default value is `Infinity`.

### setViewOffset()

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

In this [example](/en/examples/camera#view-offset), [Cube](/en/docs/api/3d/geometry#cubegeometry) is originally in the center of the viewport, by setting the `x/y` offset to the center of the viewport.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*U6ELSY2EVNIAAAAAAAAAAAAAARQnAQ" alt="setViewOffset" width="300">

When picking up in [g-plugin-device-renderer](/en/docs/plugins/device-renderer), we use this method to set the offset (aligning the camera to the pickup area) and render only the pickup area instead of the whole screen to improve performance.

### clearViewOffset()

Clear the previously set viewport offset and immediately recalculate the projection matrix.

In this [example](/en/examples/camera#view-offset), the set offset can be removed at any time by clicking the button.

### Set azimuth

When describing rotation, sometimes Euler angles are more intuitive to understand because they are more closely related to what we describe in everyday life, such as camera motion, latitude and longitude in a horizontal coordinate system (also known as a geocentric coordinate system), and so on. In some GIS-like visualization projects (e.g. Mapbox), pitch/yaw/roll is often used to describe the rotation of itself. An example is an airplane in the picture below.

To set the camera azimuth, you need to recalculate the camera position or viewpoint position in different camera modes.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*tLc3R7rerqsAAAAAAAAAAAAAARQnAQ" alt="" width="400">

#### setRoll()

Sets the angle of rotation around the `forward` axis in `deg`, with the following method signature.

```
setRoll(roll: number)
```

Note the different effects of fixed camera position and fixed viewpoint position rotation under different [camera types](/en/docs/api/camera#camera type).

```js
camera.setRoll(30);
```

#### setElevation()

Sets the `elevation` angle in `deg`, with the following method signature.

```
setElevation(angle: number)
```

Note the different effects of fixed camera position and fixed viewpoint position rotation under different [camera types](/en/docs/api/camera#camera type).

```js
camera.setElevation(30);
```

#### setAzimuth()

Set the angle around `azimuth` in `deg`, with the following method signature.

```
setAzimuth(angle: number)
```

Note the different effects of fixed camera position and fixed viewpoint position rotation under different [camera types](/en/docs/api/camera#camera type).

```js
camera.setAzimuth(30);
```

## Camera Types

In 2D scenes, if we want to move around the scene, we usually use panning and zooming. In 3D scenes different camera types will bring different visual effects.

The image on the left is a fixed point of view, moving the camera position to observe the scene, mostly seen in model observation. On the right, the camera position is fixed and the viewpoint is adjusted to observe all objects in the scene.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*vNDVQ5tE4G0AAAAAAAAAAAAAARQnAQ" width="600" alt="camera types">

We offer three types.

```js
export enum CameraType {
  ORBITING,
  EXPLORING,
  TRACKING,
}

```

With [g-plugin-control](/en/docs/plugins/control) you can interact with mouse panning and zooming, [example](/en/examples/camera#landmark).

### Orbiting

Fixes the viewpoint `focalPoint` and changes the camera position `position`. Commonly used in scenarios like CAD viewing models, but not across the north and south poles.

Called [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls) in Three.js.

In this [example](/en/examples/camera#landmark), we control the camera by mouse panning to complete the [pan](/en/docs/api/camera#pan) action, as if we were "rotating" the scene around a fixed viewpoint.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*QjQQRLA3w8sAAAAAAAAAAAAAARQnAQ">

### Exploring

Similar to `Orbiting` mode, also fixed viewpoint `focalPoint`, but can span North and South poles.

G's **Default Camera** has this mode selected.

Called [TrackballControls](https://threejs.org/docs/#examples/en/controls/TrackballControls) in Three.js.

In this [example](/en/examples/camera#landmark), we control the camera via mouse panning to complete the [pan]() action, allowing the camera to "rotate" around a fixed point of view.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*dGgTTKjUrKoAAAAAAAAAAAAAARQnAQ">

### Tracking

The fixed camera position `position` rotates around it, so the viewpoint `focalPoint` position will change.

Called [FirstPersonControls](https://threejs.org/docs/#examples/en/controls/FirstPersonControls) in Three.js.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*3OPVQajsb3YAAAAAAAAAAAAAARQnAQ">

### setType()

At any time, you can switch between these three modes.

```js
camera.setType(CameraType.Tracking);
```

## Camera action

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

Naturally, depending on the camera type, the same camera action is implemented differently. Let's take [dolly]() action as an example, it's also an action to move the camera position forward and backward, for [Orbiting](/en/docs/api/camera#orbiting) / [Exploring](/en/docs/api/camera#exploring) mode the point of view remains the same. In [Tracking](/en/docs/api/camera#tracking) mode, the point of view is adjusted.

### pan()

Pans the camera along the u / v axis, i.e., horizontally and vertically.

The method signature is as follows.

```
pan(tx: number, ty: number)
```

Parameters:

-   `tx` Positive translation along u-axis
-   `ty` Positive translation along v-axis

In this [example](/en/examples/camera#action), the following action will cause the object originally at the point of view to be displayed in the upper left corner.

```ts
camera.pan(200, 200);
```

In [g-plugin-control](/en/docs/plugins/control) we respond to the mouse panning event by calling this method.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*QjQQRLA3w8sAAAAAAAAAAAAAARQnAQ">

### dolly()

Move the camera along the n-axis. Fix the viewpoint and change the camera position to change the view distance. It will keep the view distance between [minDistance](/en/docs/api/camera#setmindistance) and [maxDistance](/en/docs/api/camera#setmaxdistance).

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

The effect in the pivot projection is as follows. In [g-plugin-control](/en/docs/plugins/control) we respond to the mouse wheel event by calling this method.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Q-OJQ5cCbowAAAAAAAAAAAAAARQnAQ">

### rotate()

Rotate by camera azimuth, counterclockwise is positive.

The method signature is as follows.

```
rotate(azimuth: number, elevation: number, roll: number)
```

2D scenes only need to specify rolls, e.g. for the camera to "tilt its head".

```js
camera.rotate(0, 0, 30);
```

## Camera animation

We can record the current position and viewpoint of the camera and save it as a Landmark, and then when the camera parameters change, you can switch to any of the previously saved Landmark at any time, with a smooth switching animation, similar to the camera pan arm on a real set, also called `flyTo` in some applications (e.g. [Mapbox in application](https://docs.mapbox.com/mapbox-gl-js/example/flyto/)), [example](/en/examples/camera#landmark).

### createLandmark()

Create a Landmark with the following parameters.

-   markName
-   options Camera parameters, including.
    -   `position` The position of the camera in the world coordinate system, taking the type reference [setPosition](/en/docs/api/camera#setposition)
    -   `focalPoint` Viewpoint in the world coordinate system, reference to the value type [setFocalPoint](/en/docs/api/camera#setfocalpoint)
    -   `roll` Rotation angle, take the value type reference [setRoll](/en/docs/api/camera#setroll)
    -   `zoom` Zoom scaling, take the value type reference [setZoom](/en/docs/api/camera#setzoom)

```js
camera.createLandmark('mark1', {
    position: [300, 250, 400],
    focalPoint: [300, 250, 0],
});
camera.createLandmark('mark2', {
    position: [300, 600, 500],
    focalPoint: [300, 250, 0],
});
camera.createLandmark('mark3', {
    position: [0, 250, 800],
    focalPoint: [300, 250, 0],
    roll: 30,
});
```

### gotoLandmark()

Switching to a previously saved Landmark works in both 2D and 3D scenes, [example](/en/examples/camera#landmark2).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*EL2XSL5qSQ8AAAAAAAAAAAAAARQnAQ" width="200">
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*o4eKT4ZQfJcAAAAAAAAAAAAAARQnAQ" width="300">

```js
camera.gotoLandmark('mark1', { duration: 300, easing: 'ease-in' });
// or
camera.gotoLandmark(landmark, { duration: 300, easing: 'ease-in' });
```

The list of parameters is as follows.

-   markName
-   options Camera parameters, including.
    -   `duration` Duration of the animation in `ms`, default value is `100`.
    -   `easing` Easing function, default value is `linear`. Consistent with the animation system [built-in effects](/en/docs/api/animation#easing-1)
    -   `easingFunction` Custom easing function, when the built-in easing function can not meet the requirements, you can [custom](/en/docs/api/animation#easingfunction)
    -   `onfinish` Callback function at the end of the animation

As with the [options](/en/docs/api/animation#options) parameter in the animation system, passing `number` is equivalent to setting `duration`.

```js
camera.gotoLandmark('mark1', { duration: 300 });
camera.gotoLandmark('mark1', 300);
```

It is important to note that if another camera animation is called before the end of one, the animation in progress will be cancelled immediately.
