# @antv/g-webgpu-compiler

应当仅在开发模式下使用此包，生产环境应当直接使用编译后的产物。

实现一个简单的编译器，将类 TS 语法转译成适合不同目标平台的运行时代码，包括：

-   WebGL 1.0 - GLSL 1.0
-   WebGPU
    -   Chrome/Edge - GLSL 4.5 & WGSL
    -   Safari - WSL
-   CPU - JS 便于调试

## 使用方法

生成适应某一个平台的代码：

```typescript
import { Compiler, Target } from '@antv/g-webgpu-compiler';

const compiler = new Compiler();
compiler.setTarget(Target.WGSL);
// Parsing TS -> ESTree
const esTree = compiler.parse('your g code');
// Transformation ESTree -> ShaderTree
const shaderTree = compiler.transform(esTree);
// Code Generation ShaderTree -> target code(WGSL、GLSL100、GLSL450、JS)
const generatedCode = compiler.generateCode(shaderTree);
// context includes defined, uniform variables
const context = compiler.getContext();
```

生成适合全平台运行的代码，可以直接传给 g-webgpu 使用

```typescript
import { Compiler, Target } from '@antv/g-webgpu-compiler';
import { World } from '@antv/g-webgpu';

const compiler = new Compiler();
// 生成适合全平台运行的代码(JSON 字符串)
const precompiledBundle = compiler.compileBundle('your g code');
// 或者仅生成特定运行平台的代码(JSON 字符串)
const precompiledBundle = compiler.compileBundle('your g code', [Target.WGSL]);

const world = new World({
    engineOptions: {
        supportCompute: true,
    },
});

const compute = world.createComputePipeline({
    precompiledBundle,
    dispatch: [10, 1, 1],
    onCompleted: (result) => {
        // 计算完成后销毁相关 GPU 资源
        world.destroy();
    },
});

world.setBinding(compute, 'gData', data);
```

## 编译流程

TS -> ESTree(AST) -> ShaderTree(Transformation) -> Target Code(Code Generation)

其中 TS -> ESTree 是通过 Pegjs 完成的，我们的语法规则如下：

-   `import/export`
-   类/方法装饰器
-   类属性
-   类方法
-   额外数据类型，包括标量 `int` `float` 和向量 `vec2/3/4` 等

## 代码生成

### WebGL1

生成 GLSL 1.0 代码，使用纹理映射的方式完成计算，有很多 Compute Shader 特性无法使用。

### WebGPU

#### WGSL

从 Google Tint 发展而来：

-   [WGSL is terrible](https://github.com/gpuweb/gpuweb/issues/566)
-   https://medium.com/@dmnsgn/graphics-on-the-web-and-beyond-with-webgpu-13c4ba049039

#### GLSL 4.5

SPRI-V

#### WHLSL

Apple 原始的方案，被 WGSL 替代 https://webkit.org/blog/8482/web-high-level-shading-language/

DEMO: https://hello-webgpu-compute.glitch.me/hello-compute-safari.html

### WebGL2 Compute

https://www.khronos.org/registry/webgl/specs/latest/2.0-compute/ 目前仅能在 Windows/Linux 下的 Chrome Canary 运行。

### CPU

Shader 调试是很困难的，虽然我们也尝试使用类似 `console.log` 的 debug 方法帮助用户输出中间变量值，但受限于 WebGL 的实现，只能调用一次 debug，而且会中断 Shader 中后续语句的执行。

如果我们能生成 JS 代码则没有这个限制。

inspired by [stardustjs](https://github.com/stardustjs/stardust/tree/dev/packages/stardust-core/src/compiler) & [shader-ast](https://github.com/thi-ng/umbrella/tree/develop/packages/shader-ast)
