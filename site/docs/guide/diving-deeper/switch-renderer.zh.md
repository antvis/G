---
title: 按需引入渲染器
order: 99
---

通过场景图描述待渲染对象后，我们需要将它们交给渲染器。使用何种渲染器由用户按需引入，并且可以在运行时切换。

## 按需引入渲染器

目前我们提供了多种[渲染器](/zh/api/renderer/intro)，用户可以像插件一样按需引入，但至少需要一种：

```js
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
```

这样在创建[画布](/zh/api/canvas/intro)时可以选择引入的渲染器之一，例如我们引入了 Canvas 和 WebGL 渲染器，就可以在两者之间选择：

```js
import { Canvas } from '@antv/g';
const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    // renderer: new CanvasRenderer(),
    renderer: new WebGLRenderer(),
});
```

很多渲染引擎会为用户选择默认渲染器，例如 Pixi.js 会优先使用 WebGL，如果不支持则降级成 Canvas。在 G 中这个选择权交给用户。

## 运行时切换

如果引入了多个渲染器，可以在运行时切换。目前 G 官网中的所有 DEMO 都可以在 `renderer` 面板中切换，并不会中断动画效果。再比如 G6 中可以通过节点和边的数目动态判断，是否需要切换到 WebGL 渲染器。

```js
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SvgRenderer } from '@antv/g-svg';

const webglRenderer = new WebGLRenderer();
const svgRenderer = new SvgRenderer();

if (tooManyShapes) {
    canvas.setRenderer(webglRenderer);
} else {
    canvas.setRenderer(svgRenderer);
}
```
