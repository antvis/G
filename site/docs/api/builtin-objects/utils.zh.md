---
title: 工具方法
order: 6
---

我们提供了一系列工具方法，供核心以及插件使用，例如：

```js
import { convertToPath } from '@antv/g';
```

## 数学计算

主要涉及不同角度单位之间的换算。

### deg2rad

角度转换到弧度。

```js
deg2rad(deg: number): number;
```

### rad2deg

弧度转换到角度。

```js
rad2deg(rad: number): number;
```

### deg2turn

角度转换到圈数。

```js
deg2turn(deg: number): number;
```

### turn2deg

圈数转换到角度。

```js
turn2deg(turn: number): number;
```

## 矩阵计算

在绝大部分情况下，我们都可以使用图形自带的变换能力，内部通过 [gl-matrix](https://github.com/toji/gl-matrix) 实现。

### decompose

分解 3x3 变换矩阵，得到平移、缩放和旋转角度。

来自：https://www.w3.org/TR/css-transforms-1/#decomposing-a-2d-matrix

```js
const [tx, ty, scalingX, scalingY, angle] = decompose(mat3);
```

### getEuler

从 `quat` 或者 `mat4` 中获取欧拉角。方法签名如下：

```js
getEuler(out: vec3, quat: quat | mat4): vec3
```

来自：https://github.com/toji/gl-matrix/issues/329

### createVec3

创建 `vec3`，接受多种类型参数。方法签名如下：

```js
createVec3(x: number | vec2 | vec3 | vec4, y: number = 0, z: number = 0): vec3;
```

## Path 计算

大部分涉及 path 的计算都依赖于 `@antv/util`。

### convertToPath

[Morph 形变动画](/zh/api/animation/waapi#形变动画)是通过对 [Path](/zh/api/basic/path) 的 [path/d](/zh/api/basic/path#d) 属性进行插值实现的。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*qCHaTJUg_aEAAAAAAAAAAAAAARQnAQ">

方法签名如下：

```js
convertToPath(
    object: Circle | Ellipse | Rect | Line | Polyline | Polygon | Path,
    transform = object.getLocalTransform()
): string;
```

该方法支持以下基础图形，不支持 [Group](/zh/api/basic/group) 或者其他自定义图形：

-   [Circle](/zh/api/basic/circle)
-   [Ellipse](/zh/api/basic/ellipse)
-   [Rect](/zh/api/basic/rect)
-   [Line](/zh/api/basic/line)
-   [Polyline](/zh/api/basic/polyline)
-   [Polygon](/zh/api/basic/polygon)
-   [Path](/zh/api/basic/path)

转换结果为字符串形式的三阶贝塞尔曲线，利用它易于分割的特性，将变换前后的路径规范到相同数目的分段，最后对各个分段中的控制点进行插值实现动画效果。

在转换过程中会考虑输入图形在局部坐标系下的变换（使用 [transform](/zh/api/basic/display-object#transform) 进行的声明式变换或者[命令式的变换方法](/zh/api/basic/display-object#变换操作)），因此生成的路径定义已经包含了变换信息，可以直接基于该路径定义创建 [Path](/zh/api/basic/path)。[示例](/zh/examples/animation#convert-to-path)：

```js
const circle = new Circle({
    style: {
        cx: 100,
        cy: 100,
        r: 100,
        transform: 'translate(20px, 20px)', // 声明式变换
    },
});
// 对源图形应用变换，命令式
circle.translate(100, 0);
circle.scale(0.5);

// 转换得到路径，已经包含了全部变换信息
const pathStr = convertToPath(circle);

// 创建新图形
const circlePath = new Path({
    style: {
        d: pathStr,
        fill: 'red',
    },
});

// 不需要再进行以下变换
// circlePath.translate(100, 0);
```

在某些情况下不需要考虑局部坐标系下的变换，可以传入第二个参数为 `mat4.identity()`。
