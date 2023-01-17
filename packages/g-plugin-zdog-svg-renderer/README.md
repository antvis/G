# @antv/g-plugin-zdog-svg-renderer

Use [Zdog](https://zzz.dog/getting-started)(Canvas version) to render pseudo-3D shapes.

<!-- <img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*d4iiS5_3YVIAAAAAAAAAAAAAARQnAQ" width="300"> -->

## Getting started

Use `g-svg` and register this plugin.

The dirty-rectangle rendering won't work in this scenario, any change on display objects will cause fullscreen re-rendering.

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-svg';
import { Plugin as PluginZdogSvgRenderer } from '@antv/g-plugin-zdog-svg-renderer';

// create a renderer
const renderer = new Renderer();
renderer.registerPlugin(new PluginZdogSvgRenderer());

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

<!-- - [x] Group
- [x] Circle
- [x] Ellipse
- [x] Rect, `radius` won't work
- [x] Line
- [x] Polyline
- [x] Polygon
- [x] Path
- [x] Text
- [x] Image -->
