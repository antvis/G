---
title: g-plugin-box2d
order: -1
---

支持 [Box2D](https://box2d.org/documentation/) 物理引擎（仅支持刚体）。2D 图形初始化后开始仿真，除了受重力和表面摩擦力，在任意时刻也可以施加外力改变图形的位置和旋转角度。

运行时加载 WASM 方式使用，entry 使用 UMD：

-   2.4 版本 https://github.com/Birch-san/box2d-wasm
-   2.3 & 2.2 版本 https://github.com/kripken/box2d.js

目前使用 Box2D 最新版 2.4，参考文档：https://box2d.org/documentation/。

支持以下 2D 图形：[Circle](/zh/api/basic/circle)、[Rect](/zh/api/basic/rect)、[Line](/zh/api/basic/line)、[Image](/zh/api/basic/image)、[Polygon](/zh/api/basic/polygon)

在该[示例](/zh/examples/plugins#box2d)中，我们创建了一系列动态物体，让它们进行自由落体，最终停留在“U 形槽”中。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Qw5OQLGQy_4AAAAAAAAAAAAAARQnAQ" width="300px">

## 安装方式

创建插件并在渲染器中注册：

```js
import { Plugin as PluginBox2D } from '@antv/g-plugin-box2d';
renderer.registerPlugin(new PluginBox2D());
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

### gravity

重力方向向量，默认值为 `[0, 100]`。

例如设置成 `[100, 100]`，物体会自然向右下角运动：

```js
new PluginBox2D({
  gravity: [100, 100],
}),
```

### timeStep

仿真时间间隔，默认值为 `1/60`

### velocityIterations

计算加速度迭代次数，默认值为 `8`，越高计算开销越大

### positionIterations

计算位置迭代次数，默认值为 `3`，越高计算开销越大

### onContact

可以监听两个物体表面接触：

```js
new PluginBox2D({
  onContact: (objectA, objectB) => {
    // 两个物体表面发生了接触
  }
}),
```

https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md105

## 图形物理属性

Box2D 使用如下物理单位：米、千克和秒。

https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_loose_ends.html#autotoc_md124

> Box2D uses MKS (meters, kilograms, and seconds) units and radians for angles.

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

### linearVelocity

线速度，默认值为 `[0, 0]`。

### angularVelocity

角速度，默认值为 `0`。

### gravityScale

重力因子，默认值为 `1`。 https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md60

### linearDamping

阻尼，默认值为 `0`。https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md59

### angularDamping

角阻尼，默认值为 `0`。https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md59

### fixedRotation

固定旋转角度，默认值为 `false`。https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md62

### bullet

默认值为 `false`。https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md63

### friction

摩擦力，取值范围为 `[0 - 1]`

### restitution

恢复力，取值范围为 `[0 - 1]`。例如一个球落向地面，恢复力为 0 时则不会弹起。

## [WIP] 对物体施加外力

除了通过初始化参数进行仿真，在任意时刻都可以通过施加外力，改变物体的位置和旋转角度。

https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md71

```c++
void b2Body::ApplyForce(const b2Vec2& force, const b2Vec2& point);
void b2Body::ApplyTorque(float torque);
void b2Body::ApplyLinearImpulse(const b2Vec2& impulse, const b2Vec2& point);
void b2Body::ApplyAngularImpulse(float impulse);
```

### applyForce

```js
const plugin = new PluginBox2D();
plugin.applyForce(circle, [0, 0], [0, 0]);
```

### applyTorque

### applyLinearImpulse

### applyAngularImpulse

## [WIP] Joint

物理间的连接会导致作用力的发生。Box2D 提供了一系列连接的描述。

https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md82

## [WIP] 流体

使用 liquidfun：https://github.com/Birch-san/box2d-wasm/blob/c04514c040/README.md#alternative-distributions
