---
title: Image
order: 5
---

You can refer to the [\<image\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/image) element of SVG.

The following [example](/en/examples/shape#image) defines an image with a top-left vertex position of `(200, 100)`.

```javascript
const image = new Image({
    style: {
        x: 200,
        y: 100,
        width: 200,
        height: 200,
        img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    },
});
```

Usually we are used to centering on the image, which can be modified by the anchor [anchor](/en/docs/api/display-object#anchor).

```javascript
const image = new Image({
    style: {
        //...
        anchor: [0.5, 0.5],
    },
});
```

## Inherited from

Inherits [style property](/en/docs/api/basic/display-object#drawing-properties) from [DisplayObject](/en/docs/api/basic/display-object).

### anchor

The default value is `[0, 0]`. For details, see [DisplayObject's anchor](/en/docs/api/basic/display-object#anchor).

### transformOrigin

The default value is `left top`. For details, see [DisplayObject's transformOrigin](/en/docs/api/basic/display-object#transformOrigin).

## Additional Properties

### x

The x-axis coordinates of the top-left vertex of the image in the local coordinate system.

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/x

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value)                                                             |
| ------------------------------------------------------------------------- | ------------------- | ------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                       | -                   | no                                          | yes        | [\<percentage\>](/en/docs/api/css/css-properties-values-api#percentage) [\<length\>](/en/docs/api/css/css-properties-values-api#length) |

### y

The y-axis coordinates of the top-left vertex of the image in the local coordinate system.

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/y

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value)                                                             |
| ------------------------------------------------------------------------- | ------------------- | ------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                       | -                   | no                                          | yes        | [\<percentage\>](/en/docs/api/css/css-properties-values-api#percentage) [\<length\>](/en/docs/api/css/css-properties-values-api#length) |

### img

Image sources, supports the following types:

-   Image address string, displayed after successful loading
-   Create your own [Image](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image) object to create a G Image in the `onload` callback, as shown in the following example.

```js
import { Image as GImage, Canvas } from '@antv/g';

let image;
const img = new Image();
img.src =
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ';
img.crossOrigin = 'Anonymous';
img.onload = () => {
    image = new GImage({
        style: {
            x: 200,
            y: 100,
            width: 200,
            height: 200,
            img,
        },
    });
    canvas.appendChild(image);
};
```

### src

This attribute is an alias for [img](/en/docs/api/basic/image).

### width

Image width.

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/width

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value)                                                             |
| ------------------------------------------------------------------------- | ------------------- | ------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                       | -                   | no                                          | yes        | [\<percentage\>](/en/docs/api/css/css-properties-values-api#percentage) [\<length\>](/en/docs/api/css/css-properties-values-api#length) |

### height

Image height.

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/height

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value)                                                             |
| ------------------------------------------------------------------------- | ------------------- | ------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                       | -                   | no                                          | yes        | [\<percentage\>](/en/docs/api/css/css-properties-values-api#percentage) [\<length\>](/en/docs/api/css/css-properties-values-api#length) |
