---
title: Text
order: 1
---

Provides simple single/multi-line text layout capabilities, with single-line support for horizontal alignment and character spacing; multi-line support for explicit line breaks as well as automatic line breaks and vertical alignment.

The following properties can be adjusted in this [example](/en/examples/shape/text/#text).

## Inherited from

-   [DisplayObject](/en/api/basic/display-object)

The position of a text/text block is described by a text anchor point around which it adjusts itself through properties such as `textBaseline` (single/multi-line), `textAlign` (multi-line), etc.

## text

Text content, which can contain line breaks, e.g. `"test text \n another line"`

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| ''                                                                   | -                   | no                                     | no         | [\<string\>](/en/api/css/css-properties-values-api#string)             |

## textTransform

Consistent with [CSS text-transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/text-transform), the following enumeration values are supported for text content transformation.

-   `'capitalize'`
-   `'uppercase'`
-   `'lowercase'`
-   `'none'` default value

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| 'none'                                                               | -                   | no                                     | no         | [\<keywords\>](/en/api/css/css-properties-values-api#keywords)         |

## dx / dy

Corresponds to the [SVG dx / dy attribute](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/dx) to add offsets in the horizontal and vertical directions.

Both `px` and `em` units are supported, and the default `px` unit when using the `number` type.

```js
{
    dx: 10;
    dx: '10px';
    dx: '0.5em';
}
```

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

## isBillboard

Whether or not to always face the camera in 3D scenes, defaults to `false`, also known as the "billboard effect".

In [example](/en/examples/3d/3d-basic#billboard), the text is rendered compressed when the camera is rotated without being turned on:

![disable billboard effect](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*i7kASr_GZhUAAAAAAAAAAAAADmJ7AQ/original)

Turning it on doesn't change the position of the text, but it will always face the camera. This is in line with what is usually required for 2D graphics like text in 3D scenes:

![enable billboard effect](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*5cNIQ40b4IIAAAAAAAAAAAAADmJ7AQ/original)

## billboardRotation

Rotation angle in billboard mode, clockwise in radians.

In [example](/zh/examples/3d/3d-basic#billboard), we add a rotation angle to the text:

```js
label.style.isBillboard = true;
label.style.billboardRotation = Math.PI / 8;
```

![billboard rotation](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*v8ngTbgkP-MAAAAAAAAAAAAADmJ7AQ/original)

## isSizeAttenuation

Whether or not to apply size attenuation in perspective projection. This option can be turned on if you want to keep the size consistent regardless of depth, following the "near big, far small" visual effect in perspective projection.

In [example](/en/examples/3d/3d-basic#size-attenuation), we enable size attenuation for text:

```js
label.style.isSizeAttenuation = true;
```

![enable size attenuation](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*9SMLQpVThc4AAAAAAAAAAAAADmJ7AQ/original)

## Font Related

### fontFamily

Font type, e.g. `'PingFang SC'` `'Microsoft Yahei'`

Corresponds to the [CSS font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family).

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| ''                                                                   | -                   | yes                                    | no         | [\<keywords\>](/en/api/css/css-properties-values-api#keywords)         |

### fontSize

Corresponds to the [CSS font-size](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size).

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '16px'                                                               | -                   | yes                                    | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### fontWeight

Corresponds to the [CSS font-weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight).

-   `'normal'` Normal font weight. Same as 400.
-   `'bold'` Bold font weight. Same as 700.
-   `'bolder'`
-   `'lighter'`
-   `number` A number value between 1 and 1000.

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| 'normal'                                                             | -                   | yes                                    | no         | [\<keywords\>](/en/api/css/css-properties-values-api#keywords)         |

### fontStyle

Corresponds to the [CSS font-style](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style).

Font style, for example, the image below shows the tilted `italic` effect.

![fontStyle](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*DQivSL2Oll0AAAAAAAAAAAAAARQnAQ)

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| 'normal'                                                             | -                   | yes                                    | no         | [\<keywords\>](/en/api/css/css-properties-values-api#keywords)         |

### fontVariant

Corresponds to the [CSS font-variant](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant).

Font style, for example, the following image is the `small-cap` effect.

![fontVariant](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*DQivSL2Oll0AAAAAAAAAAAAAARQnAQ)

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| 'normal'                                                             | -                   | yes                                    | no         | [\<keywords\>](/en/api/css/css-properties-values-api#keywords)         |

## Single row layout

### textBaseline

Corresponds to the [Canvas textBaseline](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline).

Alignment in the vertical direction is achieved by `textBaseline`, and the following figure shows the effect of alignment with different values.

![textBaseline](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*1g1SQZlEBCAAAAAAAAAAAAAAARQnAQ)

Using the current position of the text as the anchor point, the following figure shows the effect of `top`, `middle` and `bottom` in turn. In addition to single line also applies to multi-line text blocks.

![textBaseline](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*ZJzIQKBhAnUAAAAAAAAAAAAAARQnAQ)

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| 'alphabetic'                                                         | -                   | yes                                    | no         | [\<keywords\>](/en/api/css/css-properties-values-api#keywords)         |

### letterSpacing

Corresponds to the [Canvas letterSpacing](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/letterSpacing).

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | -                   | yes                                    | no         | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

## Multi-row layout

Line feeds occur in the following two cases:

1. Line breaks in text
2. When `wordWrap` is turned on, the part beyond `wordWrapWidth` will be automatically line wrapped, similar to `word-break` in CSS.

Therefore, both cases need to be considered when parsing raw text. However, when dealing with CJK (Chinese/Japanese/Korean) characters, their special language specification needs to be taken into account. In fact, the CSS `word-break` also provides a value that takes into account the CJK case.

### textAlign

Corresponds to the [CSS text-align](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align).

In multi-line text, each line can be horizontally aligned with an anchor

-   `'start'`
-   `'center'`
-   `'end'`
-   `'left'` Same as `'start'`.
-   `'right'` Same as `'end'`.

The following figure shows the effect of `left`, `center` and `right` in that order:

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*tyAzR7Y11oIAAAAAAAAAAAAAARQnAQ" alt="text align" width="400">

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| 'left'                                                               | -                   | yes                                    | no         | [\<keywords\>](/en/api/css/css-properties-values-api#keywords)         |

### wordWrap

Whether to turn on automatic line feed, default value is `false`.

### wordWrapWidth

When `wordWrap` is turned on, the line will break beyond that width.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*FdtgQLndl8IAAAAAAAAAAAAAARQnAQ" alt="wordWrapWidth" width="600">

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| '0'                                                                  | -                   | yes                                    | no         | [\<length\>](/en/api/css/css-properties-values-api#length)             |

### textOverflow

Used to determine how to prompt the user for the presence of hidden text overflow content, such as direct cropping, appending an ellipsis or a custom string. Need to be used with [wordWrap](/en/api/basic/text#wordwrap), [wordWrapWidth](/en/api/basic/text#wordwrapwidth) and [maxLines](/en/api/ basic/text#maxlines) are used together.

Corresponds to the [CSS text-overflow](https://developer.mozilla.org/zh-CN/docs/Web/CSS/text-overflow).

The following values are supported.

-   `'clip'` truncates the text directly
-   `'ellipsis'` uses `...` to indicate the truncated text
-   Custom strings, using it to indicate the truncated text

Caution.

-   `'clip'` and `'ellipsis'` are reserved words, so custom strings cannot use them.
-   If the length of custom text exceeds [wordWrapWidth](/en/api/basic/text#wordwrapwidth), it will be truncated directly, and the effect is the same as `'clip'`.
-   The truncation only affects the visual effect, the original text content [text](/en/api/basic/text#text) is not affected

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| 'clip'                                                               | -                   | no                                     | no         | [\<keywords\>](/en/api/css/css-properties-values-api#keywords)         |

### maxLines

Max lines, text overflow will be truncated, need to use with [wordWrap](/en/api/basic/text#wordwrap), [wordWrapWidth](/en/api/basic/text#wordwrapwidth) and [textOverflow](/en/api/basic/text#textoverflow) are used together.

The following figure shows limiting text to be displayed on one line and truncated with an ellipsis after it is exceeded.

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*vGk_TL5e2gEAAAAAAAAAAAAAARQnAQ" alt="text overflow" width="400">

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| 'Infinity'                                                           | -                   | no                                     | no         | [\<number\>](/en/api/css/css-properties-values-api#number)             |

### lineHeight

Corresponds to the [CSS line-height](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height).

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | yes        | [\<length\>](/en/api/css/css-properties-values-api#length)             |

### leading

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| '0'                                                                  | -                   | no                                     | no         | [\<length\>](/en/api/css/css-properties-values-api#length)             |

## Methods

### getLineBoundingRects

Get the bounding box for each line of text, e.g.:

```js
text.getLineBoundingRects(); // Rectangle[]
```

where the enclosing box structure is as follows, where x/y is relative to the local coordinate system of the text:

```js
interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}
```

In [example](/en/examples/shape/text#text), we draw the bounding box for each line of the multi-line text, and we can implement advanced text features such as underline and strikethrough based on the bounding box information:

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

Used to determine if there is overflow content. Useful for Tooltip-like components to determine if the full text needs to be displayed.

```js
text.isOverflowing(); // true
```

Note that the presence of a line break does not necessarily mean that there is overflow. For example, in the following figure, even though `maxLines` and `wordWrapWidth` are set, there is no content overflow and the method returns `false`.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*4bL1QaVJ40MAAAAAAAAAAAAAARQnAQ" alt="no onverflowing" width="200">

And only if the content does overflow, i.e. the [textOverflow](/en/api/basic/text#textoverflow) attribute does take effect (whatever its value is), will it return `true`.

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*vGk_TL5e2gEAAAAAAAAAAAAAARQnAQ" alt="text overflow" width="400">

## Loading Fonts

In addition to the system default fonts, sometimes we want to load third-party fonts.

In this case, you can use [Web Font Loader](https://github.com/typekit/webfontloader), which is created in the `active` callback function when it is loaded successfully, [example](/en/examples/shape/text/#web-font-loader):

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

## More CanvasKit-based configuration items

CanvasKit provides [enhanced paragraph drawing capabilities](/en/api/renderer/canvaskit#text-paragraphs). We've integrated them into our [g-canvaskit](/en/api/renderer/canvaskit) renderer.

## FAQ

### The bounding box acquisition is not accurate

Since many properties of Text are inheritable, this means that if their values are not explicitly passed in, the correct inherited value can only be obtained after adding the document, so as to calculate an accurate bounding box. If you really want to get the size of the bounding box before adding the document, for example, to get the exact bounding box immediately after instantiation, you need to manually pass in their values:

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
