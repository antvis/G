---
title: CSS Properties & Values API
order: 2
---

有了 [CSS Typed OM](/zh/api/css/css-typed-om) 我们能方便地定义例如 `CSS.px(5)` 这样的属性值，但属性并不只有值。

在浏览器中 [CSS Properties & Values API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Properties_and_Values_API) 允许用户自定义 CSS 属性并为其配置类型检查、默认值、是否支持继承等元数据，它也是 CSS Houdini 的一部分。

例如下面展示了如何自定义一个颜色属性：

```js
window.CSS.registerProperty({
    name: '--my-color',
    syntax: '<color>',
    inherits: false,
    initialValue: '#c0ffee',
});
```

我们在 G 中也实现了这一 API，定义了一系列内置的属性值类型。

# 属性值类型

CSS 属性值包含各种类型：https://drafts.csswg.org/css-values-4/

在 G 中我们支持以下类型：

-   关键词，例如 `unset` `center`
-   数值
    -   \<color\> 颜色值，例如 `red`
    -   \<paint\> 绘制，包含颜色值
    -   \<percentage\> 百分比，例如 `%`
    -   \<number\> 纯数字
    -   \<length\> 带单位的长度值 `px` `em` `rem`
    -   \<angle\> 带单位的角度值，例如 `deg` `rad` `turn`

在部分场景下，这些类型可以进行组合，例如：\<length-percentage\> 就是 \<length\> 和 \<percentage\> 的组合。

## 关键词

