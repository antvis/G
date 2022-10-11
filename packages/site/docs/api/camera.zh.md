---
title: 相机
order: -98
---

相机（Camera）描述了我们观察世界的角度。视点、相机位置都会影响最终的成像。在创建 [Canvas](/zh/docs/api/canvas) 画布时，已经内置了一个默认使用正交投影的相机。因此我们不需要手动创建它，可以通过如下方式获取：

```js
const camera = canvas.getCamera();
```

通过操作相机我们可以很方便地实现很多效果，例如对整个画布进行平移和缩放。这在渲染性能上会有很大提升。

目前相机支持以下特性：

-   两种投影模式：正交投影 [Orthographic](/zh/docs/api/camera#投影模式) 和透视投影 [Perspective](/zh/docs/api/camera#投影模式)，默认使用前者。
-   三种相机类型：[Exploring](/zh/docs/api/camera#exploring)、[Orbiting](/zh/docs/api/camera#orbiting) 和 [Tracking](/zh/docs/api/camera#tracking)，默认使用 Exploring。
-   相机动作。例如 [pan](/zh/docs/api/camera#pan)、[dolly](/zh/docs/api/camera#dolly)、[rotate](/zh/docs/api/camera#rotate)
-   自定义[相机动画](/zh/docs/api/camera#相机动画)，创建/保存当前相机状态作为一个 Landmark，可在多个 Landmark 间平滑切换。

## 投影模式

正交投影（左图）常用于 CAD 软件和策略类游戏（模拟人生）中。而透视投影（右图）遵循我们认知中的“近大远小”。 ![](https://www.scratchapixel.com/images/upload/perspective-matrix/projectionsexample.png)

我们提供了以上两种投影模式：

```js
enum CameraProjectionMode {
  ORTHOGRAPHIC,
  PERSPECTIVE,
}
```

### getProjectionMode()

G 默认使用 `CameraProjectionMode.ORTHOGRAPHIC`：

```js
canvas.getCamera().getProjectionMode(); // CameraProjectionMode.ORTHOGRAPHIC
```

在 2D 场景中使用的都是正交投影，因此这也是 G 默认的投影模式。而在 3D 场景中，有时我们需要切换到透视投影，因此我们提供以下两个 API 来设置投影模式。

### setOrthographic()

设置相机投影模式为正交投影 `CameraProjectionMode.ORTHOGRAPHIC`

方法签名如下：

```
setOrthographic(left: number, right: number,
                top: number, bottom: number,
                near: number, far: number)
```

参数列表如下：

-   `left` x 轴负向最大距离
-   `right` x 轴正向最大距离
-   `top` y 轴正向最大距离
-   `bottom` y 轴负向最大距离
-   `near` 近平面
-   `far` 远平面

G 的默认相机设置如下，其中 `width/height` 为 [Canvas](/zh/docs/api/canvas) 的尺寸，[使用示例](/zh/examples/camera#ortho)：

```js
const camera = new Camera()
    .setPosition(width / 2, height / 2, 500)
    .setFocalPoint(width / 2, height / 2, 0)
    .setOrthographic(width / -2, width / 2, height / 2, height / -2, 0.1, 1000);
```

### setPerspective()

设置相机投影模式为透视投影 `CameraProjectionMode.PERSPECTIVE`

方法签名如下：

```
setPerspective(near: number, far: number, fov: number, aspect: number)
```

参数：

-   `near` 近平面
-   `far` 远平面
-   `fov` 可视角度，越大意味着能容纳场景中的更多对象
-   `aspect` 宽高比

[使用示例](/zh/examples/camera#perspective)：

```js
camera
    .setPosition(300, 100, 500)
    .setFocalPoint(300, 250, 0)
    .setPerspective(0.1, 1000, 75, 600 / 500);
```

## 相机参数

我们提供了以下方法获取或者修改相机位置、视点等常用的相机参数。

下图来自：http://voxelent.com/tutorial-camera-landmarks/ 展示了相机位置 `position` 和视点 `focalPoint`：

<img src="http://voxelent.com/wp-content/uploads/2014/03/camera_position_focalpoint.png" alt="position and focal position" width="300">

### getPosition()

获取相机在世界坐标系下的位置，类型为 `[number, number, number]`。

```js
camera.getPosition(); // [300, 200, 500]
```

### setPosition()

设置相机在世界坐标系下的位置。

方法签名如下：

```
setPosition(x: number | vec2 | vec3, y?: number, z?: number)
```

在 G 内置的正交投影相机中，默认设置为 `[width / 2, height / 2, 500]`，其中 `width/height` 为 [Canvas](/zh/docs/api/canvas) 的尺寸。因此如果我们想重新设置相机的 `x/y` 坐标，同时保持 `z` 坐标不变，可以这么做：

```js
// 保持 Z 坐标不变
camera.setPosition(300, 250);
camera.setPosition([300, 250]);
// 或者设置 Z 坐标为默认值 500
camera.setPosition(300, 250, 500);
camera.setPosition([300, 250, 500]);
```

需要注意的是，在 2D 场景中当我们设置相机位置时，通常也需要一并设置视点位置，否则使用 `g-webgl` 渲染时会出现非预期的效果：

```js
camera.setPosition(100, 100, 500);
camera.setFocalPoint(100, 100, 0);
```

### getFocalPoint()

获取视点在世界坐标系下的位置，类型为 `[number, number, number]`。

```js
camera.getFocalPoint(); // [300, 200, 0]
```

### setFocalPoint()

设置视点在世界坐标系下的位置。

方法签名如下：

```
setFocalPoint(x: number | vec2 | vec3, y?: number, z?: number)
```

在 G 内置的正交投影相机中，默认设置为 `[width / 2, height / 2, 0]`，其中 `width/height` 为 [Canvas](/zh/docs/api/canvas) 的尺寸。因此如果我们想重新设置相机视点的 `x/y` 坐标，同时保持 `z` 坐标不变，可以这么做：

```js
// 保持 Z 坐标不变
camera.setFocalPoint(300, 250);
camera.setFocalPoint([300, 250]);
// 或者设置 Z 坐标为默认值 0
camera.setFocalPoint(300, 250, 0);
// 或者设置 Z 坐标为默认值 0
camera.setFocalPoint([300, 250, 0]);
```

### getDistance()

获取相机位置到视点的距离。

例如默认相机中：

```js
camera.getDistance(); // 500
```

### setDistance()

固定视点，沿 `forward` 方向移动相机位置。

例如移动默认相机，固定视点位置，将视距从 `500` 改成 `400`：

```js
camera.setDistance(400);
```

### getNear()

获取近平面。近平面内的图形将被剔除。

G 的默认相机设置为 `0.1`：

```js
camera.getNear(); // 0.1
```

### setNear()

设置近平面。

方法签名如下：

```
setNear(near: number)
```

### getFar()

获取远平面。远平面外的图形将被剔除。

G 的默认相机设置为 `1000`：

```js
camera.getFar(); // 1000
```

### setFar()

设置远平面。

方法签名如下：

```
setFar(far: number)
```

### getZoom()

获取缩放比例。虽然从视觉效果上看，增大相机的缩放比例与调用根节点的 [setScale]() 相同，但显然前者并不会对场景中的图形造成任何改变。

默认缩放比例为 `1`：

```js
camera.getZoom(); // 1
```

### setZoom()

`zoom` 大于 1 代表放大，反之代表缩小，[示例](/zh/examples/camera#ortho)。

方法签名如下：

```
setZoom(zoom: number)
```

### setZoomByViewportPoint()

[setZoom](/zh/docs/api/camera#setzoom) 会以相机在世界坐标系下的位置为中心进行缩放。但有时我们希望固定视点，即以[视口坐标系](/zh/docs/api/canvas#viewport)下的点为中心进行缩放。

在下面的[示例](/zh/examples/camera#zoom-by-point)中，我们监听了 `wheel` 事件，以事件对象在 client 坐标系下的位置为中心进行缩放：

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*cIK-RL1MHtYAAAAAAAAAAAAAARQnAQ" alt="zoom by viewport point" width="200">

```js
// 将 wheel 事件的 clientX/Y 转换到视口坐标系
const { x, y } = canvas.client2Viewport({ x: e.clientX, y: e.clientY });
camera.setZoomByViewportPoint(zoom, [x, y]);
```

方法签名如下：

-   `zoom` 大于 1 代表放大，反之代表缩小。
-   `viewportPoint` 为[视口坐标系](/zh/docs/api/canvas#viewport)下的点坐标。

```
setZoomByViewportPoint(zoom: number, viewportPoint: vec2)
```

### setFov()

仅透视投影下生效，视角越大容纳的对象越多。[示例](/zh/examples/camera#perspective)

方法签名如下：

```
setFov(fov: number)
```

### setAspect()

仅透视投影下生效。大部分情况下不需要手动设置，当画布尺寸发生改变时可以通过调用 `canvas.resize()` 自动更新。

方法签名如下：

```
setAspect(aspect: number)
```

### setMinDistance()

设置最小视距。在进行 [dolly](/zh/docs/api/camera#dolly) 操作时不会小于该距离。

默认值为 `-Infinity`。

### setMaxDistance()

设置最大视距。在进行 [dolly](/zh/docs/api/camera#dolly) 操作时不会大于该距离。

默认值为 `Infinity`。

### setViewOffset()

设置视口的偏移量，立刻重新计算投影矩阵。

方法签名为：

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

其中 `fullWidth/fullHeight` 为原始视口大小，`x/y` 为视口偏移坐标，`width/height` 为偏移后视口大小。

在该[示例](/zh/examples/camera#view-offset)中，[Cube](/zh/docs/api/3d/geometry#cubegeometry) 原本位于视口正中央，通过设置 `x/y` 偏移量到视口中心。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*U6ELSY2EVNIAAAAAAAAAAAAAARQnAQ" alt="setViewOffset" width="300">

在 [g-plugin-device-renderer](/zh/docs/plugins/device-renderer) 中拾取时，我们使用该方法设置偏移量（将相机对准拾取区域），仅渲染拾取区域而非整个屏幕以提高性能。

### clearViewOffset()

清除之前设置的视口偏移量，立刻重新计算投影矩阵。

在该[示例](/zh/examples/camera#view-offset)中，点击按钮可以随时移除已设置的偏移量。

### 设置方位角

在描述旋转时，有时欧拉角理解起来要更直观，因为它更加贴近我们在日常生活中的描述，比如摄像机运动、水平坐标系（也称作地心坐标系）中的经纬度等等。在一些 GIS 类可视化项目（例如 Mapbox）中，经常使用 pitch/yaw/roll 来描述自身的旋转情况。例如下图中的一架飞机。

设置相机方位角，不同相机模式下需要重新计算相机位置或者是视点位置。

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*tLc3R7rerqsAAAAAAAAAAAAAARQnAQ)

#### setRoll()

设置绕 `forward` 轴旋转的角度，单位为 `deg`，方法签名如下：

```
setRoll(roll: number)
```

注意不同的[相机类型](/zh/docs/api/camera#相机类型)下，固定相机位置和固定视点位置旋转的效果不同：

```js
camera.setRoll(30);
```

#### setElevation()

设置 `elevation` 角度，单位为 `deg`，方法签名如下：

```
setElevation(angle: number)
```

注意不同的[相机类型](/zh/docs/api/camera#相机类型)下，固定相机位置和固定视点位置旋转的效果不同：

```js
camera.setElevation(30);
```

#### setAzimuth()

设置绕 `azimuth` 角度，单位为 `deg`，方法签名如下：

```
setAzimuth(angle: number)
```

注意不同的[相机类型](/zh/docs/api/camera#相机类型)下，固定相机位置和固定视点位置旋转的效果不同：

```js
camera.setAzimuth(30);
```

## 相机类型

在 2D 场景中，如果我们想在场景中移动，通常会使用到平移和缩放。而在 3D 场景下不同的相机类型会带来不同的视觉效果。

左图是固定视点，移动相机位置来观测场景，多见于模型观察。而右图固定相机位置，调整视点观察场景中的所有物体。 ![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*vNDVQ5tE4G0AAAAAAAAAAAAAARQnAQ)

我们提供了三种类型：

```js
export enum CameraType {
  ORBITING,
  EXPLORING,
  TRACKING,
}

```

配合 [g-plugin-control](/zh/docs/plugins/control) 可以使用鼠标平移、缩放进行交互，[示例](/zh/examples/camera#landmark)。

### Orbiting

固定视点 `focalPoint`，改变相机位置 `position`。常用于 CAD 观察模型这样的场景，但不能跨越南北极。

在 Three.js 中称作 [OrbitControls](https://threejs.org/docs/#examples/zh/controls/OrbitControls)

在该[示例](/zh/examples/camera#landmark)中，我们通过鼠标的平移控制相机完成 [pan](/zh/docs/api/camera#pan) 动作，仿佛是在让场景绕固定视点“旋转”。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*QjQQRLA3w8sAAAAAAAAAAAAAARQnAQ">

### Exploring

类似 `Orbiting` 模式，同样固定视点 `focalPoint`，但可以跨越南北极。

G 的**默认相机**选择了该模式。

在 Three.js 中称作 [TrackballControls](https://threejs.org/docs/#examples/en/controls/TrackballControls)

在该[示例](/zh/examples/camera#landmark)中，我们通过鼠标的平移控制相机完成 [pan]() 动作，让相机绕固定视点“旋转”。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*dGgTTKjUrKoAAAAAAAAAAAAAARQnAQ">

### Tracking

固定相机位置 `position` 绕其旋转，因此视点 `focalPoint` 位置会发生改变。

在 Three.js 中称作 [FirstPersonControls](https://threejs.org/docs/#examples/en/controls/FirstPersonControls)

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*3OPVQajsb3YAAAAAAAAAAAAAARQnAQ">

### setType()

随时可以在以上三种模式间切换：

```js
camera.setType(CameraType.Tracking);
```

## 相机动作

在相机坐标系中相机的三轴为 `uvn`

<img src="https://i.stack.imgur.com/ooEFp.png" width="200">

后面我们介绍的相机动作实际就是沿这三轴进行移动和旋转。

下图来自 Television Production Handbook p.97。早年的电视台使用的摄像机通过轨道完成移动：

<img src="https://gw.alipayobjects.com/mdn/rms_4be1e1/afts/img/A*Dm7cQZ6locEAAAAAAAAAAAAAARQnAQ" width="400">

我们不考虑依靠摇臂完成的 crane 和 tongue 动作，沿 uvn 三轴的平移和旋转可总结出以下动作：

| 动作名   | 相机位置 | 视点     | u    | v    | n    |
| -------- | -------- | -------- | ---- | ---- | ---- |
| dolly    |          |          |      |      | 平移 |
| pedestal |          |          |      | 平移 |      |
| truck    |          |          | 平移 |      |      |
| cant     | 旋转中心 |          |      |      | 旋转 |
| pan      | 旋转中心 |          |      | 旋转 |      |
| tilt     | 旋转中心 |          | 旋转 |      |      |
| arc      |          | 旋转中心 |      | 旋转 |      |

很自然的，根据相机类型的不同，同一个摄像机动作对应的实现也不同。 我们以 [dolly]() 动作为例，同样都是一个向前向后移动摄像机位置的动作，对于 [Orbiting](/zh/docs/api/camera#orbiting) / [Exploring](/zh/docs/api/camera#exploring) 模式视点不变，而在 [Tracking](/zh/docs/api/camera#tracking) 模式下视点是需要调整的。

### pan()

沿 u / v 轴，即水平和垂直方向平移相机。

方法签名如下：

```
pan(tx: number, ty: number)
```

参数：

-   `tx` 沿 u 轴正向平移
-   `ty` 沿 v 轴正向平移

在该[示例](/zh/examples/camera#action) 中，下面的操作将导致原本处于视点处的物体展示在左上角：

```ts
camera.pan(200, 200);
```

在 [g-plugin-control](/zh/docs/plugins/control) 中我们响应鼠标平移事件，调用该方法：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*QjQQRLA3w8sAAAAAAAAAAAAAARQnAQ">

### dolly()

沿 n 轴移动相机。固定视点，改变相机位置从而改变视距。会保持视距在 [minDistance](/zh/docs/api/camera#setmindistance) 和 [maxDistance](/zh/docs/api/camera#setmaxdistance) 之间。

方法签名如下：

```
dolly(value: number)
```

参数：

-   `value` 以 `dollyingStep` 为单位，正向远离视点，负向靠近

使用示例：

```ts
camera.dolly(10); // 远离视点
camera.dolly(-10); // 靠近视点
```

在透视投影中效果如下，在 [g-plugin-control](/zh/docs/plugins/control) 中我们响应鼠标滚轮事件，调用该方法：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Q-OJQ5cCbowAAAAAAAAAAAAAARQnAQ">

### rotate()

按相机方位角旋转，逆时针方向为正。

方法签名如下：

```
rotate(azimuth: number, elevation: number, roll: number)
```

2D 场景只需要指定 roll，例如让相机“歪下头”：

```js
camera.rotate(0, 0, 30);
```

## 相机动画

我们可以把相机当前的位置、视点记录下来，保存成一个"地标" Landmark。随后当相机参数发生改变时，可以随时切换到之前保存的任意一个 Landmark，同时带有平滑的切换动画，类似真实片场中的摄像机摇臂，在一些应用中也称作 `flyTo`（例如 [Mapbox 中的应用](https://docs.mapbox.com/mapbox-gl-js/example/flyto/)），[示例](/zh/examples/camera#landmark)。

### createLandmark()

创建一个 Landmark，参数包括：

-   markName 名称
-   options 相机参数，包括：
    -   position 世界坐标系下的相机位置，取值类型参考 [setPosition](/zh/docs/api/camera#setposition)
    -   focalPoint 世界坐标系下的视点，取值类型参考 [setFocalPoint](/zh/docs/api/camera#setfocalpoint)
    -   roll 旋转角度，取值类型参考 [setRoll](/zh/docs/api/camera#setroll)
    -   zoom 缩放比例，取值类型参考 [setZoom](/zh/docs/api/camera#setzoom)

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

切换到之前保存的 Landmark，在 2D 和 3D 场景下都适用，[示例](/zh/examples/camera#landmark2)：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*EL2XSL5qSQ8AAAAAAAAAAAAAARQnAQ" width="200">
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*o4eKT4ZQfJcAAAAAAAAAAAAAARQnAQ" width="300">

```js
camera.gotoLandmark('mark1', { duration: 300, easing: 'ease-in' });
// or
camera.gotoLandmark(landmark, { duration: 300, easing: 'ease-in' });
```

参数列表如下：

-   markName 名称或者已创建的 Landmark
-   options 动画参数，包括：
    -   duration 动画持续时间，单位为 `ms`，默认值为 `100`
    -   easing 缓动函数，默认值为 `linear`。和动画系统一致的[内置效果](/zh/docs/api/animation/waapi#easing-1)
    -   easingFunction 自定义缓动函数，当内置的缓动函数无法满足要求时，可以[自定义](/zh/docs/api/animation/waapi#easingfunction)
    -   onfinish 动画结束后的回调函数

和动画系统中的 [options](/zh/docs/api/animation/waapi#options) 参数一样，传入 `number` 时等同于设置 `duration`：

```js
camera.gotoLandmark('mark1', { duration: 300 });
camera.gotoLandmark('mark1', 300);
```

值得注意的是，如果在一个相机动画结束前调用另一个，进行中的动画将会立刻取消。
