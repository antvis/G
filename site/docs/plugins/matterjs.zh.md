---
title: g-plugin-matterjs
order: -1
---

支持 [matter.js](https://brm.io/matter-js/) 物理引擎（仅支持刚体）。2D 图形初始化后开始仿真，除了受重力和表面摩擦力，在任意时刻也可以施加外力改变图形的位置和旋转角度。

支持以下 2D 图形：[Circle](/zh/api/basic/circle)、[Rect](/zh/api/basic/rect)、[Line](/zh/api/basic/line)、[Image](/zh/api/basic/image)、[Polygon](/zh/api/basic/polygon)

在该[示例](/zh/examples/plugins#matterjs)中，我们创建了一系列动态物体，让它们进行自由落体，最终停留在“U 形槽”中。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Qw5OQLGQy_4AAAAAAAAAAAAAARQnAQ" width="300px">

## 安装方式

创建插件并在渲染器中注册：

```js
import { Plugin as PluginMatterjs } from '@antv/g-plugin-matterjs';
renderer.registerPlugin(new PluginMatterjs());
```

在 2D 图形中使用相关物理属性：

```js
new Circle({
    style: {
        rigid: 'dynamic', // 动态物体，参与受力计算
        density: 10, // 密度：10 千克/平方米
        r: 10, // 半径：对应物理世界中 10 米
    },
});
```

## 全局配置

全局物理世界配置。

### debug

matter.js  本身支持渲染。开启后配合 [debugContainer](/zh/plugins/matterjs#debugcontainer) 可以绘制物理引擎世界中每个对象的 wireframe，便于 debug：

```js
const plugin = new PluginMatterjs({
    debug: true,
    debugContainer: document.getElementById('container'),
    debugCanvasWidth: 600,
    debugCanvasHeight: 500,
});
```

例如下图展示了三堵静态墙壁和一些动态物体的 wireframe：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Z5XLQ5zRKzkAAAAAAAAAAAAAARQnAQ" width="300px">

### debugContainer

类型为 `HTMLElement`，matter.js 会在容器内创建 `<canvas>` 用于渲染。

### debugCanvasWidth

类型为 `number`，用于调试的 `<canvas>` 的宽度。

### debugCanvasHeight

类型为 `number`，用于调试的 `<canvas>` 的高度。

### gravity

重力方向向量，默认值为 `[0, 1]`。

https://brm.io/matter-js/docs/classes/Engine.html#property_gravity

例如设置成 `[1, 1]`，物体会自然向右下角运动：

```js
new PluginMatterjs({
  gravity: [1, 1],
}),
```

### gravityScale

类型为 `number`，重力缩放系数。

https://brm.io/matter-js/docs/classes/Engine.html#property_gravity.scale

### timeStep

仿真时间间隔，默认值为 `1/60`

### velocityIterations

计算加速度迭代次数，默认值为 `4`，越高计算开销越大

https://brm.io/matter-js/docs/classes/Engine.html#property_velocityIterations

### positionIterations

计算位置迭代次数，默认值为 `6`，越高计算开销越大

https://brm.io/matter-js/docs/classes/Engine.html#property_positionIterations

## 图形物理属性

以下属性大部分都支持运行时修改，例如修改密度：

```js
circle.style.density = 100;
```

### rigid

刚体类型：

-   static 静态物体，例如地面
-   dynamic 动态物体，计算受力

<!-- - kinematic -->

### density

密度，千克/平方米。静态物体为 0。

https://brm.io/matter-js/docs/classes/Body.html#property_density

### velocity

线速度，默认值为 `[0, 0]`。

https://brm.io/matter-js/docs/classes/Body.html#property_velocity

### angularVelocity

角速度，默认值为 `0`。

https://brm.io/matter-js/docs/classes/Body.html#property_angularVelocity

### friction

摩擦力，取值范围为 `[0 - 1]`，默认值为 `0.1`。`0` 代表物体会无限滑动下去，`1` 表示物体受力后会立刻停止。

https://brm.io/matter-js/docs/classes/Body.html#property_friction

### frictionAir

定义在空气中的摩擦力，`0` 表示无重力，值越高物体在空间中移动减速就越明显，默认值为 `0.01`。

https://brm.io/matter-js/docs/classes/Body.html#property_frictionAir

### frictionStatic

默认值为 `0.5`

https://brm.io/matter-js/docs/classes/Body.html#property_frictionStatic

### restitution

恢复力，取值范围为 `[0 - 1]`。例如一个球落向地面，恢复力为 0 时则不会弹起。

## 对物体施加外力

除了通过初始化参数进行仿真，在任意时刻都可以通过施加外力，改变物体的位置和旋转角度。

### applyForce

方法签名，对一个图形在某个点上施加力：

```ts
applyForce(object: DisplayObject, force: [number, number], point: [number, number])
```

```js
const plugin = new PluginMatterjs();
plugin.applyForce(circle, [10, 0], [0, 0]);
```
