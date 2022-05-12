---
title: 自定义渲染器
order: 4
---

当已有的 `g-canvas/svg/webgl/webgpu` 这些渲染器不能满足当前渲染环境时，可以按照以下两步完成自定义：

1. 自定义渲染环境上下文服务
2. 继承 `AbstractRenderer` 实现一个 `Renderer`

# 自定义渲染环境上下文服务

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

## getContext

返回自定义渲染上下文。

-   `g-canvas` 返回 `CanvasRenderingContext2D`
-   `g-svg` 返回 `SVGElement`
-   `g-webgl` 返回一个复杂对象 `WebGLRenderingContext`

```js
interface WebGLRenderingContext {
    engine: RenderingEngine;
    camera: Camera;
    view: IView;
}
```

## getDomElement

返回上下文所属的 DOM 元素。例如 `g-canvas/webgl` 会返回 `<canvas>`，而 `g-svg` 会返回 `svg`。

## getDPR

返回 devicePixelRatio

## getBoundingClientRect

# 实现自定义渲染器

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
