---
title: Shader 语法介绍
order: 1
---

很多可并行算法适合放在 GPU 中执行，但对于前端开发者来说，迁移这些算法成本很高，需要学习 WebGL/WebGPU API 以及 Shader 语法。并且 GLSL 语言本身存在多个版本（WebGL 1 使用 GLSL 1.0，WebGPU 使用 GLSL 4.5），在兼容性场景下还得考虑语法层面的差异。

为了降低前端开发者的学习成本，我们决定使用一种类 TypeScript 语言，暂定名为 G 语言，通过 Pegjs 生成 Parser，将源码转成 AST (ESTree) 后根据不同目标（WebGL/WebGPU）输出不同版本的 GLSL 代码，实现“一套代码多处运行”的效果。

首先我们简单介绍下为何选择一种类 TypeScript 语言作为我们的 DSL。

# 为何选择 TypeScript

不管是 GLSL 还是 WSL，Shader 语言都是一种类 C 的强类型语言。例如：

```glsl
float a = 1.0;
int b = 1;
```

因此选择 TypeScript 作为 DSL 就显得很自然了，更精准的说，我们选择了 TypeScript 的语法子集，再扩充基础数据类型形成了我们的 G 语言。

下图展示了我们与 GPU.js、Stardust.js 这些同样选择 DSL 编译方案的差别。简单概括下就是我们选择了更轻量的 Parser，语法对于前端开发者更加友好，生成代码优先 WebGPU 同时兼容 WebGL：

