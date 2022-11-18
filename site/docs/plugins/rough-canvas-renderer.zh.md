---
title: g-plugin-rough-canvas-renderer
order: 3
---

使用 [rough.js](https://roughjs.com/) 的 Canvas 版本进行手绘风格的渲染，[示例](/zh/examples/plugins#rough)。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*d4iiS5_3YVIAAAAAAAAAAAAAARQnAQ" width="500">

## 安装方式

首先需要使用 `g-canvas` 渲染器，注册该插件，它会替换掉 [g-plugin-canvas-renderer](/zh/plugins/canvas-renderer) 中对于 2D 图形的渲染效果：

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

需要注意的是一旦使用该插件，“脏矩形渲染”便无法使用，这意味着任何图形的任何样式属性改变，都会导致画布的全量重绘。

另外，我们支持所有 2D 图形，其中 [Text](/zh/api/basic/text)、[Image](/zh/api/basic/image) 和 [HTML](/zh/api/basic/html) 无手绘风格。

## 样式属性

除了 2D 图形的样式属性，rough.js 提供的配置项也可以使用。

### opacity

rough.js 并不支持 `opacity`，但我们可以通过 `globalAlpha` 实现，这一点和 [g-plugin-canvas-renderer](/zh/plugins/canvas-renderer) 一样。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*gl6ETYiyCCQAAAAAAAAAAAAAARQnAQ" width="200">

### shadow

rough.js 并不支持 `shadow` 相关效果，但我们提供了相关效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*JKLVSrYk7BYAAAAAAAAAAAAAARQnAQ" width="300">

配置项可以参考 [阴影](/zh/api/basic/display-object#阴影)：

```js
circle.style.shadowColor = '#000';
circle.style.shadowBlur = 0;
circle.style.shadowOffsetX = 0;
circle.style.shadowOffsetY = 0;
```

### roughness

rough.js 提供了很多影响手绘效果的[配置项](https://github.com/rough-stuff/rough/wiki#options)，都可以正常使用。[示例](/zh/examples/plugins/rough/#rough-options)

表示手绘风格程度，默认值为 `1`。`0` 代表无手绘效果，数字越大风格化效果越明显，但超过 `10` 会完全失去原本的形状也就没意义了。

<img src="https://gw.alipayobjects.com/zos/raptor/1668150000221/Nov-11-2022%25252014-59-41.gif" alt="roughness">

```js
circle.style.roughness = 2;
```

### bowing

线条的弯曲程度，默认值为 `1`。`0` 代表直线。[示例](/zh/examples/plugins/rough/#rough-options)

<img src="https://gw.alipayobjects.com/zos/raptor/1668150135837/Nov-11-2022%25252015-01-56.gif" alt="bowing">

```js
circle.style.bowing = 2;
```

### fillStyle

填充风格，支持以下枚举值，[示例](/zh/examples/plugins/rough/#rough-options)：

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

代表填充的线宽，默认为 `strokeWidth` 的一半。当 [fillStyle](/zh/plugins/rough-canvas-renderer#fillstyle) 选择 `'dots'` 样式时，代表点的直径。

<img src="https://gw.alipayobjects.com/zos/raptor/1668150690054/Nov-11-2022%25252015-11-20.gif" alt="fillWeight">

```js
circle.style.fillWeight = 2;
```

### hachureAngle

填充线条旋转的角度，默认为 `-41`。

<img src="https://gw.alipayobjects.com/zos/raptor/1668150901705/Nov-11-2022%25252015-14-53.gif" alt="hachureAngle">

```js
circle.style.hachureAngle = 30;
```

### hachureGap

相邻填充线条之间的距离，默认值为 `strokeWidth` 的 4 倍。

<img src="https://gw.alipayobjects.com/zos/raptor/1668151091570/Nov-11-2022%25252015-18-01.gif" alt="hachureGap">

### curveStepCount

绘制 Ellipse Circle 和曲线时，用于近似步长估计，默认值为 `9`，越小会越走形。

<img src="https://gw.alipayobjects.com/zos/raptor/1668151293704/Nov-11-2022%25252015-21-21.gif" alt="curveStepCount">

### curveFitting

绘制 Ellipse Circle 和曲线时，用于决定填充区域比例，默认值为 `0.95`，越小会越走形。

<img src="https://gw.alipayobjects.com/zos/raptor/1668151456179/Nov-11-2022%25252015-24-08.gif" alt="curveFitting">

### lineDash

描边虚线。

<img src="https://gw.alipayobjects.com/zos/raptor/1668153913783/Nov-11-2022%25252016-04-49.gif" alt="lineDash">

```js
circle.style.lineDash = [10, 10];
```

### lineDashOffset

描边虚线偏移量。

<img src="https://gw.alipayobjects.com/zos/raptor/1668153943968/Nov-11-2022%25252016-05-03.gif" alt="lineDashOffset">

```js
circle.style.lineDashOffset = 10;
```

### fillLineDash

填充虚线。

<img src="https://gw.alipayobjects.com/zos/raptor/1668151976505/Nov-11-2022%25252015-32-46.gif" alt="fillLineDash">

```js
circle.style.fillLineDash = [10, 10];
```

### fillLineDashOffset

填充虚线偏移量。

<img src="https://gw.alipayobjects.com/zos/raptor/1668152090255/Nov-11-2022%25252015-34-43.gif" alt="fillLineDashOffset">

```js
circle.style.fillLineDashOffset = 10;
```

### disableMultiStroke

禁止在描边上应用多个线条。

<img src="https://gw.alipayobjects.com/zos/raptor/1668152302347/Nov-11-2022%25252015-37-37.gif" alt="disableMultiStroke">

```js
circle.style.disableMultiStroke = true;
```

### disableMultiStrokeFill

禁止在填充上应用多个线条。

<img src="https://gw.alipayobjects.com/zos/raptor/1668152341144/Nov-11-2022%25252015-38-14.gif" alt="disableMultiStrokeFill">

```js
circle.style.disableMultiStrokeFill = true;
```

### simplification

路径简化程度，取值范围在 `0 - 1` 之间，默认值为 `0`，值越大简化程度越高。

### dashOffset

当 [fillStyle](/zh/plugins/rough-canvas-renderer#fillstyle) 选择 `'dashed'` 时，表示每段虚线长度。未设置会使用 [hachureGap](/zh/plugins/rough-canvas-renderer#hachuregap) 的值。

<img src="https://gw.alipayobjects.com/zos/raptor/1668152931436/Nov-11-2022%25252015-48-38.gif" alt="dashOffset">

### dashGap

当 [fillStyle](/zh/plugins/rough-canvas-renderer#fillstyle) 选择 `'dashed'` 时，表示虚线间隔。未设置会使用 [hachureGap](/zh/plugins/rough-canvas-renderer#hachuregap) 的值。

<img src="https://gw.alipayobjects.com/zos/raptor/1668153031116/Nov-11-2022%25252015-49-51.gif" alt="dashGap">

### zigzagOffset

当 [fillStyle](/zh/plugins/rough-canvas-renderer#fillstyle) 选择 `'zigzag-line'` 时，指定三角形的宽度。未设置会使用 [hachureGap](/zh/plugins/rough-canvas-renderer#hachuregap) 的值。

<img src="https://gw.alipayobjects.com/zos/raptor/1668153049044/Nov-11-2022%25252015-50-20.gif" alt="zigzagOffset">

### preserveVertices

## 拾取

在 [g-plugin-canvas-picker](/zh/plugins/canvas-picker) 中我们使用空间索引快速过滤，再配合图形几何定义的数学计算完成精确拾取。

但在手绘风格下，似乎无法也没必要做精确拾取，因此我们仍使用该插件。
