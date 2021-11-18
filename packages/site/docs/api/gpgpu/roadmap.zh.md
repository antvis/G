---
title: Roadmap
order: 10
---

# 提升 Shader 开发体验

虽然我们的 Shader 代码使用了 TypeScript 语法，但在字符串中写计算逻辑总是不太好的体验。未来我们希望提供 G 语言的 VS Code 扩展，提供高亮、诊断、自动补全等语言特性，提升开发者的编程体验。

这样开发者可以创建 `.g` 文件，使用类似 webpack 的 `raw-loader` 以字符串形式加载：

```typescript
import myGCode from './my-code.g';

const compute = world.createComputePipeline({
    shader: myGCode,
    dispatch: [1, 1, 1], // 线程网格
    onCompleted: (result) => {},
});
```

# 支持 WHLSL

虽然 WebGPU API 已经得到各大浏览器厂商的积极支持，但在 Shader 语言的选择上还是存在分歧。未来我们会选择支持编译后输出 [WHLSL](https://webkit.org/blog/8482/web-high-level-shading-language/) ，这样在 Safari Preview 中也能运行。

当然对于开发者来说，仍是一套代码(TypeScript)，多处运行。

# 支持 debug

Shader 程序显然没法直接在浏览器中用开发者工具进行 debug。但我们或许可以尝试使用类似 `console.log` 的方式，提前输出一些关键变量：

```typescript
@main
compute() {
  //...
  const a = b + c;
  debug(a);
  //...
}
```

例如 GPU.js 提供了一些简单的思路：https://github.com/gpujs/gpu.js#debugging

# 提供更多数据结构

从 [Fruchterman](/zh/docs/tutorial/gpgpu/fruchterman) 的例子中也能看出，设计一个对于 GPU 内存友好的数据结构对于前端开发者来说并不是一件容易的事。另外，在实现可并行算法时，很多数据结构也很难实现。例如 G6 的力导布局算法中就使用了 quadtree。

# 与渲染结合

目前我们的示例都是纯计算任务，但未来我们也希望提供渲染能力。这样能在 instance-based visualizations 场景下满足不同布局的灵活切换。例如微软的 Sanddance：

![](https://user-images.githubusercontent.com/3608471/70215541-a92c7980-1778-11ea-9c69-17fe29f7b8cb.gif)

Stardust.js 在这方面有很多优秀的实践。