![image](https://user-images.githubusercontent.com/3608471/83704581-04b2c380-a645-11ea-821e-5556ddeda396.png)

对于前端开发者来说，只需要了解 G 语言的一些限制以及基础数据类型就能轻松上手编写 Shader 代码了。

# 语法限制

既然 G 语言是 TypeScript 的子集，对于前端开发者来说很多熟悉的语法与特性在 Shader 中都不能使用：

-   无法使用 JS 中的原生类型例如 `String` `Date` `RegExp` 对象等等
-   无法使用 JS 中的 `Math` 方法，请使用对应的 GLSL 原生函数（后续会考虑提供转译，例如将 `Math.sin()` 转译成 `sin()`），详见[原生函数]()
-   无法使用解构
-   无法使用箭头函数，后续可能会支持
-   不支持在函数内声明另一个函数
-   循环无法使用 `for in`。循环长度必须为定长
-   单文件，不支持类似 ESModule 引用依赖，`import`语法仅用于引用工具方法。未来可能会提供简单的 Shader 模块化功能

# 基础数据类型

在 TypeScript 中，常见的和数字类型包括 `number` `number[]` 等。但是在 Shader 语言中 `number` 会细分成标量、向量、矩阵等等。

标量：

-   float 浮点数，例如 `1.0`
-   int 整数，例如 `1`
-   bool 布尔值，例如 `true/false`

向量：

-   vec2 长度为 2 的向量，其中每个元素都是 float，例如 `[1.0, 1.0]`
-   vec3
-   vec4
-   ivec2 其中每个元素都是 int，例如 `[1, 1]`
-   ivec3
-   ivec4
-   bvec2 其中每个元素都是 bool，例如 `[true, true]`
-   bvec3
-   bvec4

矩阵：

-   mat3 3\*3 的矩阵，其中每个元素都是 float
-   mat4 4\*4 的矩阵，其中每个元素都是 float

# 语法

## 声明程序

通过类声明语法定义我们的计算程序，只能声明一个类：

```typescript
class MyProgram {}
```

## 声明函数

需要注意两点：

-   支持全局作用域声明和类方法定义两种方式，不可以在一个函数内声明另一个函数
-   一定要声明返回值和参数类型

```typescript
function sum(a: float, b: float): float {
    return a + b;
}

class MyProgram {
    myFunc(p1: float, p2: float): float {
        //...
    }
}
// ->
// float sum(float a, float b) { return a + b; }
// float myFunc(float p1, float p2) {...}
```

## main 函数

在 GLSL 中只能有一个 main 函数作为程序入口，为了和其他自定义函数区分开，我们使用 `main` 类方法装饰器描述。`main` 函数不需要声明参数和返回值：

```typescript
class MyProgram {
    @main
    compute() {
        //...
    }
}
// -> void main() {...}
```

有了计算函数，我们还需要计算数据，具体来说需要定义输入和输出变量。

## 输入变量

我们的输入通常在 CPU 侧计算完成后传值，在渲染引擎中常见的相机矩阵就是如此。当然我们在 Shader 中也不需要修改这些变量值。在声明时有以下注意点：

-   作为类属性声明，配合 `@in` 属性装饰器使用
-   需要声明类型
-   不可以在此直接定义值，运行时从 CPU 侧传入，如何传值详见[计算管线 API](/zh/docs/api/compute-pipeline)

```typescript
class MyProgram {
  @in
  param1: float;

  @in
  param2: vec4;

  @in
  param3: float[];
}

// -> WebGL 1 GLSL 1.0
// uniform float param1;
// uniform vec4 param2;
// uniform sampler2D param3;

// -> WebGPU GLSL 4.5
// layout(std140, set = 0, binding = 1) uniform Params {
//   float param1;
//   vec4 param2;
// } params;
// layout(std140, set = 0, binding = 2) buffer readonly Params {
//   float param3[];
// } params;
```

⚠️ 考虑到 `std140` 内存布局，尽量使用 `float` `vec2` 和 `vec4` 类型，避免使用 `vec3`。

## 输出变量

考虑到兼容 WebGL，我们目前仅支持输出一份数据。通过 `@out` 类装饰器声明：

```typescript
class MyProgram {
  @in @out
  data: float[];

  @main
  compute() {
    this.data[globalInvocationID.x] = 1;
  }
}
```

## 常量

通过在全局作用域使用全大写变量名，就可以声明一个常量，后续在自定义函数和 main 函数中都可以引用：

```typescript
const CONST = 100;
// -> #define CONST 100
```

但是有一类特殊的常量，只能在运行时确定，需要在 CPU 侧计算完成后传入 Shader 中。因此无法像上面一样直接写在 Shader 里，但又没法以 uniform 变量形式传入。 例如 GLSL 1.0 中的循环变量只能和常量比较：

```typescript
class MyProgram {
  @in
  loopLength: int;
// -> uniform int loopLength;
  @main
  compute() {
    for (let i = 0; i < this.loopLength; i++)
// 报错:
// Loop index cannot be compared with non-constant expression
```

面对这种情况，我们可以写成全大写，然后像输入变量一样在运行时传值：

```typescript
const LOOP_LENGTH;
// -> #define LOOP_LENGTH 100

for (let i = 0; i < LOOP_LENGTH; i++)
```

## swizzling

在 GLSL 中有一种“特殊”的向量操作，通过 `rgba/xyzw` 可以代替下标访问向量中的元素：

```typescript
const a: vec4 = [1, 2, 3, 4];

// a.r/a.x 等价于 a[0]
// a.g/a.y 等价于 a[1]
// a.b/a.z 等价于 a[2]
// a.a/a.w 等价于 a[3]

const b = a.rrr;
// -> vec3 b = vec3(1, 1, 1);
```

## 内置函数

来自 [GLSLangSpec.4.30](https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.30.pdf) 第八节。

首先需要介绍 component-wise 的概念。大部分内置的三角函数、数学函数都是针对标量（float、int、uint）进行，但也可以传入向量，此时函数会作用于向量的每一个分量，例如：

```glsl
max(1.0, 2.0) // 返回 float 2.0
max(int(1.0), int(2.0)) // 返回 int 1
max(uint(1.0), uint(2.0)) // 返回 uint 2
max(vec2(1.0, 2.0), vec2(2.0, 1.0)) // 返回 vec2(2.0, 2.0)
```

由于考虑到 WebGL 1 的兼容性，部分不支持的函数就不列出来了。兼容性支持可以查看对应函数说明下方的支持表。

三角函数，全部都是 component-wise：

-   `radians()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/radians.xhtml
-   `degrees()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/degrees.xhtml
-   `sin()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/sin.xhtml
-   `cos()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/cos.xhtml
-   `tan()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/tan.xhtml
-   `asin()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/asin.xhtml
-   `acos()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/acos.xhtml
-   `atan()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/atan.xhtml

指数函数，全部都是 component-wise：

-   `pow()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/pow.xhtml
-   `exp()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/exp.xhtml
-   `log()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/log.xhtml
-   `exp2()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/exp2.xhtml
-   `log2()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/log2.xhtml
-   `sqrt()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/sqrt.xhtml

常用数学函数，全部都是 component-wise：

-   `abs()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/abs.xhtml
-   `sign()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/sign.xhtml
-   `floor()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/floor.xhtml
-   `ceil()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/ceil.xhtml
-   `min()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/min.xhtml
-   `max()` https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/max.xhtml

## 线程组声明

通过类装饰器 `numthreads` 可以声明每个线程组中包含多少线程，详见[线程、共享内存与同步](/zh/docs/api/workgroup)：

```typescript
@numthreads(10, 1, 1)
class MyProgram {}
```

## 线程组常量

所有线程执行相同的 Shader 程序，但需要处理不同的数据实现并行才有意义。因此在 Shader 中需要获取当前的线程、线程组 ID 以便映射不同的数据。我们提供了这些内置变量，可以通过 `import` 语法引入，在 `main` 函数中使用这些变量。

```typescript
import { globalInvocationID } from 'g-webgpu';

@numthreads(10, 1, 1)
class MyProgram {
  @in
  data: float[];

  @main
  compute() {
    const a = this.data[globalInvocationID.x];
  }
}
```

目前我们提供的线程组相关变量、常量包括：

| 变量名 | 类型 | 说明 |
| --- | --- | --- |
| numWorkGroups | ivec3 | dispatch 的线程工作组数目 |
| workGroupSize | ivec3 | Shader 内通过 `numthreads` 声明的每一个线程工作组包含的线程数 |
| workGroupID | ivec3 | 当前线程工作组的索引。取值范围为 `(0, 0, 0)` 到 `(numWorkGroups.x - 1, numWorkGroups.y - 1, numWorkGroups.z - 1)` 之间 |
| localInvocationID | ivec3 | 当前线程在自己线程组中的索引。取值范围为 `(0, 0, 0) 到 (workGroupSize.x - 1, * workGroupSize.y - 1, workGroupSize.z - 1)` 之间 |
| globalInvocationID | ivec3 | 当前线程在全局线程组中的索引。计算方法为 `workGroupID * workGroupSize + localInvocationID` |
| localInvocationIndex | int | 当前线程在自己线程组中的一维索引，计算方法为 `localInvocationID.z * workGroupSize.x * workGroupSize.y + localInvocationID.y * workGroupSize.x + localInvocationID.x` |

以上变量的说明详见[线程、共享内存与同步](/zh/docs/api/workgroup)。

## 共享内存与同步

⚠️ 只在 WebGPU 下环境有效

在某些算法（例如 reduce）线程组内的线程需要共享内存，显然更新后也需要同步。详见[线程、共享内存与同步](/zh/docs/api/workgroup)。

-   通过 `@shared(length)` 属性修饰器可以声明一个线程组内共享内存，读写方式和其他输入/输出变量一致
-   通过 `barrier()` 可以触发内存同步

```typescript
import { globalInvocationID } from 'g-webgpu';

@numthreads(10, 1, 1)
class MyProgram {
  @in
  globalData: float[];

  @shared(1024)
  sharedData: float[];

  @main
  compute() {
    const tid = localInvocationID.x;
    const i = workGroupID.x * workGroupSize.x * 2 + localInvocationID.x;

    this.sharedData[tid] = this.globalData[i] + this.globalData[i + workGroupSize.x];
    barrier();
  }
}
```
