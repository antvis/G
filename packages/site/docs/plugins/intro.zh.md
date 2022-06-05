---
title: 插件系统介绍
order: -100
redirect_from:
    - /zh/docs/plugins
---

# 插件集

-   渲染相关
    -   [g-plugin-canvas-renderer](/zh/docs/plugins/canvas-renderer) 基于 Canvas2D 渲染 2D 图形
    -   [g-plugin-canvaskit-renderer](/zh/docs/plugins/canvaskit-renderer) 基于 CanvasKit / Skia 渲染 2D 图形
    -   [g-plugin-svg-renderer](/zh/docs/plugins/svg-renderer) 基于 SVG 渲染 2D 图形
    -   [g-plugin-device-renderer](/zh/docs/plugins/device-renderer) 基于 WebGPU / WebGL 渲染 2D 图形
    -   [g-plugin-html-renderer](/zh/docs/plugins/html-renderer) 渲染 DOM 元素
    -   [g-plugin-3d](/zh/docs/plugins/3d) 基于 g-plugin-device-renderer 扩展 3D 能力
    -   [g-plugin-rough-canvas-renderer](/zh/docs/plugins/rough-canvas-renderer) 基于 rough.js 和 Canvas2D 渲染手绘风格图形
    -   [g-plugin-rough-svg-renderer](/zh/docs/plugins/rough-svg-renderer) 基于 rough.js 和 SVG 渲染手绘风格图形
-   拾取
    -   [g-plugin-canvas-picker](/zh/docs/plugins/canvas-picker) 基于 Canvas2D
    -   [g-plugin-svg-picker](/zh/docs/plugins/svg-picker) 基于 SVG
-   交互
    -   [g-plugin-dom-interaction](/zh/docs/plugins/dom-interaction) 基于 DOM API 绑定事件
    -   [g-plugin-dragndrop](/zh/docs/plugins/dragndrop) 基于 PointerEvents 实现拖放功能
    -   [g-plugin-control](/zh/docs/plugins/control) 为 3D 场景提供相机交互
-   物理引擎
    -   [g-plugin-box2d](/zh/docs/plugins/box2d) 基于 Box2D
    -   [g-plugin-matterjs](/zh/docs/plugins/matterjs) 基于 matter.js
    -   [g-plugin-physx](/zh/docs/plugins/physx) 基于 PhysX
-   布局引擎
    -   [g-plugin-yoga](/zh/docs/plugins/yoga) 基于 Yoga 提供 Flex 布局能力
-   GPGPU
    -   [g-plugin-gpgpu](/zh/docs/plugins/gpgpu) 基于 WebGPU 提供 GPGPU 能力
-   CSS 选择器
    -   [g-plugin-css-select](/zh/docs/plugins/css-select) 支持使用 CSS 选择器在场景图中检索

# 与渲染器的关系

`g-canvas/svg/webgl` 这些渲染器本质上是由一组插件组成，通过插件也可以扩展它们的能力：

```js
// 渲染器注册插件
renderer.registerPlugin(new Plugin());
```

在命名方式上，所有的插件名都以 `g-plugin-` 开头。下面我们通过对于 `g-plugin-canvas-renderer` 这个使用 Canvas2D 渲染的插件分析，深入了解一下插件的结构，它也是 `g-canvas` 的核心插件之一。

# 基本结构

## package.json

从 `package.json` 的 `peerDependencies` 可以看出，一个插件的最核心依赖有两个：

-   `@antv/g` G 的核心层，包含了画布、基础图形、事件等核心对象
-   `mana-syringe` 一个依赖注入库，我们用它定义模块，完成核心依赖的注入

```json
"peerDependencies": {
    "@antv/g": "^5.0.1",
    "mana-syringe": "^0.3.0"
},
```

## index.js

打开插件的入口文件，我们可以发现一个实现了 `RendererPlugin` 接口的插件只需要实现两个方法：

-   `init` 在容器中加载模块
-   `destroy` 在容器中卸载模块

```js
import { RendererPlugin } from '@antv/g';
import { Syringe, Module } from 'mana-syringe';
import { DOMInteractionPlugin } from './DOMInteractionPlugin';

// 定义该插件的模块
const containerModule = Module((register) => {
    register(ImagePool);
    // ...省略注册其他依赖
    register(CanvasRendererPlugin);
    register(LoadImagePlugin);
});

export class Plugin implements RendererPlugin {
    init(container: Syringe.Container): void {
        // 加载模块
        container.load(containerModule, true);
    }
    destroy(container: Syringe.Container): void {
        // 卸载模块
        // 注：mana-syringe 实现 unload 之后就不需要手动一个个移除依赖了
        container.remove(ImagePool);
        container.remove(RBushRoot);
        container.remove(DefaultRenderer);
    }
}
```

在模块中我们可以通过 `register` 向当前容器（每个画布拥有一个）或者全局容器（所有画布共享）中注册依赖。也可以向核心层定义的扩展点（马上就会看到）上挂载。

这里我们注册了一个 `CanvasRendererPlugin`，让我们继续深入看看。

## CanvasRendererPlugin

通过 `mana-syringe` 提供的 `inject` 可以获取我们关心的对象，例如创建画布时的原始配置、默认相机、上下文等服务，注入依赖由容器完成。

同时我们也在 `RenderingPluginContribution` 这个 G 核心层提供的扩展点上注册了自己，这样在核心层渲染服务运行时就会调用包含它在内的一组渲染服务插件。

```js
import { inject, singleton } from 'mana-syringe';

// 实现扩展点
@singleton({ contrib: RenderingPluginContribution })
export class CanvasRendererPlugin implements RenderingPlugin {
    // 画布配置
    @inject(CanvasConfig)
    private canvasConfig: CanvasConfig;

    // 默认相机
    @inject(DefaultCamera)
    private camera: Camera;

    // 上下文服务
    @inject(ContextService)
    private contextService: ContextService<CanvasRenderingContext2D>;

    // 场景图服务
    @inject(SceneGraphService)
    private sceneGraphService: SceneGraphService;

    // 渲染服务
    @inject(RenderingContext)
    private renderingContext: RenderingContext;
}
```

接下来就可以通过渲染服务提供的一系列 `hooks` 选择适当的执行时机，例如在渲染服务初始化时处理下 DPR：

```js
//
apply(renderingService: RenderingService) {
    // 当渲染服务初始化时...
    renderingService.hooks.init.tap(CanvasRendererPlugin.tag, () => {
        // 使用容器注入的上下文服务
        const context = this.contextService.getContext();
        const dpr = this.contextService.getDPR();
        // scale all drawing operations by the dpr
        // @see https://www.html5rocks.com/en/tutorials/canvas/hidpi/
        context && context.scale(dpr, dpr);

        // 使用容器注入的渲染上下文服务
        this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
        this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
        this.renderingContext.root.addEventListener(ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
    });
}
```

所有插件都遵循以上的结构实现。

# 插件之间的关系

插件之间也会存在依赖关系，例如 `g-plugin-gpgpu` 就依赖 `g-plugin-device-renderer`。在独立构建 UMD 时需要排除掉依赖，详见[构建说明]()。
