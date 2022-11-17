---
title: 使用 matter.js 物理引擎
order: 12
---

[matter.js](https://brm.io/matter-js/) 物理引擎提供了一系列针对刚体的仿真计算，例如重力和表面摩擦力。另外，在任意时刻也可以施加外力改变图形的位置和旋转角度，这为我们实现一些基于真实物理规则的布局提供了帮助。

通过 [g-plugin-matterjs](/zh/plugins/matterjs) 插件的支持，我们可以给已有的大部分 2D 图形增加物理属性。

在该[示例](/zh/examples/plugins#matterjs)中，我们创建了一系列动态物体，让它们进行自由落体，最终停留在“U 形槽”中。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Qw5OQLGQy_4AAAAAAAAAAAAAARQnAQ" width="300px">

## 注册插件

创建一个渲染器并注册插件：

```js
import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-canvas';
import { Plugin as PluginMatterjs } from '@antv/g-plugin-matterjs';

const renderer = new Renderer();
const plugin = new PluginMatterjs();
renderer.registerPlugin(plugin);

const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer,
});
```

## 开启 debug

在开发时，我们常常希望能把物理引擎中的世界也渲染出来，便于和“现实世界”对照。

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

## 创建静态地面

我们使用 [Line](/zh/api/basic/line) 创建一个平地，需要特别注意 [rigid](/zh/plugins/box2d#rigid) 属性，设置为 `static` 表明它不受重力等作用力影响：

```js
const ground = new Line({
    style: {
        x1: 50,
        y1: 400,
        // 省略其他属性
        rigid: 'static',
    },
});
canvas.appendChild(ground);
```

## 创建动态弹力球

接下来我们创建一个受重力影响的“弹力球”，其中：

-   [density](/zh/plugins/matterjs#density) 表示物体密度，单位为千克/立方米
-   [restitution](/zh/plugins/matterjs#restitution) 表示弹力系数

```js
const circle = new Circle({
    style: {
        fill: '#1890FF',
        r: 50,
        rigid: 'dynamic',
        density: 10,
        restitution: 0.5,
    },
});
canvas.appendChild(circle);
```

## 施加外力

插件会自动完成仿真过程，你可以看到小球自由落体至地面并弹起。

使用 [applyForce](/zh/plugins/matterjs#applyforce) 可以向图形施加外力。在该 [示例](/zh/examples/plugins#matterjs) 中，点击按钮可以向 Circle 施加一个 `[0, 0]` 点处 `[0, -10]` 的外力，因此受力会向上弹起：

```js
plugin.applyForce(circle, [0, -10], [0, 0]);
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*cen3SLSqkZEAAAAAAAAAAAAAARQnAQ" width="300px">
