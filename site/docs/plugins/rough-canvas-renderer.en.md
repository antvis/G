---
title: g-plugin-rough-canvas-renderer
order: 3
---

Hand-drawn style rendering using the Canvas version of [rough.js](https://roughjs.com/), [example](/en/examples/plugins#rough).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*d4iiS5_3YVIAAAAAAAAAAAAAARQnAQ" width="500">

## Usage

First you need to use the [g-canvas](/en/api/renderer/canvas) renderer, register the plugin and it will replace the rendering of 2D graphics in [g-plugin-canvas-renderer](/en/plugins/canvas-renderer).

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-canvas';
import { Plugin as PluginRoughCanvasRenderer } from '@antv/g-plugin-rough-canvas-renderer';

// create a renderer
const renderer = new Renderer();
renderer.registerPlugin(new PluginRoughCanvasRenderer());

// create a canvas & use `g-canvas`
const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer,
});
```

Note that once the plugin is used, "Dirty Rectangle Rendering" is not available, which means that any change in the style properties of any graphic will result in a full redraw of the canvas.

In addition, we support all 2D graphics, among which [Text](/en/api/basic/text), [Image](/en/api/basic/image) and [HTML](/en/api/basic/html) have no hand-drawn style.

## Style properties

In addition to the style properties of 2D graphics, the configuration items provided byrough.js can also be used.

### opacity

rough.js doesn't support `opacity`, but we can achieve it with `globalAlpha`, same as [g-plugin-canvas-renderer](/en/plugins/canvas-renderer).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*gl6ETYiyCCQAAAAAAAAAAAAAARQnAQ" width="200">

Note, however, that `fillOpacity` and `strokeOpacity` do not work because rough.js does not open the relevant configuration items.

```js
circle.style.opacity = 0.5;
```

### shadow

rough.js does not support `shadow` related effects, but we do provide them.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*JKLVSrYk7BYAAAAAAAAAAAAAARQnAQ" width="300">

Configuration items can be found in [shadow](/en/api/basic/display-object#shadow).

```js
circle.style.shadowColor = '#000';
circle.style.shadowBlur = 0;
circle.style.shadowOffsetX = 0;
circle.style.shadowOffsetY = 0;
```

### roughness

rough.js provides many [configuration items](https://github.com/rough-stuff/rough/wiki#options) that affect the hand-drawn effect, all of which work properly. [example](/en/examples/plugins/rough/#rough-options)

The default value is `1`, indicating the degree of hand-drawn style. `0` means no hand-drawn effect, the larger the number the more obvious the stylization effect, but more than `10` will completely lose the original shape and it is meaningless.

<img src="https://gw.alipayobjects.com/zos/raptor/1668150000221/Nov-11-2022%25252014-59-41.gif" alt="roughness">

```js
circle.style.roughness = 2;
```

### bowing

The degree of curvature of the line, the default value is `1`. `0` represents a straight line. [example](/en/examples/plugins/rough/#rough-options)

<img src="https://gw.alipayobjects.com/zos/raptor/1668150135837/Nov-11-2022%25252015-01-56.gif" alt="bowing">

```js
circle.style.bowing = 2;
```

### fillStyle

Fill style, supporting the following enumerated values, [example](/en/examples/plugins/rough/#rough-options)：

-   `'hachure'`
-   `'solid'`
-   `'zigzag'`
-   `'cross-hatch'`
-   `'dots'`
-   `'dashed'`
-   `'zigzag-line'`

<img src="https://mdn.alipayobjects.com/mdn/huamei_qa8qxu/afts/img/A*jY87QqogOL8AAAAAAAAAAAAADmJ7AQ" alt="hachure" width="100">
<img src="https://mdn.alipayobjects.com/mdn/huamei_qa8qxu/afts/img/A*c6e2TrkVgG4AAAAAAAAAAAAADmJ7AQ" alt="solid"  width="100">
<img src="https://mdn.alipayobjects.com/mdn/huamei_qa8qxu/afts/img/A*-7BPRLwr84oAAAAAAAAAAAAADmJ7AQ" alt="zigzag"  width="100">
<img src="https://mdn.alipayobjects.com/mdn/huamei_qa8qxu/afts/img/A*l69YRowb8S4AAAAAAAAAAAAADmJ7AQ" alt="cross-hatch"  width="100">
<img src="https://mdn.alipayobjects.com/mdn/huamei_qa8qxu/afts/img/A*EOAwTJmUBv0AAAAAAAAAAAAADmJ7AQ" alt="dots"  width="100">
<img src="https://mdn.alipayobjects.com/mdn/huamei_qa8qxu/afts/img/A*La-UR72MBz4AAAAAAAAAAAAADmJ7AQ" alt="dashed"  width="100">
<img src="https://mdn.alipayobjects.com/mdn/huamei_qa8qxu/afts/img/A*cdsdTKyu6b4AAAAAAAAAAAAADmJ7AQ" alt="zigzag-line"  width="100">

```js
circle.style.fillStyle = 'zigzag';
```

### fillWeight

Numeric value representing the width of the hachure lines. Default value of the fillWeight is set to half the strokeWidth of that shape.

When using dots styles to fill the shape, this value represents the diameter of the dot.

<img src="https://gw.alipayobjects.com/zos/raptor/1668150690054/Nov-11-2022%25252015-11-20.gif" alt="fillWeight">

```js
circle.style.fillWeight = 2;
```

### hachureAngle

Numerical value (in degrees) that defines the angle of the hachure lines. Default value is `-41` degrees.

<img src="https://gw.alipayobjects.com/zos/raptor/1668150901705/Nov-11-2022%25252015-14-53.gif" alt="hachureAngle">

```js
circle.style.hachureAngle = 30;
```

### hachureGap

Numerical value that defines the average gap, in pixels, between two hachure lines. Default value of the hachureGap is set to four times the `strokeWidth` of that shape.

<img src="https://gw.alipayobjects.com/zos/raptor/1668151091570/Nov-11-2022%25252015-18-01.gif" alt="hachureGap">

### curveStepCount

When drawing ellipses, circles, and arcs, RoughJS approximates curveStepCount number of points to estimate the shape. Default value is `9`.

<img src="https://gw.alipayobjects.com/zos/raptor/1668151293704/Nov-11-2022%25252015-21-21.gif" alt="curveStepCount">

### curveFitting

When drawing ellipses, circles, and arcs, Let RoughJS know how close should the rendered dimensions be when compared to the specified one. Default value is 0.95 - which means the rendered dimensions will be at least 95% close to the specified dimensions. A value of 1 will ensure that the dimensions are almost 100% accurate.

<img src="https://gw.alipayobjects.com/zos/raptor/1668151456179/Nov-11-2022%25252015-24-08.gif" alt="curveFitting">

### lineDash

If you want the stroke to be dashed (This does not affect the hachure and other fills of the shape), set this property. The value is an array of numbers as described in setLineDash method of canvas

<img src="https://gw.alipayobjects.com/zos/raptor/1668153913783/Nov-11-2022%25252016-04-49.gif" alt="lineDash">

```js
circle.style.lineDash = [10, 10];
```

### lineDashOffset

When using dashed strokes, this property sets the line dash offset or phase. This is akin to the lineDashOffset of canvas

<img src="https://gw.alipayobjects.com/zos/raptor/1668153943968/Nov-11-2022%25252016-05-03.gif" alt="lineDashOffset">

```js
circle.style.lineDashOffset = 10;
```

### fillLineDash

This property is similar to the strokeLineDash property but it affects the fills, not the stroke. eg. when you want hachure lines to be dashed.

<img src="https://gw.alipayobjects.com/zos/raptor/1668151976505/Nov-11-2022%25252015-32-46.gif" alt="fillLineDash">

```js
circle.style.fillLineDash = [10, 10];
```

### fillLineDashOffset

This property is similar to the strokeLineDashOffset property but it affects the fills, not the stroke.

<img src="https://gw.alipayobjects.com/zos/raptor/1668152090255/Nov-11-2022%25252015-34-43.gif" alt="fillLineDashOffset">

```js
circle.style.fillLineDashOffset = 10;
```

### disableMultiStroke

If this property is set to true, roughjs does not apply multiple strokes to sketch the shape.

<img src="https://gw.alipayobjects.com/zos/raptor/1668152302347/Nov-11-2022%25252015-37-37.gif" alt="disableMultiStroke">

```js
circle.style.disableMultiStroke = true;
```

### disableMultiStrokeFill

If this property is set to true, roughjs does not apply multiple strokes to sketch the hachure lines to fill the shape.

<img src="https://gw.alipayobjects.com/zos/raptor/1668152341144/Nov-11-2022%25252015-38-14.gif" alt="disableMultiStrokeFill">

```js
circle.style.disableMultiStrokeFill = true;
```

### simplification

Simplification can be set to simplify the shape by the specified factor. The value can be between 0 and 1.

### dashOffset

When filling a shape using the dashed style, this property indicates the nominal length of dash (in pixels). If not set, it defaults to the hachureGap value.

<img src="https://gw.alipayobjects.com/zos/raptor/1668152931436/Nov-11-2022%25252015-48-38.gif" alt="dashOffset">

### dashGap

When filling a shape using the dashed style, this property indicates the nominal gap between dashes (in pixels). If not set, it defaults to the hachureGap value.

<img src="https://gw.alipayobjects.com/zos/raptor/1668153031116/Nov-11-2022%25252015-49-51.gif" alt="dashGap">

### zigzagOffset

When filling a shape using the zigzag-line style, this property indicates the nominal width of the zig-zag triangle in each line. If not set, it defaults to the hachureGap value.

<img src="https://gw.alipayobjects.com/zos/raptor/1668153049044/Nov-11-2022%25252015-50-20.gif" alt="zigzagOffset">

### preserveVertices

## Picking

In [g-plugin-canvas-picker](/en/plugins/canvas-picker) we use the spatial index for quick filtering and the mathematical calculation of the geometric definition of the figure for exact picking.

However, in the hand-drawn style, it seems impossible and unnecessary to do exact picking, so we still use this plugin.
