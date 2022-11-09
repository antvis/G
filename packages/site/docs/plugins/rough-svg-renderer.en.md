---
title: g-plugin-rough-svg-renderer
order: 3
---

Hand-drawn style rendering using the SVG version of [rough.js](https://roughjs.com/), [example](/en/examples/plugins#rough).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*d4iiS5_3YVIAAAAAAAAAAAAAARQnAQ" width="500">

## Usage

First you need to use the [g-svg](/en/docs/api/renderer/svg) renderer, register the plugin and it will replace the rendering of 2D graphics in [g-plugin-svg-renderer](/en/docs/plugins/svg-renderer).

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

In addition, we support all 2D graphics, among which [Text](/en/docs/api/basic/text), [Image](/en/docs/api/basic/image) and [HTML](/en/docs/api/basic/html) have no hand-drawn style.

## Style properties

In addition to the style properties of 2D graphics, the configuration items provided byrough.js can also be used.

### opacity

rough.js doesn't support `opacity`, but we can achieve it with `globalAlpha`, same as [g-plugin-canvas-renderer](/en/docs/plugins/canvas-renderer).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*gl6ETYiyCCQAAAAAAAAAAAAAARQnAQ" width="200">

Note, however, that `fillOpacity` and `strokeOpacity` do not work because rough.js does not open the relevant configuration items.

```js
circle.style.opacity = 0.5;
```

### shadow

rough.js does not support `shadow` related effects, but we do provide them.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*JKLVSrYk7BYAAAAAAAAAAAAAARQnAQ" width="300">

Configuration items can be found in [shadow](/en/docs/api/basic/display-object#shadow).

```js
circle.style.shadowColor = '#000';
circle.style.shadowBlur = 0;
circle.style.shadowOffsetX = 0;
circle.style.shadowOffsetY = 0;
```

### rough.js Related Properties

rough.js provides a number of configuration items that affect the hand-drawn effect, all of which work properly.

https://github.com/rough-stuff/rough/wiki#options

For example, we can modify the fill style and adjust more configuration items in this [example](/en/examples/plugins#rough).

```js
circle.style.fillStyle = 'zigzag';
```

## Picking

Non-`solid` fill styles leave a lot of white space, and these blank areas do not trigger interaction events. This is inconsistent with [g-plugin-canvas-renderer](/en/docs/plugins/canvas-renderer).
