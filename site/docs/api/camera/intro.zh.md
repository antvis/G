---
title: 简介
order: 0
---

相机（Camera）描述了我们观察世界的角度。视点、相机位置都会影响最终的成像。在创建 [Canvas](/zh/api/canvas) 画布时，已经内置了一个默认使用正交投影的相机。因此我们不需要手动创建它，可以通过如下方式获取：

```js
const camera = canvas.getCamera();
```

通过操作相机我们可以很方便地实现很多效果，例如对整个画布进行平移和缩放。这在渲染性能上会有很大提升。

目前相机支持以下特性：

-   两种投影模式：正交投影 [Orthographic](/zh/api/camera/intro#投影模式) 和透视投影 [Perspective](/zh/api/camera/intro#投影模式)，默认使用前者。
-   三种相机类型：[Exploring](/zh/api/camera/intro#exploring)、[Orbiting](/zh/api/camera/intro#orbiting) 和 [Tracking](/zh/api/camera/intro#tracking)，默认使用 Exploring。
-   相机动作。例如 [pan](/zh/api/camera/action#pan)、[dolly](/zh/api/camera/action#dolly)、[rotate](/zh/api/camera/action#rotate)
-   自定义[相机动画](/zh/api/camera/animation)，创建/保存当前相机状态作为一个 Landmark，可在多个 Landmark 间平滑切换。

## 投影模式

正交投影（左图）常用于 CAD 软件和策略类游戏（模拟人生）中。而透视投影（右图）遵循我们认知中的“近大远小”。 ![perspective](https://www.scratchapixel.com/images/upload/perspective-matrix/projectionsexample.png)

我们提供了以上两种投影模式：

```js
enum CameraProjectionMode {
  ORTHOGRAPHIC,
  PERSPECTIVE,
}
```

### getProjectionMode

G 默认使用 `CameraProjectionMode.ORTHOGRAPHIC`：

```js
canvas.getCamera().getProjectionMode(); // CameraProjectionMode.ORTHOGRAPHIC
```

在 2D 场景中使用的都是正交投影，因此这也是 G 默认的投影模式。而在 3D 场景中，有时我们需要切换到透视投影，因此我们提供以下两个 API 来设置投影模式。

### setOrthographic

设置相机投影模式为正交投影 `CameraProjectionMode.ORTHOGRAPHIC`

方法签名如下：

```js
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

G 的默认相机设置如下，其中 `width/height` 为 [Canvas](/zh/api/canvas) 的尺寸，[使用示例](/zh/examples/camera/projection-mode/#ortho)：

```js
const camera = new Camera()
    .setPosition(width / 2, height / 2, 500)
    .setFocalPoint(width / 2, height / 2, 0)
    .setOrthographic(width / -2, width / 2, height / 2, height / -2, 0.1, 1000);
```

### setPerspective

设置相机投影模式为透视投影 `CameraProjectionMode.PERSPECTIVE`

方法签名如下：

```js
setPerspective(near: number, far: number, fov: number, aspect: number)
```

参数：

-   `near` 近平面
-   `far` 远平面
-   `fov` 可视角度，越大意味着能容纳场景中的更多对象
-   `aspect` 宽高比

[使用示例](/zh/examples/camera/projection-mode/#perspective)：

```js
camera
    .setPosition(300, 100, 500)
    .setFocalPoint(300, 250, 0)
    .setPerspective(0.1, 1000, 75, 600 / 500);
```

## 相机类型

在 2D 场景中，如果我们想在场景中移动，通常会使用到平移和缩放。而在 3D 场景下不同的相机类型会带来不同的视觉效果。

左图是固定视点，移动相机位置来观测场景，多见于模型观察。而右图固定相机位置，调整视点观察场景中的所有物体。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*vNDVQ5tE4G0AAAAAAAAAAAAAARQnAQ" alt="camera types" width="600">

我们提供了三种类型：

```js
export enum CameraType {
  ORBITING,
  EXPLORING,
  TRACKING,
}

```

配合 [g-plugin-control](/zh/plugins/control) 可以使用鼠标平移、缩放进行交互，[示例](/zh/examples/camera/camera-animation/#landmark)。

### Orbiting

固定视点 `focalPoint`，改变相机位置 `position`。常用于 CAD 观察模型这样的场景，但不能跨越南北极。

在 Three.js 中称作 [OrbitControls](https://threejs.org/#examples/zh/controls/OrbitControls)

在该[示例](/zh/examples/camera/camera-animation/#landmark)中，我们通过鼠标的平移控制相机完成 [pan](/zh/api/camera/action#pan) 动作，仿佛是在让场景绕固定视点“旋转”。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*QjQQRLA3w8sAAAAAAAAAAAAAARQnAQ">

### Exploring

类似 `Orbiting` 模式，同样固定视点 `focalPoint`，但可以跨越南北极。

G 的**默认相机**选择了该模式。

在 Three.js 中称作 [TrackballControls](https://threejs.org/#examples/en/controls/TrackballControls)

在该[示例](/zh/examples/camera/camera-animation/#landmark)中，我们通过鼠标的平移控制相机完成 [pan]() 动作，让相机绕固定视点“旋转”。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*dGgTTKjUrKoAAAAAAAAAAAAAARQnAQ">

### Tracking

固定相机位置 `position` 绕其旋转，因此视点 `focalPoint` 位置会发生改变。

在 Three.js 中称作 [FirstPersonControls](https://threejs.org/#examples/en/controls/FirstPersonControls)

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*3OPVQajsb3YAAAAAAAAAAAAAARQnAQ">

### setType

随时可以在以上三种模式间切换：

```js
camera.setType(CameraType.Tracking);
```
