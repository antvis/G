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

判断是否为 `number`

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
