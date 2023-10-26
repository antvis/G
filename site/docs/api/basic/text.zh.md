---
title: Text 文本
order: 1
---

提供简单的单行/多行文本排版能力，单行支持水平对齐、字符间距；多行支持显式换行符以及自动换行，垂直对齐。

可以在该 [示例](/zh/examples/shape/text/#text) 中调整以下属性。

## 继承自

-   [DisplayObject](/zh/api/basic/display-object)

文本/文本块的位置通过文本锚点描述，围绕该锚点通过 `textBaseline`（单行/多行）、`textAlign`（多行）等属性调整自身位置。

## text

必填项，文本内容，可以包含换行符，例如 `"测试文本\n另起一行"`

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| ''                                                            | -        | 否                                    | 否           | [\<string\>](/zh/api/css/css-properties-values-api#string)     |

## textTransform

与 [CSS text-transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/text-transform) 一致，对文本内容进行转换，仅影响视觉效果，原始文本内容不变，支持以下枚举值：

-   `'capitalize'` 首字母大写
-   `'uppercase'` 全大写
-   `'lowercase'` 全小写
-   `'none'` 不做转换，默认值

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| 'none'                                                        | -        | 否                                    | 否           | [\<keywords\>](/zh/api/css/css-properties-values-api#keywords) |

## dx / dy

与 [SVG dx / dy 属性](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/dx)对应，在水平和垂直方向增加偏移量

支持 `px` 和 `em` 两种单位，使用 `number` 类型时默认 `px` 单位：

```js
{
    dx: 10;
    dx: '10px';
    dx: '0.5em';
}
```

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

## isBillboard

在 3D 场景下是否永远面朝相机，默认为 `false`，也称作“公告牌效果”。

在[示例](/zh/examples/3d/3d-basic#billboard)中，未开启情况下在相机发生旋转时，文本会呈现被压缩的效果：

![disable billboard effect](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*i7kASr_GZhUAAAAAAAAAAAAADmJ7AQ/original)

开启后并不会改变文本的位置，但它会始终面朝相机。这也符合通常 3D 场景下对于文本这类 2D 图形的需求：

![enable billboard effect](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*5cNIQ40b4IIAAAAAAAAAAAAADmJ7AQ/original)

## billboardRotation

公告牌模式下的旋转角度，顺时针方向以 radians 为单位。

在[示例](/zh/examples/3d/3d-basic#billboard)中，我们为文本增加一个旋转角度：

```js
label.style.isBillboard = true;
label.style.billboardRotation = Math.PI / 8;
```

![billboard rotation](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*v8ngTbgkP-MAAAAAAAAAAAAADmJ7AQ/original)

## isSizeAttenuation

在透视投影下，是否进行尺寸衰减。在透视投影中遵循“近大远小”的视觉效果，如果希望保持大小始终一致不受深度影响，可以开启该选项。

在[示例](/zh/examples/3d/3d-basic#size-attenuation)中，我们为文本开启了尺寸衰减：

```js
label.style.isSizeAttenuation = true;
```

![enable size attenuation](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*9SMLQpVThc4AAAAAAAAAAAAADmJ7AQ/original)

## 字体相关

### fontFamily

字体类型，例如 `'PingFang SC'` `'Microsoft Yahei'`。

与 [CSS font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family) 一致。

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| ''                                                            | -        | 是                                    | 否           | [\<keywords\>](/zh/api/css/css-properties-values-api#keywords) |

### fontSize

字体大小。

与 [CSS font-size](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size) 一致。

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value)                                                                |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| '16px'                                                        | -        | 是                                    | 是           | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### fontWeight

字体粗细。

与 [CSS font-weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight) 一致。

支持以下值：

-   `'normal'` 正常粗细度，等于 `400`
-   `'bold'` 加粗，等于 `700`
-   `'bolder'`
-   `'lighter'`
-   `number` `1` 到 `1000` 之间的值。

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| 'normal'                                                      | -        | 是                                    | 否           | [\<keywords\>](/zh/api/css/css-properties-values-api#keywords) |

### fontStyle

字体样式。

与 [CSS font-style](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style) 一致。

例如下图为倾斜 `italic` 效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*DQivSL2Oll0AAAAAAAAAAAAAARQnAQ" alt="fontstyle" width="400">

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| 'normal'                                                      | -        | 是                                    | 否           | [\<keywords\>](/zh/api/css/css-properties-values-api#keywords) |

### fontVariant

字体样式。

与 [CSS font-variant](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant) 一致。

支持以下取值：

-   `'normal'` 默认值
-   `'small-caps'`

例如下图为 `small-cap` 效果

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*DQivSL2Oll0AAAAAAAAAAAAAARQnAQ" alt="font variant" width="400">

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| 'normal'                                                      | -        | 是                                    | 否           | [\<keywords\>](/zh/api/css/css-properties-values-api#keywords) |

## 单行布局

### textBaseline

在垂直方向的对齐通过该属性实现，

与 [Canvas textBaseline](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline) 一致。下图展示了不同取值下的对齐效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*1g1SQZlEBCAAAAAAAAAAAAAAARQnAQ" alt="text baseline" width="400">

以文本当前位置为锚点，下图依次展示了 `top` `middle` 和 `bottom` 的效果。除了单行也适用于多行文本块：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*ZJzIQKBhAnUAAAAAAAAAAAAAARQnAQ" alt="text baseline" width="400">

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| 'alphabetic'                                                  | -        | 是                                    | 否           | [\<keywords\>](/zh/api/css/css-properties-values-api#keywords) |

### letterSpacing

字符间距。

与 [Canvas letterSpacing](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/letterSpacing) 一致。

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| '0'                                                           | -        | 是                                    | 否           | [\<length\>](/zh/api/css/css-properties-values-api#length)     |

## 多行布局

在以下两种情况下会出现换行：

1. 文本中的换行符
2. 开启 `wordWrap` 后，超出 `wordWrapWidth` 的部分自动换行，类似 CSS 中的 `word-break`

因此在解析原始文本时，需要考虑这两种情况。但在处理 CJK(Chinese/Japanese/Korean) 字符时，需要考虑它们的特殊语言规范。事实上 CSS 的 `word-break` 也提供了考虑 CJK 情况的值。

### textAlign

在多行文本中，每一行可以在水平方向以锚点（anchor）对齐。

与 [CSS text-align](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align) 一致。

支持以下取值：

-   `'start'`
-   `'center'`
-   `'end'`
-   `'left'` 与 `'start'` 一致。
-   `'right'` 与 `'end'` 一致。

下图依次展示了 `left` `center` 和 `right` 的效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*tyAzR7Y11oIAAAAAAAAAAAAAARQnAQ" alt="text align" width="400">

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| 'left'                                                        | -        | 是                                    | 否           | [\<keywords\>](/zh/api/css/css-properties-values-api#keywords) |

### wordWrap

是否开启自动折行，默认值为 `false`。

### wordWrapWidth

开启自动折行后，超出该宽度则换行。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*FdtgQLndl8IAAAAAAAAAAAAAARQnAQ" alt="wordWrapWidth" width="600">

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 否           | [\<length\>](/zh/api/css/css-properties-values-api#length)     |

### textOverflow

用于确定如何提示用户存在隐藏的文本溢出内容，例如直接裁剪、追加省略号或一个自定义字符串。需要配合 [wordWrap](/zh/api/basic/text#wordwrap) ，[wordWrapWidth](/zh/api/basic/text#wordwrapwidth) 和 [maxLines](/zh/api/basic/text#maxlines) 一起使用。

与 [CSS text-overflow](https://developer.mozilla.org/zh-CN/docs/Web/CSS/text-overflow) 一致。

支持以下取值：

-   `'clip'` 直接截断文本
-   `'ellipsis'` 使用 `...` 表示被截断的文本
-   自定义字符串，使用它表示被截断的文本

注意事项：

-   `'clip'` 和 `'ellipsis'` 为保留字，因此自定义字符串不能使用它们。
-   如果自定义文本长度超出 [wordWrapWidth](/zh/api/basic/text#wordwrapwidth)，将直接截断，效果等同于 `'clip'`。
-   截断仅影响视觉效果，原始文本内容 [text](/zh/api/basic/text#text) 不受影响

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| 'clip'                                                        | -        | 否                                    | 否           | [\<keywords\>](/zh/api/css/css-properties-values-api#keywords) |

### maxLines

最大行数，文本超出后将被截断，需要配合 [wordWrap](/zh/api/basic/text#wordwrap) ，[wordWrapWidth](/zh/api/basic/text#wordwrapwidth) 和 [textOverflow](/zh/api/basic/text#textoverflow) 一起使用。

下图展示了限制文本在一行展示，超出后使用省略号截断：

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*vGk_TL5e2gEAAAAAAAAAAAAAARQnAQ" alt="text overflow" width="400">

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| 'Infinity'                                                    | -        | 否                                    | 否           | [\<number\>](/zh/api/css/css-properties-values-api#number)     |

### lineHeight

行高。

与 [CSS line-height](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height) 保持一致。

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 是           | [\<length\>](/zh/api/css/css-properties-values-api#length)     |

### leading

行间距。

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| ------------------------------------------------------------- | -------- | ------------------------------------- | ------------ | -------------------------------------------------------------- |
| '0'                                                           | -        | 否                                    | 否           | [\<length\>](/zh/api/css/css-properties-values-api#length)     |

## [WIP] 阴影

## 方法

### getLineBoundingRects

获取每一行文本的包围盒，例如：

```js
text.getLineBoundingRects(); // Rectangle[]
```

其中包围盒结构如下，其中 x/y 相对于文本的局部坐标系：

```js
interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}
```

在[示例](/zh/examples/shape/text#text)中，我们绘制出了多行文本中每一行的包围盒，可以根据包围盒信息实现例如下划线、删除线等高级文本特性：

![getLineBoundingRects](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*4bL1QaVJ40MAAAAAAAAAAAAAARQnAQ)

```js
text.getLineBoundingRects().forEach(({ x, y, width, height }) => {
    const block = new Rect({
        style: {
            x,
            y,
            width,
            height,
            stroke: 'black',
            lineWidth: 2,
        },
    });
    text.appendChild(block);
});
```

### isOverflowing

用于判断是否有溢出内容。便于类似 Tooltip 组件判定是否需要展示完整文本。

```js
text.isOverflowing(); // true
```

需要注意的是，存在折行并不意味着一定有溢出内容。例如下图即使设置了 `maxLines` 和 `wordWrapWidth`，但内容并不存在溢出情况，该方法返回 `false`：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*4bL1QaVJ40MAAAAAAAAAAAAAARQnAQ" alt="no onverflowing" width="200">

而只有内容确实存在溢出情况，即 [textOverflow](/zh/api/basic/text#textoverflow) 属性确实生效（无论它的取值是啥），才会返回 `true`：

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*vGk_TL5e2gEAAAAAAAAAAAAAARQnAQ" alt="text overflow" width="400">

## 加载字体

除了系统默认字体，有时我们希望加载第三方字体。

此时可以使用 [Web Font Loader](https://github.com/typekit/webfontloader)，在加载成功的 `active` 回调函数中创建，[示例](/zh/examples/shape/text/#web-font-loader)：

```js
import WebFont from 'webfontloader';

WebFont.load({
    google: {
        families: ['Gaegu'],
    },
    active: () => {
        const text = new Text({
            style: {
                x: 100,
                y: 100,
                fontFamily: 'Gaegu',
                text: 'Almost before we knew it, we had left the ground.',
                fontSize: 30,
                fill: '#1890FF',
                stroke: '#F04864',
                lineWidth: 5,
            },
        });
        canvas.appendChild(text);
    },
});
```

## 更多基于 CanvasKit 的配置项

CanvasKit 提供了 [众多文本段落增强功能](/zh/api/renderer/canvaskit#text-paragraphs)。 我们将这些能力整合进了 [g-canvaskit](/zh/api/renderer/canvaskit) 渲染器中。

## 常见问题

### 包围盒获取不准确

由于 Text 的很多属性都是可继承的，这意味着如果未显式传入它们的值，只有在加入文档后才能获取到正确的继承值，从而计算得到精确的包围盒。如果确实想在加入文档前获取包围盒大小，例如实例化之后立刻获取到精确的包围盒，需要手动传入它们的值：

```js
const text = new Text({
    style: {
        text: 'abcde',
    },
});
text.getBounds(); // Wrong empty bounding box.

text.attr({
    fontSize: '16px',
    fontFamily: 'sans-serif',
    fontWeight: 'normal',
    fontVariant: 'normal',
    fontStyle: 'normal',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    lineWidth: 0,
});
text.getBounds(); // Right bounding box.
```
