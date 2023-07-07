---
title: 相机动画
order: 10
---

我们可以把相机当前的位置、视点记录下来，保存成一个"地标" Landmark。随后当相机参数发生改变时，可以随时切换到之前保存的任意一个 Landmark，同时带有平滑的切换动画，类似真实片场中的摄像机摇臂，在一些应用中也称作 `flyTo`（例如 [Mapbox 中的应用](https:/.mapbox.com/mapbox-gl-js/example/flyto/)），[示例](/zh/examples/camera/camera-animation/#landmark2)。

## createLandmark

创建一个 Landmark，参数包括：

-   markName 名称
-   options 相机参数，包括：
    -   position 世界坐标系下的相机位置，取值类型参考 [setPosition](/zh/api/camera#setposition)
    -   focalPoint 世界坐标系下的视点，取值类型参考 [setFocalPoint](/zh/api/camera#setfocalpoint)
    -   roll 旋转角度，取值类型参考 [setRoll](/zh/api/camera#setroll)
    -   zoom 缩放比例，取值类型参考 [setZoom](/zh/api/camera#setzoom)

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

切换到之前保存的 Landmark，在 2D 和 3D 场景下都适用，[示例](/zh/examples/camera/camera-animation/#landmark2)：

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
    -   easing 缓动函数，默认值为 `linear`。和动画系统一致的[内置效果](/zh/api/animation/waapi#easing-1)
    -   easingFunction 自定义缓动函数，当内置的缓动函数无法满足要求时，可以[自定义](/zh/api/animation/waapi#easingfunction)
    -   onfinish 动画结束后的回调函数

和动画系统中的 [options](/zh/api/animation/waapi#options) 参数一样，传入 `number` 时等同于设置 `duration`：

```js
camera.gotoLandmark('mark1', { duration: 300 });
camera.gotoLandmark('mark1', 300);
```

值得注意的是，如果在一个相机动画结束前调用另一个，进行中的动画将会立刻取消。
