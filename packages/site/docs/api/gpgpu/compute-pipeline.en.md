---
title: Compiler & Kernel API
order: 2
---

Compiler 帮助我们将类 TS 语言编译成各底层图形 API 接受的 Shader 代码。Kernel，我们可以向其传入输入数据，执行后获取计算结果。

### 前置条件

-   ⚠️ WebGL 中需要浏览器支持 `OES_texture_float` [扩展](https://developer.mozilla.org/en-US/docs/Web/API/OES_texture_float)。可以在 https://webglreport.com/ 中查看本机是否支持该扩展
-   ⚠️ WebGPU 需要使用 Chrome/Edge Canary 运行，Safari Preview 由于使用 [WHLSL](https://webkit.org/blog/8482/web-high-level-shading-language/) 暂不支持，待后续完善 compiler 后支持

如果希望体验 WebGPU 的运行效果，或者使用一些 WebGPU 特有的特性（共享内存与同步），请先下载 Chrome/Edge Canary，开启 `chrome://flags/#enable-unsafe-webgpu`。

### 使用 Compiler

首先创建一个编译器，将类 TS 代码编译成 WebGL/WebGPU Shader 代码，后续创建 Kernel 时传入：

```typescript
import { Compiler } from '@antv/g-webgpu-compiler';

// 创建 Compiler
const compiler = new Compiler();
// 编译
const precompiledBundle = compiler.compileBundle(gCode);
// 后续创建 Kernel 时直接传入
// const kernel = world.createKernel(precompiledBundle);
```

通常我们开发调试完 Kernel 代码后，在运行时就不需要重复编译了，此时我们可以预先输出 JSON 编译内容到控制台，后续直接使用。这样在运行时就不需要引入 Compiler 模块了，自然也就省去了额外的编译时间。

```typescript
console.log(precompiledBundle.toString()); // '{"shaders":{"WebGPU":"\\...'
// 后续创建 Kernel 时直接传入
// const kernel = world.createKernel('{"shaders":{"WebGPU":"\\...');
```

### 开启 GPGPU 支持

和 `RenderPipeline` 一样，我们需要先创建 `World` 并开启 GPGPU 支持：

```typescript
import { World } from '@antv/g-webgpu';

const world = World.create({
    engineOptions: {
        supportCompute: true,
    },
});
const isFloatSupported = (await world.getEngine()).isFloatSupported();
```

我们在 WebGL 的实现中使用了 OES_texture_float 扩展进行浮点数纹理的读写。但是该扩展存在一定兼容性问题，尤其是在移动端 和 Safari 中：http://webglstats.com/webgl/extension/OES_texture_float

因此可以通过 `isFloatSupported` 查询当前浏览器的支持情况，如果发现不支持可以及时中断后续 Kernel 的创建，切换成 CPU 版本的算法。

未来我们会尝试在不支持该扩展的浏览器中做兼容，详见：https://github.com/antvis/GWebGPUEngine/issues/26。

### 创建 Kernel

通过 `world.createKernel()` 可以创建一个 Kernel，使用编译后的计算程序：

```typescript
const kernel = world
    .createKernel(precompiledBundle) // 编译后的计算程序
    .setDispatch([1, 1, 1]);
```

我们可以通过链式调用完成一系列参数的设置：

-   `setDispatch`: `[number, number, number]` **required** 线程网格尺寸。

### 绑定数据

Kernel 创建完毕后，我们可以传入数据：

```typescript
kernel.setBinding('param1', p1).setBinding('param2', p1);
// or
kernel.setBinding({
    param1: p1,
    param2: p2,
});
```

`setBinding(BindingName, Data)` 参数说明如下：

-   `BindingName`: 绑定数据名称，需要与 Shader 中全局作用域声明的运行时常量、变量保持一致
-   `Data`: `number|number[]|TypedArray|Kernel`: 绑定数据

无返回值。

### 执行 Kernel 并获取结果

调用 `execute()` 执行程序，然后通过 `getOutput()` 获取计算结果：

```typescript
await kernel.execute();
const output = await kernel.getOutput();
```

使用时有以下两点注意事项，在大多数情况下可以提高执行速度。

当我们想执行多次时，可以向 `execute()` 传入执行次数进行批处理，相比多次单独调用效率更高：

```typescript
await kernel.execute(8000); // 迭代 8000 次
// 相比如下方式效率更高
for (let i = 0; i < 8000; i++) {
    await kernel.execute();
}
```

每次调用 `getOutput()` 会完成 GPU 的内存读取，有一定性能开销。尽可能减少调用次数或者使用多个 Kernel 的串联方式。

### 串联两个 Kernel

有时候我们需要串联两个 Kernel 得到最终的计算结果，将前一个的计算结果作为第二个 Kernel 的输入。

例如我们使用两个 Kernel 完成 3 个向量的求和，当然可以这样做，调用两次 `getOutput()`：

```typescript
const kernel1 = world
    .createKernel(precompiledBundle)
    .setDispatch([1, 1, 1])
    .setBinding('vectorA', [1, 2, 3, 4, 5, 6, 7, 8])
    .setBinding('vectorB', [1, 2, 3, 4, 5, 6, 7, 8]);
await kernel1.execute();
// 可避免获取中间结果
const kernel1Output = await kernel1.getOutput();

const kernel2 = world
    .createKernel(precompiledBundle)
    .setDispatch([1, 1, 1])
    .setBinding('vectorA', [1, 2, 3, 4, 5, 6, 7, 8])
    .setBinding('vectorB', kernel1Output);
await kernel2.execute();
const kernel2Output = await kernel2.getOutput();
```

但我们并不需要第一个 Kernel 的中间计算结果，可以避免调用 `getOutput()`，直接将第一个 Kernel 作为绑定数据传入：

```typescript
const kernel2 = world
    .createKernel(precompiledBundle)
    .setDispatch([1, 1, 1])
    .setBinding('vectorA', [1, 2, 3, 4, 5, 6, 7, 8])
    .setBinding('vectorB', kernel1); // 直接传入 kernel1
```
