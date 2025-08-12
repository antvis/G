---
title: g-plugin-canvas-renderer
order: 3
---

Provides Canvas2D-based rendering capabilities.

## Usage

The [g-canvas](/en/api/renderer/canvas) renderer is built in by default, so there is no need to introduce it manually.

```js
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
// Create a renderer with the plugin built in
const canvasRenderer = new CanvasRenderer();
```

## Contributions

### StyleRenderer

When rendering the base graphics using [CanvasRenderingContext2D](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D), you can implement this interface after using [g-plugin- canvas-path-generator](/en/plugins/canvas-path-generator) to generate the graphical path, implement this interface to finish drawing the style.

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

We provide different extension points for different types of graphics. For example, in [g-plugin-rough-canvas-renderer](/en/plugins/rough-canvas-renderer), we use the API provided by rough.js for [Circle](/en/api/basic/circle) to add a hand-drawn style.

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
