---
title: g-plugin-canvas-path-generator
order: 4
---

Use CanvasRenderingContext2D to draw the path of individual shapes, for example using [arcTo()](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/arcTo) Draws [Circle](/en/api/basic/circle).

In addition to being used for final rendering, you also need to draw in the off-screen canvas before using [isPointInPath()](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/isPointInPath) .

## Token

The plugin provides two Tokens, which are injected via Token when used.

```js
export const PathGeneratorFactory = Syringe.defineToken('PathGeneratorFactory');
export const PathGenerator = Syringe.defineToken('PathGenerator');
```

### PathGeneratorFactory

For example, you can currently see the factory method injected into [g-plugin-canvas-renderer](/en/plugins/canvas-renderer) and [g-plugin-canvas-picker](/en/plugins/canvas-picker) in both plugins. You can see that the factory method is injected via the token `PathGeneratorFactory`, and passing [nodeName](/en/api/builtin-objects/node#nodename) will give you the drawing method for the corresponding graphic path: `PathGeneratorFactory`.

```js
@inject(PathGeneratorFactory)
private pathGeneratorFactory: (tagName: Shape | string) => PathGenerator<any>;

const circlePathGenerator = this.pathGeneratorFactory(Shape.CIRCLE);
```

### PathGenerator

The path drawing method specific to each base drawing accepts as parameters the CanvasRenderingContext2D context and the parsed drawing style property.

```js
export type PathGenerator<T extends ParsedBaseStyleProps> = (
  context: CanvasRenderingContext2D,
  attributes: T,
) => void;
```

Take Circle as an example.

```js
function generatePath(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedCircleStyleProps,
) {
    const { r } = parsedStyle;
    context.arc(r.value, r.value, r.value, 0, Math.PI * 2, false);
}
```
