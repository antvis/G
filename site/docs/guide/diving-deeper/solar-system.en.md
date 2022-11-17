---
title: 创造一个“太阳系”
order: 1
---

有了[场景图](/zh/guide/diving-deeper/scenegraph)的知识，在本教程中我们来创造一个“太阳系”，月球绕着地球转、地球绕着太阳转。

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*ZcrHSoLxRS8AAAAAAAAAAAAAARQnAQ)

其中会涉及以下 API：

-   使用 [appendChild](/zh/api/basic/display-object#添加删除节点) 创建场景中各个节点的父子关系
-   使用 [translate](/zh/api/basic/display-object#平移) 移动节点
-   使用 [rotate](/zh/api/basic/display-object#旋转) 让节点旋转
-   使用 [getElementsByName](/zh/api/basic/display-object#简单节点查询) 在场景图中查询节点
-   使用 [addEventListener](/zh/api/event#addeventlistener) 监听画布事件

最终示例：

-   [官网示例](/zh/examples/scenegraph#hierarchy)
-   [CodeSandbox 示例](https://codesandbox.io/s/jiao-cheng-tai-yang-xi-li-zi-1bphz)

## 创建场景图

它具有以下层次关系：

```
太阳系 solarSystem
   |    |
   |   太阳 sun
   |
 地球轨道 earthOrbit
   |    |
   |  地球 earth
   |
 月球轨道 moonOrbit
      |
     月球 moon
```

从 `@antv/g` 核心包中引入基础对象 [Group](/zh/api/basic/group) 和 [Circle](/zh/api/basic/circle)。前者无可渲染实体，仅表示逻辑上的“容器”概念，适合“太阳系”、“地球轨道”、“月球轨道”这样的抽象概念，而后者用来表现太阳、地球和月球。当我们想表示“从属”关系时，就可以使用 `appendChild`，例如“太阳属于太阳系”：

```js
import { Group, Circle } from '@antv/g';

// 太阳系
const solarSystem = new Group({
    name: 'solarSystem',
});
// 地球轨道
const earthOrbit = new Group({
    name: 'earthOrbit',
});
// 月球轨道
const moonOrbit = new Group({
    name: 'moonOrbit',
});
// 太阳
const sun = new Circle({
    name: 'sun',
    style: {
        r: 100,
    },
});
// 地球
const earth = new Circle({
    name: 'earth',
    style: {
        r: 50,
    },
});
// 月球
const moon = new Circle({
    name: 'moon',
    style: {
        r: 25,
    },
});

// 太阳属于太阳系
solarSystem.appendChild(sun);
// 地球轨道也属于太阳系
solarSystem.appendChild(earthOrbit);
earthOrbit.appendChild(earth);
earthOrbit.appendChild(moonOrbit);
moonOrbit.appendChild(moon);
```

后续随时可以通过 [getElementsByName](/zh/api/basic/display-object#简单节点查询) 在场景图中查询节点：

```js
canvas.getElementsByName('sun'); // [sun]
```

## 确定位置

此时我们使用 [setPosition](/zh/api/basic/display-object#平移) 将整个太阳系移动到画布中央，基于场景图内的父子关系，太阳、地球轨道、地球、月球轨道和月球都被移动到了 `(300, 250)`，如下图（左）所示：

```javascript
// 设置太阳系的位置
solarSystem.setPosition(300, 250);
```

保持太阳位置不变，我们沿 X 轴移动地球轨道 100，同样地球、月球轨道和月球也都被移动到了世界坐标系下`(400, 250)`，如下图（中）所示：

```javascript
earthOrbit.translate(100, 0);
// earthOrbit.getLocalPosition() --> (100, 0)
// earthOrbit.getPosition() --> (400, 250)
```

然后我们移动月球轨道，如下图（右）所示：

```javascript
moonOrbit.translate(100, 0);
```

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*XcUqQJowVKMAAAAAAAAAAAAAARQnAQ)

## 旋转起来！

现在我们需要让地球和月球都旋转起来。首先使用 [addEventListener](/zh/api/event#addeventlistener) 给画布添加一个事件监听器，监听 [AFTER_RENDER](/zh/api/canvas#画布特有事件) 事件，该事件会在每一帧渲染完毕后触发。然后我们分别让太阳系和地球轨道在局部坐标系中沿 Z 轴旋转 1 度（你也可以让地球轨道转的更快点）：

```javascript
import { CanvasEvent } from '@antv/g';

// 当画布每一帧渲染完毕时...
canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
    // 太阳系自转
    solarSystem.rotateLocal(1);
    // 地球轨道自转
    earthOrbit.rotateLocal(1);
});
```
