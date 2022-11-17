---
title: Takeover Observable Plot's rendering
order: 15
---

In the previous section we showed [How to take over the rendering of D3](/en/guide/diving-deeper/d3), and we can do the same for other SVG-based diagram libraries. [Observable Plot](https://github.com/observablehq/plot) is a good example.

The chart library also supports passing `document` objects to `plot()`, and we pass G's [Document](/en/api/builtin-objects/document) object to.

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
    // Pass in our Document object instead of `window.document`
    document: canvas.document,
});
```

It's worth mentioning that we don't need to call `canvas.appendChild()` manually to add the chart to the canvas, Observable Plot does that internally.

[DEMO in Codesandbox](https://codesandbox.io/s/observable-plot-eh62fb?file=/index.js)

The top half of the figure below shows the rendering of the Observable Plot native SVG, and the bottom half shows the drawing using [g-canvas](/en/api/renderer/canvas).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*EyjlTIwCrlgAAAAAAAAAAAAAARQnAQ" width="600" alt="observablehq plot">

Also thanks to taking over the rendering layer, we can use a plugin like [g-plugin-rough-canvas-renderer](/en/plugins/rough-canvas-renderer) for hand-drawn style transformation.

[DEMO in Codesandbox](https://codesandbox.io/s/sketchy-observable-plot-fd1smr?file=/index.js)

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*022sTZrfznEAAAAAAAAAAAAAARQnAQ" width="500" alt="sketchy plot">
