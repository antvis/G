---
title: 相机
order: -98
---

相机（Camera）描述了我们观察世界的角度。视点、相机位置都会影响最终的成像。
在创建 [Canvas](/zh/docs/api/canvas) 画布时，已经内置了一个默认使用正交投影的相机。因此我们不需要手动创建它，可以通过如下方式获取：

```js
const camera = canvas.getCamera();
```

通过操作相机我们可以很方便地实现很多效果，例如对整个画布进行平移和缩放。这在渲染性能上会有很大提升。

目前我们支持以下特性：

- 支持两种投影模式：正交投影（Orthographic）和透视投影（Perspective），默认使用前者。
- 支持两种观测类型：固定摄像机（Tracking）和固定视点（Orbiting），默认使用后者。
- 支持自定义相机动画，创建/保存当前相机状态作为一个 Landmark，可在多个 Landmark 间平滑切换。

## 投影模式

正交投影（左图）常用于 CAD 软件和策略类游戏（模拟人生）中。
而透视投影（右图）遵循我们认知中的“近大远小”。
![](https://www.scratchapixel.com/images/upload/perspective-matrix/projectionsexample.png)

在 2D 场景中使用的都是正交投影，因此这也是 G 默认的投影模式。而在 3D 场景中，有时我们需要切换到透视投影，因此我们提供以下两个 API 来设置投影模式。

### setOrthographic

定义正交投影下的视锥：
`setOrthographic(l: number, r: number, t: number, b: number, near: number, far: number)`

为了和 Canvas 坐标系保持一致，即原点为左上角，G 内置的相机使用了如下配置：

```js
camera.setOrthographic(0, canvas.width, 0, canvas.height, -1000, 1000);
```

### setPerspective

定义透视投影下的视锥：
`setPerspective(near: number, far: number, fov: number, aspect: number)`

## 相机类型

在 2D 场景中，如果我们想在场景中移动，通常会使用到平移和缩放。而在 3D 场景下不同的相机类型会带来不同的视觉效果。

左图是固定视点，移动相机位置来观测场景，多见于模型观察。而右图固定相机位置，调整视点观察场景中的所有物体。
![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*vNDVQ5tE4G0AAAAAAAAAAAAAARQnAQ)

## 相机动作

在相机坐标系中相机的三轴为 `uvn`
![](https://i.stack.imgur.com/ooEFp.png)

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

### camera.setPerspective(near: number, far: number, fov: number, aspect: number): Camera

功能描述：设置相机投影模式为透视投影 `Camera.ProjectionMode.PERSPECTIVE`

参数：

- `near` `number` 近平面
- `far` `number` 远平面
- `fov` `number` 角度
- `aspect` `number` 宽高比

使用示例：

```ts
const camera = world.createCamera().setPerspective(0.1, 5, 75, canvas.width / canvas.height);
```

### camera.setOrthographic(left: number, right: number, top: number, bottom: number, near: number, far: number): Camera

下图来自：http://learnwebgl.brown37.net/08_projections/projections_ortho.html

![](http://learnwebgl.brown37.net/_images/clipping_volume.png)

功能描述：设置相机投影模式为正交投影 `Camera.ProjectionMode.ORTHOGRAPHIC`

参数：

- `left` `number` x 轴负向最大距离
- `right` `number` x 轴正向最大距离
- `top` `number` y 轴正向最大距离
- `bottom` `number` y 轴负向最大距离
- `near` `number` 近平面
- `far` `number` 远平面

使用示例：

```ts
camera = world.createCamera().setOrthographic(-4, 4, -4, 4, 1, 600);
```

### camera.dolly(distance: number): Camera

功能描述：沿 n 轴移动，当距离视点远时移动速度较快，离视点越近速度越慢

参数：

- `distance` `number` 移动距离，正向靠近视点，负向远离使用示例：

```ts
camera.dolly(2); // 靠近
camera.dolly(-2); // 远离
```
