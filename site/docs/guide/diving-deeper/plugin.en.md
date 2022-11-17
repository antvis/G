---
title: 使用插件
order: 3
---

插件可以极大程度丰富渲染器的能力，在本教程中我们将使用 `g-webgl` 渲染器，配合 [g-plugin-3d](/zh/plugins/3d) 插件渲染一个简单的立方体。更多用法可以参考[插件系统](/zh/plugins/intro)。

其中会涉及以下 API：

-   使用 [registerPlugin](/zh/api/renderer#registerplugin) 为渲染器注册插件
-   使用 [getCamera](/zh/api/canvas#getcamera-camera) 获取画布相机
-   使用 [setPosition](/zh/api/camera#setpositionx-number--vec3-y-number-z-number) 设置相机位置

最终示例：

-   [官网示例](/zh/examples/3d#cube)
-   [CodeSandbox 示例](https://codesandbox.io/s/jiao-cheng-shi-yong-3d-cha-jian-hzfdo?file=/index.js)

## 使用 WebGL 渲染器

我们使用 `g-webgl` 渲染器，并为其注册：

-   [g-plugin-3d](/zh/plugins/3d) 提供 3D 渲染能力
-   [g-plugin-control](/zh/plugins/control) 提供交互能力

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import { Plugin as Plugin3D } from '@antv/g-plugin-3d';
import { Plugin as PluginControl } from '@antv/g-plugin-control';

// 创建 WebGL 渲染器
const webglRenderer = new Renderer();

// 注册 3D 插件
webglRenderer.registerPlugin(new Plugin3D());
// 注册 Control 插件
webglRenderer.registerPlugin(new PluginControl());

// 创建画布
const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: webglRenderer,
});
```

## 创建一个立方体

我们创建一个 `200 * 200 * 200` 的立方体，并通过 `map` 给它贴个图：

```js
import {
    MeshBasicMaterial,
    CubeGeometry,
    Mesh,
    Plugin as Plugin3D,
} from '@antv/g-plugin-3d';

const cubeGeometry = new CubeGeometry();
const basicMaterial = new MeshBasicMaterial({
    map: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_aqoS73Se3sAAAAAAAAAAAAAARQnAQ',
});

const cube = new Mesh({
    style: {
        fill: '#1890FF',
        opacity: 1,
        width: 200,
        height: 200,
        depth: 200,
        geometry: cubeGeometry,
        material: basicMaterial,
    },
});

canvas.appendChild(cube);
```

然后使用 [setPosition](/zh/api/basic/display-object#平移) 移动它到画布中央：

```js
cube.setPosition(300, 250, 0);
```

## 调整相机视角

现在让我们将相机位置稍稍调整一下，来到立方体的斜上方观察。

-   使用 [getCamera](/zh/api/canvas#getcamera-camera) 获取画布相机
-   使用 [setPosition](/zh/api/camera#setpositionx-number--vec3-y-number-z-number) 设置相机位置

```js
const camera = canvas.getCamera();
camera.setPosition(300, 0, 500);
```

## 旋转起来！

让立方体旋转和其他基础图形一样，使用 [rotate](/zh/api/basic/display-object#旋转) 即可：

```js
canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
    cube.rotate(0, 1, 0); // 绕 Y 轴旋转 1 度
});
```
