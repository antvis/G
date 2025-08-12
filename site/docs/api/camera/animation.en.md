---
title: Camera animation
order: 10
---

We can record the current position and viewpoint of the camera and save it as a Landmark, and then when the camera parameters change, you can switch to any of the previously saved Landmark at any time, with a smooth switching animation, similar to the camera pan arm on a real set, also called `flyTo` in some applications (e.g. [Mapbox in application](https:/.mapbox.com/mapbox-gl-js/example/flyto/)), [example](/examples/camera/camera-animation/#landmark2).

## createLandmark

Create a Landmark with the following parameters.

- markName
- options Camera parameters, including.
  - `position` The position of the camera in the world coordinate system, taking the type reference [setPosition](/api/camera/action#pan)
  - `focalPoint` Viewpoint in the world coordinate system, reference to the value type [setFocalPoint](/api/camera/action#pan)
  - `roll` Rotation angle, take the value type reference [setRoll](/api/camera/action#rotate)
  - `zoom` Zoom scaling, take the value type reference [setZoom](/api/camera/action#dolly)

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

## gotoLandmark

Switching to a previously saved Landmark works in both 2D and 3D scenes, [example](/examples/camera/camera-animation/#landmark2).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*EL2XSL5qSQ8AAAAAAAAAAAAAARQnAQ" width="200">
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*o4eKT4ZQfJcAAAAAAAAAAAAAARQnAQ" width="300">

```js
camera.gotoLandmark('mark1', { duration: 300, easing: 'ease-in' });
// or
camera.gotoLandmark(landmark, { duration: 300, easing: 'ease-in' });
```

The list of parameters is as follows.

- markName
- options Camera parameters, including.
  - `duration` Duration of the animation in `ms`, default value is `100`.
  - `easing` Easing function, default value is `linear`. Consistent with the animation system [built-in effects](/api/animation/waapi#easing-1)
  - `easingFunction` Custom easing function, when the built-in easing function can not meet the requirements, you can [custom](/api/animation/waapi#easingfunction)
  - `onfinish` Callback function at the end of the animation

As with the [options](/api/animation/waapi#options) parameter in the animation system, passing `number` is equivalent to setting `duration`.

```js
camera.gotoLandmark('mark1', { duration: 300 });
camera.gotoLandmark('mark1', 300);
```

It is important to note that if another camera animation is called before the end of one, the animation in progress will be cancelled immediately.
