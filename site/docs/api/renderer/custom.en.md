---
title: Custom Renderer
order: 4
---

In [Renderer Introduction](/en/api/renderer/renderer), we learned that a renderer consists of a rendering context and a set of plugins that can dynamically extend the capabilities of the renderer at runtime.

When the existing renderer does not satisfy the current rendering context, customization can be accomplished by following these steps.

1. Inherit from `AbstractRenderer` to implement a `Renderer`, which can be registered by selecting an existing plug-in
2. Implement a custom context registration plugin
3. Customize the rendering environment context service

Here we will take [g-canvas](/en/api/renderer/canvas) as an example to show how to complete the above steps.

## Implementing a custom renderer

After inheriting `AbstractRenderer`, you can select a set of existing plugins in the constructor and register them using [registerPlugin()](/en/api/renderer/renderer#registerplugin), for example using the Canvas2D API g-plugin-canvas-path-generator](/en/plugins/canvas-path-generator) for path definition, [g-plugin-canvas-picker](/en/plugins/canvas-path-generator) for pickup using Canvas2D API, [g-plugin-canvas-picker](/en/ plugins/canvas-picker).

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

In addition to these ready-made built-in plugins, we need to develop an additional one.

## Implement a custom contextual registration plugin

You can refer to [plugin basic structure](/en/plugins/intro#basic-structure) on how to implement a plugin that does only one thing, and that is to register the rendering context service.

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

The rendering context service masks the details of the underlying rendering API upwards so that Canvas2D, SVG, or WebGL are not perceived when using the service.

## Custom Rendering Environment Context Service

A rendering context service needs to be registered with the `ContextService` token and implement the `ContextService` interface.

```js
import { ContextService, inject, singleton } from '@antv/g';

@singleton({ token: ContextService })
export class Canvas2DContextService
  implements ContextService<CanvasRenderingContext2D> {}
```

The `ContextService` interface is defined as follows.

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

Below we detail the meaning of each method.

### init

Different underlying rendering APIs have different initialization methods, for example, while Canvas2D / WebGL / WebGPU can all get the context from the `<canvas>` element via the DOM API, WebGPU is asynchronous, so we designed the method to be asynchronous.

```js
@inject(CanvasConfig)
private canvasConfig: CanvasConfig;

async init() {
  const { container, canvas, devicePixelRatio } = this.canvasConfig;
  this.context = this.$canvas.getContext('2d');
}
```

In this method, we can get the parameters passed by the user when creating [Canvas](/en/api/renderer/canvas) by injection, such as [devicePixelRatio](/en/api/canvas#devicepixelratio).

Regarding the timing of the call, it will be called not only when initializing the canvas for the first time, but also when switching the renderer at subsequent runtimes.

### destroy

In this method, we can do some context destruction.

Regarding the timing of the call, in addition to being called when the canvas is initialized for the first time, it will also be called when switching renderers at subsequent runtimes, where the old renderer context will be destroyed first.

### resize

During runtime, sometimes the initialized [canvas size](/en/api/canvas#width--height) will change, and then `canvas.resize()` will eventually call this method.

### getContext

Returns a custom rendering context, with different renderers returning different objects, e.g.

- [g-canvas](/en/api/renderer/canvas) will return `CanvasRenderingContext2D`
- [g-svg](/en/api/renderer/svg) will return `SVGElement`
- [g-webgl](/en/api/renderer/webgl) will return a complex object `WebGLRenderingContext`

```js
interface WebGLRenderingContext {
  engine: RenderingEngine;
  camera: Camera;
  view: IView;
}
```

### getDomElement

Returns the DOM element to which the context belongs. For example, `g-canvas/webgl` will return `<canvas>`, while `g-svg` will return `<svg>`.

### getDPR

Returns devicePixelRatio.

### getBoundingClientRect

It is available in most rendering environments via the DOM API method of the same name.

### applyCursorStyle

Set the mouse style. This can be set in most rendering environments via the DOM API.

### toDataURL

When implementing requirements like [export-image](/en/guide/advanced-topics/image-exporter), you need to rely on the capabilities of the rendering context.

Different rendering contexts naturally have different difficulties to implement, for example, native [toDataURL](https://developer.mozilla.org/zh-CN/Web/API/) can be used in [g-canvas](/en/api/renderer/canvas) HTMLCanvasElement/toDataURL) method.

https://github.com/antvis/G/blob/next/packages/g-svg/src/Canvas2DContextService.ts#L107-L110

```js
async toDataURL(options: Partial<DataURLOptions> = {}) {
  const { type, encoderOptions } = options;
  return (this.context.canvas as HTMLCanvasElement).toDataURL(type, encoderOptions);
}
```

However, [g-svg](/en/api/renderer/svg) is much more complicated to implement and requires the [XMLSerializer](https://developer.mozilla.org/zh-CN/Web/API/XMLSerializer) serialization capabilities.

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

The situation is more complicated in [g-webgl](/en/api/renderer/webgl), which even requires the use of asynchronous methods.

https://github.com/antvis/G/blob/next/packages/g-plugin-device-renderer/src/RenderGraphPlugin.ts#L428-L438
