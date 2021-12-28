---
title: 几何
order: 2
---

再复杂的模型都可以用“三角面”来描述，区别只在于数量多少。因此在 3D 世界中我们用这种描述能力更强的方式定义几何形状，它们可以是我们熟悉的 Circle、Rect，也可以是“犹他茶壶”。

我们内置了一些常用的几何，例如 Cube、Sphere 等，它们在运行时程序化生成。

可以随时启用材质的 [wireframe](/zh/docs/api/3d/material#wireframe) 属性查看几何中包含的三角面：

```js
material.wireframe = true;
```

在该[示例](/zh/examples/3d#sphere)中效果如下，可以看出一个 Sphere 球体是由不同经纬度上的众多三角面组成：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*bsj2S4upLBgAAAAAAAAAAAAAARQnAQ" height='200'/>

# 内置几何

几何只是定义一类“图形”，场景中的 1k 个图形都是 Cube，但它们可以拥有不同的长、宽、高。因此在使用时应该谨慎创建几何，如果场景中完全由一种几何组成，那就只应该创建一个。

当我们想修改几何信息时，例如改变一个几何形状为 CubeGeometry 的 Mesh 时，应该在 Mesh 而非几何上操作：

```js
import { MeshBasicMaterial, CubeGeometry, Mesh, Plugin as Plugin3D } from '@antv/g-plugin-3d';

// 创建几何
const cubeGeometry = new CubeGeometry();

// 创建 Mesh
const cube = new Mesh({
    style: {
        fill: '#1890FF',
        opacity: 1,
        width: 200, // 来自 CubeGeometry 的定义
        height: 200, // 来自 CubeGeometry 的定义
        depth: 200, // 来自 CubeGeometry 的定义
        geometry: cubeGeometry,
        material: basicMaterial,
    },
});

// 修改这个形状为 Cube 的 Mesh 宽度
// 正确用法
cube.style.width = 300;

// 错误用法
cube.style.geometry.width = 300;
```

## CubeGeometry

立方体，[示例](/zh/examples/3d#cube)

### width

宽度，必填。

### height

高度，必填。

### depth

深度，必填。

### widthSegments

影响程序化生成，默认值为 1

### heightSegments

影响程序化生成，默认值为 1

### depthSegments

影响程序化生成，默认值为 1

## SphereGeometry

球体，[示例](/zh/examples/3d#sphere)

### radius

球半径，必填，默认值为 0.5

### latitudeBands

默认值为 16

### longitudeBands

默认值为 16

## PlaneGeometry

平面，默认躺在 XZ 平面上，[示例](/zh/examples/3d#plane)

### width

必填，宽度

### depth

必填，深度

### widthSegments

选填，默认值为 5

### depthSegments

选填，默认值为 5

## TorusGeometry

[示例](/zh/examples/3d#torus)

# 通用方法

## applyMat4

对程序化生成的几何应用变换矩阵。由于 G 的坐标系 Y 轴正向向下，因此在生成后需要进行 Y 轴翻转。该方法对位置、法线应用变换。

参数列表：

-   matrix mat4 变换矩阵

```js
geometry.applyMat4(mat4.fromScaling(mat4.create(), vec3.fromValues(1, -1, 1)));
```
