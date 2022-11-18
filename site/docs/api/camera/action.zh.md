---
title: 相机动作
order: 9
---

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

很自然的，根据相机类型的不同，同一个摄像机动作对应的实现也不同。 我们以 [dolly](/zh/api/camera/action#dolly) 动作为例，同样都是一个向前向后移动摄像机位置的动作，对于 [Orbiting](/zh/api/camera/intro#orbiting) / [Exploring](/zh/api/camera/intro#exploring) 模式视点不变，而在 [Tracking](/zh/api/camera/intro#tracking) 模式下视点是需要调整的。

## pan

沿 u / v 轴，即水平和垂直方向平移相机。

方法签名如下：

```
pan(tx: number, ty: number)
```

参数：

-   `tx` 沿 u 轴正向平移
-   `ty` 沿 v 轴正向平移

在该[示例](/zh/examples/camera/camera-action/#action) 中，下面的操作将导致原本处于视点处的物体展示在左上角：

```ts
camera.pan(200, 200);
```

在 [g-plugin-control](/zh/plugins/control) 中我们响应鼠标平移事件，调用该方法：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*QjQQRLA3w8sAAAAAAAAAAAAAARQnAQ">

## dolly

沿 n 轴移动相机。固定视点，改变相机位置从而改变视距。会保持视距在 [minDistance](/zh/api/camera/params#setmindistance) 和 [maxDistance](/en/api/camera/params#setmaxdistance) 之间。

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

在透视投影中效果如下，在 [g-plugin-control](/zh/plugins/control) 中我们响应鼠标滚轮事件，调用该方法：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Q-OJQ5cCbowAAAAAAAAAAAAAARQnAQ">

## rotate

按相机方位角旋转，逆时针方向为正。

方法签名如下：

```
rotate(azimuth: number, elevation: number, roll: number)
```

2D 场景只需要指定 roll，例如让相机“歪下头”：

```js
camera.rotate(0, 0, 30);
```
