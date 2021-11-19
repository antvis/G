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

-   两种投影模式：正交投影（Orthographic）和透视投影（Perspective），默认使用前者。
-   两种观测类型：固定摄像机（Tracking）和固定视点（Orbiting），默认使用后者。
-   自定义相机动画，创建/保存当前相机状态作为一个 Landmark，可在多个 Landmark 间平滑切换。

## 投影模式

正交投影（左图）常用于 CAD 软件和策略类游戏（模拟人生）中。而透视投影（右图）遵循我们认知中的“近大远小”。 ![](https://www.scratchapixel.com/images/upload/perspective-matrix/projectionsexample.png)

在 2D 场景中使用的都是正交投影，因此这也是 G 默认的投影模式。而在 3D 场景中，有时我们需要切换到透视投影，因此我们提供以下两个 API 来设置投影模式。

### setOrthographic(left: number, right: number, top: number, bottom: number, near: number, far: number)

设置相机投影模式为正交投影 `Camera.ProjectionMode.ORTHOGRAPHIC`

参数：

-   `left` `number` x 轴负向最大距离
-   `right` `number` x 轴正向最大距离
-   `top` `number` y 轴正向最大距离
-   `bottom` `number` y 轴负向最大距离
-   `near` `number` 近平面
-   `far` `number` 远平面

[使用示例](/zh/examples/camera#ortho)：

```js
camera.setOrthographic(-300, 300, -250, 250, 0.1, 1000);
```

### setPerspective(near: number, far: number, fov: number, aspect: number)

设置相机投影模式为透视投影 `Camera.ProjectionMode.PERSPECTIVE`

参数：

-   `near` `number` 近平面
-   `far` `number` 远平面
-   `fov` `number` 可视角度，越大意味着能容纳场景中的更多对象
-   `aspect` `number` 宽高比

[使用示例](/zh/examples/camera#perspective)：

```js
camera
    .setPosition(300, 100, 500)
    .setFocalPoint(300, 250, 0)
    .setPerspective(0.1, 1000, 75, 600 / 500);
```

## 相机参数设置

我们提供了以下方法修改相机位置、视点等常用的相机参数。

### setPosition(x: number | vec3, y?: number, z?: number)

设置相机在世界坐标系下的位置。在 G 内置的正交投影相机中，默认设置为 `[width / 2, height / 2]`，其中 `width/height` 为创建画布时传入的参数。

```js
camera.setPosition(300, 250);
// 或者
camera.setPosition(300, 250, 0);
// 或者
camera.setPosition([300, 250, 0]);
```

### setFocalPosition(x: number | vec3, y?: number, z?: number)

设置视点位置。

### setNear(near: number)

设置近平面。

### setFar(far: number)

设置远平面。

### setZoom(zoom: number)

`zoom` 大于 1 代表放大，反之代表缩小，[示例](/zh/examples/camera#ortho)。

### setFov(fov: number)

仅透视投影下生效，视角越大容纳的对象越多。[示例](/zh/examples/camera#perspective)

### setAspect(aspect: number)

仅透视投影下生效。大部分情况下不需要手动设置，当画布尺寸发生改变时可以通过调用 `canvas.resize()` 自动更新。

## 相机类型

在 2D 场景中，如果我们想在场景中移动，通常会使用到平移和缩放。而在 3D 场景下不同的相机类型会带来不同的视觉效果。

左图是固定视点，移动相机位置来观测场景，多见于模型观察。而右图固定相机位置，调整视点观察场景中的所有物体。 ![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*vNDVQ5tE4G0AAAAAAAAAAAAAARQnAQ)

## 相机动作

在相机坐标系中相机的三轴为 `uvn` ![](https://i.stack.imgur.com/ooEFp.png)

后面我们介绍的相机动作实际就是沿这三轴进行移动和旋转。

下图来自 Television Production Handbook p.97。早年的电视台使用的摄像机通过轨道完成移动：

![](https://gw.alipayobjects.com/mdn/rms_4be1e1/afts/img/A*Dm7cQZ6locEAAAAAAAAAAAAAARQnAQ)

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

很自然的，根据相机类型的不同，同一个摄像机动作对应的实现也不同。 我们以 dolly 动作为例，同样都是一个向前向后移动摄像机位置的动作，对于 Orbiting 模式视点不变，而在 Tracking 模式下视点是需要调整的。

### pan(tx: number, ty: number)

沿水平和垂直方向平移相机。

参数：

-   `tx` 沿 x 轴正向平移
-   `ty` 沿 y 轴正向平移

使用示例，下面的操作将导致原本处于视点处的物体展示在左上角：

```ts
camera.pan(200, 200);
```

### dolly(distance: number)

沿 n 轴移动相机。

参数：

-   `distance` `number` 移动距离，正向远离视点，负向靠近

使用示例：

```ts
camera.dolly(10); // 远离视点
camera.dolly(-10); // 靠近视点
```

### rotate(azimuth: number, elevation: number, roll: number)

按相机方位角旋转。

## 相机动画

我们可以把相机当前的位置、视点记录下来，保存成一个"地标" Landmark。随后当相机参数发生改变时，可以随时切换到之前保存的任意一个 Landmark，同时带有平滑的切换动画，类似真实片场中的摄像机摇臂，[示例](/zh/examples/camera#landmark)。

### createLandmark(name: string, params: LandmarkParams): Landmark

创建 Landmark，参数包括：

-   position 相机位置
-   focalPoint 视点
-   roll 旋转角度

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

### gotoLandmark(name: string, duration: number = 1000)

切换到之前保存的 Landmark：

```js
camera.gotoLandmark('mark1', 300);
```
