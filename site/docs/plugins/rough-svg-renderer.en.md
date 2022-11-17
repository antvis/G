---
title: g-plugin-rough-svg-renderer
order: 3
---

Hand-drawn style rendering using the SVG version of [rough.js](https://roughjs.com/), [example](/en/examples/plugins#rough).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*d4iiS5_3YVIAAAAAAAAAAAAAARQnAQ" width="500">

## Usage

First you need to use the [g-svg](/en/api/renderer/svg) renderer, register the plugin and it will replace the rendering of 2D graphics in [g-plugin-svg-renderer](/en/plugins/svg-renderer).

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-svg';
import { Plugin as PluginRoughSVGRenderer } from '@antv/g-plugin-rough-svg-renderer';

// create a renderer
const renderer = new Renderer();
renderer.registerPlugin(new PluginRoughSVGRenderer());

// create a canvas & use `g-svg`
const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer,
});
```

In addition, we support all 2D graphics, among which [Text](/en/api/basic/text), [Image](/en/api/basic/image) and [HTML](/en/api/basic/html) have no hand-drawn style.

## Style properties

In addition to the style properties of 2D graphics, the configuration items provided by rough.js can also be used. See [g-plugin-rough-canvas-renderer](/en/plugins/rough-canvas-renderer).

## Picking

Non-`solid` fill styles leave a lot of white space, and these blank areas do not trigger interaction events. This is inconsistent with [g-plugin-canvas-renderer](/en/plugins/canvas-renderer).
