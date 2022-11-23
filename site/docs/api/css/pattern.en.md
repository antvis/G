---
title: Pattern
order: 10
---

就像可平铺的瓷砖、地板一样，有时我们希望使用重复的相同图案填充图形。

在该[示例](/zh/examples/style/pattern/#pattern)中我们展示了目前支持的 Pattern（模版填充）效果，来源可以包括图片 URL，`HTMLImageElement`，`HTMLCanvasElement`，`HTMLVideoElement` 和 [Rect](/zh/api/basic/rect) 等，同时还可以指定填充重复方向：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*cRmFTItZOtYAAAAAAAAAAAAAARQnAQ" width="400" alt="pattern">

在支持 Pattern 的样式属性（例如 `fill`）中，可以使用一个对象描述，包含来源、填充模式和变换：

```js
rect.style.fill = {
    image: 'http://example.png',
    repetition: 'repeat',
    transform: 'rotate(30deg)',
};
```

支持的参数如下：

```ts
interface Pattern {
    image: string | CanvasImageSource | Rect;
    repetition?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
    transform?: string;
}
```

## image

必填。支持以下来源：

-   图片 URL，例如 `'http://example.png'`
-   HTMLImageElement
-   HTMLCanvasElement
-   HTMLVideoElement
-   [Rect](/zh/api/basic/rect)

### 图片 URL

这是较为常见的一种用法，使用图片 URL 作为 Pattern 来源：

```js
// <img> URL
rect.style.fill = {
    image: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*jgjxQ57sACsAAAAAAAAAAAAAARQnAQ',
    repetition: 'repeat',
};
```

### HTMLImageElement

除了使用图片 URL，还可以传入 [Image](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image) 对象作为来源：

```js
// HTMLImageElement(<img>)
const image = new window.Image();
image.onload = () => {
    const rect2 = new Rect({
        style: {
            x: 300,
            y: 50,
            width: 200,
            height: 100,
            fill: {
                image,
                repetition: 'repeat',
            },
        },
    });
};
image.crossOrigin = 'Anonymous';
image.src =
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*jgjxQ57sACsAAAAAAAAAAAAAARQnAQ';
```

### HTMLVideoElement

`<video>` 也可以作为填充来源。

```js
// HTMLVideoElement(<video>)
const video = document.createElement('video');
video.src =
    'https://gw.alipayobjects.com/v/rms_6ae20b/afts/video/A*VD0TTbZB9WMAAAAAAAAAAAAAARQnAQ/720P';
video.crossOrigin = 'Anonymous';
video.autoplay = true;
video.controls = false;
video.muted = true;
video.height = 100;
video.width = 200;

video.onloadeddata = function () {
    const rect5 = new Rect({
        style: {
            x: 50,
            y: 350,
            width: 200,
            height: 100,
            fill: {
                image: video,
                repetition: 'no-repeat',
            },
        },
    });
    canvas.appendChild(rect5);
};
```

### HTMLCanvasElement

除了使用图片、视频作为来源，还可以使用程序化生成，此时就需要使用到 `<canvas>` 以及原生 [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)。

在该[示例](/zh/examples/style/pattern/#pattern)中，我们使用了 HTMLCanvasElement 先绘制了一个 20 \* 20 的模版，再使用它进行填充：

```js
// @see https://observablehq.com/@awoodruff/canvas-cartography-nacis-2019
const patternCanvas = document.createElement('canvas');
patternCanvas.width = 20;
patternCanvas.height = 20;
const ctx = patternCanvas.getContext('2d');
ctx.strokeStyle = '#333';
ctx.lineWidth = 1;
ctx.beginPath();
for (let i = 0.5; i < 20; i += 5) {
    ctx.moveTo(0, i);
    ctx.lineTo(20, i);
}
ctx.stroke();

const rect3 = new Rect({
    style: {
        x: 50,
        y: 200,
        width: 200,
        height: 100,
        fill: {
            image: patternCanvas,
            repetition: 'repeat',
        },
    },
});
```

### Rect

上述使用原生 [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) 程序化生成 Pattern 有以下局限性：

-   如果想在 SVG 渲染器中使用 Canvas API 生成的 Pattern，只能通过引用 Canvas 导出图片的方式，这将导致丧失矢量图的优秀特性，例如放大后变模糊
-   学习成本高，尤其是复杂 Pattern 定义困难

因此我们希望使用 G 的图形 API 定义 Pattern，与定义场景保持一致。一方面统一的描述能力提升易用性，让用户不必接触底层渲染 API；另一方面也让我们得以在不同渲染器中使用不同的 Pattern 实现，例如在 SVG 中使用原生 `<pattern>` 提升清晰度，下图为放大后 Canvas 和 SVG 的对比。

<img src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*asBpS647S0EAAAAAAAAAAAAADmJ7AQ/original" alt="canvas vs svg pattern" width="400">

在下面的 [示例](/zh/examples/style/pattern#rect) 中，我们创建了一个 `16 * 16` 的 Pattern，白色背景上包含一个红点。可以看出和常规定义场景的用法别无二致：

```js
const background = new Rect({
    style: {
        width: 16,
        height: 16,
        fill: 'red',
    },
});
const dot = new Circle({
    style: {
        cx: 8,
        cy: 8,
        r: 6,
        fill: 'white',
    },
});
background.appendChild(dot);
```

然后将 Pattern 平铺应用图形上，同时通过 [transform](/zh/api/css/pattern#transform) 旋转一定角度：

```js
const rect = new Rect({
    style: {
        fill: {
            image: background,
            repetition: 'repeat',
            transform: 'rotate(30deg)',
        },
    },
});
```

效果如下：

<img src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*8kA4QZ8xU88AAAAAAAAAAAAADmJ7AQ/original" alt="rect as pattern" width="300">

最后下面提到的 [g-pattern](/api/css/pattern#g-pattern) 也是通过这种方式定义的。

## repetition

选填。支持以下模式，可以在该[示例](/zh/examples/style/pattern/#pattern)中查看：

-   `'repeat'` 默认值，沿水平和垂直方向平铺
-   `'repeat-x'` 沿水平方向平铺
-   `'repeat-y'` 沿垂直方向平铺
-   `'no-repeat'` 不平铺

## transform

选填。有时我们希望对模式进行变换，例如旋转一定角度，此时可以使用 `transform` 属性，取值和 CSS Transform 完全一致。

在下面的[示例](/zh/examples/ecosystem/pattern/#dots)中，我们希望让模式旋转起来：

<img src="https://gw.alipayobjects.com/zos/raptor/1668740048992/Nov-18-2022%25252010-53-54.gif" alt="transform pattern">

```js
rect.style.fill = {
    image: canvas,
    repetition: 'repeat',
    transform: `rotate(30deg)`,
};
```

需要注意的是，SVG 中的 [patternTransform](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/patternTransform) 和 CSS Transform 的取值有些许不同，矢量图是没有单位的，仅支持 [transform_functions](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform#transform_functions)，因此例如 `rotate(20deg)` 需要去掉单位改写成 `rotate(20)`，`transform(20px, 30px)` 同理。但我们在内部进行了统一处理，因此可以完全使用 CSS Transform 的取值。

## g-pattern

参考 [nivo patterns](https://nivo.rocks/guides/patterns/) 我们提供了一些内置模式，还可以通过更加友好的参数调整外观。目前我们支持以下三种模式：

-   `dots` 由圆点构成的模式
-   `lines` 由直线构成的模式
-   `squares` 由正方形构成的模式

这三种模式方法签名如下，参数为模式的样式配置：

```ts
dots(cfg?: DotPatternCfg): HTMLCanvasElement;
lines(cfg?: LinePatternCfg): HTMLCanvasElement;
squares(cfg?: SquarePatternCfg): HTMLCanvasElement;
```

在该[示例](/zh/examples/ecosystem/pattern/#dots)中，我们使用了圆点模式，并通过 [transform](/api/css/css-properties-values-api#transform) 对其进行了一些变换：

```js
import { dots } from '@antv/g-pattern';

rect.style.fill = {
    image: dots({
        size: 6,
        padding: 2,
        fill: '#ff0000',
        isStagger: true,
    }),
    repetition: 'repeat',
    transform: `rotate(30deg) scale(1.2)`,
};
```

三种模式支持的样式配置公共属性如下：

| 属性名            | 类型   | 介绍                                                                          |
| ----------------- | ------ | ----------------------------------------------------------------------------- |
| backgroundColor   | string | 贴图的背景色，默认值为 `'transparent'`                                        |
| backgroundOpacity | number | 贴图的背景色透明度，默认值为 `1`                                              |
| fill              | string | 贴图元素的填充色，`dots` 和 `squares` 默认值为 `'#fff'`，                     |
| fillOpacity       | number | 贴图元素填充的透明度，默认值为 1                                              |
| stroke            | string | 贴图元素的描边色，`dots` 和 `squares` 为 `'transparent'`，`lines` 为 `'#fff'` |
| strokeOpacity     | number | 贴图元素的描边透明度色，默认值为 1                                            |
| lineWidth         | number | 贴图元素的描边粗细，`dots` 和 `squares` 为 `0`，`lines` 为 `2`                |
| opacity           | number | 贴图元素整体的透明度，默认值为 1                                              |

### dots

`dots` 模式支持额外配置如下，[示例](/zh/examples/ecosystem/pattern/#dots)：

<img src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*Xce3RrT3zAMAAAAAAAAAAAAADmJ7AQ/original" alt="dots pattern" width="200">

| 属性名    | 类型    | 介绍                          |
| --------- | ------- | ----------------------------- |
| size      | number  | 圆点的大小，默认为 6          |
| padding   | number  | 圆点之间的间隔，默认为 2      |
| isStagger | boolean | 圆点之间是否交错，默认为 true |

### lines

`lines` 模式支持额外配置如下，[示例](/zh/examples/ecosystem/pattern/#lines)：

<img src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*cQp7TrgGMoUAAAAAAAAAAAAADmJ7AQ/original" alt="lines pattern" width="200">

| 属性名  | 类型   | 介绍                       |
| ------- | ------ | -------------------------- |
| spacing | number | 两条线之间的距离，默认为 5 |

### squares

`squares` 模式支持额外配置如下，[示例](/zh/examples/ecosystem/pattern/#squares)：

<img src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*JB3lRoeyzdIAAAAAAAAAAAAADmJ7AQ/original" alt="squares pattern" width="200">

| 属性名    | 类型    | 介绍                          |
| --------- | ------- | ----------------------------- |
| size      | number  | 矩形的大小，默认为 6          |
| padding   | number  | 矩形之间的间隔，默认为 1      |
| isStagger | boolean | 矩形之间是否交错，默认为 true |

## 常见问题

### 能否使用除 Rect 之外的图形作为 Pattern 来源？

不能。使用 Rect 描述 Pattern 是非常合适的，其宽高刚好可以作为 Pattern 的尺寸，而填充色也代表了背景色。

在描述复杂 pattern 时利用场景图能力，可以在其中添加基础图形作为其子元素。

### Rect 作为 Pattern 时能否动态更新？

暂不支持。如果要更新，请重新创建一个 Rect。

### 历史用法

不再推荐使用 4.0 中支持的如下格式，可以看出无论在记忆成本还是表达能力上都有很大局限性。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8FjsSoqE1mYAAAAAAAAAAABkARQnAQ" alt="legacy usage of pattern">

-   `p`: 表示使用纹理，绿色的字体为可变量，由用户自己填写。
-   `a`: 该模式在水平和垂直方向重复；
-   `x`: 该模式只在水平方向重复；
-   `y`: 该模式只在垂直方向重复；
-   `n`: 该模式只显示一次（不重复）。
-   纹理的内容可以直接是图片或者 [Data URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)。

```js
// example
// 使用纹理填充，在水平和垂直方向重复图片
fill: 'p(a)https://gw.alipayobjects.com/zos/rmsportal/ibtwzHXSxomqbZCPMLqS.png';
```
