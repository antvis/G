---
title: Introduction
order: 0
---

The camera describes the angle from which we view the world. The viewpoint and camera position all affect the final image. When creating the [Canvas](/en/api/canvas) canvas, there is already a built-in camera that uses orthogonal projection by default. So we don't need to create it manually, we can get it as follows.

```js
const camera = canvas.getCamera();
```

By manipulating the camera we can easily achieve many effects, such as panning and zooming the entire canvas. This will be a big improvement in rendering performance.

The camera currently supports the following features.

-   Two projection modes: Orthographic [Orthogonal](/en/api/camera/intro#projection-mode) and Perspective [Perspective](/en/api/camera/intro#projection-modee), the former is used by default.
-   Three camera types: [Exploring](/en/api/camera/intro#exploring), [Orbiting](/en/api/camera/intro#orbiting) and [Tracking](/en/api/camera/intro#tracking), Exploring is used by default.
-   Camera action. For example [pan](/en/api/camera/action#pan), [dolly](/en/api/camera/action#dolly), [rotate](/en/api/camera/action#rotate)
-   Customize [camera animation](/en/api/camera/animation) to create/save the current camera state as a Landmark and smoothly switch between multiple Landmarks.

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

### getProjectionMode

We use `CameraProjectionMode.ORTHOGRAPHIC` by default.

```js
canvas.getCamera().getProjectionMode(); // CameraProjectionMode.ORTHOGRAPHIC
```

In 2D scenes the orthogonal projection is used, so this is the default projection mode of G. In 3D scenes, sometimes we need to switch to perspective projection, so we provide the following two APIs to set the projection mode.

### setOrthographic

Set the camera projection mode to orthogonal projection `CameraProjectionMode.ORTHOGRAPHIC`

The method signature is as follows.

```js
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

The default camera settings for G are as follows, where `width/height` is the size of [Canvas](/en/api/canvas) and [usage example](/en/examples/camera/projection-mode/#ortho).

```js
const camera = new Camera()
    .setPosition(width / 2, height / 2, 500)
    .setFocalPoint(width / 2, height / 2, 0)
    .setOrthographic(width / -2, width / 2, height / 2, height / -2, 0.1, 1000);
```

### setPerspective

Set the camera projection mode to Perspective Projection `CameraProjectionMode.PERSPECTIVE`

The method signature is as follows.

```js
setPerspective(near: number, far: number, fov: number, aspect: number)
```

Parameters:

-   `near` Near plane
-   `far` Far plane
-   `fov` Viewing angle, larger means more objects in the scene can be accommodated
-   `aspect` Width-to-Height Ratio

[Example](/en/examples/camera/projection-mode/#perspective)：

```js
camera
    .setPosition(300, 100, 500)
    .setFocalPoint(300, 250, 0)
    .setPerspective(0.1, 1000, 75, 600 / 500);
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

With [g-plugin-control](/en/plugins/control) you can interact with mouse panning and zooming, [example](/en/examples/camera/camera-animation/#landmark).

### Orbiting

Fixes the viewpoint `focalPoint` and changes the camera position `position`. Commonly used in scenarios like CAD viewing models, but not across the north and south poles.

Called [OrbitControls](https://threejs.org/#examples/en/controls/OrbitControls) in Three.js.

In this [example](/en/examples/camera/camera-animation/#landmark), we control the camera by mouse panning to complete the [pan](/en/api/camera/action#pan) action, as if we were "rotating" the scene around a fixed viewpoint.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*QjQQRLA3w8sAAAAAAAAAAAAAARQnAQ">

### Exploring

Similar to `Orbiting` mode, also fixed viewpoint `focalPoint`, but can span North and South poles.

G's **Default Camera** has this mode selected.

Called [TrackballControls](https://threejs.org/#examples/en/controls/TrackballControls) in Three.js.

In this [example](/en/examples/camera/camera-animation/#landmark), we control the camera via mouse panning to complete the [pan]() action, allowing the camera to "rotate" around a fixed point of view.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*dGgTTKjUrKoAAAAAAAAAAAAAARQnAQ">

### Tracking

The fixed camera position `position` rotates around it, so the viewpoint `focalPoint` position will change.

Called [FirstPersonControls](https://threejs.org/#examples/en/controls/FirstPersonControls) in Three.js.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*3OPVQajsb3YAAAAAAAAAAAAAARQnAQ">

### setType

At any time, you can switch between these three modes.

```js
camera.setType(CameraType.Tracking);
```