对应 [CSS Typed OM](/zh/api/css/css-typed-om) 中的 [CSSKeywordValue](/zh/api/css/css-typed-om#csskeywordvalue)。

例如会被解析成：

```js
text.style.fontWeight = 'normal';

const styleMap = text.computedStyleMap();
styleMap.get('fontWeight'); // CSSKeywordValue { value: 'normal' }
```

和 CSS 一样，全局关键词如下。

### initial

该关键词为元素应用“默认值”，可以用来重置继承属性。

例如下面的例子中，`<em>` 本应继承 `<p>` 定义的 `color` 属性，但它通过 `initial` 应用默认值（黑色），覆盖掉了继承值：

```css
p {
  color: red;
}
em {
  color: initial;
}

<p>
  <span>This text is red.</span>
  <em>This text is in the initial color (typically black).</em>
  <span>This is red again.</span>
</p>
```

https://developer.mozilla.org/en-US/docs/Web/CSS/initial

### inherit

https://developer.mozilla.org/en-US/docs/Web/CSS/inherit

### unset

https://developer.mozilla.org/en-US/docs/Web/CSS/unset

## \<number\>

对应 [CSS Typed OM](/zh/api/css/css-typed-om) 中的 [CSSUnitValue](/zh/api/css/css-typed-om#cssunitvalue)，无单位。

目前使用该类型的属性值包括：

-   [opacity](/zh/api/basic/display-object#opacity)
-   [fillOpacity](/zh/api/basic/display-object#fillopacity)
-   [strokeOpacity](/zh/api/basic/display-object#strokeopacity)

```js
circle.style.opacity = '0.5';

const styleMap = circle.computedStyleMap();
styleMap.get('opacity'); // CSSUnitValue { unit:'', value: 0.5 }
```

## \<length\>

长度类型用于定义距离，而距离又包括绝对和相对类型。

https://drafts.csswg.org/css-values-4/#length-value

### px

像素显然是一种绝对单位，如果一个长度值使用 `number` 默认单位就是 `px`。随后被解析成 `CSS.px()`：

```js
circle.style.r = 10;
// or
circle.style.r = '10px';

const styleMap = circle.computedStyleMap();
styleMap.get('r'); // CSSUnitValue { unit: 'px', value: 10 }
```

### rem

这个单位代表根元素的 font-size 大小。当用在根元素的 font-size 上面时，它代表了它的初始值。

### em

相对长度单位，这个单位表示元素的 font-size 的计算值。如果用在 font-size 属性本身，它则表示元素继承的 font-size 值。

## \<percentage\>

https://drafts.csswg.org/css-values-4/#percentage-value

## \<angle\>

https://drafts.csswg.org/css-values-4/#angle-value

### deg

度。一个完整的圆是 360deg。例：0deg，90deg，14.23deg。

### grad

百分度。一个完整的圆是 400grad。例：0grad，100grad，38.8grad。

### rad

弧度。一个完整的圆是 2π 弧度，约等于 6.2832rad。1rad 是 180/π 度。例：0rad，1.0708rad，6.2832rad。

### turn

圈数。一个完整的圆是 1turn。例：0turn，0.25turn，1.2turn。

## \<color\>

参考 CSS 规范中对于 [\<color\>](https://www.w3.org/TR/css-color-3/#valuea-def-color) 类型的定义，我们支持以下颜色值类型，它们都以 JS 中的 `string` 类型存在。

它是 [\<paint\>](/zh/api/css/painting) 包含的一种类型。

[示例](/zh/examples/style#color)。

目前会使用该类型的属性有：

-   [shadowColor]() 阴影色

### 基础颜色关键词

CSS 定义了一系列基础的颜色关键词，它们都是**大小写敏感**的。下左图展示基础的颜色关键词，下右图为部分扩展的关键词。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*NFB5T69VUUwAAAAAAAAAAAAAARQnAQ" width="300"/>
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*PKSDR4_nEgIAAAAAAAAAAAAAARQnAQ" width="300"/>

在内部实现中，我们会把关键词字符串传给 [d3-color](https://github.com/d3/d3-color) 解析，得到 [CSSRGB](/zh/api/css/css-typed-om#cssrgb)。

使用示例如下：

```js
circle.style.fill = 'red';
circle.style.fill = 'darkcyan';
```

### 数值类型

#### rgb

定义在 [sRGB](https://www.w3.org/TR/css-color-3/#ref-SRGB) 颜色空间，支持十六进制写法。

使用示例如下：

```js
circle.style.fill = '#f00';
circle.style.fill = '#ff0000';
circle.style.fill = 'rgb(255,0,0)';
circle.style.fill = 'rgb(100%, 0%, 0%)';
```

#### rgba

在 `rgb` 基础上增加透明度通道。按照[规范](https://www.w3.org/TR/css-color-3/#alphavaluedt)，`alpha` 取值范围为 `[0, 1]`。

使用示例如下：

```js
circle.style.fill = 'rgb(255,0,0)';
circle.style.fill = 'rgba(255,0,0,1)';
circle.style.fill = 'rgba(100%,0%,0%,1)';
```

#### transparent

等同于 `rgba(0,0,0,0)` 即完全透明的黑色。

注意它和 [\<paint\>](/zh/api/css/css-properties-values-api#paint) 支持的 `none` 是不同的含义。

#### [WIP] hsl

暂不支持。

#### [WIP] hsla

暂不支持。

### currentColor

https://www.w3.org/TR/css-color-3/#currentcolor

Canvas / WebGL 渲染环境中等同于 black，SVG 中为同名属性效果。

## \<gradient\>

在 CSS 中，渐变是通过函数创建的，例如线性渐变 [linear-gradient](https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient/linear-gradient)：

```css
background: linear-gradient(#e66465, #9198e5);
```

我们沿用了该语法，因此可以在支持渐变的属性中使用：

```js
rect.style.fill = 'linear-gradient(#e66465, #9198e5)';
```

其中渐变色列表 `<color-stop-list>` 形如：`radial-gradient(cyan 0%, transparent 20%, salmon 40%)`，使用 [\<color\>](/zh/api/css/css-properties-values-api#color) 和 [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) 的组合。

在该[示例](/zh/examples/style#gradient)中我们展示了目前支持的渐变效果，包括线性和径向渐变、多个渐变叠加等：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*sXoJTKPWg70AAAAAAAAAAAAAARQnAQ" width="400" alt="gradient">

### linear-gradient

线性渐变用于创建一个表示两种或多种颜色线性渐变的图片。[这个教程](https://observablehq.com/@danburzo/css-gradient-line)可以帮助你理解线性渐变方向的含义和计算逻辑。

用法完全可以参考 CSS [linear-gradient](https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient/linear-gradient)，但有以下区别：

-   渐变方向在 CSS 中默认为从下到上，而我们为了和 Canvas / SVG 保持一致，使用从左到右。

因此一个从左到右方向，旋转角度为 0 的线性渐变如下，[示例](/zh/examples/style#gradient)：

```js
rect.style.fill = 'linear-gradient(0deg, blue, green 40%, red)';
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*aU84RIJaH6AAAAAAAAAAAAAAARQnAQ" width="300" alt="linear gradient">

最后和 CSS 一致，多组渐变可以叠加：

```js
rect.style.fill = `linear-gradient(217deg, rgba(255,0,0,.8), rgba(255,0,0,0) 70.71%),
            linear-gradient(127deg, rgba(0,255,0,.8), rgba(0,255,0,0) 70.71%),
            linear-gradient(336deg, rgba(0,0,255,.8), rgba(0,0,255,0) 70.71%)`;
```

### radial-gradient

径向渐变由从原点发出的两种或者多种颜色之间的逐步过渡组成。

用法完全可以参考 CSS [radial-gradient](https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient/radial-gradient)。

因此一个渐变中心位于图形中心，从红过渡到蓝再到绿的径向渐变如下，[示例](/zh/examples/style#gradient)：

```js
rect.style.fill = 'radial-gradient(circle at center, red, blue, green 100%)';
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Z4QLTr3lC80AAAAAAAAAAAAAARQnAQ" width="300" alt="radial gradient">

注意事项：

-   形状仅支持 `circle` 不支持 `ellipse`
-   支持指定 `circle` 半径：

    -   `'closest-side'` 圆心到包围盒最近边的距离
    -   `'farthest-corner'` **默认值**。圆心到包围盒最远角的距离
    -   `'closest-corner'` 圆心到包围盒最近角的距离
    -   `'farthest-side'` 圆心到包围盒最远边的距离
    -   `<length>` 指定长度，例如 `'radial-gradient(circle 80px at center, red 100%, blue 100%)'`

下图分别展示了 `'closest-side'` `'farthest-side'` 和 `80px` 的效果：

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*eXrBQYlLENwAAAAAAAAAAAAAARQnAQ" alt="radial-gradient-closest-side" width="200">
<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*C__VRJ24rVcAAAAAAAAAAAAAARQnAQ" 
alt="radial-gradient-farthest-side" width="200">
<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*3U91RYB3DukAAAAAAAAAAAAAARQnAQ" alt="radial-gradient-size-80" width="200">

-   支持指定圆心位置，相对包围盒左上角定位，例如 `radial-gradient(circle at 50px 50px, red, blue, green 100%)`：
    -   `'top'` 上方边缘中点
    -   `'left'` 左侧边缘中点
    -   `'bottom'` 下方边缘中点
    -   `'right'` 右侧边缘中点
    -   `'center'` 水平垂直居中
    -   `'top left'` 左上角
    -   `'left top'` 同 `'top left'`
    -   `'top right'` 右上角
    -   `'bottom left'` 左下角
    -   `'bottom right'` 右下角
    -   `<length> <length>` 指定长度，例如 `'25% 25%'` 或者 `'50px 50px'`

下图分别展示了 `'50px 50px'`，`'top right'` 和 `'left'` 的效果：

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*UrmySIhRKdgAAAAAAAAAAAAAARQnAQ" alt="radial-gradient-center-50-50" width="200">
<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*ekj4TZv0Yf4AAAAAAAAAAAAAARQnAQ" alt="radial-gradient-center-top-right" width="200">
<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*bXIjTaTpC2QAAAAAAAAAAAAAARQnAQ" alt="radial-gradient-center-left" width="200">

-   和线性渐变一样，也支持多组叠加

### 历史用法

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Z5gpQL9ia9kAAAAAAAAAAABkARQnAQ)

-   `l` 表示使用线性渐变，绿色的字体为可变量，由用户自己填写。

```js
// example
// 使用渐变色描边，渐变角度为 0，渐变的起始点颜色 #ffffff，中点的渐变色为 #7ec2f3，结束的渐变色为 #1890ff
stroke: 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff';
```

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*9sc1SY2d_0AAAAAAAAAAAABkARQnAQ)

-   `r` 表示使用放射状渐变，绿色的字体为可变量，由用户自己填写，开始圆的 `x`、`y`、`r` 值均为相对值(0 至 1 范围)。

```js
// example
// 使用渐变色填充，渐变起始圆的圆心坐标为被填充物体的包围盒中心点，半径为(包围盒对角线长度 / 2) 的 0.1 倍，渐变的起始点颜色 #ffffff，中点的渐变色为 #7ec2f3，结束的渐变色为 #1890ff
fill: 'r(0.5, 0.5, 0.1) 0:#ffffff 1:#1890ff';
```

## \<pattern\>

在该[示例](/zh/examples/style#pattern)中我们展示了目前支持的模版填充效果，来源可以包括图片 URL，`HTMLImageElement` `HTMLCanvasElement` `HTMLVideoElement` 等，同时还可以指定填充重复方向：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*cRmFTItZOtYAAAAAAAAAAAAAARQnAQ" width="400" alt="pattern">

使用一个对象描述，包含来源和填充模式：

```js
rect.style.fill = {
    image: 'http://example.png',
    repetition: 'repeat',
};
```

### image

支持以下来源：

-   图片 URL，例如 `'http://example.png'`
-   HTMLImageElement
-   HTMLCanvasElement
-   HTMLVideoElement

在该[示例](/zh/examples/style#pattern)中，我们使用了 HTMLCanvasElement 先绘制了一个 20 \* 20 的模版，再使用它进行填充：

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

### repetition

支持以下模式，可以在该[示例](/zh/examples/style#pattern)中查看：

-   repeat 默认值，沿水平和垂直方向平铺
-   repeat-x 沿水平方向平铺
-   repeat-y 沿垂直方向平铺
-   no-repeat 不平铺

### transform

有时我们希望对模式进行变换，例如旋转一定角度，此时可以使用 `transform` 属性，取值和 CSS Transform 完全一致。

在下面的[示例](/zh/examples/ecosystem/pattern/#dots)中，我们希望让模式旋转起来：

<img src="https://gw.alipayobjects.com/zos/raptor/1668740048992/Nov-18-2022%25252010-53-54.gif" alt="transform pattern">

```js
rect.style.fill = {
    image: canvas,
    repetition: 'repeat',
    transform: `rotate(30deg)`,
};
```

### g-pattern

参考 [nivo patterns](https://nivo.rocks/guides/patterns/) 我们提供了一些内置模式，还可以通过更加友好的参数调整外观。目前我们支持以下三种模式：

-   `dots` 由圆点构成的模式
-   `lines` 由直线构成的模式
-   `squares` 由正方形构成的模式

这三种模式方法签名如下，第一个参数为 [Canvas](/zh/api/canvas/intro)，第二个参数为模式的样式配置：

```ts
dots(canvas: Canvas, cfg?: DotPatternCfg): HTMLCanvasElement;
lines(canvas: Canvas, cfg?: LinePatternCfg): HTMLCanvasElement;
squares(canvas: Canvas, cfg?: SquarePatternCfg): HTMLCanvasElement;
```

在该[示例](/zh/examples/ecosystem/pattern/#dots)中，我们使用了圆点模式，并通过 [transform](/api/css/css-properties-values-api#transform) 对其进行了一些变换：

```js
import { dots } from '@antv/g-pattern';

rect.style.fill = {
    image: dots(canvas, {
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

| 属性名          | 类型   | 介绍                                                                          |
| --------------- | ------ | ----------------------------------------------------------------------------- |
| backgroundColor | string | 贴图的背景色，默认值为 `'transparent'`                                        |
| fill            | string | 贴图元素的填充色，`dots` 和 `squares` 默认值为 `'#fff'`，                     |
| fillOpacity     | number | 贴图元素填充的透明度，默认值为 1                                              |
| stroke          | string | 贴图元素的描边色，`dots` 和 `squares` 为 `'transparent'`，`lines` 为 `'#fff'` |
| strokeOpacity   | number | 贴图元素的描边透明度色，默认值为 1                                            |
| lineWidth       | number | 贴图元素的描边粗细，`dots` 和 `squares` 为 `0`，`lines` 为 `2`                |
| opacity         | number | 贴图整体的透明度，默认值为 1                                                  |

`dots` 模式支持额外配置如下，[示例](/zh/examples/ecosystem/pattern/#dots)：

<img src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*Xce3RrT3zAMAAAAAAAAAAAAADmJ7AQ/original" alt="dots pattern" width="200">

| 属性名    | 类型    | 介绍                          |
| --------- | ------- | ----------------------------- |
| size      | number  | 圆点的大小，默认为 6          |
| padding   | number  | 圆点之间的间隔，默认为 2      |
| isStagger | boolean | 圆点之间是否交错，默认为 true |

`lines` 模式支持额外配置如下，[示例](/zh/examples/ecosystem/pattern/#lines)：

<img src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*cQp7TrgGMoUAAAAAAAAAAAAADmJ7AQ/original" alt="lines pattern" width="200">

| 属性名  | 类型   | 介绍                       |
| ------- | ------ | -------------------------- |
| spacing | number | 两条线之间的距离，默认为 5 |

`squares` 模式支持额外配置如下，[示例](/zh/examples/ecosystem/pattern/#squares)：

<img src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*JB3lRoeyzdIAAAAAAAAAAAAADmJ7AQ/original" alt="squares pattern" width="200">

| 属性名    | 类型    | 介绍                          |
| --------- | ------- | ----------------------------- |
| size      | number  | 矩形的大小，默认为 6          |
| padding   | number  | 矩形之间的间隔，默认为 1      |
| isStagger | boolean | 矩形之间是否交错，默认为 true |

### 历史用法

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

## \<paint\>

参考 SVG 中的 [\<paint\>](https://www.w3.org/TR/SVG/painting.html#SpecifyingPaint)，它是以下类型的并集：

```js
<paint> = none | <color> | <gradient> | <pattern>
```

[示例](/zh/examples/style#paint)。

目前使用的属性有：

-   [fill](/zh/api/basic/display-object#fill) 填充色
-   [stroke](/zh/api/basic/display-object#stroke) 描边色

### none

不使用任何颜色，并不等于 [\<color\>](/zh/api/css/css-properties-values-api#color) 的 [transparent](/zh/api/css/css-properties-values-api#transparent) 关键词。以 `fill` 属性为例，两者从视觉效果上看相同，但设置为 `'transparent'` 依然可以被拾取到，设置成 `'none'` 则不会。

例如当图形在初始化未设置 `fill` 属性时，等同于创建后手动修改为 `none`：

```js
const circle = new Circle({
    r: 150,
});

circle.style.fill = 'none';
```

# 属性元数据

在 Blink 中所有的 CSS 属性元数据都定义在一个 JSON 列表中，它描述了样式系统应该如何解析、计算样式值。

属性的元数据包含以下关键信息：

-   属性名。例如 fill width r
-   值解析器。从字符串到 CSSStyleValue。不同属性值自然需要不同的解析器，例如 fill stroke 可以共享颜色解析器。注意我们只需要实现对于 “值” 的解析，而非类似 https://github.com/csstree/csstree 这样的实现。
-   是否支持插值。不支持则无法在动画系统中进行平滑过渡。https://drafts.csswg.org/css-values-4/#combining-values
-   是否支持继承。例如 font-size 需要支持。在 D3 中有大量类似的技巧。
-   是否独立。例如 visibility 就不是，需要考虑祖先节点才能得到最终的计算值。
-   默认值。例如 fill 的默认值为 black（SVG 规范）
-   关键词列表。例如 width 属性支持 auto 关键词。
-   别名列表。例如 line-width 的别名 stroke-width。

## initial value

默认值对于“属性是否支持继承”的定义不同：

https://developer.mozilla.org/en-US/docs/Web/CSS/initial_value

> -   For inherited properties, the initial value is used on the root element only, as long as no specified value is supplied.
> -   For non-inherited properties, the initial value is used on all elements, as long as no specified value is supplied.

因此对于 G 的根节点，在创建时需要设置所有 `inherited` 属性的默认值，例如 `visibility` 在属性元数据中定义如下，它支持继承：

```js
{
  name: 'visibility',
  keywords: ['visible', 'hidden'],
  inherited: true,
  interpolable: true,
  defaultValue: 'visible',
  handler: CSSPropertyVisibility,
}
```

由于支持继承，子元素虽然没有设置过 `visibility`，默认情况下得到的计算值也会是 `visible`。

## computed value

对于属性值的解析经历以下阶段：

-   原始值（通常是字符串）转换成 CSSStyleUnit，称作 computed value
-   将 computed value 计算后得到 used value

https://developer.mozilla.org/en-US/docs/Web/CSS/computed_value

在这一步需要：

-   处理特殊的关键词（通常是通用的），例如 [initial](/zh/api/css/css-properties-values-api#initial) [inherit](/zh/api/css/css-properties-values-api#inherit)
-   做一些值计算，需要布局阶段参与的除外

通过 [computedStyleMap](/zh/api/builtin-objects/element#computedstylemap) 方法可以获取 computed value map，这是一个 [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) 类型：

```js
/**
 * computed values
 */
const styleMap = circle.computedStyleMap();

expect((styleMap.get('r') as CSSUnitValue).equals(CSS.px(100))).to.be.true;
const fill = styleMap.get('fill') as CSSRGB;
expect(fill.r).to.be.eqls(255);
expect(fill.g).to.be.eqls(0);
expect(fill.b).to.be.eqls(0);
expect(fill.alpha).to.be.eqls(1);
```

但是 computed value 并不能直接用于渲染，例如百分比、相对长度都需要进一步计算。

## used value

https://developer.mozilla.org/en-US/docs/Web/CSS/used_value

进一步处理 computed value，得到最终送入渲染管线的值。

例如 `CSS.percent(50)` 需要计算得到 `CSS.px(?)`。

# 自定义属性

在 CSS 中定义新属性方法如下：

https://developer.mozilla.org/en-US/docs/Web/API/CSS/RegisterProperty

```js
CSS.registerProperty({
    name: '--my-color',
    syntax: '<color>',
    inherits: false,
    initialValue: '#c0ffee',
});
```

随后就可以在 CSS 中使用这个属性。其中比较关键的是 `syntax`，局限性是只能使用浏览器内置的实现，无法做到真正意义上的自定义解析。

在该[示例](/zh/examples/style#custom-property)中，我们注册了多种不同类型的自定义属性，让它们支持插值。

```js
import { CSS, PropertySyntax } from '@antv/g';

// 注册自定义属性
CSS.registerProperty({
    name: 'myNumber',
    syntax: PropertySyntax.NUMBER, // 使用内置的 “数字” 解析器
    initialValue: '0',
    interpolable: true, // 支持动画过程中的插值
});

// 对自定义属性应用动画
const animation = myCustomElement.animate(
    [
        {
            myNumber: 0,
        },
        {
            myNumber: 1,
        },
    ],
    { duration: 2000, fill: 'both' },
);
```

## name

字符串形式的属性名。需要保证全局唯一，不能与内置属性冲突，可加上命名空间前缀。

## inherits

是否支持继承。

## initialValue

默认值。

## interpolate

是否支持插值。只有支持才能应用[动画](/zh/api/animation/waapi)。

例如在下面的自定义元素中，我们定义了自定义属性 `angle`，它使用 `<angle>` 解析器并支持插值：

```js
CSS.registerProperty({
    name: 'angle',
    syntax: PropertySyntax.ANGLE,
    initialValue: '0',
    interpolable: true,
});
```

## syntax

目前我们支持的解析器如下：

```js
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type
 */
export enum PropertySyntax {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#coordinate
   */
  COORDINATE = '<coordinate>',
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#color
   */
  COLOR = '<color>',
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint
   */
  PAINT = '<paint>',
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number
   */
  NUMBER = '<number>',
  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/angle
   */
  ANGLE = '<angle>',
  /**
   * <number> with range 0..1
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#opacity_value
   */
  OPACITY_VALUE = '<opacity-value>',
  /**
   * <number> with range 0..Infinity
   */
  SHADOW_BLUR = '<shadow-blur>',
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length
   */
  LENGTH = '<length>',
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage
   */
  PERCENTAGE = '<percentage>',
  LENGTH_PERCENTAGE = '<length> | <percentage>',

  LENGTH_PERCENTAGE_12 = '[<length> | <percentage>]{1,2}',
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/margin#formal_syntax
   */
  LENGTH_PERCENTAGE_14 = '[<length> | <percentage>]{1,4}',
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#list-of-ts
   */
  LIST_OF_POINTS = '<list-of-points>',
  PATH = '<path>',
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/filter#formal_syntax
   */
  FILTER = '<filter>',
  Z_INDEX = '<z-index>',
  OFFSET_PATH = '<offset-path>',
  OFFSET_DISTANCE = '<offset-distance>',
  CLIP_PATH = '<clip-path>',
  TRANSFORM = '<transform>',
  TRANSFORM_ORIGIN = '<transform-origin>',
  TEXT = '<text>',
  TEXT_TRANSFORM = '<text-transform>',
}
```
