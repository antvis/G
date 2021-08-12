---
title: 渲染器
order: -99
---

渲染器使用底层渲染 API 绘制各类图形，目前我们提供了三种渲染器，分别是：

-   基于 Canvas2D 的 `g-canvas`
-   基于 SVG 的 `g-svg`
-   基于 WebGL 的 `g-webgl`

渲染器由一个渲染上下文和一组插件组成，通过插件可以在运行时动态扩展渲染器的能力。

# 初始化配置

## enableAutoRendering

是否开启自动渲染，默认开启。有些场景需要手动控制渲染时机时可关闭：

```js
const webglRenderer = new WebGLRenderer({
    // 关闭自动渲染
    enableAutoRendering: false,
});
```

## enableDirtyRectangleRendering

是否开启脏矩阵渲染，仅 `g-canvas` 生效。

# 修改配置

通过 `setConfig` 可以修改初始化配置，例如再次开启自动渲染：

```js
renderer.setConfig({ enableAutoRendering: true });
```

# registerPlugin

渲染器可以在运行时动态添加插件，扩展自身能力，例如 `g-webgl` 可以通过 [g-pluin-3d](/zh/docs/plugins/3d) 进行 3D 场景的渲染：

```js
import { Plugin } from '@antv/g-plugin-3d';
// 注册 3D 插件
webglRenderer.registerPlugin(new Plugin());
```

# 自定义渲染器

当已有的 `g-canvas/svg/webgl` 这些渲染器不能满足当前渲染环境时，可以按照以下两步完成自定义：
1. 自定义渲染环境上下文服务
2. 继承 `AbstractRenderer` 实现一个 `Renderer`

## 自定义渲染环境上下文服务

一个渲染上下文需要实现 `ContextService` 接口：
```js
import type { ContextService } from '@antv/g';

// 自定义上下文
interface MyCustomContext {
}

@injectable()
export class MyCustomContextService implements ContextService<MyCustomContext> {
  // 注入 new Canvas() 时传入的配置项
  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  // 实现以下方法
  getContext(): MyCustomContext | null;
  getDomElement(): HTMLElement | null;
  getDPR(): number;
  getBoundingClientRect(): DOMRect | undefined;
  resize(width: number, height: number): void;
  applyCursorStyle(cursor: string): void;
}
```

定义完成后，可以在其他插件中通过注入使用该上下文：
```js
@injectable()
export class EventPlugin implements RenderingPlugin {
  static tag = 'EventPlugin';

  // 注入
  @inject(ContextService)
  private contextService: ContextService;

  apply() {
    // 使用上下文
    this.contextService.getDomElement();
  }
}
```

### getContext

返回自定义渲染上下文。
* `g-canvas` 返回 `CanvasRenderingContext2D`
* `g-svg` 返回 `SVGElement`
* `g-webgl` 返回一个复杂对象 `WebGLRenderingContext`

```js
interface WebGLRenderingContext {
  engine: RenderingEngine;
  camera: Camera;
  view: IView;
}
```

### getDomElement

返回上下文所属的 DOM 元素。例如 `g-canvas/webgl` 会返回 `<canvas>`，而 `g-svg` 会返回 `svg`。

### getDPR

返回 devicePixelRatio

### getBoundingClientRect

## 实现自定义渲染器

渲染器由一系列插件组成：
```js
import { AbstractRenderer, RendererConfig } from '@antv/g';
import { Plugin as DomInteractionPlugin } from '@antv/g-plugin-dom-interaction';
import { Plugin as CanvasRendererPlugin } from '@antv/g-plugin-canvas-renderer';
import { Plugin as CanvasPickerPlugin } from '@antv/g-plugin-canvas-picker';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<RendererConfig>) {
    super(config);

    // 注册一系列插件
    this.registerPlugin(new ContextRegisterPlugin());
    this.registerPlugin(new CanvasRendererPlugin());
    this.registerPlugin(new DomInteractionPlugin());
    this.registerPlugin(new CanvasPickerPlugin());
  }
}
```