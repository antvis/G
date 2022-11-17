---
title: g-plugin-canvas-renderer
order: 3
---

提供基于 Canvas2D 的渲染能力。

## 安装方式

[g-canvas](/zh/api/renderer/canvas) 渲染器默认内置，因此无需手动引入。

```js
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
// 创建 Canvas 渲染器，其中内置了该插件
const canvasRenderer = new CanvasRenderer();
```

## 扩展点

### StyleRenderer

在使用 [CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D) 渲染基础图形时，在使用 [g-plugin-canvas-path-generator](/zh/plugins/canvas-path-generator) 生成图形路径之后，实现该接口即可完成绘制样式。

```js
export interface StyleRenderer {
    render: (
        context: CanvasRenderingContext2D,
        parsedStyle: ParsedBaseStyleProps,
        object: DisplayObject,
        renderingService: RenderingService,
    ) => void;
}
```

我们为不同类型的图形提供了不同的扩展点。例如在 [g-plugin-rough-canvas-renderer](/zh/plugins/rough-canvas-renderer) 中，我们使用 rough.js 提供的 API 为 [Circle](/zh/api/basic/circle) 增加手绘风格的样式：

```js
@singleton({
  token: CanvasRenderer.CircleRendererContribution,
})
export class CircleRenderer implements CanvasRenderer.StyleRenderer {
  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedCircleStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { r } = parsedStyle as ParsedCircleStyleProps;
    // rough.js use diameter instead of radius
    // @see https://github.com/rough-stuff/rough/wiki#circle-x-y-diameter--options
    context.roughCanvas.circle(r.value, r.value, r.value * 2, generateRoughOptions(object));
  }
}
```
