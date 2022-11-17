---
title: 使用 Box2D 物理引擎
order: 12
---

[Box2D](https://box2d.org/documentation/) 物理引擎提供了一系列针对刚体的仿真计算，例如重力和表面摩擦力。另外，在任意时刻也可以施加外力改变图形的位置和旋转角度，这为我们实现一些基于真实物理规则的布局提供了帮助。

通过 [g-plugin-box2d](/zh/plugins/box2d) 插件的支持，我们可以给已有的大部分 2D 图形增加物理属性。

在该[示例](/zh/examples/plugins#box2d)中，我们创建了一系列动态物体，让它们进行自由落体，最终停留在“U 形槽”中。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Qw5OQLGQy_4AAAAAAAAAAAAAARQnAQ" width="300px">

## 注册插件

创建一个渲染器并注册插件：

```js
import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-canvas';
import { Plugin as PluginBox2D } from '@antv/g-plugin-box2d';

const renderer = new Renderer();
const plugin = new PluginBox2D();
renderer.registerPlugin(plugin);

const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer,
});
```

此时我们的“物理世界”已经存在默认的重力 [gravity](/zh/plugins/box2d#gravity)，如果要修改它，可以这样做：

```js
const plugin = new PluginBox2D({
    gravity: [0, 200],
});
```

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

-   [density](/zh/plugins/box2d#density) 表示物体密度，单位为千克/立方米
-   [restitution](/zh/plugins/box2d#restitution) 表示弹力系数

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

## 运行效果

插件会自动完成仿真过程，你可以看到小球自由落体至地面并弹起。
