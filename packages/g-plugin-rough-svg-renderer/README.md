# @antv/g-plugin-rough-svg-renderer

Use [rough.js](https://roughjs.com/)(SVG version) to render sketchy styled shapes, inspired by [roughViz](https://github.com/jwilber/roughViz).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*d4iiS5_3YVIAAAAAAAAAAAAAARQnAQ" width="300">

## Getting started

Use `g-svg` and register this plugin.

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-svg';
import { Plugin as PluginRoughSVGRenderer } from '@antv/g-plugin-rough-svg-renderer';

// create a renderer
const renderer = new Renderer();
renderer.registerPlugin(new PluginRoughSVGRenderer());

// create a canvas & use `g-canvas`
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});
```

## Features

### Basic shapes

- [x] Group
- [x] Circle
- [x] Ellipse
- [x] Rect, `radius` won't work
- [x] Line
- [x] Polyline
- [x] Polygon
- [x] Path
- [x] Text
- [x] Image

### Opacity

rough.js don't support `opacity` now, but we can augment it with `globalAlpha`.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*gl6ETYiyCCQAAAAAAAAAAAAAARQnAQ" width="200">

We can use `opacity` but not `fillOpacity` or `strokeOpacity` separately:

```js
circle.style.opacity = 0.5;
```

### Shadow

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*JKLVSrYk7BYAAAAAAAAAAAAAARQnAQ" width="300">

Shadow can also work:

```js
circle.style.shadowColor = '#000';
circle.style.shadowBlur = 0;
circle.style.shadowOffsetX = 0;
circle.style.shadowOffsetY = 0;
```

### Other rough.js options

https://github.com/rough-stuff/rough/wiki#options

### Text & Image

Text & Image should be the same in `g-plugin-canvas-renderer`.

### Picking

Maybe it's not necessary to pick target in a precise way.
