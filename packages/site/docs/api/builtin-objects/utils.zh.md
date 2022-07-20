---
title: 工具方法
order: 6
---

我们提供了一系列工具方法，供核心以及插件使用，例如：

```js
import { isUndefined } from '@antv/g';
```

# 类型判断

以下方法大部分来自：https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore 对入参进行类型判断。

## isUndefined

判断是否为 `undefined`

## isNil

判断是否为 `undefined` 或者 `null`

## isNumber

判断是否为 `number`

## isFunction

判断是否为 `Function`

## isBoolean

判断是否为 `boolean`

## isObject

判断是否为 `object`。仅作简单判断，并没有 lodash 中那么复杂：

```js
function isObject(value: any): value is object {
  return Object.prototype.toString.call(value) === '[object Object]';
}
```

# 断言

不满足断言条件时抛出错误，提前中止程序执行。

## DCHECK

`false` 时中止。

```js
DCHECK(true);
```

## DCHECK_EQ

两者不等时中止。

```js
DCHECK_EQ(1, 1);
```

## DCHECK_NE

两者相等时中止。

```js
DCHECK_NE(1, 2);
```

# 矩阵计算

在绝大部分情况下，我们都可以使用图形自带的变换能力，内部通过 [gl-matrix](https://github.com/toji/gl-matrix) 实现。

## decompose

分解 3x3 变换矩阵，得到平移、缩放和旋转角度。

来自：https://www.w3.org/TR/css-transforms-1/#decomposing-a-2d-matrix

```js
const [tx, ty, scalingX, scalingY, angle] = decompose(mat3);
```

## getEuler

从 `quat` 或者 `mat4` 中获取欧拉角。方法签名如下：

```js
getEuler(out: vec3, quat: quat | mat4): vec3
```

来自：https://github.com/toji/gl-matrix/issues/329

# Path 计算

大部分涉及 path 的计算都依赖于 `@antv/util`。

## convertToPath

[Morph 形变动画](/zh/docs/api/animation#形变动画)是通过对 [Path](/zh/docs/api/basic/path) 的 [path/d](/zh/docs/api/basic/path#d) 属性进行插值实现的。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*qCHaTJUg_aEAAAAAAAAAAAAAARQnAQ">

方法签名如下：

```js
convertToPath(
    object: Circle | Ellipse | Rect | Line | Polyline | Polygon | Path,
    applyLocalTransformation = true
): string;
```

该方法支持以下基础图形，不支持 [Group](/zh/docs/api/basic/group) 或者其他自定义图形：

-   [Circle](/zh/docs/api/basic/circle)
-   [Ellipse](/zh/docs/api/basic/ellipse)
-   [Rect](/zh/docs/api/basic/rect)
-   [Line](/zh/docs/api/basic/line)
-   [Polyline](/zh/docs/api/basic/polyline)
-   [Polygon](/zh/docs/api/basic/polygon)
-   [Path](/zh/docs/api/basic/path)

转换结果为字符串形式的三阶贝塞尔曲线，利用它易于分割的特性，将变换前后的路径规范到相同数目的分段，最后对各个分段中的控制点进行插值实现动画效果。

在转换过程中会考虑输入图形在局部坐标系下的变换（使用 [transform](/zh/docs/api/basic/display-object#transform) 进行的声明式变换或者[命令式的变换方法](/zh/docs/api/basic/display-object#变换操作)），因此生成的路径定义已经包含了变换信息，可以直接基于该路径定义创建 [Path](/zh/docs/api/basic/path)。[示例](/zh/examples/animation#convert-to-path)：

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

在某些情况下不需要考虑局部坐标系下的变换，可以传入第二个参数为 `false`。
