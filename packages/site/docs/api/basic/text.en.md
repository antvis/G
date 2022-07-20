---
title: Text
order: 1
---

Provides simple single/multi-line text layout capabilities, with single-line support for horizontal alignment and character spacing; multi-line support for explicit line breaks as well as automatic line breaks and vertical alignment.

The following properties can be adjusted in this [example](/en/examples/shape#text).

# Inherited from

-   [DisplayObject](/en/docs/api/basic/display-object)

The position of a text/text block is described by a text anchor point around which it adjusts itself through properties such as `textBaseline` (single/multi-line), `textAlign` (multi-line), etc.

# Additional Properties

## text

**type**: `string`

**default value**: -

**required**: `true`

**remarks**: Text content, which can contain line breaks, e.g. `"test text \n another line"`

## textTransform

**type**: `string`

**default value**: `'none'`

**required**: `false`

**remarks**: Consistent with [CSS text-transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/text-transform), the following enumeration values are supported for text content transformation.

-   `'capitalize'`
-   `'uppercase'`
-   `'lowercase'`
-   `'none'`

## dx / dy

**type**: `number` | `string`

**default value**: `0`

**required**: `false`

**remarks**: Corresponds to the [SVG dx / dy attribute](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/dx) to add offsets in the horizontal and vertical directions.

Both `px` and `em` units are supported, and the default `px` unit when using the `number` type.

```js
{
    dx: 10;
    dx: '10px';
    dx: '0.5em';
}
```

## Font Related

### fontFamily

**type**: `string`

**default value**: -

**required**: `true`

**remarks**: Font type, e.g. `'PingFang SC'` `'Microsoft Yahei'`

### fontSize

**type**: `number`

**default value**: -

**required**: `true`

### fontWeight

**type**: `string` | `number`

**default value**: `normal`

**required**: `false`

### fontStyle

**type**: `string`

**default value**: `normal`

**required**: `false`

**remarks**: Font style, for example, the image below shows the tilted `italic` effect.

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*DQivSL2Oll0AAAAAAAAAAAAAARQnAQ)

### fontVariant

**type**: `string`

**default value**: `normal`

**required**: `false`

**remarks**: Font style, for example, the following image is the `small-cap` effect.

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*DQivSL2Oll0AAAAAAAAAAAAAARQnAQ)

## Single row layout

### textBaseline

**type**: `string`

**default value**: `alphabetic`

**required**: `false`

**remarks**: Alignment in the vertical direction is achieved by `textBaseline`, and the following figure shows the effect of alignment with different values.

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*1g1SQZlEBCAAAAAAAAAAAAAAARQnAQ)

Using the current position of the text as the anchor point, the following figure shows the effect of `top`, `middle` and `bottom` in turn. In addition to single line also applies to multi-line text blocks.

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*ZJzIQKBhAnUAAAAAAAAAAAAAARQnAQ)

### letterSpacing

**type**: `number`

**default value**: `0`

**required**: `false`

**remarks**: Character Spacing

## Multi-row layout

Line feeds occur in the following two cases:

1. Line breaks in text
2. When `wordWrap` is turned on, the part beyond `wordWrapWidth` will be automatically line wrapped, similar to `word-break` in CSS.

Therefore, both cases need to be considered when parsing raw text. However, when dealing with CJK (Chinese/Japanese/Korean) characters, their special language specification needs to be taken into account. In fact, the CSS `word-break` also provides a value that takes into account the CJK case.

### textAlign

**type**: `string`

**default value**: `left`

**required**: `false`

**remarks**: In multi-line text, each line can be horizontally aligned with an anchor

The following figure shows the effect of `left`, `center` and `right` in that order:

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*tyAzR7Y11oIAAAAAAAAAAAAAARQnAQ)

### wordWrap

**type**: `boolean`

**default value**: `false`

**required**: `false`

**remarks**: Whether to turn on automatic line feed

### wordWrapWidth

**type**: `number`

**default value**: -

**required**: `false`

**remarks**: When auto-folding is turned on, the line will be changed beyond that width

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*FdtgQLndl8IAAAAAAAAAAAAAARQnAQ)

### lineHeight

**type**: `number`

**default value**: -

**required**: `false`

### leading

**type**: `number`

**default value**: -

**required**: `false`

# Methods

## getLineBoundingRects(): Rectangle[]

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

In [example](/en/examples/shape#text), we draw the bounding box for each line of the multi-line text, and we can implement advanced text features such as underline and strikethrough based on the bounding box information:

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*4bL1QaVJ40MAAAAAAAAAAAAAARQnAQ)

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

# Loading Fonts

In addition to the system default fonts, sometimes we want to load third-party fonts.

In this case, you can use [Web Font Loader](https://github.com/typekit/webfontloader), which is created in the `active` callback function when it is loaded successfully, [example](/en/examples/shape#text):

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

# More CanvasKit-based configuration items

CanvasKit provides [enhanced paragraph drawing capabilities](/en/docs/api/renderer/canvaskit#text-paragraphs). We've integrated them into our [g-canvaskit](/en/docs/api/renderer/canvaskit) renderer.
