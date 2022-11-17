---
title: 相机参数
order: 1
---

我们提供了以下方法获取或者修改相机位置、视点等常用的相机参数。

下图来自：http://voxelent.com/tutorial-camera-landmarks/ 展示了相机位置 `position` 和视点 `focalPoint`：

<img src="http://voxelent.com/wp-content/uploads/2014/03/camera_position_focalpoint.png" alt="position and focal position" width="300">

## getPosition

获取相机在世界坐标系下的位置，类型为 `[number, number, number]`。

```js
camera.getPosition(); // [300, 200, 500]
```

## setPosition

设置相机在世界坐标系下的位置。

方法签名如下：

```
setPosition(x: number | vec2 | vec3, y?: number, z?: number)
```

在 G 内置的正交投影相机中，默认设置为 `[width / 2, height / 2, 500]`，其中 `width/height` 为 [Canvas](/zh/api/canvas) 的尺寸。因此如果我们想重新设置相机的 `x/y` 坐标，同时保持 `z` 坐标不变，可以这么做：

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

## getFocalPoint

获取视点在世界坐标系下的位置，类型为 `[number, number, number]`。

```js
camera.getFocalPoint(); // [300, 200, 0]
```

## setFocalPoint

设置视点在世界坐标系下的位置。

方法签名如下：

```
setFocalPoint(x: number | vec2 | vec3, y?: number, z?: number)
```

在 G 内置的正交投影相机中，默认设置为 `[width / 2, height / 2, 0]`，其中 `width/height` 为 [Canvas](/zh/api/canvas) 的尺寸。因此如果我们想重新设置相机视点的 `x/y` 坐标，同时保持 `z` 坐标不变，可以这么做：

```js
// 保持 Z 坐标不变
camera.setFocalPoint(300, 250);
camera.setFocalPoint([300, 250]);
// 或者设置 Z 坐标为默认值 0
camera.setFocalPoint(300, 250, 0);
// 或者设置 Z 坐标为默认值 0
camera.setFocalPoint([300, 250, 0]);
```

## getDistance

获取相机位置到视点的距离。

例如默认相机中：

```js
camera.getDistance(); // 500
```

## setDistance

固定视点，沿 `forward` 方向移动相机位置。

例如移动默认相机，固定视点位置，将视距从 `500` 改成 `400`：

```js
camera.setDistance(400);
```

## getNear

获取近平面。近平面内的图形将被剔除。

G 的默认相机设置为 `0.1`：

```js
camera.getNear(); // 0.1
```

## setNear

设置近平面。

方法签名如下：

```
setNear(near: number)
```

## getFar

获取远平面。远平面外的图形将被剔除。

G 的默认相机设置为 `1000`：

```js
camera.getFar(); // 1000
```

## setFar

设置远平面。

方法签名如下：

```
setFar(far: number)
```

## getZoom

获取缩放比例。虽然从视觉效果上看，增大相机的缩放比例与调用根节点的 [setScale]() 相同，但显然前者并不会对场景中的图形造成任何改变。

默认缩放比例为 `1`：

```js
camera.getZoom(); // 1
```

## setZoom

`zoom` 大于 1 代表放大，反之代表缩小，[示例](/zh/examples/camera/projection-mode/#ortho)。

方法签名如下：

```
setZoom(zoom: number)
```

## setZoomByViewportPoint

[setZoom](/zh/api/camera/params#setzoom) 会以相机在世界坐标系下的位置为中心进行缩放。但有时我们希望固定视点，即以[视口坐标系](/zh/api/canvas/coordinates#viewport)下的点为中心进行缩放。

在下面的[示例](/zh/examples/camera/camera-action/#zoom-by-point)中，我们监听了 `wheel` 事件，以事件对象在 client 坐标系下的位置为中心进行缩放：

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*cIK-RL1MHtYAAAAAAAAAAAAAARQnAQ" alt="zoom by viewport point" width="200">

```js
// 将 wheel 事件的 clientX/Y 转换到视口坐标系
const { x, y } = canvas.client2Viewport({ x: e.clientX, y: e.clientY });
camera.setZoomByViewportPoint(zoom, [x, y]);
```

方法签名如下：

-   `zoom` 大于 1 代表放大，反之代表缩小。
-   `viewportPoint` 为[视口坐标系](/zh/api/canvas/coordinates#viewport)下的点坐标。

```
setZoomByViewportPoint(zoom: number, viewportPoint: vec2)
```

## setFov

仅透视投影下生效，视角越大容纳的对象越多。[示例](/zh/examples/camera/projection-mode/#perspective)

方法签名如下：

```
setFov(fov: number)
```

## setAspect

仅透视投影下生效。大部分情况下不需要手动设置，当画布尺寸发生改变时可以通过调用 `canvas.resize()` 自动更新。

方法签名如下：

```
setAspect(aspect: number)
```

## setMinDistance

设置最小视距。在进行 [dolly](/zh/api/camera/action#dolly) 操作时不会小于该距离。

默认值为 `-Infinity`。

## setMaxDistance

设置最大视距。在进行 [dolly](/zh/api/camera/action#dolly) 操作时不会大于该距离。

默认值为 `Infinity`。

## setViewOffset

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

在该[示例](/zh/examples/camera/camera-action/#view-offset)中，[Cube](/zh/api/3d/geometry#cubegeometry) 原本位于视口正中央，通过设置 `x/y` 偏移量到视口中心。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*U6ELSY2EVNIAAAAAAAAAAAAAARQnAQ" alt="setViewOffset" width="300">

在 [g-plugin-device-renderer](/zh/plugins/device-renderer) 中拾取时，我们使用该方法设置偏移量（将相机对准拾取区域），仅渲染拾取区域而非整个屏幕以提高性能。

## clearViewOffset

清除之前设置的视口偏移量，立刻重新计算投影矩阵。

在该[示例](/zh/examples/camera/camera-action/#view-offset)中，点击按钮可以随时移除已设置的偏移量。

## 设置方位角

在描述旋转时，有时欧拉角理解起来要更直观，因为它更加贴近我们在日常生活中的描述，比如摄像机运动、水平坐标系（也称作地心坐标系）中的经纬度等等。在一些 GIS 类可视化项目（例如 Mapbox）中，经常使用 pitch/yaw/roll 来描述自身的旋转情况。例如下图中的一架飞机。

设置相机方位角，不同相机模式下需要重新计算相机位置或者是视点位置。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*tLc3R7rerqsAAAAAAAAAAAAAARQnAQ" alt="azimuth" width="400">

### setRoll

设置绕 `forward` 轴旋转的角度，单位为 `deg`，方法签名如下：

```
setRoll(roll: number)
```

注意不同的[相机类型](/zh/api/camera/intro#相机类型)下，固定相机位置和固定视点位置旋转的效果不同：

```js
camera.setRoll(30);
```

### setElevation

设置 `elevation` 角度，单位为 `deg`，方法签名如下：

```
setElevation(angle: number)
```

注意不同的[相机类型](/zh/api/camera#相机类型)下，固定相机位置和固定视点位置旋转的效果不同：

```js
camera.setElevation(30);
```

### setAzimuth

设置绕 `azimuth` 角度，单位为 `deg`，方法签名如下：

```
setAzimuth(angle: number)
```

注意不同的[相机类型](/zh/api/camera#相机类型)下，固定相机位置和固定视点位置旋转的效果不同：

```js
camera.setAzimuth(30);
```
