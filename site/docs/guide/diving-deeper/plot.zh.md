---
title: 接管 Observable Plot 渲染
order: 15
---

在上一节中我们展示了[如何接管 D3 的渲染工作](/zh/guide/diving-deeper/d3)，我们可以对其他基于 SVG 实现的图表库进行相同的操作。[Observable Plot](https://github.com/observablehq/plot) 就是一个很好的例子。

该图表库同样支持向 `plot()` 传入 `document` 对象，我们将 G 的 [Document](/zh/api/builtin-objects/document) 对象传入：

```js
import * as Plot from '@observablehq/plot';
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-canvas';

const canvasRenderer = new Renderer();
const canvas = new Canvas({
    container: 'container',
    width: 640,
    height: 400,
    renderer: canvasRenderer,
});

const chart = Plot.dot(data, {
    x: 'weight',
    y: 'height',
    stroke: 'sex',
}).plot({
    // 传入 Document 对象代替 `window.document`
    document: canvas.document,
});
```

值得一提的是我们不需要手动调用 `canvas.appendChild()` 将图表加入画布，Observable Plot 内部完成了这一工作。

[DEMO in Codesandbox](https://codesandbox.io/s/observable-plot-eh62fb?file=/index.js)

下图中上半部分展示了 Observable Plot 原生 SVG 的渲染效果，下半部分展示了使用 [g-canvas](/zh/api/renderer/canvas) 绘制的效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*EyjlTIwCrlgAAAAAAAAAAAAAARQnAQ" width="600" alt="observablehq plot">

同样由于接管了渲染层，我们可以使用例如 [g-plugin-rough-canvas-renderer](/zh/plugins/rough-canvas-renderer) 这样的插件进行手绘风格改造。

[DEMO in Codesandbox](https://codesandbox.io/s/sketchy-observable-plot-fd1smr?file=/index.js)

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*022sTZrfznEAAAAAAAAAAAAAARQnAQ" width="500" alt="sketchy plot">
