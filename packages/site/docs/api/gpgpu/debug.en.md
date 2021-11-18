---
title: Debug Shader
order: 4
---

对于习惯了浏览器提供 devTools 的前端开发者来说，Shader 的 debug 是非常困难的，显然我们没法使用调试工具加断点。因此我们只能借助渲染 API 的某些特性，将开发者关心的变量值打印输出，类似 `console.log`。

首先通过 `import` 引入 `debug` 方法：

```typescript
import { debug } from 'g-webgpu';
```

然后在函数中就可以输出变量值了：

```typescript
sum(a: float, b: float): float {
    debug(a);
    return a + b;
}
```

最后在 `onCompleted` 回调函数中可以获取该变量的结果。

看起来使用很简单，但是受限于 WebGL 的实现，存在以下限制。

# 使用限制

## 仅调用一次

多次调用 `debug` 仅最后一条生效，例如：

```typescript
sum(a: float, b: float): float {
    debug(a);
    debug(b); // 最后输出的是 b 的值
    return a + b;
}
```

## 仅支持输出一个变量

只支持输出一个变量，其中该变量类型包括：

-   标量 `float` `int` `bool`
-   向量 `vec2` `vec3` `vec4` `ivec2` `ivec3` `ivec4` `bvec2` `bvec3` `bvec4`

## 单次迭代

对于需要进行多次迭代的算法，建议将 `maxIteration` 设置成 1 之后再进行调试。否则输出的调试变量结果可能会影响后续迭代的运算。

## padding

对于输出变量类型为向量数组的情况，如果我们输出的变量类型为标量，输出结果中的多余部分会用 0 填充。

例如我们的输出为 `vec4` 数组，尝试打印每一个线程的全局线程索引，该变量为 `int`：

```typescript
@in @out
u_Data: vec4[];

@main
compute() {
    const i = globalInvocationID.x;
    debug(i);
}
```

最终得到的结果为 `[0,0,0,0, 1,0,0,0, 2,0,0,0...]`
