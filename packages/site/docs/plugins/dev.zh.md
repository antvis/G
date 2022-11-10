---
title: 插件结构
order: -99
---

## 命名规范

在命名方式上，所有的插件名都以 `g-plugin-` 开头。下面我们通过对于 [g-plugin-canvas-renderer](/plugins/canvas-renderer) 这个使用 Canvas2D 渲染的插件分析，深入了解一下插件的结构，它也是 [g-canvas](/api/renderer/canvas) 的核心插件之一。

## 基本结构

https://github.com/antvis/G/tree/next/packages/g-plugin-canvas-renderer

### package.json

从 `package.json` 的 `peerDependencies` 可以看出，一个插件的最核心依赖就是 `@antv/g`，即 G 的核心层，包含了依赖注入、画布、基础图形、事件等核心对象。

```json
"peerDependencies": {
    "@antv/g-lite": "^1.0.0"
},
```

### index.js

打开插件的入口文件，我们可以发现一个继承了 `AbstractRendererPlugin` 的插件需要实现两个方法：

-   `init` 在容器中加载模块
-   `destroy` 在容器中卸载模块

```js
import { AbstractRendererPlugin, Module } from '@antv/g';
import { DOMInteractionPlugin } from './DOMInteractionPlugin';

// 定义该插件的模块
const containerModule = Module((register) => {
    register(ImagePool);
    // ...省略注册其他依赖
    register(CanvasRendererPlugin);
    register(LoadImagePlugin);
});

export class Plugin extends AbstractRendererPlugin {
    name = 'canvas-renderer';
    init(): void {
        // 加载模块
        this.container.load(containerModule, true);
    }
    destroy(): void {
        // 卸载模块
        this.container.unload(containerModule);
    }
}
```

这里我们注册了一个 `CanvasRendererPlugin`，让我们继续深入看看。

### CanvasRendererPlugin

```js
export class CanvasRendererPlugin implements RenderingPlugin {
    static tag = 'CanvasRenderer';
}
```

接下来就可以通过渲染服务提供的一系列 `hooks` 选择适当的执行时机，例如在渲染服务初始化时处理下 DPR：

```js
apply(context: RenderingPluginContext) {
    const { config, camera, renderingService, renderingContext, rBushRoot, pathGeneratorFactory } =
      context;

    // 当渲染服务初始化时...
    renderingService.hooks.init.tap(CanvasRendererPlugin.tag, () => {
        // 使用容器注入的上下文服务
        const context = this.contextService.getContext();
        const dpr = this.contextService.getDPR();
        context && context.scale(dpr, dpr);

        // 使用容器注入的渲染上下文服务
        this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
        this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
        this.renderingContext.root.addEventListener(ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
    });
}
```

所有插件都遵循以上的结构实现。

## 插件之间的关系

插件之间也会存在依赖关系，例如 `g-plugin-gpgpu` 就依赖 `g-plugin-device-renderer`。在独立构建 UMD 时需要排除掉依赖，详见[构建说明]()。
