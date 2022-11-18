---
title: 交互
order: 6
---

在 2D 场景中对于整个场景的常见交互有平移、缩放和旋转，通过[相机](/zh/api/camera#pantx-number-ty-number)动作实现。

例如对场景的平移等价于固定视点，让相机沿 u、v 轴（G 的世界坐标系 Y 轴正向向下）方向移动，也称作 [pan](/zh/api/camera#pantx-number-ty-number) 相机动作，在具体实现中通过对鼠标 move 系列事件的监听实现，同时由于相机固定为正交投影，视点是否固定并不影响最终成像效果。

![](https://i.stack.imgur.com/ooEFp.png)

但而在 3D 场景中，同样的鼠标平移动作可能包含不同的语义。例如在模型观察场景中，我们希望固定视点，改变相机位置，而在第一/三人称开放世界中，我们希望固定相机位置，改变视点。

我们提供了 `g-plugin-control` 插件，目前支持观察者模式，即通过鼠标交互固定视点，改变相机位置：

-   鼠标拖拽将引起相机在 u、v 轴的移动，即 pan 动作
-   鼠标滚轮缩放将引起相机在 n 轴的移动，即 dolly 动作

[示例](/zh/examples/3d#force-3d)：

```js
import { Plugin as PluginControl } from '@antv/g-plugin-control';

renderer.registerPlugin(new Plugin3D());
```

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*lQsCSrDhFP8AAAAAAAAAAAAAARQnAQ)
