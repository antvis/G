---
title: 自定义渲染器
order: 4
---

在[渲染器简介](/zh/api/renderer/renderer)中，我们了解到渲染器由一个渲染上下文和一组插件组成，通过插件可以在运行时动态扩展渲染器的能力。

当已有的渲染器不能满足当前渲染环境时，可以按照以下步骤完成自定义：

1. 继承 `AbstractRenderer` 实现一个 `Renderer`，可以选取已有的插件进行注册
2. 实现一个自定义上下文注册插件
3. 自定义渲染环境上下文服务

下面我们将以 [g-canvas](/zh/api/renderer/canvas) 为例，展示如何完成以上步骤。

## 实现自定义渲染器

继承了 `AbstractRenderer` 之后，在构造函数中可以选取一系列已有的插件，使用 [registerPlugin()](/zh/api/renderer/renderer#registerplugin) 进行注册，例如使用 Canvas2D API 定义路径的 [g-plugin-canvas-path-generator](/zh/plugins/canvas-path-generator)，使用 Canvas2D API 进行拾取的 [g-plugin-canvas-picker](/zh/plugins/canvas-picker)。

https://github.com/antvis/G/blob/next/packages/g-svg/src/index.ts

```js
import type { RendererConfig } from '@antv/g';
import { AbstractRenderer } from '@antv/g';
import * as CanvasPathGenerator from '@antv/g-plugin-canvas-path-generator';
import * as CanvasPicker from '@antv/g-plugin-canvas-picker';
import * as CanvasRenderer from '@antv/g-plugin-canvas-renderer';
import * as DomInteraction from '@antv/g-plugin-dom-interaction';
import * as HTMLRenderer from '@antv/g-plugin-html-renderer';
import * as ImageLoader from '@antv/g-plugin-image-loader';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<RendererConfig>) {
    super(config);

    // register Canvas2DContext
    this.registerPlugin(new ContextRegisterPlugin());

    // register other built-in plugins
    this.registerPlugin(new ImageLoader.Plugin());
    this.registerPlugin(new CanvasPathGenerator.Plugin());
    this.registerPlugin(new CanvasRenderer.Plugin());
    this.registerPlugin(new DomInteraction.Plugin());
    this.registerPlugin(new CanvasPicker.Plugin());
    this.registerPlugin(new HTMLRenderer.Plugin());
  }
}
```

除了这些现成的内置插件，我们需要额外开发一个。

## 实现一个自定义上下文注册插件

关于如何实现一个插件可以参考 [插件基本结构](/zh/plugins/intro#基本结构)，该插件只做一件事，那就是注册渲染上下文服务。

```js
import { AbstractRendererPlugin, Module } from '@antv/g';
import { Canvas2DContextService } from './Canvas2DContextService';

const containerModule = Module((register) => {
  /**
   * implements ContextService
   */
  register(Canvas2DContextService);
});

export class ContextRegisterPlugin extends AbstractRendererPlugin {
  name = 'canvas-context-register';
  init(): void {
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.unload(containerModule);
  }
}
```

渲染上下文服务向上屏蔽了底层渲染 API 的细节，这样在使用该服务时不会感知到 Canvas2D、SVG 或者 WebGL。

## 自定义渲染环境上下文服务

一个渲染上下文服务需要通过 `ContextService` token 注册，并实现 `ContextService` 接口：

```js
import { ContextService, inject, singleton } from '@antv/g';

@singleton({ token: ContextService })
export class Canvas2DContextService
  implements ContextService<CanvasRenderingContext2D> {}
```

`ContextService` 接口定义如下：

```js
export interface ContextService<Context> {
  init: () => Promise<void>;
  destroy: () => void;
  getContext: () => Context | null;
  getDomElement: () => CanvasLike | null;
  getDPR: () => number;
  getBoundingClientRect: () => DOMRect | undefined;
  resize: (width: number, height: number) => void;
  applyCursorStyle: (cursor: string) => void;
  toDataURL: (options: Partial<DataURLOptions>) => Promise<string>;
}
```

下面我们详细介绍每一个方法的含义。

### init

不同的底层渲染 API 有不同的初始化方式，例如 Canvas2D / WebGL / WebGPU 虽然都可以通过 DOM API 从 `<canvas>` 元素中获取上下文，但 WebGPU 为异步方式，因此我们将该方法设计成异步：

```js
@inject(CanvasConfig)
private canvasConfig: CanvasConfig;

async init() {
  const { container, canvas, devicePixelRatio } = this.canvasConfig;
  this.context = this.$canvas.getContext('2d');
}
```

在该方法中，我们可以通过注入的方式获取用户创建 [Canvas](/zh/api/renderer/canvas) 时传入的参数，例如 [devicePixelRatio](/zh/api/canvas#devicepixelratio)。

关于调用时机，除了首次初始化画布时会调用，在后续运行时切换渲染器时也会调用。

### destroy

在该方法中，我们可以做一些上下文销毁工作。

关于调用时机，除了首次初始化画布时会调用，在后续运行时切换渲染器时也会调用，其中旧的渲染器上下文会先销毁。

### resize

在运行过程中，有时初始化的[画布尺寸](/zh/api/canvas#width--height)会发生改变，此时 `canvas.resize()` 最终会调用到该方法。

### getContext

返回自定义渲染上下文，不同的渲染器返回不同的对象，例如：

- [g-canvas](/zh/api/renderer/canvas) 返回 `CanvasRenderingContext2D`
- [g-svg](/zh/api/renderer/svg) 返回 `SVGElement`
- [g-webgl](/zh/api/renderer/webgl) 返回一个复杂对象 `WebGLRenderingContext`

```js
interface WebGLRenderingContext {
  engine: RenderingEngine;
  camera: Camera;
  view: IView;
}
```

### getDomElement

返回上下文所属的 DOM 元素。例如 `g-canvas/webgl` 会返回 `<canvas>`，而 `g-svg` 会返回 `<svg>`。

### getDPR

返回 devicePixelRatio。

### getBoundingClientRect

在大部分渲染环境中都可以通过 DOM API 同名方法获取。

### applyCursorStyle

设置鼠标样式。在大部分渲染环境中都可以通过 DOM API 设置。

### toDataURL

在实现[导出图片](/zh/guide/advanced-topics/image-exporter)这样的需求时，需要依靠渲染上下文的能力。

不同的渲染环境实现起来难度自然也不同，例如 [g-canvas](/zh/api/renderer/canvas) 中可以使用原生 [toDataURL](https://developer.mozilla.org/zh-CN/Web/API/HTMLCanvasElement/toDataURL) 方法

https://github.com/antvis/G/blob/next/packages/g-svg/src/Canvas2DContextService.ts#L107-L110

```js
async toDataURL(options: Partial<DataURLOptions> = {}) {
  const { type, encoderOptions } = options;
  return (this.context.canvas as HTMLCanvasElement).toDataURL(type, encoderOptions);
}
```

但 [g-svg](/zh/api/renderer/svg) 实现起来就要麻烦很多，需要借助 [XMLSerializer](https://developer.mozilla.org/zh-CN/Web/API/XMLSerializer) 的序列化能力：

https://github.com/antvis/G/blob/next/packages/g-svg/src/SVGContextService.ts#L74-L90

```js
async toDataURL(options: Partial<DataURLOptions> = {}) {
  const cloneNode = this.$namespace.cloneNode(true);
  const svgDocType = document.implementation.createDocumentType(
    'svg',
    '-//W3C//DTD SVG 1.1//EN',
    'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd',
  );
  const svgDoc = document.implementation.createDocument(
    'http://www.w3.org/2000/svg',
    'svg',
    svgDocType,
  );
  svgDoc.replaceChild(cloneNode, svgDoc.documentElement);
  return `data:image/svg+xml;charset=utf8,${encodeURIComponent(
    new XMLSerializer().serializeToString(svgDoc),
  )}`;
}
```

在 [g-webgl](/zh/api/renderer/webgl) 中情况就更复杂了，甚至需要使用异步方式。

https://github.com/antvis/G/blob/next/packages/g-plugin-device-renderer/src/RenderGraphPlugin.ts#L428-L438
