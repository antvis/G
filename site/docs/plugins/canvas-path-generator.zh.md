---
title: g-plugin-canvas-path-generator
order: 4
---

使用 CanvasRenderingContext2D 绘制各个图形的路径，例如使用 [arcTo()](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/arcTo) 绘制 [Circle](/zh/api/basic/circle)。

除了用于最终渲染，在使用 [isPointInPath()](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/isPointInPath) 前也需要在离屏画布中绘制。

## Token

该插件提供两个 Token，使用时通过 Token 注入：

```js
export const PathGeneratorFactory = Syringe.defineToken('PathGeneratorFactory');
export const PathGenerator = Syringe.defineToken('PathGenerator');
```

### PathGeneratorFactory

例如目前在 [g-plugin-canvas-renderer](/zh/plugins/canvas-renderer) 和 [g-plugin-canvas-picker](/zh/plugins/canvas-picker) 这两个插件中都能看到通过 `PathGeneratorFactory` 这个 token 将工厂方法注入，传入 [nodeName](/zh/api/builtin-objects/node#nodename) 就能得到对应图形路径的绘制方法：

```js
@inject(PathGeneratorFactory)
private pathGeneratorFactory: (tagName: Shape | string) => PathGenerator<any>;

const circlePathGenerator = this.pathGeneratorFactory(Shape.CIRCLE);
```

### PathGenerator

具体到每一种基础图形的路径绘制方法，它接受 CanvasRenderingContext2D 上下文和解析后的图形样式属性作为参数：

```js
export type PathGenerator<T extends ParsedBaseStyleProps> = (
  context: CanvasRenderingContext2D,
  attributes: T,
) => void;
```

以 Circle 为例：

```js
function generatePath(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedCircleStyleProps,
) {
    const { r } = parsedStyle;
    context.arc(r.value, r.value, r.value, 0, Math.PI * 2, false);
}
```
